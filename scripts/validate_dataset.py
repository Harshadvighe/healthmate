"""
HealthMate Dataset Validator Utility
Loads the dataset via dataset_service and verifies row count and schema columns.
Exits 0 if valid, 1 if invalid.
"""
import sys
from pathlib import Path

# Ensure backend directory is in sys.path
backend_dir = Path(__file__).resolve().parent.parent / "backend"
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

try:
    from app.services.dataset_service import dataset_service
    report = dataset_service.get_validation_report()
    total = report.get("total_records", 0)
    is_valid = report.get("is_valid", False)
    print(f"COUNT:{total}|VALID:{is_valid}")
    if is_valid and total > 0:
        sys.exit(0)
    else:
        print("Dataset invalid or empty:", report)
        sys.exit(1)
except Exception as e:
    print(f"Dataset check failed with exception: {e}")
    sys.exit(1)

