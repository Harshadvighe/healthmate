# healthmate
AI-powered personalized health and nutrition assistant using machine learning and an Indian food dataset.

---

## 🌟 Overview & Key Architecture
**HealthMate** is a responsive full-stack health and nutrition assistant designed around an authentic catalog of 1,400+ Indian food items. Unlike generic AI chatbots that hallucinate nutritional values and medical claims, HealthMate couples NLP query intent detection and TF-IDF similarity matching with transparent, explainable health recommendation rules grounded in the user's saved health profile.

### Color Palette & Design System
Designed with a calm, modern light healthcare aesthetic:
- **Main Background**: `#F8FAF8`
- **Surface / Card Background**: `#FFFFFF`
- **Primary Deep Teal**: `#145B52`
- **Secondary Teal**: `#287C70`
- **Soft Orange Accent**: `#F2A65A`
- **Light Orange Tint**: `#FFF3E6`
- **Main Text**: `#202C2A`
- **Secondary Text**: `#71807B`
- **Borders**: `#E5EBE7`
- **Status Colors**: Success `#3A936B`, Warning `#D99A35`, Error `#D85C5C`

---

## 🚀 Features

### 1. Indian Food Dataset & Multilingual Catalog
- **1,444 verified food entries** across 9 categories (*Beverages & Condiments*, *Cereals & Millets*, *Fruits*, *Indian Meals & Snacks*, *Milk & Dairy*, *Nuts, Seeds & Oils*, *Pulses & Legumes*, *Sweets & Desserts*).
- **Trilingual Aliases**: Full search support for English, Hindi (हिन्दी), and Marathi (मराठी) food names.
- **Preparation Form Variants**: Compares raw, boiled, pasteurized, steamed, cooked, and roasted variants.
- **Missing Nutrition Integrity**: Unpopulated nutritional values in the source catalog are honestly handled as **unverified/unavailable**, never as zero.

### 2. Machine Learning Implementation
- **Food Matcher (`app/ml/food_matcher.py`)**: Sub-linear TF-IDF character and word n-gram vectorizer (`ngram_range=(2, 4)`) with cosine similarity and exact token boosts.
- **Intent Classifier (`app/ml/intent_classifier.py`)**: Supervised NLP classifier categorizing user inquiries into `food_suitability`, `nutrition_query`, `meal_plan_request`, `general_health`, and `profile_query`.
- **Explainable Recommendation Scorer (`app/ml/recommendation_scorer.py`)**: Multi-factor rule evaluator assessing allergen conflicts, diet restrictions, and condition sensitivities (Diabetes, Hypertension, Lactose Intolerance, Celiac/Gluten sensitivity).

### 3. Multi-Step Onboarding & Health Profile
- **Step 1**: Personal Info (Age, Gender - clearly optional).
- **Step 2**: Health Conditions (Diabetes, Hypertension, Lactose Intolerance, PCOS, Thyroid, etc.) and Allergies (Milk, Peanut, Gluten, Egg, Soy, Fish, Mustard, Sesame).
- **Step 3**: Lifestyle & Diet (Vegetarian, Vegan, Lacto-vegetarian, Eggetarian, Non-vegetarian, Activity levels, Preferred cuisines).
- **Step 4**: Wellness Goals (Weight management, Healthy eating, Nutritional balance, Fitness support, Custom goals).

### 4. Interactive AI Health Chatbot
- Conversation history tracking with user-specific persistence.
- Context-aware responses directly considering the user's declared profile.
- Transparent disclaimers and explanation of uncertainties.

### 5. Food Compatibility Checker
- Case-insensitive, fuzzy, and alias search with real-time feedback.
- Detailed ingredient, allergen, and preparation variant cards.
- Suitability Score (0-100) with color status badges (`Suitable`, `Caution`, `Avoid`).

### 6. Personalized 7-Day Weekly Meal Planner
- Breakfast, Lunch, Evening Snack, Dinner, and Daily Movement recommendations.
- Interactive tab navigation for each day of the week.
- One-click regeneration and print-friendly format.

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 19 / Vite 8
- **Styling**: Tailwind CSS v4 with custom theme tokens
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Router**: React Router v7

### Backend
- **Framework**: FastAPI (Python 3.11)
- **Validation**: Pydantic v2 schemas
- **Database & ORM**: PostgreSQL / SQLite (local fallback) via SQLAlchemy 2.0 & Alembic migrations
- **Machine Learning**: Scikit-Learn (TF-IDF vectorizer, Logistic Regression classifier)
- **Data Engine**: Pandas & OpenPyXL singleton cached loader
- **Authentication**: Bcrypt password hashing & PyJWT tokens

---

## 💻 Local Development Setup

### 1. Prerequisites
- Python 3.11+
- Node.js v18+ and npm

### 2. Backend Setup
```bash
cd backend
python -m venv venv

# Windows
.\venv\Scripts\activate
# Linux/macOS
# source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
Backend API will be accessible at `http://localhost:8000`. Interactive OpenAPI documentation is available at `http://localhost:8000/api/docs`.

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Frontend will be running at `http://localhost:5173`.

### 4. Running Automated Tests
```bash
cd backend
.\venv\Scripts\python -m pytest -v
```
All 11 unit and integration tests will run verifying password hashing, authentication, data isolation, dataset verification, ML intent classification, food matching, and weekly plan generation.

---

## 🌐 Production Deployment

### Frontend (Netlify)
- Configured via `netlify.toml` in project root:
  - Base: `frontend`
  - Publish directory: `dist`
  - Build command: `npm run build`
  - SPA routing: `/* /index.html 200`
- Set environment variable in Netlify:
  `VITE_API_BASE_URL=https://your-healthmate-api.onrender.com`

### Backend (Render)
- Configured via `render.yaml`:
  - Build command: `cd backend && pip install -r requirements.txt`
  - Start command: `cd backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT`
  - Health check path: `/api/health`
  - Environment variables:
    - `ENVIRONMENT=production`
    - `SECRET_KEY=<your-secure-random-key>`
    - `DATABASE_URL=<your-postgresql-connection-string>`
    - `CORS_ORIGINS=https://your-healthmate-app.netlify.app`

---

## 🔒 Security, Privacy & Medical Disclaimers
1. **No Plain Text Passwords**: Secured using standard Bcrypt password hashing.
2. **User Data Isolation**: Protected endpoints ensure users only access their own records.
3. **Data Deletion Workflow**: Complete erasure workflow available in Profile Settings.
4. **Non-Diagnostic Disclaimer**: HealthMate is an educational wellness aid and does not provide clinical diagnosis or prescribe treatments.
