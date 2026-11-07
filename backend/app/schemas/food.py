from typing import List, Optional, Dict, Any
from pydantic import BaseModel

class FoodItem(BaseModel):
    food_id: str
    canonical_food_id: Optional[str] = None
    food_name: str
    canonical_food_name: Optional[str] = None
    name_mr: Optional[str] = None
    name_hi: Optional[str] = None
    search_aliases: Optional[str] = None
    food_category: Optional[str] = None
    food_type: Optional[str] = None
    preparation_form: Optional[str] = None
    preparation_label: Optional[str] = None
    region_or_origin: Optional[str] = None
    food_group: Optional[str] = None
    diet_type: Optional[str] = None
    allergen_tags: Optional[str] = None
    ingredients_summary: Optional[str] = None
    serving_reference: Optional[str] = None
    serving_weight_g: Optional[str] = None
    energy_kcal_per_100g: Optional[str] = None
    protein_g_per_100g: Optional[str] = None
    carbohydrate_g_per_100g: Optional[str] = None
    fat_g_per_100g: Optional[str] = None
    fibre_g_per_100g: Optional[str] = None
    sodium_mg_per_100g: Optional[str] = None
    nutrition_verification_status: Optional[str] = "not_yet_populated"
    health_rule_status: Optional[str] = None
    notes: Optional[str] = None
    match_score: Optional[float] = None

class FoodSearchResponse(BaseModel):
    query: str
    total_found: int
    results: List[FoodItem]

class FoodCheckRequest(BaseModel):
    query: str

class PersonalizedSuitability(BaseModel):
    score: int # 0 to 100
    status: str # 'suitable', 'caution', 'avoid', 'neutral_unverified'
    headline: str
    allergen_conflict: bool
    allergen_details: List[str]
    dietary_conflict: bool
    dietary_details: List[str]
    condition_notes: List[str]
    nutrition_available: bool
    disclaimer: str

class FoodCheckResponse(BaseModel):
    query: str
    matched: bool
    food: Optional[FoodItem] = None
    variants: List[FoodItem] = []
    suitability: Optional[PersonalizedSuitability] = None
    message: Optional[str] = None

