import pytest
from app.services.auth_service import verify_password, get_password_hash

def test_password_hashing():
    raw = "SecurePassword123!"
    hashed = get_password_hash(raw)
    assert hashed != raw
    assert verify_password(raw, hashed) is True
    assert verify_password("WrongPassword", hashed) is False

def test_registration_and_login(client):
    # 1. Register User 1
    reg_payload = {
        "full_name": "Aarav Sharma",
        "email": "aarav@example.com",
        "password": "Password123!",
        "confirm_password": "Password123!"
    }
    res = client.post("/api/auth/register", json=reg_payload)
    assert res.status_code == 201
    data = res.json()
    assert "access_token" in data
    assert data["email"] == "aarav@example.com"
    token = data["access_token"]

    # 2. Duplicate registration fails
    dup_res = client.post("/api/auth/register", json=reg_payload)
    assert dup_res.status_code == 400

    # 3. Password mismatch fails
    mismatch_payload = dict(reg_payload, email="new@example.com", confirm_password="DifferentPassword")
    mis_res = client.post("/api/auth/register", json=mismatch_payload)
    assert mis_res.status_code == 400

    # 4. Login with correct credentials
    login_res = client.post("/api/auth/login", json={"email": "aarav@example.com", "password": "Password123!"})
    assert login_res.status_code == 200
    assert "access_token" in login_res.json()

    # 5. Login with invalid password
    bad_login = client.post("/api/auth/login", json={"email": "aarav@example.com", "password": "WrongPassword"})
    assert bad_login.status_code == 401

def test_protected_routes_and_profile(client):
    # Register
    reg_res = client.post("/api/auth/register", json={
        "full_name": "Priya Patel",
        "email": "priya@example.com",
        "password": "Password123!",
        "confirm_password": "Password123!"
    })
    token = reg_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Protected route without token fails
    unauth_res = client.get("/api/auth/me")
    assert unauth_res.status_code == 401

    # Protected route with token succeeds
    me_res = client.get("/api/auth/me", headers=headers)
    assert me_res.status_code == 200
    assert me_res.json()["email"] == "priya@example.com"

    # Profile onboarding
    onboard_payload = {
        "age": 28,
        "gender": "Female",
        "activity_level": "moderate",
        "daily_routine": "Desk job with evening gym",
        "diet_type": "lacto_vegetarian",
        "health_conditions": ["Lactose Intolerance"],
        "allergies": ["peanut"],
        "goals": ["weight_management", "nutritional_balance"],
        "additional_notes": "Prefers warm home cooked meals"
    }
    onboard_res = client.post("/api/profile/onboarding", json=onboard_payload, headers=headers)
    assert onboard_res.status_code == 200
    prof = onboard_res.json()
    assert prof["age"] == 28
    assert prof["diet_type"] == "lacto_vegetarian"
    assert "Lactose Intolerance" in prof["health_conditions"]
    assert "peanut" in prof["allergies"]
    assert prof["onboarding_completed"] is True

def test_user_data_isolation(client):
    # Register User A
    res_a = client.post("/api/auth/register", json={
        "full_name": "User Alpha",
        "email": "alpha@example.com",
        "password": "Password123!",
        "confirm_password": "Password123!"
    })
    token_a = res_a.json()["access_token"]
    headers_a = {"Authorization": f"Bearer {token_a}"}

    # Register User B
    res_b = client.post("/api/auth/register", json={
        "full_name": "User Beta",
        "email": "beta@example.com",
        "password": "Password123!",
        "confirm_password": "Password123!"
    })
    token_b = res_b.json()["access_token"]
    headers_b = {"Authorization": f"Bearer {token_b}"}

    # User A sets health condition
    client.post("/api/profile/onboarding", json={
        "age": 45,
        "health_conditions": ["Hypertension"],
        "allergies": ["egg"],
        "diet_type": "vegetarian"
    }, headers=headers_a)

    # User B checks their own profile: must NOT contain User A's conditions
    prof_b = client.get("/api/profile", headers=headers_b).json()
    assert "Hypertension" not in prof_b["health_conditions"]
    assert "egg" not in prof_b["allergies"]

