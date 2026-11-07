import re
import unicodedata
from typing import List, Dict, Any, Tuple, Optional
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

from app.services.dataset_service import dataset_service

def normalize_text(text: str) -> str:
    if not text:
        return ""
    # Normalize unicode (NFKC)
    text = unicodedata.normalize("NFKC", str(text))
    # Keep alphanumeric characters and devanagari characters (range \u0900-\u097F)
    text = text.lower()
    text = re.sub(r"[^\w\s\u0900-\u097f]", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text

class FoodMatcher:
    _instance: Optional["FoodMatcher"] = None

    def __init__(self):
        self.records: List[Dict[str, Any]] = []
        self.corpus: List[str] = []
        self.vectorizer: Optional[TfidfVectorizer] = None
        self.tfidf_matrix = None
        self._build_index()

    @classmethod
    def get_instance(cls) -> "FoodMatcher":
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def _build_index(self):
        self.records = dataset_service.get_all_records()
        self.corpus = []
        for r in self.records:
            # Multi-lingual & multi-attribute document representation
            parts = [
                str(r.get("food_name", "")),
                str(r.get("canonical_food_name", "")),
                str(r.get("name_mr", "")),
                str(r.get("name_hi", "")),
                str(r.get("search_aliases", "")),
                str(r.get("food_type", "")),
                str(r.get("food_category", "")),
                str(r.get("preparation_form", "")),
            ]
            doc = " ".join([normalize_text(p) for p in parts if p])
            self.corpus.append(doc)

        # Character n-gram TF-IDF handles typos, partial substrings, and Devanagari roots
        self.vectorizer = TfidfVectorizer(
            analyzer="char_wb",
            ngram_range=(2, 4),
            min_df=1,
            sublinear_tf=True
        )
        self.tfidf_matrix = self.vectorizer.fit_transform(self.corpus)

    def search(self, query: str, top_k: int = 10, threshold: float = 0.28) -> List[Tuple[Dict[str, Any], float]]:
        norm_query = normalize_text(query)
        if not norm_query:
            return []

        # Exact substring or alias matching check for ultra-fast precision
        exact_matches = []
        for r in self.records:
            name_en = normalize_text(r.get("food_name", ""))
            name_canon = normalize_text(r.get("canonical_food_name", ""))
            name_mr = normalize_text(r.get("name_mr", ""))
            name_hi = normalize_text(r.get("name_hi", ""))
            aliases = [normalize_text(a) for a in str(r.get("search_aliases", "")).split(";") if a]

            if norm_query == name_en or norm_query == name_canon or norm_query == name_mr or norm_query == name_hi:
                exact_matches.append((r, 1.0))
            elif norm_query in aliases:
                exact_matches.append((r, 0.98))
            elif norm_query in name_en.split() or norm_query in name_canon.split():
                exact_matches.append((r, 0.92))

        # Vectorized TF-IDF cosine similarity
        query_vec = self.vectorizer.transform([norm_query])
        sims = cosine_similarity(query_vec, self.tfidf_matrix).flatten()

        # Combine exact boosts with TF-IDF scores
        scored_records: Dict[str, Tuple[Dict[str, Any], float]] = {}
        for r, score in exact_matches:
            scored_records[r["food_id"]] = (r, score)

        top_indices = np.argsort(sims)[::-1][:top_k * 2]
        for idx in top_indices:
            score = float(sims[idx])
            rec = self.records[idx]
            fid = rec["food_id"]
            if score >= threshold:
                if fid not in scored_records or score > scored_records[fid][1]:
                    scored_records[fid] = (rec, score)

        # Sort by score descending
        results = sorted(scored_records.values(), key=lambda x: x[1], reverse=True)
        return results[:top_k]

food_matcher = FoodMatcher.get_instance()
