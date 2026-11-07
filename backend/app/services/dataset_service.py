import os
import re
from pathlib import Path
from typing import List, Dict, Any, Optional
import pandas as pd
import openpyxl

from app.config import settings

class DatasetService:
    _instance: Optional["DatasetService"] = None

    def __init__(self):
        self.df: Optional[pd.DataFrame] = None
        self.food_records: List[Dict[str, Any]] = []
        self.food_id_index: Dict[str, Dict[str, Any]] = {}
        self.canonical_groups: Dict[str, List[Dict[str, Any]]] = {}
        self.validation_report: Dict[str, Any] = {}
        self._load_dataset()

    @classmethod
    def get_instance(cls) -> "DatasetService":
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def _load_dataset(self):
        file_path = settings.resolved_dataset_path
        if not file_path.exists():
            raise FileNotFoundError(f"Food dataset not found at: {file_path}")

        # If .xlsx is present, inspect sheet names and columns with openpyxl
        base_dir = file_path.parent
        xlsx_path = base_dir / "healthmate_indian_food_dataset_1200plus.xlsx"
        csv_path = base_dir / "healthmate_indian_food_dataset_1200plus.csv"

        if xlsx_path.exists():
            try:
                wb = openpyxl.load_workbook(str(xlsx_path), read_only=True)
                self.sheet_names = wb.sheetnames
                wb.close()
            except Exception:
                self.sheet_names = ["IndianFoodDataset"]
        else:
            self.sheet_names = ["IndianFoodDataset"]

        # Fast and clean load
        if csv_path.exists():
            df = pd.read_csv(str(csv_path), encoding="utf-8", low_memory=False)
        elif str(file_path).endswith(".xlsx"):
            df = pd.read_excel(str(file_path), sheet_name=self.sheet_names[0], engine="openpyxl")
        else:
            df = pd.read_csv(str(file_path), encoding="utf-8", low_memory=False)

        # Clean column names (strip BOM or whitespace)
        df.columns = [str(col).replace("\ufeff", "").strip() for col in df.columns]

        # Validate required columns
        required_cols = [
            "food_id", "canonical_food_id", "food_name", "canonical_food_name",
            "name_mr", "name_hi", "search_aliases", "food_category", "diet_type"
        ]
        missing_cols = [col for col in required_cols if col not in df.columns]
        if missing_cols:
            raise ValueError(f"Dataset is missing required columns: {missing_cols}")

        # Replace NaN with empty string or None for text fields
        df = df.fillna("")

        self.df = df
        self.food_records = df.to_dict(orient="records")
        self.food_id_index = {str(r["food_id"]).strip(): r for r in self.food_records}

        # Group by canonical_food_id or canonical_food_name for variant matching
        for r in self.food_records:
            cid = str(r.get("canonical_food_id") or r.get("canonical_food_name") or r.get("food_name")).strip()
            if cid not in self.canonical_groups:
                self.canonical_groups[cid] = []
            self.canonical_groups[cid].append(r)

        # Build validation report
        total_rows = len(self.food_records)
        categories = sorted(list(set(r.get("food_category", "") for r in self.food_records if r.get("food_category"))))
        diet_types = sorted(list(set(r.get("diet_type", "") for r in self.food_records if r.get("diet_type"))))
        
        # Check populated nutrition
        records_with_energy = sum(1 for r in self.food_records if str(r.get("energy_kcal_per_100g", "")).strip())
        
        self.validation_report = {
            "file_source": str(file_path),
            "total_records": total_rows,
            "total_columns": len(df.columns),
            "columns": list(df.columns),
            "categories_count": len(categories),
            "categories": categories,
            "diet_types": diet_types,
            "records_with_nutrition": records_with_energy,
            "missing_nutrition_handled_as_unverified": True,
            "is_valid": True,
        }

    def get_validation_report(self) -> Dict[str, Any]:
        return self.validation_report

    def get_all_records(self) -> List[Dict[str, Any]]:
        return self.food_records

    def get_by_id(self, food_id: str) -> Optional[Dict[str, Any]]:
        return self.food_id_index.get(food_id.strip())

    def search_by_name(self, name: str, limit: int = 5) -> List[Dict[str, Any]]:
        name_lower = name.strip().lower()
        # Exact match first
        for r in self.food_records:
            if str(r.get("food_name", "")).strip().lower() == name_lower:
                return [r]
        # Substring match
        results = []
        for r in self.food_records:
            fn = str(r.get("food_name", "")).lower()
            if name_lower in fn or fn in name_lower:
                results.append(r)
                if len(results) >= limit:
                    break
        return results

    def get_variants(self, food_record: Dict[str, Any]) -> List[Dict[str, Any]]:
        cid = str(food_record.get("canonical_food_id") or food_record.get("canonical_food_name") or food_record.get("food_name")).strip()
        all_variants = self.canonical_groups.get(cid, [])
        # Exclude self
        current_id = food_record.get("food_id")
        return [v for v in all_variants if v.get("food_id") != current_id]

dataset_service = DatasetService.get_instance()
