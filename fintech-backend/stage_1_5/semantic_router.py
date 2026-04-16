from typing import Dict, Any
import re
import numpy as np

from stage_1_5.constants import ENTITY_MAPPINGS
from stage_1_5.memory_engine import recall_pattern, store_user_pattern
from stage_1_5.ml_classifier import predict_entity
from stage_1_5.synonym_engine import SYNONYMS
from stage_1_5.intelligence_layer import (
    correct_typos,
    detect_phrases,
    explain_detection,
    context_boost
)

from stage_1_5.embedding_service import get_embedding

# =====================================================
# DOMAIN EMBEDDINGS
# =====================================================

DOMAIN_DESCRIPTIONS = {
    "credit_card_activity": "credit card transactions spending purchases payments",
    "payroll": "salary employee payroll wages compensation income",
    "saas_billing": "subscription billing invoices SaaS plans payments",
    "investment_statement": "investment portfolio returns stocks trading assets",
    "insurance_claims": "insurance claims fraud policy coverage",
    "loans": "loan EMI interest repayment debt lending"
}

DOMAIN_EMBEDDINGS = {
    entity: get_embedding(desc)
    for entity, desc in DOMAIN_DESCRIPTIONS.items()
}

# =====================================================
# COSINE SIMILARITY
# =====================================================

def cosine_sim(a, b):
    return float(np.dot(a, b))

# =====================================================
# EMBEDDING DETECTION
# =====================================================

def embedding_detect(prompt: str):
    emb = get_embedding(prompt)

    scores = {}
    for entity, domain_emb in DOMAIN_EMBEDDINGS.items():
        scores[entity] = cosine_sim(emb, domain_emb)

    return sorted(scores.items(), key=lambda x: x[1], reverse=True)

# =====================================================
# 🔥 KEYWORD EXTRACTION (NEW)
# =====================================================

def extract_keywords(prompt: str):
    words = re.findall(r'\b[a-z]+\b', prompt.lower())

    stopwords = {
        "show", "generate", "create", "give", "make",
        "data", "dataset", "some", "together",
        "with", "and", "for", "the", "a", "of"
    }

    return [w for w in words if w not in stopwords]

# =====================================================
# 🔥 KEYWORD → ENTITY MAPPING
# =====================================================

def map_keywords_to_entities(keywords):
    entity_hits = {}

    for entity, terms in ENTITY_MAPPINGS.items():
        count = sum(1 for kw in keywords if kw in terms)

        if count > 0:
            entity_hits[entity] = count

    return entity_hits

# =====================================================
# 🚀 MAIN ROUTER (FINAL FIXED)
# =====================================================

def semantic_route(prompt: str) -> Dict[str, Any]:

    print("\n[🧠 FINAL ROUTER v17 — WORKING]")

    # ================= CLEAN =================
    prompt = correct_typos(prompt)
    prompt_lower = prompt.lower()

    print("[PROMPT]:", prompt)

    # =====================================================
    # STEP 1 — EMBEDDINGS FIRST (PRIMARY SIGNAL)
    # =====================================================
    emb_scores = embedding_detect(prompt)

    print("[EMBEDDINGS]:", emb_scores[:3])

    # pick top strong entities
    embedding_entities = [e for e, s in emb_scores if s > 0.45]

    # =====================================================
    # STEP 2 — KEYWORD SUPPORT
    # =====================================================
    keywords = re.findall(r'\b[a-z]+\b', prompt_lower)

    keyword_entities = []
    for entity, terms in ENTITY_MAPPINGS.items():
        if any(term in keywords for term in terms):
            keyword_entities.append(entity)

    print("[KEYWORD ENTITIES]:", keyword_entities)

    # =====================================================
    # STEP 3 — FUSION (CRITICAL)
    # =====================================================
    final_entities = list(set(embedding_entities + keyword_entities))

    # =====================================================
    # STEP 4 — CLEAN FALSE POSITIVES
    # =====================================================
    def is_valid(entity):
        if entity == "loans":
            return any(w in prompt_lower for w in ["loan", "emi", "repayment"])
        if entity == "insurance_claims":
            return any(w in prompt_lower for w in ["insurance", "claim"])
        return True

    final_entities = [e for e in final_entities if is_valid(e)]

    # =====================================================
    # STEP 5 — DOMINANCE CONTROL
    # =====================================================
    if len(final_entities) >= 2:
        top_entity = emb_scores[0][0]

        # if one entity clearly strongest → single
        if emb_scores[0][1] > 0.65 and (emb_scores[0][1] - emb_scores[1][1]) > 0.2:
            final_entities = [top_entity]

    # =====================================================
    # STEP 6 — FALLBACK
    # =====================================================
    if not final_entities:
        ml = predict_entity(prompt)
        if ml:
            final_entities = [ml]

    print("[FINAL ENTITIES]:", final_entities)

    # =====================================================
    # OUTPUT
    # =====================================================
    results = []

    for entity in final_entities:
        confidence = next((s for e, s in emb_scores if e == entity), 0.5)

        results.append({
            "entity": entity,
            "confidence": round(confidence, 2),
            "reasons": explain_detection(entity, prompt_lower)
        })

    store_user_pattern(prompt, [r["entity"] for r in results])

    return {
        "normalized_intents": results,
        "detected_modifiers": {},
        "raw_prompt": prompt,
        "is_multi_entity": len(results) > 1
    }