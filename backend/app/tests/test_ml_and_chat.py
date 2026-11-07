from app.ml.intent_classifier import (
    intent_classifier,
    INTENT_FOOD_SUITABILITY,
    INTENT_NUTRITION_QUERY,
    INTENT_MEAL_PLAN_REQUEST,
    INTENT_GENERAL_HEALTH,
    INTENT_PROFILE_QUERY
)
from app.ml.recommendation_scorer import evaluate_food_suitability

def test_intent_classifier():
    test_cases = [
        ("Can I drink milk?", INTENT_FOOD_SUITABILITY),
        ("Is banana safe for diabetics?", INTENT_FOOD_SUITABILITY),
        ("How many calories in curd?", INTENT_NUTRITION_QUERY),
        ("Generate a 7 day meal plan", INTENT_MEAL_PLAN_REQUEST),
        ("What are my saved allergies?", INTENT_PROFILE_QUERY),
        ("How much water should I drink per day?", INTENT_GENERAL_HEALTH),
    ]
    for text, expected in test_cases:
        predicted, conf, _ = intent_classifier.predict(text)
        assert predicted == expected, f"Failed for '{text}': got {predicted}, expected {expected}"

def test_recommendation_scorer_rules():
    dummy_dairy = {
        "food_name": "Paneer",
        "food_category": "Milk & Dairy",
        "diet_type": "lacto_vegetarian",
        "allergen_tags": "milk",
        "energy_kcal_per_100g": ""
    }

    # Milk allergy collision
    res1 = evaluate_food_suitability(
        food=dummy_dairy,
        user_conditions=[],
        user_allergies=["milk"],
        diet_type="vegetarian"
    )
    assert res1.status == "avoid"
    assert res1.allergen_conflict is True
    assert res1.nutrition_available is False

    # Vegan diet collision
    res2 = evaluate_food_suitability(
        food=dummy_dairy,
        user_conditions=[],
        user_allergies=[],
        diet_type="vegan"
    )
    assert res2.status == "avoid"
    assert res2.dietary_conflict is True

    # Lactose intolerance caution
    res3 = evaluate_food_suitability(
        food=dummy_dairy,
        user_conditions=["Lactose Intolerance"],
        user_allergies=[],
        diet_type="vegetarian"
    )
    assert res3.status == "caution"
    assert len(res3.condition_notes) > 0

def test_chat_and_weekly_plan(client):
    # Register user
    reg = client.post("/api/auth/register", json={
        "full_name": "Rohan Deshmukh",
        "email": "rohan@example.com",
        "password": "Password123!",
        "confirm_password": "Password123!"
    })
    token = reg.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Complete onboarding with peanut allergy
    client.post("/api/profile/onboarding", json={
        "age": 32,
        "gender": "Male",
        "diet_type": "vegetarian",
        "allergies": ["peanut"],
        "health_conditions": ["Hypertension"],
        "goals": ["healthy_eating"]
    }, headers=headers)

    # Send chat message: "Can I drink milk?"
    chat_res = client.post("/api/chat", json={"message": "Can I drink milk?"}, headers=headers)
    assert chat_res.status_code == 200
    msg = chat_res.json()
    assert msg["sender"] == "assistant"
    assert "Cow milk" in msg["message_text"] or "milk" in msg["message_text"].lower()
    conv_id = msg["conversation_id"]

    # Verify conversation history
    conv_res = client.get(f"/api/chat/conversations/{conv_id}", headers=headers)
    assert conv_res.status_code == 200
    conv_data = conv_res.json()
    assert len(conv_data["messages"]) >= 2

    # Generate weekly plan
    plan_res = client.post("/api/plans/generate", json={"custom_notes": "Focus on high energy"}, headers=headers)
    assert plan_res.status_code == 201
    plan_data = plan_res.json()
    assert len(plan_data["days"]) == 7
    monday = plan_data["days"][0]
    assert monday["breakfast"] != ""
    assert monday["lunch"] != ""
    assert monday["evening_snack"] != ""
    assert monday["dinner"] != ""
    assert monday["activity"] != ""

def test_natural_chatbot_quality_scenarios(client):
    # 1. Register a fresh test user
    reg = client.post("/api/auth/register", json={
        "full_name": "Priya Sharma",
        "email": "priya.natural@example.com",
        "password": "Password123!",
        "confirm_password": "Password123!"
    })
    token = reg.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Scenario 10: User with NO declared medical condition
    client.post("/api/profile/onboarding", json={
        "age": 28,
        "gender": "Female",
        "diet_type": "vegetarian",
        "allergies": [],
        "health_conditions": [],
        "goals": ["general_fitness"]
    }, headers=headers)

    # Scenario 1: "Can I eat Vada Pav?" (General user, no conditions)
    res1 = client.post("/api/chat", json={"message": "Can I eat Vada Pav?"}, headers=headers)
    assert res1.status_code == 200
    txt1 = res1.json()["message_text"]
    conv_id = res1.json()["conversation_id"]

    # Verify no robotic tags or headings
    assert "### Evaluation for" not in txt1
    assert "**Category:**" not in txt1
    assert "vegetarian_or_vegan_check_recipe" not in txt1
    assert "**Precaution Notice:**" not in txt1
    assert "**Catalog Note:**" not in txt1
    assert "deep-fried" in txt1.lower() or "vada pav" in txt1.lower()
    # Should NOT lecture about diabetes or hypertension since user has none
    assert "since your health profile includes diabetes" not in txt1.lower()

    # Scenario 8: Follow-up question referring to previous food ("What about at night?")
    res8 = client.post("/api/chat", json={
        "message": "What about at night?",
        "conversation_id": conv_id
    }, headers=headers)
    assert res8.status_code == 200
    txt8 = res8.json()["message_text"]
    assert "vada pav" in txt8.lower()
    assert "night" in txt8.lower()
    assert "digest" in txt8.lower()

    # Scenario 2: "Can I eat Vada Pav?" with Diabetes Profile
    client.put("/api/profile/health", json={"health_conditions": ["Type 2 Diabetes"]}, headers=headers)
    res2 = client.post("/api/chat", json={"message": "Can I eat Vada Pav?"}, headers=headers)
    assert res2.status_code == 200
    txt2 = res2.json()["message_text"]
    assert "diabetes" in txt2.lower()
    assert "blood sugar" in txt2.lower() or "carbohydrate" in txt2.lower() or "glucose" in txt2.lower()
    assert "### Evaluation for" not in txt2

    # Scenario 3: "Can I eat Vada Pav?" with Hypertension Profile
    client.put("/api/profile/health", json={"health_conditions": ["Hypertension"]}, headers=headers)
    res3 = client.post("/api/chat", json={"message": "Can I eat Vada Pav?"}, headers=headers)
    assert res3.status_code == 200
    txt3 = res3.json()["message_text"]
    assert "blood pressure" in txt3.lower() or "hypertension" in txt3.lower()
    assert "sodium" in txt3.lower() or "chutney" in txt3.lower() or "salt" in txt3.lower()

    # Scenario 4: "Can I drink milk?" with Lactose Intolerance
    client.put("/api/profile/health", json={"health_conditions": ["Lactose Intolerance"]}, headers=headers)
    res4 = client.post("/api/chat", json={"message": "Can I drink milk?"}, headers=headers)
    assert res4.status_code == 200
    txt4 = res4.json()["message_text"]
    assert "lactose" in txt4.lower()
    assert "digestive" in txt4.lower() or "alternative" in txt4.lower() or "bloating" in txt4.lower()

    # Scenario 5: "Can I eat peanuts?" with Peanut Allergy
    client.put("/api/profile/health", json={"health_conditions": [], "allergies": ["peanut"]}, headers=headers)
    res5 = client.post("/api/chat", json={"message": "Can I eat peanuts?"}, headers=headers)
    assert res5.status_code == 200
    txt5 = res5.json()["message_text"]
    assert "allergy" in txt5.lower() or "not recommended" in txt5.lower() or "caution" in txt5.lower()

    # Scenario 6: Food not in dataset
    res6 = client.post("/api/chat", json={"message": "Can I eat XyZ999NonExistentDishMystery?"}, headers=headers)
    assert res6.status_code == 200
    txt6 = res6.json()["message_text"]
    assert "couldn't find" in txt6.lower() or "not find a direct match" in txt6.lower()

    # Scenario 7: Food with missing nutrition values (verify unverified numbers aren't fabricated)
    res7 = client.post("/api/chat", json={"message": "How healthy is Poha?"}, headers=headers)
    assert res7.status_code == 200
    txt7 = res7.json()["message_text"]
    assert "**Catalog Note:" not in txt7
    assert "0.0 kcal" not in txt7

    # Scenario 9: General health question
    res9 = client.post("/api/chat", json={"message": "How much water should I drink every day?"}, headers=headers)
    assert res9.status_code == 200
    txt9 = res9.json()["message_text"]
    assert "hydration" in txt9.lower() or "liters" in txt9.lower()
    assert "### General Health & Wellness Guidelines" not in txt9

