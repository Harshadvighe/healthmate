from typing import Optional, List
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User, FoodSearchHistory
from app.schemas.food import FoodItem, FoodSearchResponse, FoodCheckRequest, FoodCheckResponse
from app.services.dataset_service import dataset_service
from app.ml.food_matcher import food_matcher
from app.ml.recommendation_scorer import evaluate_food_suitability
from app.services.auth_service import security, jwt, settings

router = APIRouter(prefix="/api/foods", tags=["Food Intelligence"])

def get_optional_user(
    auth = Depends(security),
    db: Session = Depends(get_db)
) -> Optional[User]:
    if not auth:
        return None
    try:
        payload = jwt.decode(auth.credentials, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email = payload.get("sub")
        if email:
            return db.query(User).filter(User.email == email).first()
    except Exception:
        return None
    return None

def record_to_food_item(record: dict, match_score: Optional[float] = None) -> FoodItem:
    return FoodItem(
        food_id=str(record.get("food_id", "")),
        canonical_food_id=str(record.get("canonical_food_id", "")),
        food_name=str(record.get("food_name", "")),
        canonical_food_name=str(record.get("canonical_food_name", "")),
        name_mr=str(record.get("name_mr", "")),
        name_hi=str(record.get("name_hi", "")),
        search_aliases=str(record.get("search_aliases", "")),
        food_category=str(record.get("food_category", "")),
        food_type=str(record.get("food_type", "")),
        preparation_form=str(record.get("preparation_form", "")),
        preparation_label=str(record.get("preparation_label", "")),
        region_or_origin=str(record.get("region_or_origin", "")),
        food_group=str(record.get("food_group", "")),
        diet_type=str(record.get("diet_type", "")),
        allergen_tags=str(record.get("allergen_tags", "")),
        ingredients_summary=str(record.get("ingredients_summary", "")),
        serving_reference=str(record.get("serving_reference", "")),
        serving_weight_g=str(record.get("serving_weight_g", "")),
        energy_kcal_per_100g=str(record.get("energy_kcal_per_100g", "")),
        protein_g_per_100g=str(record.get("protein_g_per_100g", "")),
        carbohydrate_g_per_100g=str(record.get("carbohydrate_g_per_100g", "")),
        fat_g_per_100g=str(record.get("fat_g_per_100g", "")),
        fibre_g_per_100g=str(record.get("fibre_g_per_100g", "")),
        sodium_mg_per_100g=str(record.get("sodium_mg_per_100g", "")),
        nutrition_verification_status=str(record.get("nutrition_verification_status", "not_yet_populated")),
        health_rule_status=str(record.get("health_rule_status", "")),
        notes=str(record.get("notes", "")),
        match_score=match_score,
    )

@router.get("/validation/report")
def get_dataset_validation_report():
    return dataset_service.get_validation_report()

@router.get("/search", response_model=FoodSearchResponse)
def search_foods(
    q: str = Query(..., min_length=1),
    category: Optional[str] = None,
    limit: int = Query(15, ge=1, le=50)
):
    matches = food_matcher.search(query=q, top_k=limit * 2, threshold=0.15)
    
    results = []
    for rec, score in matches:
        if category and str(rec.get("food_category", "")).lower() != category.lower():
            continue
        results.append(record_to_food_item(rec, match_score=round(score, 3)))
        if len(results) >= limit:
            break

    return FoodSearchResponse(
        query=q,
        total_found=len(results),
        results=results
    )

@router.get("/user/history")
def get_user_search_history(
    current_user: Optional[User] = Depends(get_optional_user),
    db: Session = Depends(get_db),
    limit: int = Query(10, ge=1, le=50)
):
    if not current_user:
        return {"history": []}
    records = db.query(FoodSearchHistory).filter(
        FoodSearchHistory.user_id == current_user.id
    ).order_by(FoodSearchHistory.created_at.desc()).limit(limit).all()
    
    return {
        "history": [
            {
                "id": r.id,
                "query_text": r.query_text,
                "matched_food_id": r.matched_food_id,
                "matched_food_name": r.matched_food_name,
                "created_at": r.created_at.isoformat() if r.created_at else None
            }
            for r in records
        ]
    }

@router.get("/{food_id}", response_model=FoodItem)
def get_food_detail(food_id: str):
    rec = dataset_service.get_by_id(food_id)
    if not rec:
        raise HTTPException(status_code=404, detail="Food item not found in catalog.")
    return record_to_food_item(rec)

@router.post("/check", response_model=FoodCheckResponse)
def check_food(
    payload: FoodCheckRequest,
    current_user: Optional[User] = Depends(get_optional_user),
    db: Session = Depends(get_db)
):
    query = payload.query.strip()
    if not query:
        raise HTTPException(status_code=400, detail="Query cannot be empty.")

    # Search top candidates
    matches = food_matcher.search(query=query, top_k=5, threshold=0.28)

    if not matches:
        return FoodCheckResponse(
            query=query,
            matched=False,
            food=None,
            variants=[],
            suitability=None,
            message=f"No matching food found in the catalog for '{query}'. Please clarify the name or regional term (e.g. Roti, Cow milk, Poha, Dal, Paneer)."
        )

    top_rec, top_score = matches[0]

    # Save to user search history if user logged in
    if current_user:
        history = FoodSearchHistory(
            user_id=current_user.id,
            query_text=query,
            matched_food_id=top_rec.get("food_id"),
            matched_food_name=top_rec.get("food_name"),
        )
        db.add(history)
        db.commit()

    # Find variants of the canonical food
    raw_variants = dataset_service.get_variants(top_rec)
    variant_items = [record_to_food_item(v) for v in raw_variants[:6]]

    # Evaluate personalization
    user_conditions = []
    user_allergies = []
    diet_type = "vegetarian"
    user_goals = []

    if current_user:
        user_conditions = [c.condition_name for c in current_user.health_conditions]
        user_allergies = [a.allergen for a in current_user.allergies]
        if current_user.food_preferences:
            diet_type = current_user.food_preferences.diet_type
        user_goals = [g.goal_type for g in current_user.goals]

    suitability = evaluate_food_suitability(
        food=top_rec,
        user_conditions=user_conditions,
        user_allergies=user_allergies,
        diet_type=diet_type,
        user_goals=user_goals
    )

    return FoodCheckResponse(
        query=query,
        matched=True,
        food=record_to_food_item(top_rec, match_score=round(top_score, 3)),
        variants=variant_items,
        suitability=suitability,
        message="Match identified and evaluated against your profile."
    )
