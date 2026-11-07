import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HeartPulse, 
  User, 
  Activity, 
  Utensils, 
  Target, 
  Check, 
  ChevronRight, 
  ChevronLeft, 
  ShieldAlert, 
  Info 
} from 'lucide-react';
import { profileApi } from '../api/profileApi';
import { useAuth } from '../context/AuthContext';

const COMMON_CONDITIONS = [
  'Diabetes / Pre-diabetes',
  'Hypertension (High BP)',
  'Lactose Intolerance',
  'High Cholesterol',
  'PCOS / PCOD',
  'Thyroid Imbalance',
  'Celiac / Gluten Sensitivity',
  'Acid Reflux / GERD',
  'None / General Health',
];

const COMMON_ALLERGIES = [
  'Milk / Dairy',
  'Peanuts',
  'Tree Nuts (Almonds, Walnuts)',
  'Wheat / Gluten',
  'Soy',
  'Egg',
  'Fish / Seafood',
  'Mustard',
  'Sesame',
  'No Known Allergies',
];

const DIET_TYPES = [
  { id: 'vegetarian', label: 'Vegetarian', desc: 'Plant-based with dairy' },
  { id: 'lacto_vegetarian', label: 'Lacto-Vegetarian', desc: 'No eggs, includes dairy' },
  { id: 'vegan', label: 'Vegan', desc: '100% plant-based, no animal or dairy products' },
  { id: 'eggetarian', label: 'Eggetarian', desc: 'Vegetarian plus eggs' },
  { id: 'non_vegetarian', label: 'Non-Vegetarian', desc: 'Includes poultry, fish, meat' },
];

const ACTIVITY_LEVELS = [
  { id: 'sedentary', label: 'Sedentary', desc: 'Desk job, minimal daily movement' },
  { id: 'light', label: 'Light Activity', desc: 'Light walking or chores 1-3 days/wk' },
  { id: 'moderate', label: 'Moderate', desc: 'Exercise or brisk walking 3-5 days/wk' },
  { id: 'active', label: 'Active', desc: 'Heavy physical work or daily sports' },
];

const GOAL_OPTIONS = [
  { id: 'healthy_eating', label: 'General Healthy Eating', desc: 'Nourishing daily meal habits' },
  { id: 'weight_management', label: 'Weight Management', desc: 'Mindful portion and glycemic awareness' },
  { id: 'nutritional_balance', label: 'Better Nutritional Balance', desc: 'Optimal macro & micronutrient diversity' },
  { id: 'fitness_support', label: 'Fitness & Energy Support', desc: 'Adequate protein & sustained endurance' },
  { id: 'blood_sugar_stability', label: 'Blood Sugar Stability', desc: 'Low GI meals & carbohydrate monitoring' },
  { id: 'heart_health', label: 'Heart & Blood Pressure Health', desc: 'Low sodium, heart-friendly fats' },
];

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  // Step 1: Personal
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');

  // Step 2: Health
  const [selectedConditions, setSelectedConditions] = useState([]);
  const [selectedAllergies, setSelectedAllergies] = useState([]);
  const [healthNotes, setHealthNotes] = useState('');

  // Step 3: Lifestyle
  const [dietType, setDietType] = useState('vegetarian');
  const [activityLevel, setActivityLevel] = useState('moderate');
  const [dailyRoutine, setDailyRoutine] = useState('');
  const [preferredCuisines, setPreferredCuisines] = useState('');
  const [dislikedFoods, setDislikedFoods] = useState('');

  // Step 4: Goals
  const [selectedGoals, setSelectedGoals] = useState(['healthy_eating']);
  const [customGoal, setCustomGoal] = useState('');

  const toggleCondition = (item) => {
    if (item === 'None / General Health') {
      setSelectedConditions(['None / General Health']);
      return;
    }
    const filtered = selectedConditions.filter((c) => c !== 'None / General Health');
    if (filtered.includes(item)) {
      setSelectedConditions(filtered.filter((c) => c !== item));
    } else {
      setSelectedConditions([...filtered, item]);
    }
  };

  const toggleAllergy = (item) => {
    if (item === 'No Known Allergies') {
      setSelectedAllergies(['No Known Allergies']);
      return;
    }
    const filtered = selectedAllergies.filter((a) => a !== 'No Known Allergies');
    if (filtered.includes(item)) {
      setSelectedAllergies(filtered.filter((a) => a !== item));
    } else {
      setSelectedAllergies([...filtered, item]);
    }
  };

  const toggleGoal = (id) => {
    if (selectedGoals.includes(id)) {
      if (selectedGoals.length > 1) {
        setSelectedGoals(selectedGoals.filter((g) => g !== id));
      }
    } else {
      setSelectedGoals([...selectedGoals, id]);
    }
  };

  const handleFinish = async () => {
    setError('');
    setSubmitting(true);

    const conditionsToSave = selectedConditions.filter((c) => c !== 'None / General Health');
    const allergiesToSave = selectedAllergies.filter((a) => a !== 'No Known Allergies');
    const goalsToSave = [...selectedGoals];
    if (customGoal.trim()) {
      goalsToSave.push(customGoal.trim());
    }

    try {
      await profileApi.completeOnboarding({
        age: age ? parseInt(age, 10) : null,
        gender: gender || null,
        health_conditions: conditionsToSave,
        allergies: allergiesToSave,
        diet_type: dietType,
        activity_level: activityLevel,
        daily_routine: dailyRoutine || null,
        preferred_cuisines: preferredCuisines || null,
        disliked_foods: dislikedFoods || null,
        goals: goalsToSave,
        additional_notes: healthNotes || null,
      });

      updateUser({ onboarding_completed: true });
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to save health profile. Please check your connection.');
    } finally {
      setSubmitting(false);
    }
  };

  const stepsList = [
    { num: 1, title: 'Personal Info', icon: User },
    { num: 2, title: 'Health & Allergies', icon: Activity },
    { num: 3, title: 'Lifestyle & Diet', icon: Utensils },
    { num: 4, title: 'Your Goals', icon: Target },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAF8] text-[#202C2A] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EBF4F2] text-[#145B52] text-xs font-semibold">
            <HeartPulse className="w-4 h-4 text-[#F2A65A]" />
            <span>Health Profile Setup</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-[#202C2A]">
            Let's personalize HealthMate for you
          </h1>
          <p className="text-sm text-[#71807B] max-w-xl mx-auto">
            We never assume medical conditions from age or gender. You have full control, and can update your answers anytime.
          </p>
        </div>

        {/* Multi-step Progress Bar */}
        <div className="bg-white p-4 rounded-2xl border border-[#E5EBE7] shadow-xs">
          <div className="grid grid-cols-4 gap-2 text-center">
            {stepsList.map((s) => {
              const Icon = s.icon;
              const isDone = step > s.num;
              const isCurrent = step === s.num;
              return (
                <div key={s.num} className="flex flex-col items-center">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs transition-all ${
                      isDone
                        ? 'bg-[#145B52] text-white'
                        : isCurrent
                        ? 'bg-[#145B52] text-white ring-4 ring-[#EBF4F2]'
                        : 'bg-[#F8FAF8] text-[#71807B] border border-[#E5EBE7]'
                    }`}
                  >
                    {isDone ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                  </div>
                  <span
                    className={`text-[11px] font-medium mt-1.5 hidden sm:block ${
                      isCurrent ? 'text-[#145B52] font-semibold' : 'text-[#71807B]'
                    }`}
                  >
                    {s.title}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="w-full bg-[#F2F6F3] h-1.5 rounded-full mt-4 overflow-hidden">
            <div
              className="bg-[#145B52] h-full transition-all duration-300"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-[#FDEEEE] border border-[#D85C5C]/20 text-[#D85C5C] text-xs flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Step Card */}
        <div className="bg-white rounded-2xl border border-[#E5EBE7] shadow-sm p-6 sm:p-8">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-xl font-bold text-[#202C2A]">Step 1: Personal Details</h3>
                  <p className="text-xs text-[#71807B]">
                    Optional fields to refine portion standards.
                  </p>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#202C2A] uppercase tracking-wider mb-1.5">
                      Age <span className="text-[#71807B] font-normal lowercase">(optional)</span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="120"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      placeholder="e.g. 29"
                      className="w-full px-4 py-2.5 rounded-xl border border-[#E5EBE7] bg-[#F8FAF8] text-sm text-[#202C2A] focus:outline-none focus:ring-2 focus:ring-[#145B52]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#202C2A] uppercase tracking-wider mb-1.5">
                      Gender <span className="text-[#71807B] font-normal lowercase">(optional)</span>
                    </label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-[#E5EBE7] bg-[#F8FAF8] text-sm text-[#202C2A] focus:outline-none focus:ring-2 focus:ring-[#145B52]"
                    >
                      <option value="">Prefer not to say</option>
                      <option value="Female">Female</option>
                      <option value="Male">Male</option>
                      <option value="Non-Binary">Non-Binary</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#EBF4F2] border border-[#287C70]/20 flex items-start gap-2.5 text-xs text-[#145B52]">
                  <Info className="w-4 h-4 shrink-0 mt-0.5 text-[#287C70]" />
                  <span>
                    HealthMate does not infer diseases based on age or gender. Medical contexts are strictly evaluated from your declared profile.
                  </span>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-xl font-bold text-[#202C2A]">Step 2: Health Conditions & Allergies</h3>
                  <p className="text-xs text-[#71807B]">
                    Select any diagnosed conditions or allergies so HealthMate can alert you to potential clashes.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#202C2A] uppercase tracking-wider mb-2">
                    Known Health Conditions <span className="text-[#71807B] font-normal lowercase">(select all that apply)</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {COMMON_CONDITIONS.map((cond) => {
                      const isSelected = selectedConditions.includes(cond);
                      return (
                        <button
                          key={cond}
                          type="button"
                          onClick={() => toggleCondition(cond)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                            isSelected
                              ? 'bg-[#145B52] text-white border-[#145B52] shadow-xs'
                              : 'bg-[#F8FAF8] text-[#202C2A] border-[#E5EBE7] hover:bg-[#F2F6F3]'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 inline mr-1" />}
                          {cond}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#202C2A] uppercase tracking-wider mb-2">
                    Known Food Allergies <span className="text-[#71807B] font-normal lowercase">(select all that apply)</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {COMMON_ALLERGIES.map((allergy) => {
                      const isSelected = selectedAllergies.includes(allergy);
                      return (
                        <button
                          key={allergy}
                          type="button"
                          onClick={() => toggleAllergy(allergy)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                            isSelected
                              ? 'bg-[#F2A65A] text-[#202C2A] border-[#E29547] font-semibold shadow-xs'
                              : 'bg-[#F8FAF8] text-[#202C2A] border-[#E5EBE7] hover:bg-[#F2F6F3]'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 inline mr-1" />}
                          {allergy}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#202C2A] uppercase tracking-wider mb-1.5">
                    Other Dietary Restrictions or Notes <span className="text-[#71807B] font-normal lowercase">(optional)</span>
                  </label>
                  <textarea
                    rows={2}
                    value={healthNotes}
                    onChange={(e) => setHealthNotes(e.target.value)}
                    placeholder="e.g. Mild lactose sensitivity, advised to watch evening sodium, prefer low oil preparations..."
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E5EBE7] bg-[#F8FAF8] text-sm text-[#202C2A] focus:outline-none focus:ring-2 focus:ring-[#145B52]"
                  />
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-xl font-bold text-[#202C2A]">Step 3: Lifestyle & Diet Preferences</h3>
                  <p className="text-xs text-[#71807B]">
                    Align meal suggestions with your cultural habits and day-to-day rhythm.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#202C2A] uppercase tracking-wider mb-2">
                    Dietary Pattern
                  </label>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {DIET_TYPES.map((dt) => {
                      const isSelected = dietType === dt.id;
                      return (
                        <div
                          key={dt.id}
                          onClick={() => setDietType(dt.id)}
                          className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                            isSelected
                              ? 'border-[#145B52] bg-[#EBF4F2] shadow-xs'
                              : 'border-[#E5EBE7] bg-[#F8FAF8] hover:bg-[#F2F6F3]'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-sm text-[#202C2A]">{dt.label}</span>
                            {isSelected && <Check className="w-4 h-4 text-[#145B52]" />}
                          </div>
                          <p className="text-xs text-[#71807B] mt-1">{dt.desc}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#202C2A] uppercase tracking-wider mb-2">
                    Daily Physical Activity Level
                  </label>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {ACTIVITY_LEVELS.map((act) => {
                      const isSelected = activityLevel === act.id;
                      return (
                        <div
                          key={act.id}
                          onClick={() => setActivityLevel(act.id)}
                          className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                            isSelected
                              ? 'border-[#145B52] bg-[#EBF4F2] shadow-xs'
                              : 'border-[#E5EBE7] bg-[#F8FAF8] hover:bg-[#F2F6F3]'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-sm text-[#202C2A]">{act.label}</span>
                            {isSelected && <Check className="w-4 h-4 text-[#145B52]" />}
                          </div>
                          <p className="text-xs text-[#71807B] mt-1">{act.desc}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#202C2A] uppercase tracking-wider mb-1.5">
                      Preferred Cuisines <span className="text-[#71807B] font-normal lowercase">(optional)</span>
                    </label>
                    <input
                      type="text"
                      value={preferredCuisines}
                      onChange={(e) => setPreferredCuisines(e.target.value)}
                      placeholder="e.g. Maharashtrian, North Indian, South Indian"
                      className="w-full px-4 py-2.5 rounded-xl border border-[#E5EBE7] bg-[#F8FAF8] text-sm text-[#202C2A] focus:outline-none focus:ring-2 focus:ring-[#145B52]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#202C2A] uppercase tracking-wider mb-1.5">
                      Typical Routine <span className="text-[#71807B] font-normal lowercase">(optional)</span>
                    </label>
                    <input
                      type="text"
                      value={dailyRoutine}
                      onChange={(e) => setDailyRoutine(e.target.value)}
                      placeholder="e.g. 9-to-6 office desk job, evening walks"
                      className="w-full px-4 py-2.5 rounded-xl border border-[#E5EBE7] bg-[#F8FAF8] text-sm text-[#202C2A] focus:outline-none focus:ring-2 focus:ring-[#145B52]"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-xl font-bold text-[#202C2A]">Step 4: Your Health & Nutrition Goals</h3>
                  <p className="text-xs text-[#71807B]">
                    What primary outcomes would you like your weekly meal recommendations to prioritize?
                  </p>
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  {GOAL_OPTIONS.map((g) => {
                    const isSelected = selectedGoals.includes(g.id);
                    return (
                      <div
                        key={g.id}
                        onClick={() => toggleGoal(g.id)}
                        className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'border-[#F2A65A] bg-[#FFF3E6] shadow-xs'
                            : 'border-[#E5EBE7] bg-[#F8FAF8] hover:bg-[#F2F6F3]'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-sm text-[#202C2A]">{g.label}</span>
                          {isSelected && <Check className="w-4 h-4 text-[#E29547]" />}
                        </div>
                        <p className="text-xs text-[#71807B] mt-1">{g.desc}</p>
                      </div>
                    );
                  })}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#202C2A] uppercase tracking-wider mb-1.5">
                    Custom Goal or Target <span className="text-[#71807B] font-normal lowercase">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={customGoal}
                    onChange={(e) => setCustomGoal(e.target.value)}
                    placeholder="e.g. Increase daily fiber intake with millets and whole pulses"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E5EBE7] bg-[#F8FAF8] text-sm text-[#202C2A] focus:outline-none focus:ring-2 focus:ring-[#145B52]"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Controls */}
          <div className="mt-8 pt-6 border-t border-[#E5EBE7] flex items-center justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="px-4 py-2.5 rounded-xl border border-[#E5EBE7] bg-white hover:bg-[#F2F6F3] text-sm font-medium text-[#202C2A] flex items-center gap-1.5 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            ) : <div />}

            {step < 4 ? (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                className="px-6 py-2.5 rounded-xl bg-[#145B52] hover:bg-[#0E423B] text-white text-sm font-medium flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <span>Continue</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                disabled={submitting}
                onClick={handleFinish}
                className="px-6 py-2.5 rounded-xl bg-[#145B52] hover:bg-[#0E423B] text-white text-sm font-medium flex items-center gap-2 transition-colors shadow-xs disabled:opacity-50"
              >
                <span>{submitting ? 'Completing Profile...' : 'Complete Profile & Open Dashboard'}</span>
                <Check className="w-4 h-4 text-[#F2A65A]" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

