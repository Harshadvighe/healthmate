import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  HeartPulse, 
  SearchCheck, 
  MessageSquareHeart, 
  CalendarDays, 
  Activity, 
  ShieldAlert, 
  ArrowRight, 
  Sparkles, 
  Utensils, 
  Clock, 
  ChevronRight,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { profileApi } from '../api/profileApi';
import { planApi } from '../api/planApi';
import { chatApi } from '../api/chatApi';
import { foodApi } from '../api/foodApi';

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [plans, setPlans] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [catalogReport, setCatalogReport] = useState(null);
  const [loading, setLoading] = useState(true);

  // Quick checker state
  const [quickSearch, setQuickSearch] = useState('');

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [profData, plansData, convsData, reportData, historyData] = await Promise.all([
          profileApi.getProfile().catch(() => null),
          planApi.getPlans().catch(() => []),
          chatApi.getConversations().catch(() => []),
          foodApi.getValidationReport().catch(() => null),
          foodApi.getRecentHistory(6).catch(() => ({ history: [] })),
        ]);
        setProfile(profData);
        setPlans(plansData);
        setConversations(convsData);
        setCatalogReport(reportData);
        setRecentSearches(historyData?.history || []);
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  const handleQuickSearchSubmit = (e) => {
    e.preventDefault();
    if (!quickSearch.trim()) return;
    navigate(`/food-checker?q=${encodeURIComponent(quickSearch.trim())}`);
  };

  const getDayOfWeek = () => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[new Date().getDay()];
  };

  const activePlan = plans && plans.length > 0 ? plans[0] : null;
  const todayMeals = activePlan?.days?.find((d) => d.day === getDayOfWeek()) || activePlan?.days?.[0];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#145B52] to-[#287C70] rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-sm">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white text-xs backdrop-blur-xs border border-white/20">
            <Sparkles className="w-3.5 h-3.5 text-[#F2A65A]" />
            <span>Personal Health Dashboard</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Namaste, {user?.full_name?.split(' ')[0] || 'Friend'}!
          </h1>

          <p className="text-sm text-[#E5EBE7] leading-relaxed">
            Welcome to your personalized health assistant. All food recommendations and chatbot responses are checked against your saved health conditions and dietary preferences.
          </p>

          <div className="pt-2 flex flex-wrap gap-2 text-xs">
            <span className="px-3 py-1 rounded-lg bg-black/20 text-[#FFF3E6] border border-white/10">
              Diet: <strong className="font-semibold text-white">{profile?.diet_type?.replace('_', ' ')?.toUpperCase() || 'VEGETARIAN'}</strong>
            </span>
            {profile?.health_conditions?.length > 0 && (
              <span className="px-3 py-1 rounded-lg bg-black/20 text-[#FFF3E6] border border-white/10">
                Conditions: <strong className="font-semibold text-white">{profile.health_conditions.join(', ')}</strong>
              </span>
            )}
            {profile?.allergies?.length > 0 && (
              <span className="px-3 py-1 rounded-lg bg-[#D85C5C]/30 text-white border border-[#D85C5C]/30">
                Allergies: <strong className="font-semibold text-white">{profile.allergies.join(', ')}</strong>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Two Main Action Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Quick Food Checker */}
        <motion.div 
          whileHover={{ y: -2 }}
          className="bg-white p-6 rounded-2xl border border-[#E5EBE7] shadow-xs space-y-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-[#EBF4F2] flex items-center justify-center text-[#145B52]">
                <SearchCheck className="w-5 h-5 text-[#145B52]" />
              </div>
              <div>
                <h3 className="font-bold text-base text-[#202C2A]">Food Checker</h3>
                <p className="text-xs text-[#71807B]">Search 1,400+ Indian dishes & ingredients</p>
              </div>
            </div>
            <Link
              to="/food-checker"
              className="text-xs font-semibold text-[#145B52] hover:text-[#0E423B] flex items-center gap-1"
            >
              <span>Explore All</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <form onSubmit={handleQuickSearchSubmit} className="flex gap-2">
            <input
              type="text"
              value={quickSearch}
              onChange={(e) => setQuickSearch(e.target.value)}
              placeholder="Check dish (e.g. Roti, Cow milk, Poha)..."
              className="flex-1 px-3.5 py-2.5 rounded-xl border border-[#E5EBE7] bg-[#F8FAF8] text-sm text-[#202C2A] placeholder-[#71807B] focus:outline-none focus:ring-2 focus:ring-[#145B52]"
            />
            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl bg-[#145B52] hover:bg-[#0E423B] text-white text-xs font-semibold transition-colors"
            >
              Check
            </button>
          </form>

          <div className="flex flex-wrap gap-1.5 pt-1">
            <span className="text-[11px] text-[#71807B]">Quick check:</span>
            {['Cow milk', 'Roti', 'Paneer', 'Curd', 'Poha', 'Banana'].map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => navigate(`/food-checker?q=${encodeURIComponent(f)}`)}
                className="px-2 py-0.5 rounded-md bg-[#F2F6F3] hover:bg-[#EBF4F2] text-[11px] text-[#145B52] border border-[#E5EBE7]"
              >
                {f}
              </button>
            ))}
          </div>
        </motion.div>

        {/* AI Health Assistant Quick Consultation */}
        <motion.div 
          whileHover={{ y: -2 }}
          className="bg-white p-6 rounded-2xl border border-[#E5EBE7] shadow-xs space-y-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-[#FFF3E6] flex items-center justify-center text-[#E29547]">
                <MessageSquareHeart className="w-5 h-5 text-[#F2A65A]" />
              </div>
              <div>
                <h3 className="font-bold text-base text-[#202C2A]">AI Health Assistant</h3>
                <p className="text-xs text-[#71807B]">Context-aware nutritional guidance</p>
              </div>
            </div>
            <Link
              to="/chat"
              className="text-xs font-semibold text-[#145B52] hover:text-[#0E423B] flex items-center gap-1"
            >
              <span>Open Chat</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <p className="text-xs text-[#71807B] leading-relaxed">
            Ask questions like "Can I drink milk?", "Is curd safe for my lactose intolerance?", or "What should I eat for dinner?"
          </p>

          <div className="pt-1">
            <Link
              to="/chat"
              className="w-full py-2.5 px-4 rounded-xl bg-[#F8FAF8] hover:bg-[#EBF4F2] border border-[#E5EBE7] text-xs font-semibold text-[#145B52] flex items-center justify-center gap-2 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#F2A65A]" />
              <span>Start Consultation with AI Assistant</span>
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Today's Meal Plan & Routine Overview */}
      <div className="bg-white rounded-2xl border border-[#E5EBE7] shadow-xs p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#E5EBE7]">
          <div>
            <div className="flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-[#145B52]" />
              <h2 className="text-lg font-bold text-[#202C2A]">
                Today's Meal Plan ({getDayOfWeek()})
              </h2>
            </div>
            <p className="text-xs text-[#71807B] mt-0.5">
              {activePlan ? activePlan.title : 'Structured seven-day Indian nutrition schedule'}
            </p>
          </div>

          <Link
            to="/weekly-plan"
            className="px-4 py-2 rounded-xl bg-[#145B52] hover:bg-[#0E423B] text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-colors self-start sm:self-auto"
          >
            <span>View Full 7-Day Plan</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {todayMeals ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-[#F8FAF8] border border-[#E5EBE7] space-y-1.5">
              <span className="text-[10px] font-bold text-[#145B52] uppercase tracking-wider">Breakfast</span>
              <p className="text-xs font-semibold text-[#202C2A] leading-snug">{todayMeals.breakfast}</p>
            </div>
            <div className="p-4 rounded-xl bg-[#F8FAF8] border border-[#E5EBE7] space-y-1.5">
              <span className="text-[10px] font-bold text-[#145B52] uppercase tracking-wider">Lunch</span>
              <p className="text-xs font-semibold text-[#202C2A] leading-snug">{todayMeals.lunch}</p>
            </div>
            <div className="p-4 rounded-xl bg-[#F8FAF8] border border-[#E5EBE7] space-y-1.5">
              <span className="text-[10px] font-bold text-[#F2A65A] uppercase tracking-wider">Evening Snack</span>
              <p className="text-xs font-semibold text-[#202C2A] leading-snug">{todayMeals.evening_snack}</p>
            </div>
            <div className="p-4 rounded-xl bg-[#F8FAF8] border border-[#E5EBE7] space-y-1.5">
              <span className="text-[10px] font-bold text-[#145B52] uppercase tracking-wider">Dinner</span>
              <p className="text-xs font-semibold text-[#202C2A] leading-snug">{todayMeals.dinner}</p>
            </div>
          </div>
        ) : (
          <div className="text-center py-6 space-y-3">
            <p className="text-sm text-[#71807B]">You haven't generated your personalized weekly plan yet.</p>
            <Link
              to="/weekly-plan"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#145B52] text-white text-xs font-semibold hover:bg-[#0E423B]"
            >
              <CalendarDays className="w-4 h-4" />
              <span>Generate My 7-Day Plan</span>
            </Link>
          </div>
        )}

        {todayMeals?.activity && (
          <div className="p-3.5 rounded-xl bg-[#EBF7F1] border border-[#3A936B]/20 flex items-center gap-3">
            <Activity className="w-5 h-5 text-[#3A936B] shrink-0" />
            <div className="text-xs text-[#202C2A]">
              <span className="font-semibold text-[#3A936B]">Suggested Daily Movement: </span>
              {todayMeals.activity}
            </div>
          </div>
        )}
      </div>

      {/* Grid: Health Profile Card & Recent Chat Consultations */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="bg-white p-6 rounded-2xl border border-[#E5EBE7] shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E5EBE7]">
            <h3 className="font-bold text-sm text-[#202C2A]">My Registered Profile</h3>
            <Link to="/profile" className="text-xs font-medium text-[#145B52] hover:underline">
              Edit Profile
            </Link>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-[#71807B] block mb-1">Declared Conditions:</span>
              <div className="flex flex-wrap gap-1.5">
                {profile?.health_conditions?.length > 0 ? (
                  profile.health_conditions.map((c) => (
                    <span key={c} className="px-2 py-0.5 rounded-md bg-[#FFF3E6] text-[#E29547] font-medium border border-[#F2A65A]/20">
                      {c}
                    </span>
                  ))
                ) : (
                  <span className="text-[#71807B] italic">No conditions declared</span>
                )}
              </div>
            </div>

            <div>
              <span className="text-[#71807B] block mb-1">Known Allergies:</span>
              <div className="flex flex-wrap gap-1.5">
                {profile?.allergies?.length > 0 ? (
                  profile.allergies.map((a) => (
                    <span key={a} className="px-2 py-0.5 rounded-md bg-[#FDEEEE] text-[#D85C5C] font-medium border border-[#D85C5C]/20">
                      {a}
                    </span>
                  ))
                ) : (
                  <span className="text-[#71807B] italic">No allergies recorded</span>
                )}
              </div>
            </div>

            <div>
              <span className="text-[#71807B] block mb-1">Diet & Activity:</span>
              <p className="font-medium text-[#202C2A]">
                {profile?.diet_type?.replace('_', ' ')?.toUpperCase()} &bull; {profile?.activity_level?.toUpperCase()}
              </p>
            </div>

            <div>
              <span className="text-[#71807B] block mb-1">Wellness Goals:</span>
              <div className="flex flex-wrap gap-1.5">
                {profile?.goals?.length > 0 ? (
                  profile.goals.map((g) => (
                    <span key={g} className="px-2 py-0.5 rounded-md bg-[#EBF4F2] text-[#145B52] font-medium border border-[#287C70]/20">
                      {g.replace('_', ' ')}
                    </span>
                  ))
                ) : (
                  <span className="text-[#71807B] italic">General wellness</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Conversations */}
        <div className="bg-white p-6 rounded-2xl border border-[#E5EBE7] shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E5EBE7]">
            <h3 className="font-bold text-sm text-[#202C2A]">Recent Health Consultations</h3>
            <Link to="/chat" className="text-xs font-semibold text-[#145B52] hover:underline">
              New Chat +
            </Link>
          </div>

          {conversations && conversations.length > 0 ? (
            <div className="space-y-2">
              {conversations.slice(0, 3).map((conv) => (
                <Link
                  key={conv.id}
                  to={`/chat?id=${conv.id}`}
                  className="flex items-center justify-between p-3 rounded-xl bg-[#F8FAF8] hover:bg-[#EBF4F2] border border-[#E5EBE7] transition-all group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <MessageSquareHeart className="w-4 h-4 text-[#145B52] shrink-0" />
                    <div className="truncate">
                      <p className="text-xs font-semibold text-[#202C2A] truncate group-hover:text-[#145B52]">
                        {conv.title}
                      </p>
                      <p className="text-[11px] text-[#71807B] truncate">{conv.last_message}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#71807B] group-hover:translate-x-1 transition-transform" />
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-xs text-[#71807B] space-y-2">
              <p>No recent chatbot consultations.</p>
              <Link
                to="/chat"
                className="inline-block px-3 py-1.5 rounded-lg bg-[#145B52] text-white font-medium"
              >
                Ask Your First Question
              </Link>
            </div>
          )}
        </div>

        {/* Recent Food Searches */}
        <div className="bg-white p-6 rounded-2xl border border-[#E5EBE7] shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E5EBE7]">
            <h3 className="font-bold text-sm text-[#202C2A]">Recent Food Checks</h3>
            <Link to="/checker" className="text-xs font-semibold text-[#145B52] hover:underline">
              Checker +
            </Link>
          </div>

          {recentSearches && recentSearches.length > 0 ? (
            <div className="space-y-2">
              {recentSearches.slice(0, 3).map((item) => (
                <Link
                  key={item.id}
                  to={`/checker?q=${encodeURIComponent(item.query_text)}`}
                  className="flex items-center justify-between p-3 rounded-xl bg-[#F8FAF8] hover:bg-[#EBF4F2] border border-[#E5EBE7] transition-all group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <SearchCheck className="w-4 h-4 text-[#287C70] shrink-0" />
                    <div className="truncate">
                      <p className="text-xs font-semibold text-[#202C2A] truncate group-hover:text-[#145B52]">
                        {item.matched_food_name || item.query_text}
                      </p>
                      <p className="text-[11px] text-[#71807B] truncate">Searched: "{item.query_text}"</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#71807B] group-hover:translate-x-1 transition-transform" />
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-xs text-[#71807B] space-y-2">
              <p>No food checks yet.</p>
              <Link
                to="/checker"
                className="inline-block px-3 py-1.5 rounded-lg bg-[#287C70] text-white font-medium"
              >
                Check a Food Item
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

