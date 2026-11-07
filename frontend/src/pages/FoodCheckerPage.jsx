import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  SearchCheck, 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  Info, 
  Layers, 
  Sparkles, 
  Languages, 
  Utensils, 
  Check, 
  ChevronRight,
  HelpCircle
} from 'lucide-react';
import { foodApi } from '../api/foodApi';

const CATEGORIES = [
  'All',
  'Beverages & Condiments',
  'Cereals & Millets',
  'Fruits',
  'Indian Meals & Snacks',
  'Milk & Dairy',
  'Nuts, Seeds & Oils',
  'Pulses & Legumes',
  'Sweets & Desserts',
  'Vegetables',
];

const QUICK_SUGGESTIONS = [
  'Cow milk',
  'Roti',
  'Banana',
  'Rice',
  'Paneer',
  'Curd',
  'Poha',
  'Dal',
  'Sugar',
];

export default function FoodCheckerPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  // Browse search list
  const [browseResults, setBrowseResults] = useState([]);
  const [browseLoading, setBrowseLoading] = useState(false);

  useEffect(() => {
    if (initialQuery) {
      performCheck(initialQuery);
    }
  }, [initialQuery]);

  const performCheck = async (foodText) => {
    if (!foodText.trim()) return;
    setChecking(true);
    setError('');
    try {
      const data = await foodApi.checkFood(foodText.trim());
      setResult(data);
      setSearchParams({ q: foodText.trim() });
    } catch (err) {
      setError(err.message || 'Error checking food in catalog.');
    } finally {
      setChecking(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    performCheck(query);
  };

  const handleCategoryFilter = async (cat) => {
    setSelectedCategory(cat);
    setBrowseLoading(true);
    try {
      const catParam = cat === 'All' ? '' : cat;
      const res = await foodApi.search(query || 'a', catParam, 12);
      setBrowseResults(res.results || []);
    } catch (err) {
      console.error(err);
    } finally {
      setBrowseLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EBF4F2] text-[#145B52] text-xs font-semibold">
          <SearchCheck className="w-4 h-4 text-[#F2A65A]" />
          <span>Food Intelligence Engine</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#202C2A]">
          Food Checker
        </h1>
        <p className="text-sm text-[#71807B] max-w-2xl leading-relaxed">
          Verify any Indian dish, raw ingredient, or preparation form against your declared health conditions, allergies, and lifestyle rules.
        </p>
      </div>

      {/* Main Search Bar Card */}
      <div className="bg-white rounded-2xl border border-[#E5EBE7] shadow-xs p-6 space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#71807B]">
              <SearchCheck className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Type Indian food name (e.g. Milk, Roti, Banana, Paneer, Curd, Poha)..."
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-[#E5EBE7] bg-[#F8FAF8] text-sm text-[#202C2A] placeholder-[#71807B] focus:outline-none focus:ring-2 focus:ring-[#145B52] transition-all"
            />
          </div>
          <button
            type="submit"
            disabled={checking || !query.trim()}
            className="px-6 py-3 rounded-xl bg-[#145B52] hover:bg-[#0E423B] text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-xs transition-colors disabled:opacity-50"
          >
            {checking ? (
              <span>Checking...</span>
            ) : (
              <>
                <span>Check Suitability</span>
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Quick Suggestion Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-xs text-[#71807B] mr-1">Try quick searches:</span>
          {QUICK_SUGGESTIONS.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => {
                setQuery(item);
                performCheck(item);
              }}
              className="px-2.5 py-1 rounded-lg bg-[#F8FAF8] hover:bg-[#EBF4F2] text-xs font-medium text-[#145B52] border border-[#E5EBE7] transition-colors"
            >
              {item}
            </button>
          ))}
        </div>

        {/* Category Filters */}
        <div className="pt-3 border-t border-[#E5EBE7]">
          <span className="text-xs text-[#71807B] block mb-2 font-medium">Browse by Food Category:</span>
          <div className="flex flex-wrap gap-1.5">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => handleCategoryFilter(cat)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  selectedCategory === cat
                    ? 'bg-[#145B52] text-white shadow-xs'
                    : 'bg-[#F8FAF8] text-[#71807B] hover:bg-[#F2F6F3] border border-[#E5EBE7]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-[#FDEEEE] border border-[#D85C5C]/20 text-[#D85C5C] text-xs flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Result Card */}
      <AnimatePresence mode="wait">
        {result && (
          <motion.div
            key={result.food?.food_id || 'unknown'}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            {result.matched && result.food ? (
              <div className="bg-white rounded-3xl border border-[#E5EBE7] shadow-sm p-6 sm:p-8 space-y-6">
                {/* Food Header & Suitability Badge */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-[#E5EBE7]">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#EBF4F2] text-[#145B52]">
                        {result.food.food_category}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#F8FAF8] text-[#71807B] border border-[#E5EBE7]">
                        {result.food.diet_type?.replace(/_/g, ' ')?.toUpperCase()}
                      </span>
                      {result.food.match_score && (
                        <span className="text-[11px] text-[#71807B]">
                          Match confidence: {Math.round(result.food.match_score * 100)}%
                        </span>
                      )}
                    </div>

                    <h2 className="text-2xl sm:text-3xl font-bold text-[#202C2A]">
                      {result.food.food_name}
                    </h2>

                    {/* Regional Aliases */}
                    {(result.food.name_hi || result.food.name_mr) && (
                      <div className="flex items-center gap-3 text-xs text-[#71807B] pt-1">
                        <Languages className="w-4 h-4 text-[#145B52]" />
                        {result.food.name_hi && <span>Hindi: <strong className="text-[#202C2A]">{result.food.name_hi}</strong></span>}
                        {result.food.name_mr && <span>Marathi: <strong className="text-[#202C2A]">{result.food.name_mr}</strong></span>}
                      </div>
                    )}
                  </div>

                  {/* Suitability Score Box */}
                  {result.suitability && (
                    <div className={`p-4 rounded-2xl border text-center shrink-0 min-w-[160px] ${
                      result.suitability.status === 'avoid'
                        ? 'bg-[#FDEEEE] border-[#D85C5C]/30 text-[#D85C5C]'
                        : result.suitability.status === 'caution'
                        ? 'bg-[#FCF5E8] border-[#D99A35]/30 text-[#D99A35]'
                        : 'bg-[#EBF7F1] border-[#3A936B]/30 text-[#3A936B]'
                    }`}>
                      <span className="text-[10px] uppercase font-bold tracking-wider block">
                        Compatibility Score
                      </span>
                      <span className="text-3xl font-extrabold block my-0.5">
                        {result.suitability.score}
                        <span className="text-xs font-normal opacity-75">/100</span>
                      </span>
                      <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/70">
                        {result.suitability.status}
                      </span>
                    </div>
                  )}
                </div>

                {/* Compatibility Assessment Banner */}
                {result.suitability && (
                  <div className={`p-4 rounded-xl border flex items-start gap-3 ${
                    result.suitability.status === 'avoid'
                      ? 'bg-[#FDEEEE] border-[#D85C5C]/20 text-[#D85C5C]'
                      : result.suitability.status === 'caution'
                      ? 'bg-[#FCF5E8] border-[#D99A35]/20 text-[#D99A35]'
                      : 'bg-[#EBF7F1] border-[#3A936B]/20 text-[#145B52]'
                  }`}>
                    {result.suitability.status === 'avoid' ? (
                      <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
                    ) : result.suitability.status === 'caution' ? (
                      <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                    ) : (
                      <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5 text-[#3A936B]" />
                    )}
                    <div className="space-y-1 text-xs">
                      <p className="font-semibold text-sm">{result.suitability.headline}</p>
                      
                      {result.suitability.allergen_details?.length > 0 && (
                        <div className="space-y-0.5">
                          {result.suitability.allergen_details.map((msg, i) => (
                            <p key={i}>&bull; <strong>Allergen clash:</strong> {msg}</p>
                          ))}
                        </div>
                      )}

                      {result.suitability.dietary_details?.length > 0 && (
                        <div className="space-y-0.5">
                          {result.suitability.dietary_details.map((msg, i) => (
                            <p key={i}>&bull; <strong>Dietary clash:</strong> {msg}</p>
                          ))}
                        </div>
                      )}

                      {result.suitability.condition_notes?.length > 0 && (
                        <div className="space-y-0.5 pt-1">
                          {result.suitability.condition_notes.map((msg, i) => (
                            <p key={i}>&bull; <strong>Condition note:</strong> {msg}</p>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Details Grid: Preparation & Verification */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-[#F8FAF8] border border-[#E5EBE7] space-y-2">
                    <span className="text-[11px] font-semibold text-[#71807B] uppercase tracking-wider block">
                      Preparation Details
                    </span>
                    <p className="text-xs text-[#202C2A]">
                      <strong>Preparation Form:</strong> {result.food.preparation_label || result.food.preparation_form || 'Standard as sold'}
                    </p>
                    <p className="text-xs text-[#202C2A]">
                      <strong>Region/Origin:</strong> {result.food.region_or_origin || 'Common Indian household food'}
                    </p>
                    {result.food.serving_reference && (
                      <p className="text-xs text-[#71807B]">
                        <strong>Serving Reference:</strong> {result.food.serving_reference}
                      </p>
                    )}
                  </div>

                  <div className="p-4 rounded-xl bg-[#F8FAF8] border border-[#E5EBE7] space-y-2">
                    <span className="text-[11px] font-semibold text-[#71807B] uppercase tracking-wider block">
                      Allergens & Verification Status
                    </span>
                    <p className="text-xs text-[#202C2A]">
                      <strong>Allergen Tags:</strong>{' '}
                      {result.food.allergen_tags ? (
                        <span className="text-[#D85C5C] font-semibold">{result.food.allergen_tags}</span>
                      ) : (
                        <span className="text-[#3A936B]">No allergen tags declared</span>
                      )}
                    </p>
                    <p className="text-xs text-[#71807B]">
                      <strong>Nutrition Status:</strong>{' '}
                      <span className="inline-block px-2 py-0.5 rounded bg-[#FFF3E6] text-[#E29547] font-medium text-[10px]">
                        {result.food.nutrition_verification_status || 'Unpopulated in Catalog'}
                      </span>
                    </p>
                    <p className="text-[11px] text-[#71807B] italic">
                      Missing nutrition numbers are treated as unverified, never as zero.
                    </p>
                  </div>
                </div>

                {/* Preparation Variants */}
                {result.variants && result.variants.length > 0 && (
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center gap-2 text-xs font-semibold text-[#202C2A]">
                      <Layers className="w-4 h-4 text-[#145B52]" />
                      <span>Other Preparation Variants for {result.food.canonical_food_name || result.food.food_name}:</span>
                    </div>
                    <div className="grid sm:grid-cols-3 gap-2.5">
                      {result.variants.map((variant) => (
                        <button
                          key={variant.food_id}
                          type="button"
                          onClick={() => {
                            setQuery(variant.food_name);
                            performCheck(variant.food_name);
                          }}
                          className="p-3 rounded-xl bg-[#F8FAF8] hover:bg-[#EBF4F2] border border-[#E5EBE7] text-left transition-all group"
                        >
                          <p className="text-xs font-semibold text-[#202C2A] group-hover:text-[#145B52] truncate">
                            {variant.food_name}
                          </p>
                          <p className="text-[11px] text-[#71807B]">
                            Form: {variant.preparation_label || variant.preparation_form}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Medical Disclaimer */}
                <div className="pt-4 border-t border-[#E5EBE7] flex items-start gap-2.5 text-xs text-[#71807B]">
                  <HelpCircle className="w-4 h-4 shrink-0 text-[#71807B] mt-0.5" />
                  <p>
                    {result.suitability?.disclaimer || 'Educational guidance only. Consult a healthcare professional for clinical management.'}
                  </p>
                </div>
              </div>
            ) : (
              /* Unknown Food Empty State */
              <div className="bg-white rounded-3xl border border-[#E5EBE7] p-8 text-center space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-[#FFF3E6] text-[#E29547] flex items-center justify-center mx-auto">
                  <HelpCircle className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-[#202C2A]">
                  Food Item Not Found
                </h3>
                <p className="text-xs text-[#71807B] max-w-md mx-auto leading-relaxed">
                  {result.message || "We couldn't locate a verified match in our catalog of 1,400+ Indian foods. Please check the spelling or try searching a common regional synonym."}
                </p>
                <div className="pt-2 flex flex-wrap justify-center gap-2">
                  {QUICK_SUGGESTIONS.slice(0, 5).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => {
                        setQuery(s);
                        performCheck(s);
                      }}
                      className="px-3 py-1 rounded-lg bg-[#F8FAF8] hover:bg-[#EBF4F2] text-xs font-medium text-[#145B52] border border-[#E5EBE7]"
                    >
                      Search {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Category Browse Grid (when category filter clicked) */}
      {browseResults && browseResults.length > 0 && (
        <div className="space-y-4 pt-4">
          <h3 className="text-base font-bold text-[#202C2A]">
            Catalog Results in {selectedCategory} ({browseResults.length})
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {browseResults.map((item) => (
              <div
                key={item.food_id}
                onClick={() => {
                  setQuery(item.food_name);
                  performCheck(item.food_name);
                }}
                className="p-4 rounded-xl bg-white border border-[#E5EBE7] hover:border-[#145B52] shadow-xs cursor-pointer transition-all space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold uppercase text-[#145B52]">
                    {item.food_category}
                  </span>
                  <span className="text-[10px] text-[#71807B]">
                    {item.preparation_label || item.preparation_form}
                  </span>
                </div>
                <h4 className="font-semibold text-sm text-[#202C2A]">{item.food_name}</h4>
                {(item.name_hi || item.name_mr) && (
                  <p className="text-[11px] text-[#71807B]">
                    {item.name_hi && `${item.name_hi} `}
                    {item.name_mr && `| ${item.name_mr}`}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

