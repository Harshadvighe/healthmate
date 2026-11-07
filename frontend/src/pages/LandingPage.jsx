import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  HeartPulse, 
  SearchCheck, 
  MessageSquareHeart, 
  CalendarDays, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight, 
  AlertTriangle,
  Languages,
  Sparkles,
  BookOpen
} from 'lucide-react';
import { foodApi } from '../api/foodApi';

export default function LandingPage() {
  const [demoQuery, setDemoQuery] = useState('');
  const [demoResult, setDemoResult] = useState(null);
  const [demoLoading, setDemoLoading] = useState(false);

  const handleDemoSearch = async (e) => {
    e.preventDefault();
    if (!demoQuery.trim()) return;
    setDemoLoading(true);
    try {
      const res = await foodApi.checkFood(demoQuery);
      setDemoResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setDemoLoading(false);
    }
  };

  const sampleFoods = ['Cow milk', 'Roti', 'Banana', 'Paneer', 'Poha', 'Curd', 'Dal'];

  return (
    <div className="min-h-screen bg-[#F8FAF8] text-[#202C2A] flex flex-col">
      {/* Navigation */}
      <nav className="border-b border-[#E5EBE7] bg-white sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#145B52] flex items-center justify-center text-white shadow-sm">
              <HeartPulse className="w-6 h-6 text-[#F2A65A]" />
            </div>
            <div>
              <span className="font-semibold text-xl tracking-tight text-[#202C2A]">
                Health<span className="text-[#145B52]">Mate</span>
              </span>
              <span className="ml-1.5 text-[10px] font-bold tracking-wider uppercase px-1.5 py-0.5 rounded bg-[#FFF3E6] text-[#E29547]">
                AI
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="px-4 py-2 text-sm font-medium text-[#145B52] hover:text-[#0E423B] transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="px-4 py-2 text-sm font-medium rounded-lg bg-[#145B52] text-white hover:bg-[#0E423B] shadow-sm transition-all"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 lg:py-24 border-b border-[#E5EBE7] bg-gradient-to-b from-[#FFFFFF] to-[#F8FAF8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="lg:col-span-7 space-y-6"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#EBF4F2] text-[#145B52] text-xs font-semibold border border-[#287C70]/20">
                <ShieldCheck className="w-4 h-4 text-[#3A936B]" />
                <span>Evidence-Grounded Indian Food & Health Intelligence</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#202C2A] leading-tight">
                Personalized nutrition, tailored to your <span className="text-[#145B52]">health reality</span>.
              </h1>

              <p className="text-lg text-[#71807B] leading-relaxed max-w-2xl">
                HealthMate connects your personal health conditions, allergies, and lifestyle goals with a verified catalog of 1,400+ Indian foods—delivering transparent, explainable dietary guidance without fabricated claims.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  to="/register"
                  className="px-6 py-3.5 rounded-xl bg-[#145B52] text-white font-medium hover:bg-[#0E423B] shadow-sm flex items-center gap-2 transition-all group"
                >
                  <span>Build Your Health Profile</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <a
                  href="#food-intelligence"
                  className="px-6 py-3.5 rounded-xl bg-white text-[#145B52] font-medium border border-[#E5EBE7] hover:bg-[#F2F6F3] transition-all"
                >
                  Explore Food Catalog
                </a>
              </div>

              <div className="grid grid-cols-3 gap-6 pt-6 border-t border-[#E5EBE7]">
                <div>
                  <p className="text-2xl font-bold text-[#145B52]">1,444</p>
                  <p className="text-xs text-[#71807B]">Indian Food Catalog Entries</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#145B52]">3 Languages</p>
                  <p className="text-xs text-[#71807B]">English, Hindi & Marathi Aliases</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#3A936B]">100%</p>
                  <p className="text-xs text-[#71807B]">Explainable Rule Logic</p>
                </div>
              </div>
            </motion.div>

            {/* Interactive Demo Card */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="lg:col-span-5"
            >
              <div className="bg-white rounded-2xl border border-[#E5EBE7] shadow-lg p-6 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#E5EBE7]">
                  <div className="flex items-center gap-2">
                    <SearchCheck className="w-5 h-5 text-[#145B52]" />
                    <span className="font-semibold text-sm text-[#202C2A]">Live Food Suitability Test</span>
                  </div>
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-[#FFF3E6] text-[#E29547]">
                    Try It Now
                  </span>
                </div>

                <form onSubmit={handleDemoSearch} className="flex gap-2">
                  <input
                    type="text"
                    value={demoQuery}
                    onChange={(e) => setDemoQuery(e.target.value)}
                    placeholder="Type food (e.g. Cow milk, Poha, Curd)..."
                    className="flex-1 px-3.5 py-2.5 rounded-xl border border-[#E5EBE7] bg-[#F8FAF8] text-sm text-[#202C2A] placeholder-[#71807B] focus:outline-none focus:ring-2 focus:ring-[#145B52]"
                  />
                  <button
                    type="submit"
                    disabled={demoLoading}
                    className="px-4 py-2.5 rounded-xl bg-[#145B52] text-white text-sm font-medium hover:bg-[#0E423B] transition-colors disabled:opacity-50"
                  >
                    {demoLoading ? 'Checking...' : 'Check'}
                  </button>
                </form>

                <div className="flex flex-wrap gap-1.5 items-center">
                  <span className="text-xs text-[#71807B]">Examples:</span>
                  {sampleFoods.map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => {
                        setDemoQuery(f);
                        foodApi.checkFood(f).then(setDemoResult);
                      }}
                      className="px-2 py-0.5 rounded-md bg-[#F2F6F3] hover:bg-[#EBF4F2] text-xs text-[#145B52] border border-[#E5EBE7]"
                    >
                      {f}
                    </button>
                  ))}
                </div>

                {demoResult && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 p-4 rounded-xl bg-[#F8FAF8] border border-[#E5EBE7] space-y-2 text-xs"
                  >
                    {demoResult.matched ? (
                      <>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-sm text-[#202C2A]">{demoResult.food?.food_name}</p>
                            <p className="text-[11px] text-[#71807B]">
                              {demoResult.food?.name_hi && `Hindi: ${demoResult.food.name_hi} `}
                              {demoResult.food?.name_mr && `| Marathi: ${demoResult.food.name_mr}`}
                            </p>
                          </div>
                          <span className={`px-2.5 py-1 rounded-full font-semibold text-[11px] ${
                            demoResult.suitability?.status === 'avoid'
                              ? 'bg-[#FDEEEE] text-[#D85C5C]'
                              : demoResult.suitability?.status === 'caution'
                              ? 'bg-[#FCF5E8] text-[#D99A35]'
                              : 'bg-[#EBF7F1] text-[#3A936B]'
                          }`}>
                            {demoResult.suitability?.status?.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-[#202C2A]">{demoResult.suitability?.headline}</p>
                        <p className="text-[11px] text-[#71807B] italic">
                          Category: {demoResult.food?.food_category} &bull; Form: {demoResult.food?.preparation_label || 'Standard'}
                        </p>
                      </>
                    ) : (
                      <p className="text-[#71807B]">{demoResult.message}</p>
                    )}
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Feature Pillars */}
      <section className="py-20 bg-white border-b border-[#E5EBE7]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-[#202C2A]">
              Designed specifically for healthcare clarity
            </h2>
            <p className="text-[#71807B] text-base">
              HealthMate avoids generic generative hallucinations. Every recommendation stems from verified dataset attributes and transparent rule-based logic.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-[#F8FAF8] border border-[#E5EBE7] space-y-4 hover:border-[#145B52]/40 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-[#EBF4F2] flex items-center justify-center text-[#145B52]">
                <SearchCheck className="w-6 h-6 text-[#145B52]" />
              </div>
              <h3 className="text-xl font-bold text-[#202C2A]">Food Checker</h3>
              <p className="text-sm text-[#71807B] leading-relaxed">
                Search any Indian food in English, Hindi, or Marathi. Get preparation form variants, allergen warnings, and custom compatibility scores against your health profile.
              </p>
              <ul className="text-xs text-[#202C2A] space-y-2 pt-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#3A936B]" />
                  <span>Fuzzy TF-IDF multi-lingual matching</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#3A936B]" />
                  <span>Unverified nutrition honestly flagged</span>
                </li>
              </ul>
            </div>

            <div className="p-6 rounded-2xl bg-[#F8FAF8] border border-[#E5EBE7] space-y-4 hover:border-[#145B52]/40 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-[#FFF3E6] flex items-center justify-center text-[#E29547]">
                <MessageSquareHeart className="w-6 h-6 text-[#F2A65A]" />
              </div>
              <h3 className="text-xl font-bold text-[#202C2A]">Context-Aware Chatbot</h3>
              <p className="text-sm text-[#71807B] leading-relaxed">
                Consult on food suitability, nutrition education, and meal choices. Responses automatically cross-reference your saved allergies, conditions, and diet.
              </p>
              <ul className="text-xs text-[#202C2A] space-y-2 pt-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#3A936B]" />
                  <span>NLP query intent classification</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#3A936B]" />
                  <span>Contextual disclaimers & uncertainty</span>
                </li>
              </ul>
            </div>

            <div className="p-6 rounded-2xl bg-[#F8FAF8] border border-[#E5EBE7] space-y-4 hover:border-[#145B52]/40 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-[#EBF7F1] flex items-center justify-center text-[#3A936B]">
                <CalendarDays className="w-6 h-6 text-[#3A936B]" />
              </div>
              <h3 className="text-xl font-bold text-[#202C2A]">Personalized 7-Day Plan</h3>
              <p className="text-sm text-[#71807B] leading-relaxed">
                Structured seven-day Indian meal schedule covering Breakfast, Lunch, Evening Snack, Dinner, and physical activity suggestions aligned with your lifestyle.
              </p>
              <ul className="text-xs text-[#202C2A] space-y-2 pt-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#3A936B]" />
                  <span>Vegetarian, Vegan & Lacto-veg adaptations</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#3A936B]" />
                  <span>Allergen-filtered ingredient swaps</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-[#F8FAF8] border-b border-[#E5EBE7]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
            <h2 className="text-3xl font-bold text-[#202C2A]">How HealthMate Works</h2>
            <p className="text-sm text-[#71807B]">
              A continuous loop of personalization, verification, and actionable nutrition insights.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-[#E5EBE7] space-y-3">
              <div className="w-8 h-8 rounded-lg bg-[#145B52] text-white flex items-center justify-center font-bold text-sm">
                1
              </div>
              <h4 className="font-bold text-[#202C2A]">Profile Onboarding</h4>
              <p className="text-xs text-[#71807B]">
                Declare your personal conditions (Diabetes, Hypertension, Lactose Intolerance), known allergies, and diet type.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-[#E5EBE7] space-y-3">
              <div className="w-8 h-8 rounded-lg bg-[#287C70] text-white flex items-center justify-center font-bold text-sm">
                2
              </div>
              <h4 className="font-bold text-[#202C2A]">Catalog Matching</h4>
              <p className="text-xs text-[#71807B]">
                Our TF-IDF vectorizer indexes 1,444 Indian food items with cross-lingual Marathi and Hindi aliases.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-[#E5EBE7] space-y-3">
              <div className="w-8 h-8 rounded-lg bg-[#F2A65A] text-white flex items-center justify-center font-bold text-sm">
                3
              </div>
              <h4 className="font-bold text-[#202C2A]">Explainable Scoring</h4>
              <p className="text-xs text-[#71807B]">
                Algorithmic rule evaluation assesses allergen clashes, diet compliance, and condition considerations.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-[#E5EBE7] space-y-3">
              <div className="w-8 h-8 rounded-lg bg-[#3A936B] text-white flex items-center justify-center font-bold text-sm">
                4
              </div>
              <h4 className="font-bold text-[#202C2A]">Actionable Daily Living</h4>
              <p className="text-xs text-[#71807B]">
                Receive 7-day meal schedules and interact with the AI assistant for everyday culinary choices.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Catalog Intelligence Highlight */}
      <section id="food-intelligence" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#145B52] text-white rounded-3xl p-8 sm:p-12 relative overflow-hidden">
            <div className="relative z-10 max-w-2xl space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white text-xs border border-white/20">
                <Languages className="w-3.5 h-3.5 text-[#F2A65A]" />
                <span>Multilingual Indian Food Database</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                Authentic Indian Meals, Millets, Pulses, and Regional Preparations
              </h2>
              <p className="text-sm text-[#E5EBE7] leading-relaxed">
                From daily breakfast items like Poha and Upma, to regional flatbreads like Jowar Bhakri and Thepla, our catalog preserves preparation forms and allergen tags.
              </p>
              <div className="pt-4">
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#F2A65A] text-[#202C2A] font-semibold hover:bg-[#E29547] transition-colors shadow-sm"
                >
                  <span>Start Exploring Now</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-[#E5EBE7] bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#145B52] flex items-center justify-center text-white">
              <HeartPulse className="w-5 h-5 text-[#F2A65A]" />
            </div>
            <span className="font-semibold text-lg text-[#202C2A]">HealthMate</span>
          </div>
          <p className="text-xs text-[#71807B] text-center sm:text-right max-w-md">
            Educational health aid only. Does not replace professional medical diagnosis, treatment, or clinical consultation.
          </p>
        </div>
      </footer>
    </div>
  );
}

