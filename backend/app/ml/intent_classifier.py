import re
from typing import Tuple, Dict, Any, List, Optional
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression

# Intent classes
INTENT_FOOD_SUITABILITY = "food_suitability"
INTENT_NUTRITION_QUERY = "nutrition_query"
INTENT_MEAL_PLAN_REQUEST = "meal_plan_request"
INTENT_GENERAL_HEALTH = "general_health"
INTENT_PROFILE_QUERY = "profile_query"

TRAINING_DATA = [
    # food_suitability
    ("Can I drink milk?", INTENT_FOOD_SUITABILITY),
    ("Can I eat banana if I have diabetes?", INTENT_FOOD_SUITABILITY),
    ("Is curd good for high blood pressure?", INTENT_FOOD_SUITABILITY),
    ("Should I eat paneer with lactose intolerance?", INTENT_FOOD_SUITABILITY),
    ("Is rice safe for sugar patients?", INTENT_FOOD_SUITABILITY),
    ("Can a heart patient eat ghee?", INTENT_FOOD_SUITABILITY),
    ("Is poha healthy for weight loss?", INTENT_FOOD_SUITABILITY),
    ("Can I eat eggs if I have high cholesterol?", INTENT_FOOD_SUITABILITY),
    ("Can I have mango with diabetes?", INTENT_FOOD_SUITABILITY),
    ("Is besan chilla safe for gluten allergy?", INTENT_FOOD_SUITABILITY),
    ("Is it safe to consume curd at night?", INTENT_FOOD_SUITABILITY),
    ("Can I eat almonds everyday?", INTENT_FOOD_SUITABILITY),
    ("Is jaggery safe for diabetics instead of white sugar?", INTENT_FOOD_SUITABILITY),
    ("Can I eat roti on a low carb diet?", INTENT_FOOD_SUITABILITY),
    ("Should I avoid peanuts if I have nut allergy?", INTENT_FOOD_SUITABILITY),
    ("Can I have dal if I have uric acid?", INTENT_FOOD_SUITABILITY),
    ("Is it okay to drink cow milk?", INTENT_FOOD_SUITABILITY),
    ("Will eating sweets trigger my diabetes?", INTENT_FOOD_SUITABILITY),

    # nutrition_query
    ("How many calories are in 100g of paneer?", INTENT_NUTRITION_QUERY),
    ("What is the protein content of boiled eggs?", INTENT_NUTRITION_QUERY),
    ("How much carbohydrate is in white rice?", INTENT_NUTRITION_QUERY),
    ("Tell me the nutritional facts for milk", INTENT_NUTRITION_QUERY),
    ("Does dal have enough protein?", INTENT_NUTRITION_QUERY),
    ("How much fiber does oats have?", INTENT_NUTRITION_QUERY),
    ("What are the vitamins in spinach and banana?", INTENT_NUTRITION_QUERY),
    ("Is paneer high in fat?", INTENT_NUTRITION_QUERY),
    ("How much sodium is in pickles?", INTENT_NUTRITION_QUERY),
    ("What is the calcium level in cow milk?", INTENT_NUTRITION_QUERY),
    ("Nutritional breakdown of chapati and roti", INTENT_NUTRITION_QUERY),
    ("Calories and macros in curd", INTENT_NUTRITION_QUERY),

    # meal_plan_request
    ("Give me a 7 day diet plan", INTENT_MEAL_PLAN_REQUEST),
    ("Can you plan my weekly meals?", INTENT_MEAL_PLAN_REQUEST),
    ("Create a healthy breakfast lunch dinner schedule", INTENT_MEAL_PLAN_REQUEST),
    ("Generate a vegetarian meal plan for weight loss", INTENT_MEAL_PLAN_REQUEST),
    ("What should I eat this week?", INTENT_MEAL_PLAN_REQUEST),
    ("Help me plan my meals for diabetes control", INTENT_MEAL_PLAN_REQUEST),
    ("Suggest a 7-day routine for fitness support", INTENT_MEAL_PLAN_REQUEST),
    ("Make me a meal plan with Indian foods", INTENT_MEAL_PLAN_REQUEST),
    ("Weekly diet routine for high blood pressure", INTENT_MEAL_PLAN_REQUEST),
    ("I need a weekly healthy eating guide", INTENT_MEAL_PLAN_REQUEST),

    # general_health
    ("How much water should I drink in a day?", INTENT_GENERAL_HEALTH),
    ("How many hours of sleep are recommended?", INTENT_GENERAL_HEALTH),
    ("Why is physical exercise important for mental health?", INTENT_GENERAL_HEALTH),
    ("How can I improve my digestion naturally?", INTENT_GENERAL_HEALTH),
    ("Tips for reducing stress and anxiety", INTENT_GENERAL_HEALTH),
    ("How to stay hydrated during summer?", INTENT_GENERAL_HEALTH),
    ("What are good habits for healthy living?", INTENT_GENERAL_HEALTH),
    ("How to maintain a steady daily routine?", INTENT_GENERAL_HEALTH),
    ("Benefits of walking 30 minutes every day", INTENT_GENERAL_HEALTH),
    ("What causes bloating after meals?", INTENT_GENERAL_HEALTH),

    # profile_query
    ("What health conditions did I register?", INTENT_PROFILE_QUERY),
    ("Show me my saved allergies and preferences", INTENT_PROFILE_QUERY),
    ("What are my current health goals?", INTENT_PROFILE_QUERY),
    ("What is my dietary preference on my profile?", INTENT_PROFILE_QUERY),
    ("Review my personal health details", INTENT_PROFILE_QUERY),
    ("Am I listed as vegetarian or vegan?", INTENT_PROFILE_QUERY),
    ("What is my recorded activity level?", INTENT_PROFILE_QUERY),
    ("Check my profile settings", INTENT_PROFILE_QUERY),
]

class IntentClassifier:
    _instance: Optional["IntentClassifier"] = None

    def __init__(self):
        self.vectorizer = TfidfVectorizer(ngram_range=(1, 2), min_df=1, sublinear_tf=True)
        self.classifier = LogisticRegression(C=5.0, max_iter=200, random_state=42)
        self._train()

    @classmethod
    def get_instance(cls) -> "IntentClassifier":
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def _train(self):
        X_texts = [item[0] for item in TRAINING_DATA]
        y_labels = [item[1] for item in TRAINING_DATA]
        X_vec = self.vectorizer.fit_transform(X_texts)
        self.classifier.fit(X_vec, y_labels)

    def predict(self, query: str) -> Tuple[str, float, Dict[str, float]]:
        cleaned = query.strip()
        if not cleaned:
            return INTENT_GENERAL_HEALTH, 0.0, {}

        # Heuristic overrides for unmistakable keywords
        lower = cleaned.lower()
        if any(w in lower for w in ["diet plan", "meal plan", "weekly plan", "7 day plan", "7-day plan", "plan my meals"]):
            return INTENT_MEAL_PLAN_REQUEST, 0.95, {INTENT_MEAL_PLAN_REQUEST: 0.95}

        if any(w in lower for w in ["my profile", "my allergies", "my conditions", "my goals", "what did i register", "my saved info"]):
            return INTENT_PROFILE_QUERY, 0.95, {INTENT_PROFILE_QUERY: 0.95}

        vec = self.vectorizer.transform([cleaned])
        probas = self.classifier.predict_proba(vec)[0]
        classes = self.classifier.classes_

        class_probas = {cls_name: float(probas[i]) for i, cls_name in enumerate(classes)}
        top_idx = probas.argmax()
        top_intent = str(classes[top_idx])
        top_score = float(probas[top_idx])

        # If user asks "can i eat / drink", strongly favor food_suitability
        if re.search(r"\b(can i eat|can i drink|can i have|is it safe to eat|should i eat|is .* good for)\b", lower):
            if class_probas.get(INTENT_FOOD_SUITABILITY, 0) > 0.15:
                top_intent = INTENT_FOOD_SUITABILITY
                top_score = max(top_score, 0.88)

        # If user asks specifically about calories/protein/fat/macros
        if re.search(r"\b(calorie|calories|protein|macro|macros|carbs|fiber|fat content|nutritional value)\b", lower):
            if class_probas.get(INTENT_NUTRITION_QUERY, 0) > 0.15:
                top_intent = INTENT_NUTRITION_QUERY
                top_score = max(top_score, 0.88)

        return top_intent, round(top_score, 3), class_probas

intent_classifier = IntentClassifier.get_instance()

