from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import (
    User, UserProfile, UserHealthCondition, UserAllergy,
    UserFoodPreference, UserGoal, Conversation, WeeklyPlan, FoodSearchHistory
)
from app.schemas.profile import (
    FullOnboardingRequest,
    ProfileDetailResponse,
    Step1PersonalInfo,
    Step2HealthInfo,
    Step3Lifestyle,
    Step4Goals
)
from app.services.auth_service import get_current_user

router = APIRouter(prefix="/api/profile", tags=["User Profile"])

@router.get("", response_model=ProfileDetailResponse)
def get_user_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = current_user.profile
    prefs = current_user.food_preferences
    conditions = [c.condition_name for c in current_user.health_conditions]
    allergies = [a.allergen for a in current_user.allergies]
    goals = [g.goal_type for g in current_user.goals]

    return ProfileDetailResponse(
        user_id=current_user.id,
        full_name=current_user.full_name,
        email=current_user.email,
        age=profile.age if profile else None,
        gender=profile.gender if profile else None,
        activity_level=profile.activity_level if profile else "moderate",
        daily_routine=profile.daily_routine if profile else None,
        additional_notes=profile.additional_notes if profile else None,
        onboarding_completed=profile.onboarding_completed if profile else False,
        diet_type=prefs.diet_type if prefs else "vegetarian",
        preferred_cuisines=prefs.preferred_cuisines if prefs else None,
        disliked_foods=prefs.disliked_foods if prefs else None,
        health_conditions=conditions,
        allergies=allergies,
        goals=goals,
        created_at=current_user.created_at
    )

@router.post("/onboarding", response_model=ProfileDetailResponse)
def complete_onboarding(
    data: FullOnboardingRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # 1. Update or create profile
    profile = current_user.profile
    if not profile:
        profile = UserProfile(user_id=current_user.id)
        db.add(profile)
    
    profile.age = data.age
    profile.gender = data.gender
    profile.activity_level = data.activity_level
    profile.daily_routine = data.daily_routine
    profile.additional_notes = data.additional_notes
    profile.onboarding_completed = True

    # 2. Update food preferences
    prefs = current_user.food_preferences
    if not prefs:
        prefs = UserFoodPreference(user_id=current_user.id)
        db.add(prefs)
    prefs.diet_type = data.diet_type
    prefs.preferred_cuisines = data.preferred_cuisines
    prefs.disliked_foods = data.disliked_foods

    # 3. Clear and re-populate conditions
    db.query(UserHealthCondition).filter(UserHealthCondition.user_id == current_user.id).delete()
    for cond in data.health_conditions:
        if cond.strip():
            db.add(UserHealthCondition(user_id=current_user.id, condition_name=cond.strip()))

    # 4. Clear and re-populate allergies
    db.query(UserAllergy).filter(UserAllergy.user_id == current_user.id).delete()
    for allergen in data.allergies:
        if allergen.strip():
            db.add(UserAllergy(user_id=current_user.id, allergen=allergen.strip()))

    # 5. Clear and re-populate goals
    db.query(UserGoal).filter(UserGoal.user_id == current_user.id).delete()
    for goal in data.goals:
        if goal.strip():
            db.add(UserGoal(user_id=current_user.id, goal_type=goal.strip()))

    db.commit()
    db.refresh(current_user)

    return get_user_profile(current_user=current_user, db=db)

@router.put("/personal", response_model=ProfileDetailResponse)
def update_personal(
    data: Step1PersonalInfo,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = current_user.profile
    if not profile:
        profile = UserProfile(user_id=current_user.id)
        db.add(profile)
    if data.age is not None:
        profile.age = data.age
    if data.gender is not None:
        profile.gender = data.gender
    db.commit()
    return get_user_profile(current_user=current_user, db=db)

@router.put("/health", response_model=ProfileDetailResponse)
def update_health(
    data: Step2HealthInfo,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = current_user.profile
    if profile and data.additional_notes is not None:
        profile.additional_notes = data.additional_notes

    db.query(UserHealthCondition).filter(UserHealthCondition.user_id == current_user.id).delete()
    for cond in data.health_conditions:
        if cond.strip():
            db.add(UserHealthCondition(user_id=current_user.id, condition_name=cond.strip()))

    db.query(UserAllergy).filter(UserAllergy.user_id == current_user.id).delete()
    for allergen in data.allergies:
        if allergen.strip():
            db.add(UserAllergy(user_id=current_user.id, allergen=allergen.strip()))

    db.commit()
    return get_user_profile(current_user=current_user, db=db)

@router.put("/lifestyle", response_model=ProfileDetailResponse)
def update_lifestyle(
    data: Step3Lifestyle,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = current_user.profile
    if profile:
        profile.activity_level = data.activity_level
        profile.daily_routine = data.daily_routine

    prefs = current_user.food_preferences
    if not prefs:
        prefs = UserFoodPreference(user_id=current_user.id)
        db.add(prefs)
    prefs.diet_type = data.diet_type
    prefs.preferred_cuisines = data.preferred_cuisines
    prefs.disliked_foods = data.disliked_foods

    db.commit()
    return get_user_profile(current_user=current_user, db=db)

@router.put("/goals", response_model=ProfileDetailResponse)
def update_goals(
    data: Step4Goals,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db.query(UserGoal).filter(UserGoal.user_id == current_user.id).delete()
    for goal in data.goals:
        if goal.strip():
            db.add(UserGoal(user_id=current_user.id, goal_type=goal.strip()))
    db.commit()
    return get_user_profile(current_user=current_user, db=db)

@router.delete("/data", status_code=status.HTTP_200_OK)
def delete_user_account_and_data(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Completely delete user and cascade all profiles, chats, plans
    db.delete(current_user)
    db.commit()
    return {"message": "Account and all associated health data successfully deleted."}

