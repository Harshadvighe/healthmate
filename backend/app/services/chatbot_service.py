import re
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session

from app.models import User, Conversation, ChatMessage
from app.ml.intent_classifier import (
    intent_classifier,
    INTENT_FOOD_SUITABILITY,
    INTENT_NUTRITION_QUERY,
    INTENT_MEAL_PLAN_REQUEST,
    INTENT_GENERAL_HEALTH,
    INTENT_PROFILE_QUERY,
)
from app.ml.food_matcher import food_matcher
from app.services.dataset_service import dataset_service
from app.services.natural_chat_generator import (
    generate_conversational_response,
    is_followup_query,
    get_timing_context,
)

def extract_food_candidate(text: str) -> str:
    # Strip common conversational question frames
    cleaned = re.sub(
        r"\b(can\s+i\s+drink|can\s+i\s+eat|can\s+i\s+have|should\s+i\s+eat|should\s+i\s+drink|is\s+it\s+safe\s+to\s+eat|is\s+it\s+safe\s+to\s+drink|is\s+it\s+ok\s+to\s+eat|is\s+it\s+okay\s+to\s+eat|can\s+i|can|should|eat|drink|have|safe|good|bad|for\s+diabetics|with\s+diabetes|with\s+hypertension|if\s+i\s+have|for\s+me|tell\s+me\s+about|nutritional\s+value\s+of|calories\s+in|how\s+much\s+protein\s+in|what\s+about|is\s+it\s+good\s+for\s+me)\b",
        " ",
        text,
        flags=re.IGNORECASE
    )
    cleaned = re.sub(r"[^\w\s\u0900-\u097f]", " ", cleaned)
    cleaned = re.sub(r"\s+", " ", cleaned).strip()
    return cleaned if len(cleaned) >= 2 else text

class ChatbotService:
    def process_message(
        self,
        db: Session,
        user: User,
        message_text: str,
        conversation_id: Optional[int] = None
    ) -> Dict[str, Any]:
        # 1. Fetch or create conversation
        if conversation_id:
            conv = db.query(Conversation).filter(
                Conversation.id == conversation_id,
                Conversation.user_id == user.id
            ).first()
            if not conv:
                conv = Conversation(user_id=user.id, title=message_text[:35] + "...")
                db.add(conv)
                db.commit()
                db.refresh(conv)
        else:
            conv = Conversation(user_id=user.id, title=message_text[:35] + "...")
            db.add(conv)
            db.commit()
            db.refresh(conv)

        # 2. Extract User Profile context
        user_conditions = [c.condition_name for c in user.health_conditions]
        user_allergies = [a.allergen for a in user.allergies]
        diet_type = user.food_preferences.diet_type if user.food_preferences else "vegetarian"
        user_goals = [g.goal_type for g in user.goals]
        activity_level = user.profile.activity_level if user.profile else "moderate"
        user_name = user.full_name or "there"

        # 3. Check for previous food in conversation history for follow-ups
        previous_matched_food_dict = None
        for prev_msg in reversed(conv.messages):
            if prev_msg.sender == "assistant" and prev_msg.matched_food:
                records = dataset_service.search_by_name(prev_msg.matched_food, limit=1)
                if records:
                    previous_matched_food_dict = records[0]
                    break

        is_followup = is_followup_query(message_text)
        timing_focus = get_timing_context(message_text)

        # 4. Classify intent
        intent, confidence, probas = intent_classifier.predict(message_text)

        # 5. Generate contextual, natural response
        reply_text = ""
        matched_food_item = None
        metadata = {
            "intent": intent,
            "confidence": confidence,
            "is_followup": is_followup,
            "profile_context": {
                "conditions": user_conditions,
                "allergies": user_allergies,
                "diet_type": diet_type,
            }
        }

        # Food matching logic
        target_food = None
        # If user explicitly asks a follow-up ("what about at night?", "daily?", "how much?") and we have a previous food
        if is_followup and previous_matched_food_dict:
            target_food = previous_matched_food_dict
            matched_food_item = target_food
            metadata["matched_food"] = target_food.get("food_name")
            metadata["resolved_from_context"] = True
            reply_text = generate_conversational_response(
                query_text=message_text,
                food=target_food,
                user_conditions=user_conditions,
                user_allergies=user_allergies,
                diet_type=diet_type,
                user_goals=user_goals,
                user_name=user_name,
                is_followup=True,
                timing_focus=timing_focus
            )
        elif intent in [INTENT_FOOD_SUITABILITY, INTENT_NUTRITION_QUERY] or any(word in message_text.lower() for word in ["eat", "drink", "milk", "roti", "rice", "curd", "dal", "poha", "sugar", "paneer", "vada", "banana", "wheat"]):
            candidate_term = extract_food_candidate(message_text)
            matches = food_matcher.search(candidate_term, top_k=3, threshold=0.25)
            if not matches and candidate_term != message_text:
                matches = food_matcher.search(message_text, top_k=3, threshold=0.28)

            if matches:
                top_food, match_score = matches[0]
                target_food = top_food
                matched_food_item = top_food
                metadata["matched_food"] = top_food.get("food_name")
                metadata["match_score"] = round(match_score, 2)

                reply_text = generate_conversational_response(
                    query_text=message_text,
                    food=top_food,
                    user_conditions=user_conditions,
                    user_allergies=user_allergies,
                    diet_type=diet_type,
                    user_goals=user_goals,
                    user_name=user_name,
                    is_followup=False,
                    timing_focus=timing_focus
                )
            else:
                # Food not found in catalog
                reply_text = generate_conversational_response(
                    query_text=message_text,
                    food=None,
                    user_conditions=user_conditions,
                    user_allergies=user_allergies,
                    diet_type=diet_type,
                    user_goals=user_goals,
                    user_name=user_name
                )

        elif intent == INTENT_MEAL_PLAN_REQUEST:
            goals_summary = ", ".join(g.replace("_", " ") for g in user_goals) if user_goals else "healthy balanced eating"
            reply_text = (
                f"I'd be happy to help organize your weekly meals! Based on your **{diet_type.title()}** preference "
                f"and goals for **{goals_summary}**, we can generate a structured 7-day schedule that balances "
                f"breakfast, lunch, afternoon refreshments, and light dinners from our Indian food catalog.\n\n"
                f"You can view, save, or refresh your full 7-day schedule anytime in the **Weekly Plan** tab. "
                f"Would you like meal ideas for a specific day or time of day?"
            )

        elif intent == INTENT_PROFILE_QUERY:
            conds = ", ".join(user_conditions) if user_conditions else "None declared"
            allgs = ", ".join(user_allergies) if user_allergies else "None declared"
            gls = ", ".join(g.replace("_", " ") for g in user_goals) if user_goals else "Balanced nourishment"
            reply_text = (
                f"Here is a summary of the health context I currently use for your guidance:\n\n"
                f"- **Dietary Preference:** {diet_type.title()}\n"
                f"- **Recorded Health Conditions:** {conds}\n"
                f"- **Known Allergies:** {allgs}\n"
                f"- **Active Goals:** {gls}\n"
                f"- **Activity Level:** {activity_level.title()}\n\n"
                f"You can edit or update any of these details anytime in your **Profile & Settings** page."
            )

        else: # INTENT_GENERAL_HEALTH
            reply_text = (
                "Building consistent wellness comes down to a few steady daily habits:\n\n"
                "- **Daily Hydration:** Aim for 2.5 to 3 liters of water throughout the day, sipping steadily between meals.\n"
                "- **Plate Balance:** Aim for roughly half your plate to be fresh seasonal vegetables and salads, one-quarter whole grains or millets, and one-quarter protein (like dal, paneer, sprouts, or eggs).\n"
                "- **Mindful Timing:** Try to finish dinner at least 2 hours before sleeping to ensure smooth digestion and deep, restful sleep.\n\n"
                "Is there a specific food or daily meal you'd like to check today?"
            )

        # 6. Persist messages in database
        user_msg = ChatMessage(
            conversation_id=conv.id,
            sender="user",
            message_text=message_text,
            intent=intent,
            metadata_json={"probas": probas}
        )
        db.add(user_msg)

        assistant_msg = ChatMessage(
            conversation_id=conv.id,
            sender="assistant",
            message_text=reply_text,
            intent=intent,
            matched_food=metadata.get("matched_food"),
            metadata_json=metadata
        )
        db.add(assistant_msg)
        db.commit()
        db.refresh(assistant_msg)

        return {
            "conversation_id": conv.id,
            "user_message": user_msg,
            "assistant_message": assistant_msg,
            "intent": intent,
            "metadata": metadata
        }

chatbot_service = ChatbotService()
