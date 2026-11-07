from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict

class AllergyItem(BaseModel):
    allergen: str
    severity: str = "moderate" # mild, moderate, severe
    notes: Optional[str] = None

class GoalItem(BaseModel):
    goal_type: str # weight_management, healthy_eating, nutritional_balance, fitness_support, other
    description: Optional[str] = None

class HealthConditionItem(BaseModel):
    condition_name: str
    notes: Optional[str] = None

class Step1PersonalInfo(BaseModel):
    age: Optional[int] = Field(None, ge=1, le=120)
    gender: Optional[str] = None

class Step2HealthInfo(BaseModel):
    health_conditions: List[str] = []
    allergies: List[str] = []
    additional_notes: Optional[str] = None

class Step3Lifestyle(BaseModel):
    diet_type: str = "vegetarian" # vegetarian, vegan, lacto_vegetarian, eggetarian, non_vegetarian
    activity_level: str = "moderate" # sedentary, light, moderate, active, very_active
    daily_routine: Optional[str] = None
    preferred_cuisines: Optional[str] = None
    disliked_foods: Optional[str] = None

class Step4Goals(BaseModel):
    goals: List[str] = []
    custom_goal: Optional[str] = None

class FullOnboardingRequest(BaseModel):
    age: Optional[int] = Field(None, ge=1, le=120)
    gender: Optional[str] = None
    health_conditions: List[str] = []
    allergies: List[str] = []
    diet_type: str = "vegetarian"
    activity_level: str = "moderate"
    daily_routine: Optional[str] = None
    preferred_cuisines: Optional[str] = None
    disliked_foods: Optional[str] = None
    goals: List[str] = []
    additional_notes: Optional[str] = None

class ProfileDetailResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    user_id: int
    full_name: str
    email: str
    age: Optional[int] = None
    gender: Optional[str] = None
    activity_level: str = "moderate"
    daily_routine: Optional[str] = None
    additional_notes: Optional[str] = None
    onboarding_completed: bool = False
    diet_type: str = "vegetarian"
    preferred_cuisines: Optional[str] = None
    disliked_foods: Optional[str] = None
    health_conditions: List[str] = []
    allergies: List[str] = []
    goals: List[str] = []
    created_at: Optional[datetime] = None
