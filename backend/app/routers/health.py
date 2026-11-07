from fastapi import APIRouter
from app.services.dataset_service import dataset_service

router = APIRouter(tags=["Health Check"])

@router.get("/api/health")
def health_check():
    report = dataset_service.get_validation_report()
    return {
        "status": "healthy",
        "service": "HealthMate API",
        "version": "1.0.0",
        "dataset_loaded": report.get("is_valid", False),
        "total_food_records": report.get("total_records", 0)
    }

