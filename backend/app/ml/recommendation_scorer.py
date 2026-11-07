from typing import Dict, Any, List, Optional
from app.schemas.food import PersonalizedSuitability

DISCLAIMER_TEXT = (
    "Educational guidance only. This assessment is based on your declared profile and "
    "verified food catalog tags. It does not constitute medical diagnosis or clinical prescription. "
    "Consult a qualified physician or registered dietitian for clinical management."
)

def evaluate_food_suitability(
    food: Dict[str, Any],
    user_conditions: List[str],
    user_allergies: List[str],
    diet_type: str = "vegetarian",
    user_goals: List[str] = None
) -> PersonalizedSuitability:
    score = 85
    status = "suitable"
    headline = "Generally suitable based on your current profile."
    
    allergen_conflict = False
    allergen_details: List[str] = []
    dietary_conflict = False
    dietary_details: List[str] = []
    condition_notes: List[str] = []

    food_name = str(food.get("food_name", "")).lower()
    food_cat = str(food.get("food_category", "")).lower()
    food_diet = str(food.get("diet_type", "")).lower()
    food_allergens = [a.strip().lower() for a in str(food.get("allergen_tags", "")).split(";") if a.strip()]

    # 1. Allergen Check (Highest Priority)
    norm_user_allergies = [a.strip().lower() for a in user_allergies if a.strip()]
    for allergen in norm_user_allergies:
        # Check against allergen tags
        matched = False
        for fa in food_allergens:
            if allergen in fa or fa in allergen:
                matched = True
                break
        # Also check food name directly for common allergens
        if allergen in food_name or (allergen == "milk" and "dairy" in food_cat):
            matched = True

        if matched:
            allergen_conflict = True
            allergen_details.append(
                f"Contains or is derived from '{allergen}', which is flagged in your allergy profile."
            )
            score = min(score, 15)
            status = "avoid"

    # 2. Dietary Preference Check
    user_diet = (diet_type or "vegetarian").lower()
    if user_diet == "vegan":
        if "dairy" in food_cat or "milk" in food_allergens or "lacto" in food_diet or "meat" in food_diet or "egg" in food_diet:
            dietary_conflict = True
            dietary_details.append("This item contains animal-derived or dairy ingredients, conflicting with a vegan lifestyle.")
            score = min(score, 30)
            if status != "avoid":
                status = "avoid"
    elif user_diet in ["vegetarian", "lacto_vegetarian"]:
        if any(term in food_diet for term in ["meat", "fish", "shellfish", "poultry"]) or any(term in food_name for term in ["chicken", "mutton", "fish", "prawn", "egg"]):
            if "egg" in food_diet and user_diet != "eggetarian":
                dietary_conflict = True
                dietary_details.append("Contains egg or meat products, conflicting with your vegetarian preference.")
                score = min(score, 20)
                status = "avoid"
            elif any(term in food_diet for term in ["meat", "fish", "shellfish"]):
                dietary_conflict = True
                dietary_details.append("Contains non-vegetarian ingredients, conflicting with your vegetarian preference.")
                score = min(score, 20)
                status = "avoid"

    # 3. Health Condition Checks
    norm_conditions = [c.strip().lower() for c in user_conditions if c.strip()]
    for cond in norm_conditions:
        # Diabetes
        if "diabetes" in cond or "sugar" in cond or "insulin" in cond:
            if "sweets" in food_cat or "dessert" in food_cat or any(w in food_name for w in ["sugar", "jaggery", "gulab jamun", "halwa", "laddu", "kheer", "sweet"]):
                condition_notes.append("High glycemic or sugar-dense food; can trigger rapid blood glucose spikes. Exercise strong caution.")
                score = min(score, 40)
                if status == "suitable":
                    status = "caution"
            elif any(w in food_name for w in ["refined flour", "maida"]):
                condition_notes.append("Refined carbohydrates may elevate blood sugar faster than complex whole grains. Portion control advised.")
                score = min(score, 55)
                if status == "suitable":
                    status = "caution"
            elif "pulses" in food_cat or "millets" in food_cat:
                condition_notes.append("Good source of complex carbohydrates and fiber, supporting steady glucose absorption.")

        # Lactose Intolerance
        if "lactose" in cond:
            if "milk" in food_allergens or "milk & dairy" in food_cat or any(w in food_name for w in ["milk", "curd", "paneer", "cheese", "doodh", "dahi"]):
                condition_notes.append("Contains lactose; may cause abdominal cramps or bloating. Consider lactose-free alternatives or evaluate tolerance.")
                score = min(score, 45)
                if status == "suitable":
                    status = "caution"

        # Hypertension / Blood Pressure
        if "hypertension" in cond or "blood pressure" in cond or "bp" in cond:
            if any(w in food_name for w in ["pickle", "achar", "papad", "salted", "chips"]):
                condition_notes.append("Pickled or processed savory items often have high sodium levels, which can elevate blood pressure.")
                score = min(score, 50)
                if status == "suitable":
                    status = "caution"

        # High Cholesterol / Heart Disease
        if "cholesterol" in cond or "heart" in cond or "cardio" in cond:
            if any(w in food_name for w in ["deep fried", "pakora", "samosa", "poori", "vada", "ghee", "butter"]):
                condition_notes.append("High saturated fat or fried preparations can unfavorably affect lipid profiles. Moderate consumption.")
                score = min(score, 55)
                if status == "suitable":
                    status = "caution"

        # Celiac or Gluten Sensitivity
        if "celiac" in cond or "gluten" in cond:
            if "gluten" in food_allergens or any(w in food_name for w in ["wheat", "atta", "maida", "roti", "chapati", "puri", "bread", "seviyan"]):
                condition_notes.append("Contains gluten proteins; unsuitable for individuals with celiac disease or gluten enteropathy.")
                score = min(score, 20)
                status = "avoid"

    # 4. Check nutrition data availability
    energy_val = str(food.get("energy_kcal_per_100g", "")).strip()
    nutrition_available = bool(energy_val and energy_val != "0")

    # Set appropriate headline
    if status == "avoid":
        if allergen_conflict:
            headline = "Not recommended: Potential allergen conflict detected."
        elif dietary_conflict:
            headline = "Dietary preference conflict detected."
        else:
            headline = "Caution: Significant health condition restriction identified."
    elif status == "caution":
        headline = "Consume with awareness: Condition-specific moderation recommended."
    else:
        headline = "Compatible with your registered profile and dietary preferences."

    return PersonalizedSuitability(
        score=score,
        status=status,
        headline=headline,
        allergen_conflict=allergen_conflict,
        allergen_details=allergen_details,
        dietary_conflict=dietary_conflict,
        dietary_details=dietary_details,
        condition_notes=condition_notes,
        nutrition_available=nutrition_available,
        disclaimer=DISCLAIMER_TEXT,
    )

