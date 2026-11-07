from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import init_db
from app.routers import auth, profile, food, chat, plans, health

# Create tables
init_db()

app = FastAPI(
    title="HealthMate API",
    description="AI-Powered Personalized Health & Nutrition Assistant Backend",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc"
)

# CORS setup
origins = settings.cors_origin_list
if not origins:
    origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if "*" not in origins else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routers
app.include_router(health.router)
app.include_router(auth.router)
app.include_router(profile.router)
app.include_router(food.router)
app.include_router(chat.router)
app.include_router(plans.router)

@app.get("/")
def root():
    return {
        "message": "Welcome to HealthMate API - AI-Powered Personalized Health Assistant",
        "documentation": "/api/docs",
        "health_check": "/api/health"
    }

