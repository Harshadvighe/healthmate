# HealthMate – Windows Setup & Quick Start Guide

Welcome to **HealthMate**! This guide is written for non-technical users and friends who have received the HealthMate project as a ZIP file.

---

## 🚀 Quick Start (In 3 Simple Steps)

### Step 1: Extract the ZIP File
1. Right-click the `healthmate.zip` file you downloaded.
2. Select **Extract All...** and extract it into a regular folder (e.g. `C:\HealthMate` or your `Documents` folder).
> ⚠️ **Important**: Do **not** double-click scripts from *inside* the ZIP folder without extracting first!

---

### Step 2: Double-Click `RUN_HEALTHMATE.bat`
1. Open the extracted `healthmate` folder.
2. Double-click the file named **`RUN_HEALTHMATE.bat`**.
3. You will see an 8-stage setup progress in a friendly command window:
   - `[1/8] Checking your computer...`
   - `[2/8] Checking Python and Node.js...`
   - `[3/8] Preparing backend...`
   - `[4/8] Installing frontend packages...`
   - `[5/8] Checking local database...`
   - `[6/8] Checking food dataset...`
   - `[7/8] Starting HealthMate...`
   - `[8/8] Opening your browser...`
4. Your default web browser will automatically open to:
   👉 **http://localhost:5173**

---

### Step 3: Enjoy HealthMate!
- Register an account or log in.
- Complete your 4-step personalized health onboarding.
- Ask questions in the AI Health Chatbot.
- Check any Indian dish or ingredient in the Food Checker.
- View and adjust your 7-day personalized wellness plan.

---

## 🛑 How to Stop HealthMate Safely

When you are finished using HealthMate:
1. Go to the project folder.
2. Double-click **`STOP_HEALTHMATE.bat`**.
3. The script will safely terminate **only** HealthMate's processes using its recorded process IDs.
4. It will never touch or terminate unrelated programs or other Python/Node apps on your machine.

---

## 🛠️ Prerequisites (If Your Computer Doesn't Have Them Yet)

`RUN_HEALTHMATE.bat` automatically checks your computer for the required tools. If they are missing, it will offer to install them or you can install them manually:

1. **Python (version 3.10, 3.11, or newer)**:
   - Official download: [https://www.python.org/downloads/](https://www.python.org/downloads/)
   - *Crucial*: When installing, check the box that says **"Add python.exe to PATH"**!
2. **Node.js (LTS version 18, 20, or newer)**:
   - Official download: [https://nodejs.org/](https://nodejs.org/)
   - Run the installer with default recommended settings.

---

## 📁 Key Files in This Folder

| File | What It Does |
|---|---|
| **`RUN_HEALTHMATE.bat`** | **Main Launcher**: Prepares dependencies, verifies the catalog, starts the servers, and opens your browser. |
| **`SETUP_HEALTHMATE.bat`** | **Setup Only**: Installs packages and prepares the local database without starting the servers. |
| **`STOP_HEALTHMATE.bat`** | **Safe Stopper**: Cleanly terminates the HealthMate backend and frontend processes. |
| **`README_SETUP_WINDOWS.md`** | This beginner-friendly setup and troubleshooting document. |
| **`ANTIGRAVITY_SETUP_PROMPT.md`** | Copy-ready prompt for AI agent setup in Antigravity. |
| **`backend/`** | FastAPI backend with machine learning pipelines and local SQLite database (`healthmate.db`). |
| **`frontend/`** | React + Vite + Tailwind CSS frontend interface. |
| **`logs/`** | Local server execution logs (created when the app runs). |

---

## 💡 Troubleshooting & FAQ

### 1. Windows Defender SmartScreen shows "Windows protected your PC"
- Because `.bat` files downloaded from the internet are flagged by Windows as unrecognized by default:
  1. Click **"More info"** on the popup.
  2. Click **"Run anyway"**.

### 2. Do I need to install or configure PostgreSQL or Docker?
- **No!** For local Windows use, HealthMate automatically uses a zero-configuration SQLite database (`backend/healthmate.db`).
- PostgreSQL is only used for cloud production deployments (e.g. Render / Neon / Supabase).

### 3. What if port 8000 or port 5173 is already in use?
- If another application is using port 8000 or 5173, `RUN_HEALTHMATE.bat` will identify that process by name and ID and ask you before doing anything. It will **never** silently terminate unrelated applications.

### 4. Can I run HealthMate offline?
- Yes! Once you have run the setup once and dependencies are installed, HealthMate runs fully locally on your machine without requiring an active internet connection.

### 5. How do I send this project to another friend?
- When zipping the folder for a friend, you can omit the `logs/` folder and `backend/venv/` (the launcher will automatically re-create the virtual environment and install dependencies on their PC).
- Ensure the Excel/CSV dataset (`healthmate_indian_food_dataset_1200plus.xlsx` or `.csv`) is included.

