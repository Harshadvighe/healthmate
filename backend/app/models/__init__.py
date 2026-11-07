import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    profile = relationship("UserProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    health_conditions = relationship("UserHealthCondition", back_populates="user", cascade="all, delete-orphan")
    allergies = relationship("UserAllergy", back_populates="user", cascade="all, delete-orphan")
    food_preferences = relationship("UserFoodPreference", back_populates="user", uselist=False, cascade="all, delete-orphan")
    goals = relationship("UserGoal", back_populates="user", cascade="all, delete-orphan")
    conversations = relationship("Conversation", back_populates="user", cascade="all, delete-orphan")
    weekly_plans = relationship("WeeklyPlan", back_populates="user", cascade="all, delete-orphan")
    search_history = relationship("FoodSearchHistory", back_populates="user", cascade="all, delete-orphan")


class UserProfile(Base):
    __tablename__ = "user_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    age = Column(Integer, nullable=True)
    gender = Column(String(50), nullable=True)
    activity_level = Column(String(50), default="moderate") # sedentary, light, moderate, active, very_active
    daily_routine = Column(Text, nullable=True) # desk job, shift work, active outdoor, etc.
    additional_notes = Column(Text, nullable=True)
    onboarding_completed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    user = relationship("User", back_populates="profile")


class UserHealthCondition(Base):
    __tablename__ = "user_health_conditions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    condition_name = Column(String(100), nullable=False) # e.g. Diabetes, Hypertension, Lactose Intolerance, PCOS, Thyroid
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="health_conditions")


class UserAllergy(Base):
    __tablename__ = "user_allergies"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    allergen = Column(String(100), nullable=False) # e.g. milk, gluten, peanut, egg, soy, fish, sesame
    severity = Column(String(50), default="moderate") # mild, moderate, severe
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="allergies")


class UserFoodPreference(Base):
    __tablename__ = "user_food_preferences"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    diet_type = Column(String(50), default="vegetarian") # vegetarian, vegan, lacto_vegetarian, eggetarian, non_vegetarian
    preferred_cuisines = Column(String(255), nullable=True) # North Indian, South Indian, Maharashtrian, etc.
    disliked_foods = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="food_preferences")


class UserGoal(Base):
    __tablename__ = "user_goals"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    goal_type = Column(String(100), nullable=False) # weight_management, healthy_eating, nutritional_balance, fitness_support, other
    description = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="goals")


class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), default="New Health Consultation")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    user = relationship("User", back_populates="conversations")
    messages = relationship("ChatMessage", back_populates="conversation", cascade="all, delete-orphan", order_by="ChatMessage.created_at")


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(Integer, ForeignKey("conversations.id", ondelete="CASCADE"), nullable=False, index=True)
    sender = Column(String(20), nullable=False) # 'user' or 'assistant'
    message_text = Column(Text, nullable=False)
    intent = Column(String(50), nullable=True)
    matched_food = Column(String(150), nullable=True)
    metadata_json = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    conversation = relationship("Conversation", back_populates="messages")


class WeeklyPlan(Base):
    __tablename__ = "weekly_plans"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), default="My Personalized 7-Day Plan")
    status = Column(String(50), default="active") # active, archived
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    user = relationship("User", back_populates="weekly_plans")
    meals = relationship("WeeklyPlanMeal", back_populates="weekly_plan", cascade="all, delete-orphan")


class WeeklyPlanMeal(Base):
    __tablename__ = "weekly_plan_meals"

    id = Column(Integer, primary_key=True, index=True)
    weekly_plan_id = Column(Integer, ForeignKey("weekly_plans.id", ondelete="CASCADE"), nullable=False, index=True)
    day_of_week = Column(String(20), nullable=False) # Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday
    meal_type = Column(String(30), nullable=False) # Breakfast, Lunch, Evening Snack, Dinner
    food_name = Column(String(255), nullable=False)
    category = Column(String(100), nullable=True)
    portion_guidance = Column(String(255), nullable=True)
    activity_suggestion = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    weekly_plan = relationship("WeeklyPlan", back_populates="meals")


class FoodSearchHistory(Base):
    __tablename__ = "food_search_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    query_text = Column(String(255), nullable=False)
    matched_food_id = Column(String(50), nullable=True)
    matched_food_name = Column(String(255), nullable=True)
    search_timestamp = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="search_history")

