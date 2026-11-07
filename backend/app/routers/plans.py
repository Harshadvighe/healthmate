from typing import List, Dict
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User, WeeklyPlan, WeeklyPlanMeal
from app.schemas.plan import WeeklyPlanGenerateRequest, WeeklyPlanResponse, DayMeals
from app.services.auth_service import get_current_user
from app.services.plan_service import plan_service
from app.ml.recommendation_scorer import DISCLAIMER_TEXT

router = APIRouter(prefix="/api/plans", tags=["Weekly Meal Plans"])

def format_plan_response(plan: WeeklyPlan) -> WeeklyPlanResponse:
    # Group meals by day
    days_order = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    day_map: Dict[str, Dict[str, str]] = {
        d: {"breakfast": "", "lunch": "", "evening_snack": "", "dinner": "", "activity": ""}
        for d in days_order
    }

    for meal in plan.meals:
        d = meal.day_of_week
        if d in day_map:
            m_type = meal.meal_type.lower().replace(" ", "_")
            if m_type == "breakfast":
                day_map[d]["breakfast"] = meal.food_name
            elif m_type == "lunch":
                day_map[d]["lunch"] = meal.food_name
            elif "snack" in m_type:
                day_map[d]["evening_snack"] = meal.food_name
            elif m_type == "dinner":
                day_map[d]["dinner"] = meal.food_name
            if meal.activity_suggestion:
                day_map[d]["activity"] = meal.activity_suggestion

    days_list = [
        DayMeals(
            day=d,
            breakfast=day_map[d]["breakfast"] or "Balanced seasonal breakfast",
            lunch=day_map[d]["lunch"] or "Whole grain and pulse lunch",
            evening_snack=day_map[d]["evening_snack"] or "Nutritious light snack",
            dinner=day_map[d]["dinner"] or "Light digestible dinner",
            activity=day_map[d]["activity"] or "Daily active walking"
        )
        for d in days_order
    ]

    return WeeklyPlanResponse(
        id=plan.id,
        user_id=plan.user_id,
        title=plan.title,
        status=plan.status,
        notes=plan.notes,
        created_at=plan.created_at,
        days=days_list,
        disclaimer=DISCLAIMER_TEXT
    )

@router.post("/generate", response_model=WeeklyPlanResponse, status_code=status.HTTP_201_CREATED)
def generate_weekly_plan(
    payload: WeeklyPlanGenerateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    plan = plan_service.generate_plan(
        db=db,
        user=current_user,
        custom_notes=payload.custom_notes
    )
    return format_plan_response(plan)

@router.get("", response_model=List[WeeklyPlanResponse])
def get_user_plans(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    plans = plan_service.get_user_plans(db=db, user=current_user)
    return [format_plan_response(p) for p in plans]

@router.get("/{plan_id}", response_model=WeeklyPlanResponse)
def get_plan(
    plan_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    plan = plan_service.get_plan_by_id(db=db, plan_id=plan_id, user=current_user)
    if not plan:
        raise HTTPException(status_code=404, detail="Weekly plan not found or access denied.")
    return format_plan_response(plan)

@router.put("/{plan_id}", response_model=WeeklyPlanResponse)
def update_plan_status(
    plan_id: int,
    title: str = None,
    notes: str = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    plan = plan_service.get_plan_by_id(db=db, plan_id=plan_id, user=current_user)
    if not plan:
        raise HTTPException(status_code=404, detail="Weekly plan not found or access denied.")
    if title:
        plan.title = title
    if notes is not None:
        plan.notes = notes
    db.commit()
    db.refresh(plan)
    return format_plan_response(plan)

