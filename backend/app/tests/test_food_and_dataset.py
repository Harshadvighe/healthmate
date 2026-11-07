from app.services.dataset_service import dataset_service
from app.ml.food_matcher import food_matcher

def test_dataset_loading_and_report(client):
    report = dataset_service.get_validation_report()
    assert report["is_valid"] is True
    assert report["total_records"] > 1200
    assert "food_id" in report["columns"]
    assert "food_name" in report["columns"]
    assert "name_mr" in report["columns"]
    assert "name_hi" in report["columns"]
    assert report["missing_nutrition_handled_as_unverified"] is True

    # Check API validation endpoint
    res = client.get("/api/foods/validation/report")
    assert res.status_code == 200
    data = res.json()
    assert data["total_records"] > 1200

def test_food_search_exact_and_fuzzy(client):
    # Search English
    res1 = client.get("/api/foods/search?q=milk")
    assert res1.status_code == 200
    data1 = res1.json()
    assert data1["total_found"] > 0
    names = [f["food_name"].lower() for f in data1["results"]]
    assert any("milk" in n for n in names)

    # Search Hindi alias
    res2 = client.get("/api/foods/search?q=दूध")
    assert res2.status_code == 200
    data2 = res2.json()
    assert data2["total_found"] > 0

    # Search Marathi alias
    res3 = client.get("/api/foods/search?q=रोटी")
    assert res3.status_code == 200

def test_food_checker_known_and_unknown(client):
    # 1. Known food
    chk_res = client.post("/api/foods/check", json={"query": "Cow milk"})
    assert chk_res.status_code == 200
    body = chk_res.json()
    assert body["matched"] is True
    assert body["food"] is not None
    assert "Cow milk" in body["food"]["food_name"]
    assert body["suitability"] is not None
    # Nutrition columns blank handled as unavailable
    assert body["suitability"]["nutrition_available"] is False

    # 2. Unknown food
    unk_res = client.post("/api/foods/check", json={"query": "XyZ123NonExistentDish999"})
    assert unk_res.status_code == 200
    unk_body = unk_res.json()
    assert unk_body["matched"] is False
    assert unk_body["food"] is None
    assert "clarify" in unk_body["message"].lower() or "no matching" in unk_body["message"].lower()

def test_missing_nutrition_not_zero():
    all_recs = dataset_service.get_all_records()
    sample = all_recs[0]
    # Energy must NOT be 0 if blank in dataset
    energy = sample.get("energy_kcal_per_100g")
    assert energy == "" or energy is None or str(energy).strip() == ""

