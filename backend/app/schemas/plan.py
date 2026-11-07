from typing import List, Optional, Dict
from datetime import datetime
from pydantic import BaseModel, ConfigDict

class MealItem(BaseModel):
    id: Optional[int] = None
    day_of_week: str
    meal_type: str # Breakfast, Lunch, Evening Snack, Dinner
    food_name: str
    category: Optional[str] = None
    portion_guidance: Optional[str] = None
    activity_suggestion: Optional[str] = None

class DayMeals(BaseModel):
    day: str
    breakfast: str
    lunch: str
    evening_snack: str
    dinner: str
    activity: str

class WeeklyPlanGenerateRequest(BaseModel):
    target_goal: Optional[str] = None
    custom_notes: Optional[str] = None

class WeeklyPlanResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    title: str
    status: str
    notes: Optional[str] = None
    created_at: datetime
    days: List[DayMeals]
    disclaimer: str
