"""
HealthMate Natural Chat Response Generator
Generates fluent, human-like, conversational health & nutrition guidance grounded in
the Indian food catalog and personalized to the user's specific health profile.
Removes all robotic technical tags, headers, and repetitive generic disclaimers.
"""
from typing import Dict, Any, List, Optional
import re

def is_followup_query(text: str) -> bool:
    """Detects whether a user message refers to a previously discussed food."""
    t = text.lower().strip()
    followup_patterns = [
        r"\b(at night|in the night|before bed|for dinner|for lunch|for breakfast|in the morning)\b",
        r"\b(can i have it|can i eat it|can i drink it|is it ok|is it okay|how much|how often)\b",
        r"\b(daily|every day|everyday|frequently|regularly|weekly)\b",
        r"\b(what about|how about|what if|and at night)\b",
        r"^(at night|for dinner|daily|how often|how much|and at night\??)$",
    ]
    return any(re.search(pat, t) for pat in followup_patterns)

def get_timing_context(text: str) -> Optional[str]:
    t = text.lower()
    if any(w in t for w in ["night", "dinner", "before bed", "late evening", "sleeping"]):
        return "night"
    if any(w in t for w in ["morning", "breakfast", "empty stomach"]):
        return "morning"
    if any(w in t for w in ["daily", "every day", "everyday", "regularly", "often"]):
        return "daily"
    if any(w in t for w in ["how much", "portion", "quantity", "how many"]):
        return "portion"
    return None

def generate_conversational_response(
    query_text: str,
    food: Optional[Dict[str, Any]],
    user_conditions: List[str],
    user_allergies: List[str],
    diet_type: str,
    user_goals: List[str],
    user_name: Optional[str] = None,
    is_followup: bool = False,
    timing_focus: Optional[str] = None,
) -> str:
    """
    Crafts a fluent, empathetic, and medically sensible response.
    """
    if not food:
        # Food not identified
        clean_q = query_text.strip().rstrip("?!.")
        return (
            f"I couldn't find a direct match for \"{clean_q}\" in our verified catalog of 1,400+ Indian foods.\n\n"
            "Could you mention the standard name or common regional term (such as *Roti, Cow milk, Poha, Dal, Paneer, or Upma*)? "
            "Once identified, I will evaluate its preparation and ingredients against your health profile."
        )

    food_name = food.get("food_name", "this food")
    regional_hi = food.get("name_hi")
    display_name = f"{food_name}" + (f" ({regional_hi})" if regional_hi and regional_hi != food_name else "")
    category = str(food.get("food_category", "")).lower()
    prep_label = str(food.get("preparation_label", "")).lower()
    prep_form = str(food.get("preparation_form", "")).lower()
    diet_tag = str(food.get("diet_type", "")).lower()
    allergen_tags = [a.strip().lower() for a in str(food.get("allergen_tags", "")).split(";") if a.strip()]
    ingredients = str(food.get("ingredients_summary", ""))

    # Normalize user conditions and allergies
    conds_lower = [c.lower() for c in user_conditions]
    allergies_lower = [a.lower() for a in user_allergies]

    has_diabetes = any("diabetes" in c or "sugar" in c for c in conds_lower)
    has_hypertension = any("hypertension" in c or "bp" in c or "blood pressure" in c for c in conds_lower)
    has_cholesterol = any("cholesterol" in c or "heart" in c or "cardiac" in c for c in conds_lower)
    has_lactose = any("lactose" in c for c in conds_lower)
    has_celiac = any("celiac" in c or "gluten" in c for c in conds_lower)
    has_uric_acid = any("uric" in c or "gout" in c for c in conds_lower)

    # Food properties
    is_fried = any(w in prep_label or w in prep_form or w in food_name.lower() for w in ["fried", "deep fried", "fry", "pakora", "vada", "samosa", "poori", "bhaji"])
    is_sweet = "sweet" in category or "dessert" in category or any(w in food_name.lower() for w in ["halwa", "laddu", "jamun", "jaggery", "sugar", "kheer", "barfi"])
    is_dairy = "dairy" in category or "milk" in category or any(w in food_name.lower() for w in ["milk", "curd", "paneer", "dahi", "doodh", "cheese", "ghee", "chaas"])
    is_cereal = "cereal" in category or "millet" in category or any(w in food_name.lower() for w in ["rice", "roti", "wheat", "poha", "dalia", "bhakri", "upma", "khichdi"])
    is_pulse = "pulse" in category or "legume" in category or any(w in food_name.lower() for w in ["dal", "chana", "moong", "rajma", "chole", "sprout"])
    is_fruit = "fruit" in category or any(w in food_name.lower() for w in ["banana", "apple", "papaya", "mango", "orange", "guava"])

    paragraphs: List[str] = []

    # ---------------------------------------------------------
    # SCENARIO A: Follow-up question (Timing: Night, Dinner, Daily)
    # ---------------------------------------------------------
    if is_followup and timing_focus:
        if timing_focus == "night":
            if is_fried:
                paragraphs.append(
                    f"Having **{food_name}** at night is generally not recommended for restful sleep and digestion. "
                    "Deep-fried foods take significantly longer to digest and can trigger acid reflux, bloating, or heavy discomfort "
                    "when you lie down shortly after eating."
                )
                paragraphs.append(
                    "If you're looking for an evening refreshment, lighter options like roasted makhana, steamed dhokla, "
                    "or a bowl of vegetable soup are much gentler on your digestive tract before bedtime."
                )
            elif is_dairy:
                if "milk" in food_name.lower():
                    paragraphs.append(
                        f"Drinking warm **{food_name}** at night is a comforting, time-tested habit. "
                        "Milk contains tryptophan, an amino acid that assists in melatonin production and helps promote restful sleep."
                    )
                    paragraphs.append(
                        "For best results, keep it warm and unsweetened (or infused with a pinch of turmeric), "
                        "and drink it approximately 30 to 45 minutes before turning in."
                    )
                else: # Curd / Dahi
                    paragraphs.append(
                        f"Having **{food_name}** at night can occasionally cause mucus accumulation or sluggish digestion in some people, "
                        "according to traditional wellness practices. Curd also has a natural cooling and fermenting effect."
                    )
                    paragraphs.append(
                        "If you enjoy it late in the day, a glass of lightly spiced buttermilk (chaas) with roasted cumin is often easier to digest than thick, heavy curd."
                    )
            elif is_cereal:
                if "rice" in food_name.lower():
                    paragraphs.append(
                        f"Eating **{food_name}** at night is completely fine in moderate portions, provided it fits your overall daily calorie and carbohydrate goals."
                    )
                    paragraphs.append(
                        "Because evening physical activity is typically lower, pairing a modest cup of rice with plenty of fiber-rich dal and green vegetables "
                        "helps avoid sluggish digestion and keeps overnight blood sugar balanced."
                    )
                else:
                    paragraphs.append(
                        f"Enjoying **{food_name}** for dinner is a great staple choice. Whole grains like phulkas or bhakris paired with dal and sabzi "
                        "provide steady, satisfying energy without overloading your digestion before sleep."
                    )
            else:
                paragraphs.append(
                    f"Including **{food_name}** for dinner works well as long as your overall portion is moderate and eaten at least 2 hours before sleeping."
                )

        elif timing_focus == "daily":
            if is_fried or is_sweet:
                paragraphs.append(
                    f"**{food_name}** is best enjoyed as an occasional treat rather than an everyday dietary staple. "
                    "Daily consumption can lead to excess intake of refined carbohydrates and saturated cooking fats."
                )
                paragraphs.append(
                    "Saving it for special occasions or weekends helps you maintain long-term metabolic health and steady energy."
                )
            elif is_cereal or is_pulse:
                paragraphs.append(
                    f"Yes, **{food_name}** is well-suited for daily meals. It forms the backbone of traditional balanced Indian diets, "
                    "offering sustaining complex carbohydrates and plant proteins."
                )
                paragraphs.append(
                    "To get the most nutritional variety, rotate different grains and legumes throughout the week (such as jowar, bajra, moong dal, and brown rice)."
                )
            else:
                paragraphs.append(
                    f"Yes, **{food_name}** can certainly be included regularly in your routine, especially when balanced with fresh produce and adequate hydration."
                )

        return "\n\n".join(paragraphs)

    # ---------------------------------------------------------
    # SCENARIO B: Allergen Conflict (Highest Safety Priority)
    # ---------------------------------------------------------
    matched_allergen = None
    for a in allergies_lower:
        if a in food_name.lower() or any(a in tag for tag in allergen_tags):
            matched_allergen = a
            break
        # Special check for dairy in milk
        if a in ["milk", "dairy"] and is_dairy:
            matched_allergen = a
            break
        # Special check for peanuts in Vada Pav chutney
        if a in ["peanut", "groundnut", "nuts"] and "vada" in food_name.lower():
            matched_allergen = a
            break

    if matched_allergen:
        if matched_allergen in ["peanut", "groundnut", "nuts"] and "vada" in food_name.lower():
            paragraphs.append(
                f"You should exercise strong caution with **{display_name}**. While the potato patty itself may not always contain peanuts, "
                "traditional Mumbai-style Vada Pav is almost universally prepared with a dry red garlic chutney that uses roasted peanuts as a primary base."
            )
            paragraphs.append(
                "Because of your recorded peanut allergy, please explicitly ensure that no peanut-based dry chutney or peanut frying oil is used, "
                "or opt for an alternative snack with verified ingredients to stay safe."
            )
            return "\n\n".join(paragraphs)

        paragraphs.append(
            f"Based on your profile, **{display_name}** is **not recommended** because it contains or is commonly made with **{matched_allergen}**, "
            "which matches your saved allergy profile."
        )
        paragraphs.append(
            f"To protect your health, consider choosing a verified allergen-free alternative or preparing a customized version at home where all ingredients are under your control."
        )
        return "\n\n".join(paragraphs)

    # ---------------------------------------------------------
    # SCENARIO C: Lactose Intolerance & Dairy
    # ---------------------------------------------------------
    if has_lactose and is_dairy:
        if "milk" in food_name.lower():
            paragraphs.append(
                f"If you have lactose intolerance, drinking regular **{display_name}** is likely to cause digestive symptoms such as bloating, abdominal cramping, or gas, "
                "as whole milk has a high concentration of intact lactose sugar."
            )
            paragraphs.append(
                "A practical alternative is to try lactose-free cow's milk or plant-based milks like unsweetened soy milk or almond milk, "
                "both of which are gentle on the digestive tract."
            )
            return "\n\n".join(paragraphs)
        elif any(w in food_name.lower() for w in ["curd", "dahi", "paneer", "chaas"]):
            paragraphs.append(
                f"Even with lactose intolerance, many individuals can tolerate moderate amounts of **{display_name}**. "
                "The natural fermentation in curd and the curdling process in paneer significantly break down lactose into lactic acid, making them much easier to digest than liquid milk."
            )
            paragraphs.append(
                "Start with a small portion (such as 2–3 tablespoons of fresh dahi) to assess your personal tolerance, or look for probiotic fermented options."
            )
            return "\n\n".join(paragraphs)

    # ---------------------------------------------------------
    # SCENARIO D: Condition-Aware Primary Answer
    # ---------------------------------------------------------
    # 1. Direct answer opening
    if is_fried:
        paragraphs.append(
            f"Yes, you can eat **{display_name}** occasionally as part of a balanced lifestyle, but it is a deep-fried snack "
            "that delivers a dense concentration of cooking oil and refined carbohydrates."
        )
    elif is_sweet:
        paragraphs.append(
            f"You can include **{display_name}** as an occasional sweet treat, but it is high in refined sugars and energy density."
        )
    elif is_cereal:
        paragraphs.append(
            f"Yes, **{display_name}** is a staple wholesome source of energy and complex carbohydrates in Indian cuisine."
        )
    elif is_pulse:
        paragraphs.append(
            f"Yes, **{display_name}** is an excellent and nourishing food choice, providing plant protein, dietary fiber, and essential minerals."
        )
    elif is_fruit:
        paragraphs.append(
            f"Yes, **{display_name}** is a nutritious whole food packed with natural vitamins, antioxidants, and dietary fiber."
        )
    elif is_dairy:
        paragraphs.append(
            f"Yes, **{display_name}** is a traditional nutrient-dense food that provides quality protein and calcium."
        )
    else:
        paragraphs.append(
            f"Yes, you can certainly incorporate **{display_name}** into your regular meals."
        )

    # 2. Specific health condition considerations
    condition_guidance: List[str] = []

    if has_diabetes:
        if is_fried:
            condition_guidance.append(
                "Since your health profile includes **diabetes**, the combination of refined white bread (pav) and a starchy potato filling "
                "can cause a relatively rapid rise in blood sugar, while the deep-fried oil prolongs gastric emptying. "
                "If you choose to have it, consider having half a portion, pairing it with fresh cucumber or sprout salad for fiber, and skipping sweetened accompaniments."
            )
        elif is_sweet:
            condition_guidance.append(
                "Given your **diabetes** profile, sugar-dense sweets can cause sharp glucose spikes. "
                "It's best reserved for rare occasions, eaten in minimal portions, and ideally following a fiber- and protein-rich meal to blunt the glycemic rise."
            )
        elif is_fruit:
            condition_guidance.append(
                "Because you're managing **diabetes**, enjoy fruits whole rather than juiced to retain the beneficial fiber. "
                "Pairing a medium portion with a few soaked almonds or walnuts further slows sugar absorption."
            )
        elif is_cereal:
            condition_guidance.append(
                "For your **diabetes** management, pairing grains with ample dal and vegetables helps lower the overall glycemic impact of the meal."
            )

    if has_hypertension:
        if is_fried or any(w in food_name.lower() for w in ["chaat", "samosa", "vada", "namkeen", "papad", "pickle"]):
            condition_guidance.append(
                "With **high blood pressure** noted in your profile, pay close attention to sodium. "
                "Street-style preparations often use heavily salted dry garlic and green chutneys. Asking for minimal chutney or preparing it at home with controlled salt makes a meaningful difference."
            )
        else:
            condition_guidance.append(
                "For **blood pressure** support, keeping table salt moderate and emphasizing fresh herbs like coriander and mint for flavor is a great daily habit."
            )

    if has_cholesterol:
        if is_fried:
            condition_guidance.append(
                "Because your profile notes **cholesterol management**, commercial deep-frying is the main factor to watch, as reused oil can contribute unwanted saturated and trans fats. "
                "An air-fried or pan-toasted preparation made with minimal oil provides the same comforting flavor with far less strain on your lipid profile."
            )

    if has_celiac:
        if any(w in food_name.lower() for w in ["wheat", "atta", "maida", "pav", "roti", "seviyan", "bread"]):
            condition_guidance.append(
                "Because of your **celiac / gluten restriction**, standard preparations containing wheat or refined flour (maida) are not suitable. "
                "Look for gluten-free grains like jowar, bajra, or rice flour as wholesome substitutes."
            )

    if condition_guidance:
        paragraphs.append(" ".join(condition_guidance))
    elif not user_conditions:
        # User has no declared medical condition
        if is_fried:
            paragraphs.append(
                "For general healthy eating, treating it as an occasional weekend treat rather than an everyday staple keeps your diet well-balanced. "
                "Balancing the rest of your day with light, fiber-rich meals like moong dal, seasonal vegetables, and plenty of water is a great approach."
            )
        else:
            paragraphs.append(
                "Since you have no specific health conditions recorded in your profile, it fits well into a varied, wholesome diet alongside plenty of seasonal vegetables and adequate hydration."
            )

    # 3. Practical suggestion / Follow-up
    if not user_conditions and not is_followup:
        paragraphs.append(
            "Do you have any specific health goals or dietary considerations (like blood pressure or blood sugar management) you'd like me to tailor for?"
        )
    elif is_fried and not is_followup:
        paragraphs.append(
            "Would you like advice on healthier preparation methods, such as air-frying, or suitable portion sizes?"
        )

    return "\n\n".join(paragraphs)
