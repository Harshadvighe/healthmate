import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CalendarDays, 
  Activity, 
  Sparkles, 
  RefreshCw, 
  Coffee, 
  Sun, 
  Cookie, 
  Moon, 
  CheckCircle2, 
  ShieldAlert, 
  Printer 
} from 'lucide-react';
import { planApi } from '../api/planApi';
import { useAuth } from '../context/AuthContext';

const DAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

export default function WeeklyPlanPage() {
  const { user } = useAuth();
  const [plans, setPlans] = useState([]);
  const [activePlan, setActivePlan] = useState(null);
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    setLoading(true);
    try {
      const data = await planApi.getPlans();
      setPlans(data || []);
      if (data && data.length > 0) {
        setActivePlan(data[0]);
      } else {
        // Auto-generate initial plan if none exists
        handleGeneratePlan();
      }
    } catch (err) {
      console.error('Failed to load plans', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePlan = async () => {
    setGenerating(true);
    setError('');
    try {
      const newPlan = await planApi.generate({
        custom_notes: 'Tailored for balanced Indian nutritional diversity',
      });
      setActivePlan(newPlan);
      setPlans((prev) => [newPlan, ...prev]);
    } catch (err) {
      setError(err.message || 'Failed to generate weekly plan.');
    } finally {
      setGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const currentDayData = activePlan?.days?.find((d) => d.day === selectedDay) || activePlan?.days?.[0];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E5EBE7]">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EBF4F2] text-[#145B52] text-xs font-semibold mb-2">
            <CalendarDays className="w-4 h-4 text-[#F2A65A]" />
            <span>Personalized Nutrition Schedule</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#202C2A]">
            Weekly Meal Planner
          </h1>
          <p className="text-xs sm:text-sm text-[#71807B] mt-1">
            7-day Indian meal schedule tailored to your dietary pattern and declared allergies.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrint}
            className="p-2.5 rounded-xl border border-[#E5EBE7] bg-white hover:bg-[#F2F6F3] text-xs font-semibold text-[#202C2A] flex items-center gap-1.5 transition-colors"
            title="Print Plan"
          >
            <Printer className="w-4 h-4 text-[#71807B]" />
            <span className="hidden sm:inline">Print</span>
          </button>
          <button
            type="button"
            disabled={generating}
            onClick={handleGeneratePlan}
            className="px-4 py-2.5 rounded-xl bg-[#145B52] hover:bg-[#0E423B] text-white text-xs font-semibold flex items-center gap-2 transition-colors shadow-xs disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${generating ? 'animate-spin' : ''}`} />
            <span>{generating ? 'Regenerating...' : 'Regenerate Plan'}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-[#FDEEEE] border border-[#D85C5C]/20 text-[#D85C5C] text-xs flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Day Selector Tabs */}
      <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-none">
        {DAYS.map((day) => {
          const isSelected = selectedDay === day;
          return (
            <button
              key={day}
              type="button"
              onClick={() => setSelectedDay(day)}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                isSelected
                  ? 'bg-[#145B52] text-white shadow-xs'
                  : 'bg-white text-[#71807B] hover:bg-[#F2F6F3] border border-[#E5EBE7]'
              }`}
            >
              {day}
            </button>
          );
        })}
      </div>

      {/* Day Details Card */}
      <AnimatePresence mode="wait">
        {currentDayData && (
          <motion.div
            key={selectedDay}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            {/* Meal Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Breakfast */}
              <div className="bg-white p-5 rounded-2xl border border-[#E5EBE7] shadow-xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[#E5EBE7]">
                  <div className="flex items-center gap-2 text-[#145B52]">
                    <Coffee className="w-4 h-4" />
                    <span className="font-bold text-xs uppercase tracking-wider">Breakfast</span>
                  </div>
                  <span className="text-[10px] text-[#71807B]">8:00 AM - 9:00 AM</span>
                </div>
                <p className="text-sm font-semibold text-[#202C2A] leading-relaxed">
                  {currentDayData.breakfast}
                </p>
                <div className="pt-2 flex items-center gap-1 text-[11px] text-[#3A936B]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Whole grains & sustained carbs</span>
                </div>
              </div>

              {/* Lunch */}
              <div className="bg-white p-5 rounded-2xl border border-[#E5EBE7] shadow-xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[#E5EBE7]">
                  <div className="flex items-center gap-2 text-[#145B52]">
                    <Sun className="w-4 h-4 text-[#F2A65A]" />
                    <span className="font-bold text-xs uppercase tracking-wider">Lunch</span>
                  </div>
                  <span className="text-[10px] text-[#71807B]">1:00 PM - 2:00 PM</span>
                </div>
                <p className="text-sm font-semibold text-[#202C2A] leading-relaxed">
                  {currentDayData.lunch}
                </p>
                <div className="pt-2 flex items-center gap-1 text-[11px] text-[#3A936B]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Protein + fiber balance</span>
                </div>
              </div>

              {/* Evening Snack */}
              <div className="bg-white p-5 rounded-2xl border border-[#E5EBE7] shadow-xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[#E5EBE7]">
                  <div className="flex items-center gap-2 text-[#E29547]">
                    <Cookie className="w-4 h-4 text-[#F2A65A]" />
                    <span className="font-bold text-xs uppercase tracking-wider">Evening Snack</span>
                  </div>
                  <span className="text-[10px] text-[#71807B]">5:00 PM - 5:30 PM</span>
                </div>
                <p className="text-sm font-semibold text-[#202C2A] leading-relaxed">
                  {currentDayData.evening_snack}
                </p>
                <div className="pt-2 flex items-center gap-1 text-[11px] text-[#3A936B]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Light, roasted & non-greasy</span>
                </div>
              </div>

              {/* Dinner */}
              <div className="bg-white p-5 rounded-2xl border border-[#E5EBE7] shadow-xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[#E5EBE7]">
                  <div className="flex items-center gap-2 text-[#145B52]">
                    <Moon className="w-4 h-4" />
                    <span className="font-bold text-xs uppercase tracking-wider">Dinner</span>
                  </div>
                  <span className="text-[10px] text-[#71807B]">7:30 PM - 8:30 PM</span>
                </div>
                <p className="text-sm font-semibold text-[#202C2A] leading-relaxed">
                  {currentDayData.dinner}
                </p>
                <div className="pt-2 flex items-center gap-1 text-[11px] text-[#3A936B]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Easily digestible, warm meal</span>
                </div>
              </div>
            </div>

            {/* Daily Physical Activity Suggestion */}
            {currentDayData.activity && (
              <div className="p-4 rounded-2xl bg-[#EBF7F1] border border-[#3A936B]/20 flex items-start sm:items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#3A936B] text-white flex items-center justify-center shrink-0">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#3A936B] uppercase tracking-wider">
                    Recommended Movement Routine for {selectedDay}
                  </h4>
                  <p className="text-sm font-medium text-[#202C2A] mt-0.5">
                    {currentDayData.activity}
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Medical Disclaimer Banner */}
      <div className="p-4 rounded-2xl bg-[#FCF5E8] border border-[#D99A35]/30 text-xs text-[#202C2A] flex items-start gap-3">
        <ShieldAlert className="w-4 h-4 text-[#D99A35] shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Important Clinical Notice:</strong> This 7-day schedule is an educational lifestyle guide. It does not replace clinical medical nutrition therapy. If you have conditions requiring specialized clinical management (e.g. chronic kidney disease, severe gestational diabetes, or post-operative care), consult a qualified physician or registered clinical dietitian.
        </p>
      </div>
    </div>
  );
}

