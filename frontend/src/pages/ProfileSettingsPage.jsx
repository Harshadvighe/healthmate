import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  UserCog, 
  Activity, 
  Utensils, 
  Target, 
  ShieldAlert, 
  Check, 
  Trash2, 
  Save, 
  AlertTriangle 
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
];

const DIET_TYPES = [
  { id: 'vegetarian', label: 'Vegetarian' },
  { id: 'lacto_vegetarian', label: 'Lacto-Vegetarian' },
  { id: 'vegan', label: 'Vegan' },
  { id: 'eggetarian', label: 'Eggetarian' },
  { id: 'non_vegetarian', label: 'Non-Vegetarian' },
];

const ACTIVITY_LEVELS = [
  { id: 'sedentary', label: 'Sedentary' },
  { id: 'light', label: 'Light Activity' },
  { id: 'moderate', label: 'Moderate' },
  { id: 'active', label: 'Active' },
];

export default function ProfileSettingsPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('health');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Form states
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [conditions, setConditions] = useState([]);
  const [allergies, setAllergies] = useState([]);
  const [healthNotes, setHealthNotes] = useState('');
  const [dietType, setDietType] = useState('vegetarian');
  const [activityLevel, setActivityLevel] = useState('moderate');
  const [dailyRoutine, setDailyRoutine] = useState('');
  const [preferredCuisines, setPreferredCuisines] = useState('');
  const [dislikedFoods, setDislikedFoods] = useState('');
  const [goals, setGoals] = useState([]);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const data = await profileApi.getProfile();
      setAge(data.age || '');
      setGender(data.gender || '');
      setConditions(data.health_conditions || []);
      setAllergies(data.allergies || []);
      setHealthNotes(data.additional_notes || '');
      setDietType(data.diet_type || 'vegetarian');
      setActivityLevel(data.activity_level || 'moderate');
      setDailyRoutine(data.daily_routine || '');
      setPreferredCuisines(data.preferred_cuisines || '');
      setDislikedFoods(data.disliked_foods || '');
      setGoals(data.goals || []);
    } catch (err) {
      console.error('Failed to load profile', err);
      setError('Failed to load saved profile data.');
    } finally {
      setLoading(false);
    }
  };

  const toggleCondition = (item) => {
    if (conditions.includes(item)) {
      setConditions(conditions.filter((c) => c !== item));
    } else {
      setConditions([...conditions, item]);
    }
  };

  const toggleAllergy = (item) => {
    if (allergies.includes(item)) {
      setAllergies(allergies.filter((a) => a !== item));
    } else {
      setAllergies([...allergies, item]);
    }
  };

  const handleSaveAll = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');

    try {
      await profileApi.completeOnboarding({
        age: age ? parseInt(age, 10) : null,
        gender: gender || null,
        health_conditions: conditions,
        allergies: allergies,
        diet_type: dietType,
        activity_level: activityLevel,
        daily_routine: dailyRoutine || null,
        preferred_cuisines: preferredCuisines || null,
        disliked_foods: dislikedFoods || null,
        goals: goals,
        additional_notes: healthNotes || null,
      });

      setMessage('Health profile updated successfully! All recommendations are refreshed.');
      setTimeout(() => setMessage(''), 4000);
    } catch (err) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await profileApi.deleteAccountData();
      logout();
      navigate('/');
    } catch (err) {
      alert('Failed to delete account. Please try again.');
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div className="border-b border-[#E5EBE7] pb-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EBF4F2] text-[#145B52] text-xs font-semibold mb-2">
          <UserCog className="w-4 h-4 text-[#F2A65A]" />
          <span>Profile & Health Management</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#202C2A]">
          Settings & Health Profile
        </h1>
        <p className="text-xs sm:text-sm text-[#71807B] mt-1">
          Update conditions, allergies, or diet preferences to recalculate personalized safety scores.
        </p>
      </div>

      {message && (
        <div className="p-4 rounded-xl bg-[#EBF7F1] border border-[#3A936B]/20 text-[#3A936B] text-xs flex items-center gap-2">
          <Check className="w-4 h-4 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-[#FDEEEE] border border-[#D85C5C]/20 text-[#D85C5C] text-xs flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-[#E5EBE7] gap-4 text-xs font-semibold">
        <button
          type="button"
          onClick={() => setActiveTab('health')}
          className={`pb-3 px-1 border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'health'
              ? 'border-[#145B52] text-[#145B52]'
              : 'border-transparent text-[#71807B] hover:text-[#202C2A]'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Health & Allergies</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('lifestyle')}
          className={`pb-3 px-1 border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'lifestyle'
              ? 'border-[#145B52] text-[#145B52]'
              : 'border-transparent text-[#71807B] hover:text-[#202C2A]'
          }`}
        >
          <Utensils className="w-4 h-4" />
          <span>Diet & Lifestyle</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('privacy')}
          className={`pb-3 px-1 border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'privacy'
              ? 'border-[#145B52] text-[#145B52]'
              : 'border-transparent text-[#71807B] hover:text-[#202C2A]'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>Account & Privacy</span>
        </button>
      </div>

      <form onSubmit={handleSaveAll} className="space-y-6">
        {/* Tab 1: Health & Allergies */}
        {activeTab === 'health' && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E5EBE7] shadow-xs space-y-6">
            <div>
              <label className="block text-xs font-semibold text-[#202C2A] uppercase tracking-wider mb-2">
                Health Conditions
              </label>
              <div className="flex flex-wrap gap-2">
                {COMMON_CONDITIONS.map((c) => {
                  const isSel = conditions.includes(c);
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => toggleCondition(c)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                        isSel
                          ? 'bg-[#145B52] text-white border-[#145B52]'
                          : 'bg-[#F8FAF8] text-[#202C2A] border-[#E5EBE7] hover:bg-[#F2F6F3]'
                      }`}
                    >
                      {isSel && <Check className="w-3 h-3 inline mr-1" />}
                      {c}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#202C2A] uppercase tracking-wider mb-2">
                Allergies & Sensitivities
              </label>
              <div className="flex flex-wrap gap-2">
                {COMMON_ALLERGIES.map((a) => {
                  const isSel = allergies.includes(a);
                  return (
                    <button
                      key={a}
                      type="button"
                      onClick={() => toggleAllergy(a)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                        isSel
                          ? 'bg-[#F2A65A] text-[#202C2A] border-[#E29547] font-semibold'
                          : 'bg-[#F8FAF8] text-[#202C2A] border-[#E5EBE7] hover:bg-[#F2F6F3]'
                      }`}
                    >
                      {isSel && <Check className="w-3 h-3 inline mr-1" />}
                      {a}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#202C2A] uppercase tracking-wider mb-1.5">
                Special Health Notes
              </label>
              <textarea
                rows={3}
                value={healthNotes}
                onChange={(e) => setHealthNotes(e.target.value)}
                placeholder="Doctor recommendations or personal dietary reminders..."
                className="w-full px-4 py-2.5 rounded-xl border border-[#E5EBE7] bg-[#F8FAF8] text-sm text-[#202C2A] focus:outline-none focus:ring-2 focus:ring-[#145B52]"
              />
            </div>
          </div>
        )}

        {/* Tab 2: Diet & Lifestyle */}
        {activeTab === 'lifestyle' && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E5EBE7] shadow-xs space-y-6">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#202C2A] uppercase tracking-wider mb-2">
                  Dietary Pattern
                </label>
                <select
                  value={dietType}
                  onChange={(e) => setDietType(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E5EBE7] bg-[#F8FAF8] text-sm text-[#202C2A] focus:outline-none focus:ring-2 focus:ring-[#145B52]"
                >
                  {DIET_TYPES.map((d) => (
                    <option key={d.id} value={d.id}>{d.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#202C2A] uppercase tracking-wider mb-2">
                  Activity Level
                </label>
                <select
                  value={activityLevel}
                  onChange={(e) => setActivityLevel(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E5EBE7] bg-[#F8FAF8] text-sm text-[#202C2A] focus:outline-none focus:ring-2 focus:ring-[#145B52]"
                >
                  {ACTIVITY_LEVELS.map((a) => (
                    <option key={a.id} value={a.id}>{a.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#202C2A] uppercase tracking-wider mb-1.5">
                  Age
                </label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E5EBE7] bg-[#F8FAF8] text-sm text-[#202C2A] focus:outline-none focus:ring-2 focus:ring-[#145B52]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#202C2A] uppercase tracking-wider mb-1.5">
                  Gender
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E5EBE7] bg-[#F8FAF8] text-sm text-[#202C2A] focus:outline-none focus:ring-2 focus:ring-[#145B52]"
                >
                  <option value="">Select</option>
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Non-Binary">Non-Binary</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#202C2A] uppercase tracking-wider mb-1.5">
                Preferred Cuisines
              </label>
              <input
                type="text"
                value={preferredCuisines}
                onChange={(e) => setPreferredCuisines(e.target.value)}
                placeholder="e.g. Maharashtrian, North Indian, Gujarati, South Indian"
                className="w-full px-4 py-2.5 rounded-xl border border-[#E5EBE7] bg-[#F8FAF8] text-sm text-[#202C2A] focus:outline-none focus:ring-2 focus:ring-[#145B52]"
              />
            </div>
          </div>
        )}

        {/* Tab 3: Account & Privacy */}
        {activeTab === 'privacy' && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E5EBE7] shadow-xs space-y-6">
            <div>
              <h3 className="font-bold text-sm text-[#202C2A]">Account Information</h3>
              <p className="text-xs text-[#71807B]">Your registered email and authorization identity.</p>
              <div className="mt-3 p-3.5 rounded-xl bg-[#F8FAF8] border border-[#E5EBE7] text-xs">
                <p><strong>Name:</strong> {user?.full_name}</p>
                <p className="mt-1"><strong>Email:</strong> {user?.email}</p>
              </div>
            </div>

            <div className="pt-4 border-t border-[#E5EBE7] space-y-3">
              <h3 className="font-bold text-sm text-[#D85C5C]">Danger Zone & Data Deletion</h3>
              <p className="text-xs text-[#71807B] leading-relaxed">
                Health information is sensitive. You can request the complete erasure of your account, health conditions, chat logs, and personalized plans from our database at any time.
              </p>

              <button
                type="button"
                onClick={() => setShowDeleteModal(true)}
                className="px-4 py-2.5 rounded-xl bg-[#FDEEEE] hover:bg-[#D85C5C] text-[#D85C5C] hover:text-white text-xs font-semibold border border-[#D85C5C]/30 flex items-center gap-2 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete All My Health Data & Account</span>
              </button>
            </div>
          </div>
        )}

        {/* Save Bar */}
        {activeTab !== 'privacy' && (
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-[#145B52] hover:bg-[#0E423B] text-white text-xs font-semibold flex items-center gap-2 transition-colors shadow-xs disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        )}
      </form>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-[#E5EBE7] shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="w-10 h-10 rounded-xl bg-[#FDEEEE] text-[#D85C5C] flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#202C2A]">
                Confirm Account & Data Deletion
              </h3>
              <p className="text-xs text-[#71807B] mt-1 leading-relaxed">
                This action is irreversible. All of your declared conditions, allergies, weekly plans, and consultation chats will be permanently deleted from our servers.
              </p>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 rounded-xl border border-[#E5EBE7] bg-white text-xs font-semibold text-[#202C2A] hover:bg-[#F2F6F3]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                className="px-4 py-2 rounded-xl bg-[#D85C5C] hover:bg-[#B94444] text-white text-xs font-semibold shadow-xs"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

