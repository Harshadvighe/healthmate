import os
from pathlib import Path
from typing import List
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    ENVIRONMENT: str = "development"
    PORT: int = 8000
    SECRET_KEY: str = "healthmate-dev-secret-key-32-bytes-minimum-string-12345"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 # 24 hours
    DATABASE_URL: str = "sqlite:///./healthmate.db"
    CORS_ORIGINS: str = "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173,https://healthmate-app.netlify.app"
    DATASET_PATH: str = "data/healthmate_indian_food_dataset_1200plus.xlsx"

    @property
    def cors_origin_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

    @property
    def normalized_database_url(self) -> str:
        url = self.DATABASE_URL
        if url.startswith("postgres://"):
            url = url.replace("postgres://", "postgresql://", 1)
        return url

    @property
    def resolved_dataset_path(self) -> Path:
        base_dir = Path(__file__).resolve().parent.parent
        candidates = [
            base_dir / self.DATASET_PATH,
            base_dir / "data" / "healthmate_indian_food_dataset_1200plus.xlsx",
            base_dir / "data" / "healthmate_indian_food_dataset_1200plus.csv",
            base_dir.parent / "healthmate_indian_food_dataset_1200plus.xlsx",
            base_dir.parent / "healthmate_indian_food_dataset_1200plus.csv",
        ]
        for p in candidates:
            if p.exists():
                return p
        return base_dir / "data" / "healthmate_indian_food_dataset_1200plus.xlsx"

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()

