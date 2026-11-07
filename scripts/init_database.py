"""
HealthMate Database Initialization Utility
Creates SQLite tables in local development safely without dropping data.
Exits 0 if successful, 1 if failed.
"""
import sys
from pathlib import Path

backend_dir = Path(__file__).resolve().parent.parent / "backend"
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

try:
    from app.database import init_db
    init_db()
    print("DB_INITIALIZED_SUCCESS")
    sys.exit(0)
except Exception as e:
    print(f"Database initialization failed: {e}")
    sys.exit(1)

