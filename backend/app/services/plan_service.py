from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session

from app.models import User, WeeklyPlan, WeeklyPlanMeal
from app.ml.recommendation_scorer import DISCLAIMER_TEXT

MEAL_TEMPLATES = {
    "vegetarian": [
        {
            "day": "Monday",
            "breakfast": "Poha with roasted peanuts, curry leaves, and green peas",
            "lunch": "2 Phulkas, Yellow Moong Dal, Lauki (Bottle Gourd) Sabzi, and fresh cucumber salad",
            "evening_snack": "Roasted Makhana (Foxnuts) with mild spices and green tea",
            "dinner": "Khichdi with mixed vegetables and homemade low-fat curd",
            "activity": "30-minute brisk walk and morning mobility stretching"
        },
        {
            "day": "Tuesday",
            "breakfast": "Moong Dal Chilla stuffed with grated paneer and mint chutney",
            "lunch": "Brown Rice or Millet bowl, Dal Tadka, Bhindi (Okra) fry, and kachumber",
            "evening_snack": "Handful of soaked almonds and walnuts with coconut water",
            "dinner": "2 Multigrain Rotis, Palak Paneer (light gravy), and steamed beetroot",
            "activity": "25-minute moderate bodyweight exercises and joint rotation"
        },
        {
            "day": "Wednesday",
            "breakfast": "Vegetable Upma prepared with semolina, carrots, and mustard tempering",
            "lunch": "2 Jowar (Sorghum) Bhakris, Methi Sabzi, Chana Dal, and fresh chaas",
            "evening_snack": "Sprouted Moong and Pomegranate chaat with lime juice",
            "dinner": "Light Vegetable Dalia (broken wheat) with steamed beans and curd",
            "activity": "35-minute outdoor walking or cycling session"
        },
        {
            "day": "Thursday",
            "breakfast": "Steamed Idlis with coconut-chana dal chutney and mixed vegetable sambhar",
            "lunch": "2 Whole Wheat Rotis, Rajma (Kidney Beans) curry, and cabbage-carrot slaw",
            "evening_snack": "Roasted Chana (gram) with herbal infusion",
            "dinner": "Paneer and Capsicum stir-fry with 2 thin phulkas and vegetable soup",
            "activity": "20-minute restorative yoga focusing on deep breathing and core"
        },
        {
            "day": "Friday",
            "breakfast": "Methi Thepla with curd and tomato chutney",
            "lunch": "Jeera Rice with Chole (Chickpea curry), cucumber raita, and sliced onions",
            "evening_snack": "Fresh fruit bowl (papaya, apple, or guava) with chaat masala",
            "dinner": "Vegetable Clear Soup followed by 2 Bajra Rotis and Baingan Bharta",
            "activity": "30-minute brisk walking and stair-stepping intervals"
        },
        {
            "day": "Saturday",
            "breakfast": "Oats porridge cooked with milk or water, topped with chia seeds and sliced banana",
            "lunch": "2 Whole Wheat Rotis, Paneer Bhurji, Mixed Vegetable Dal, and sprout salad",
            "evening_snack": "Bhel Puri prepared with puffed rice, onions, tomatoes, and tamarind drizzle",
            "dinner": "Moong Dal soup with grilled paneer cubes and warm steamed veggies",
            "activity": "45-minute active recreation (swimming, badminton, or nature hike)"
        },
        {
            "day": "Sunday",
            "breakfast": "Besan Chilla with grated carrot and coriander, accompanied by mint dip",
            "lunch": "Healthy Veg Biryani or Pulao loaded with beans, carrots, paneer, and curd raita",
            "evening_snack": "Warm herbal turmeric latte or spiced kadha with dry roasted pumpkin seeds",
            "dinner": "Light Lauki soup and 1 Multigrain Roti with Dal Palak",
            "activity": "20-minute mindful stretching and restorative breathing"
        }
    ],
    "vegan": [
        {
            "day": "Monday",
            "breakfast": "Poha with roasted peanuts and lemon zest",
            "lunch": "2 Phulkas, Yellow Moong Dal, Lauki Sabzi, and tomato cucumber salad",
            "evening_snack": "Roasted Makhana and black tea",
            "dinner": "Vegetable Dalia with tofu cubes and coriander",
            "activity": "30-minute brisk walk and morning mobility stretching"
        },
        {
            "day": "Tuesday",
            "breakfast": "Moong Dal Chilla stuffed with seasoned tofu and green chutney",
            "lunch": "Brown Rice, Chana Masala, sauteed spinach, and sliced radish",
            "evening_snack": "Soaked almonds and walnuts with coconut water",
            "dinner": "2 Multigrain Rotis, Soya Chunks curry, and steamed beans",
            "activity": "25-minute moderate strength routine"
        },
        {
            "day": "Wednesday",
            "breakfast": "Vegetable Upma with curry leaves and mustard seeds",
            "lunch": "2 Jowar Bhakris, Methi Sabzi, Chana Dal, and fresh lime water",
            "evening_snack": "Sprouted Moong Chaat with lemon and fresh coriander",
            "dinner": "Light Vegetable Khichdi with coconut chutney",
            "activity": "35-minute outdoor walking session"
        },
        {
            "day": "Thursday",
            "breakfast": "Steamed Idlis with Coconut Chutney and vegetable-rich Sambhar",
            "lunch": "2 Whole Wheat Rotis, Rajma curry, and grated carrot beet slaw",
            "evening_snack": "Roasted Bengal gram and chamomile tea",
            "dinner": "Tofu & Bell Pepper stir-fry with warm whole-grain flatbread",
            "activity": "20-minute restorative yoga and core stability"
        },
        {
            "day": "Friday",
            "breakfast": "Methi Thepla with mint chutney and spicy lime pickle",
            "lunch": "Jeera Rice with Chickpea Dal and crunchy cucumber salad",
            "evening_snack": "Fresh seasonal fruit bowl (papaya, guava, pomegranate)",
            "dinner": "Mushroom and Pea curry with 2 thin Phulkas",
            "activity": "30-minute brisk walk"
        },
        {
            "day": "Saturday",
            "breakfast": "Oatmeal with almond milk, flax seeds, and banana",
            "lunch": "2 Whole Wheat Rotis, Tofu Bhurji, Dal Tadka, and mixed salad",
            "evening_snack": "Dry roasted puffed rice and green tea",
            "dinner": "Mixed vegetable soup with grilled tempeh and steamed broccoli",
            "activity": "45-minute recreational sport or hiking"
        },
        {
            "day": "Sunday",
            "breakfast": "Besan Chilla with shredded zucchini and tomato relish",
            "lunch": "Vegetable Pulao loaded with legumes and sprouts",
            "evening_snack": "Spiced herbal water with roasted pumpkin seeds",
            "dinner": "Light pumpkin soup and 1 Multigrain Roti with Dal Palak",
            "activity": "20-minute mindful evening walk"
        }
    ],
    "eggetarian": [
        {
            "day": "Monday",
            "breakfast": "2 Boiled eggs with whole wheat toast and mint tea",
            "lunch": "2 Phulkas, Yellow Moong Dal, Lauki Sabzi, and fresh salad",
            "evening_snack": "Roasted Makhana with green tea",
            "dinner": "Egg Bhurji (scrambled eggs with onions & tomatoes) with 2 whole wheat rotis",
            "activity": "30-minute brisk walk and morning mobility stretching"
        },
        {
            "day": "Tuesday",
            "breakfast": "Vegetable & herb egg omelette with sliced cucumber",
            "lunch": "Brown Rice bowl, Dal Tadka, Bhindi fry, and kachumber",
            "evening_snack": "Handful of soaked almonds and walnuts",
            "dinner": "2 Multigrain Rotis, Palak Paneer, and steamed beetroot",
            "activity": "25-minute moderate bodyweight exercises and joint rotation"
        },
        {
            "day": "Wednesday",
            "breakfast": "Vegetable Poha topped with a poached egg and coriander",
            "lunch": "2 Jowar Bhakris, Methi Sabzi, Chana Dal, and fresh chaas",
            "evening_snack": "Sprouted Moong chaat with lime juice",
            "dinner": "Egg curry (light tomato-onion gravy) with 1 cup brown rice or 2 phulkas",
            "activity": "35-minute outdoor walking or cycling session"
        },
        {
            "day": "Thursday",
            "breakfast": "Moong Dal Chilla with 1 boiled egg white and mint chutney",
            "lunch": "2 Whole Wheat Rotis, Rajma curry, and cabbage-carrot slaw",
            "evening_snack": "Roasted Chana with herbal infusion",
            "dinner": "Paneer and capsicum stir-fry with vegetable clear soup",
            "activity": "20-minute restorative yoga focusing on deep breathing and core"
        },
        {
            "day": "Friday",
            "breakfast": "French toast (whole grain bread, light egg wash) with fruit slices",
            "lunch": "Jeera Rice with Chole, cucumber raita, and sliced onions",
            "evening_snack": "Fresh fruit bowl (papaya, apple, or guava)",
            "dinner": "2 Bajra Rotis with Baingan Bharta and steamed lentil soup",
            "activity": "30-minute brisk walking and stair-stepping intervals"
        },
        {
            "day": "Saturday",
            "breakfast": "Oats cooked with milk, served with 2 boiled egg whites",
            "lunch": "2 Whole Wheat Rotis, Paneer Bhurji, Mixed Veg Dal, and salad",
            "evening_snack": "Bhel Puri with puffed rice and sprouts",
            "dinner": "Egg and vegetable fried rice (made with minimal oil and brown rice)",
            "activity": "45-minute active recreation (swimming, badminton, or nature hike)"
        },
        {
            "day": "Sunday",
            "breakfast": "Besan Chilla stuffed with egg bhurji and coriander",
            "lunch": "Egg Biryani prepared with aromatic spices, served with cucumber raita",
            "evening_snack": "Warm herbal turmeric latte or spiced kadha with pumpkin seeds",
            "dinner": "Light bottle gourd soup and 1 Multigrain Roti with Dal Palak",
            "activity": "20-minute mindful stretching and restorative breathing"
        }
    ],
    "non_vegetarian": [
        {
            "day": "Monday",
            "breakfast": "2 Boiled eggs with multigrain toast and a warm cup of green tea",
            "lunch": "2 Phulkas, Yellow Moong Dal, Steamed Bhindi, and cucumber-tomato salad",
            "evening_snack": "Roasted Makhana and coconut water",
            "dinner": "Grilled Chicken breast or Light Chicken curry with 2 thin Phulkas and salad",
            "activity": "30-minute brisk walk and morning mobility stretching"
        },
        {
            "day": "Tuesday",
            "breakfast": "Vegetable egg omelette with mint and coriander chutney",
            "lunch": "Brown Rice bowl, Dal Tadka, and fresh mixed green salad",
            "evening_snack": "Handful of soaked almonds and walnuts",
            "dinner": "Pan-seared Fish or Palak Chicken with 2 Multigrain Rotis",
            "activity": "25-minute moderate bodyweight exercises and joint rotation"
        },
        {
            "day": "Wednesday",
            "breakfast": "Vegetable Poha with roasted peanuts and lemon",
            "lunch": "2 Jowar Bhakris, Chana Dal, and sauteed seasonal vegetables",
            "evening_snack": "Sprouted Moong and boiled egg chaat",
            "dinner": "Light Chicken and vegetable soup with 1 whole wheat flatbread",
            "activity": "35-minute outdoor walking or cycling session"
        },
        {
            "day": "Thursday",
            "breakfast": "Moong Dal Chilla with 1 boiled egg white and mint dip",
            "lunch": "2 Whole Wheat Rotis, Rajma curry, and crisp cucumber raita",
            "evening_snack": "Roasted Chana with herbal tea",
            "dinner": "Grilled Fish or Tawa Chicken tikka (minimal oil) with sauteed bell peppers",
            "activity": "20-minute restorative yoga focusing on deep breathing and core"
        },
        {
            "day": "Friday",
            "breakfast": "Oatmeal porridge topped with sliced banana and 2 boiled egg whites",
            "lunch": "Jeera Rice with Chicken curry (homestyle thin gravy) and kachumber",
            "evening_snack": "Fresh fruit bowl (papaya, apple, or guava)",
            "dinner": "2 Bajra Rotis with Yellow Moong Dal and stir-fried beans",
            "activity": "30-minute brisk walking and stair-stepping intervals"
        },
        {
            "day": "Saturday",
            "breakfast": "Egg Bhurji with 2 warm Phulkas and tomato chutney",
            "lunch": "Brown Rice with Fish curry (coastal style with kokum), and cabbage salad",
            "evening_snack": "Dry roasted puffed rice and green tea",
            "dinner": "Clear chicken broth with steamed vegetables and 1 Multigrain Roti",
            "activity": "45-minute active recreation (swimming, badminton, or nature hike)"
        },
        {
            "day": "Sunday",
            "breakfast": "Besan Chilla with shredded vegetables and mint tea",
            "lunch": "Homestyle Chicken Pulao or Biryani with fresh cucumber-onion raita",
            "evening_snack": "Warm herbal spiced water with roasted seeds",
            "dinner": "Light Vegetable Soup and 1 Phulka with Dal Palak",
            "activity": "20-minute mindful stretching and restorative breathing"
        }
    ]
}

class PlanService:
    def generate_plan(
        self,
        db: Session,
        user: User,
        custom_notes: Optional[str] = None
    ) -> WeeklyPlan:
        # Determine dietary category
        diet_type = user.food_preferences.diet_type.lower() if user.food_preferences else "vegetarian"
        if diet_type not in MEAL_TEMPLATES:
            # Fall back to vegetarian templates for non-vegetarian / eggetarian (safe baseline)
            template_key = "vegetarian"
        else:
            template_key = diet_type

        # Check allergies and filter dairy/peanuts if needed
        user_allergies = [a.allergen.lower() for a in user.allergies]
        has_milk_allergy = any("milk" in a or "dairy" in a for a in user_allergies)
        has_peanut_allergy = any("peanut" in a or "nut" in a for a in user_allergies)

        template_days = MEAL_TEMPLATES[template_key]

        plan = WeeklyPlan(
            user_id=user.id,
            title=f"Personalized 7-Day Plan ({diet_type.title()})",
            status="active",
            notes=custom_notes or "Auto-generated based on registered preferences and wellness goals."
        )
        db.add(plan)
        db.commit()
        db.refresh(plan)

        for day_data in template_days:
            bf = day_data["breakfast"]
            lu = day_data["lunch"]
            sn = day_data["evening_snack"]
            di = day_data["dinner"]

            # Adapt for milk allergy if present
            if has_milk_allergy:
                bf = bf.replace("paneer", "tofu").replace("curd", "mint dip").replace("milk", "almond milk")
                lu = lu.replace("curd", "kachumber").replace("chaas", "lemon water").replace("raita", "salad")
                di = di.replace("paneer", "tofu").replace("curd", "soup")

            if has_peanut_allergy:
                bf = bf.replace("peanuts", "roasted seeds")

            # Create meals in db
            meals = [
                WeeklyPlanMeal(weekly_plan_id=plan.id, day_of_week=day_data["day"], meal_type="Breakfast", food_name=bf, activity_suggestion=day_data["activity"]),
                WeeklyPlanMeal(weekly_plan_id=plan.id, day_of_week=day_data["day"], meal_type="Lunch", food_name=lu, activity_suggestion=day_data["activity"]),
                WeeklyPlanMeal(weekly_plan_id=plan.id, day_of_week=day_data["day"], meal_type="Evening Snack", food_name=sn, activity_suggestion=day_data["activity"]),
                WeeklyPlanMeal(weekly_plan_id=plan.id, day_of_week=day_data["day"], meal_type="Dinner", food_name=di, activity_suggestion=day_data["activity"]),
            ]
            for m in meals:
                db.add(m)

        db.commit()
        db.refresh(plan)
        return plan

    def get_user_plans(self, db: Session, user: User) -> List[WeeklyPlan]:
        return db.query(WeeklyPlan).filter(WeeklyPlan.user_id == user.id).order_by(WeeklyPlan.created_at.desc()).all()

    def get_plan_by_id(self, db: Session, plan_id: int, user: User) -> Optional[WeeklyPlan]:
        return db.query(WeeklyPlan).filter(WeeklyPlan.id == plan_id, WeeklyPlan.user_id == user.id).first()

plan_service = PlanService()

