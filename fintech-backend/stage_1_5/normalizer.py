from typing import Dict, Any, List
import re

# ✅ FIXED IMPORT PATH
from stage_1_5.constants import (
    ENTITY_MAPPINGS,
    GENERIC_TERMS,
    DOMAIN_TERM_WEIGHT,
    GENERIC_TERM_WEIGHT,
    CROSS_DOMAIN_PENALTY,
    MAX_CONFIDENCE,
    MIN_THRESHOLD,
    DEFAULT_FALLBACK_ENTITY,
    TIME_MODIFIERS
)

# =====================================================
# NORMALIZER (HYBRID-AWARE VERSION)
# =====================================================

def normalize_prompt(prompt: str) -> Dict[str, Any]:
    """
    Semantic Gravity Engine (Stage 1.5)

    Supports:
    - messy prompts
    - vague language
    - hybrid fusion with embeddings
    """

    # =============================
    # 1. CLEAN INPUT
    # =============================
    raw_input = prompt.lower().strip()

    prompt_clean = re.sub(
        r"(give me|show me|i want|generate|can u make|some|stuff)",
        "",
        raw_input
    )
    prompt_clean = re.sub(r"[^a-z0-9\s]", " ", prompt_clean)
    prompt_clean = re.sub(r"\s+", " ", prompt_clean).strip()

    normalized_intents: List[Dict[str, Any]] = []
    detected_modifiers: Dict[str, Any] = {}

    # =============================
    # 2. DOMAIN SCORING
    # =============================
    for entity, keywords in ENTITY_MAPPINGS.items():

        confidence = 0.0

        # 🔥 High-signal matches
        matched_domain_terms = [
        kw for kw in keywords
        if kw in prompt_clean
]
        confidence += len(matched_domain_terms) * DOMAIN_TERM_WEIGHT

        # 🔥 IMPORTANT FIX → allow generic-only prompts
        if confidence > 0 or any(t in prompt_clean for t in GENERIC_TERMS):

            matched_generic = [
                t for t in GENERIC_TERMS if t in prompt_clean
            ]
            confidence += len(matched_generic) * GENERIC_TERM_WEIGHT

            # Cross-domain penalty
            for other_entity, other_terms in ENTITY_MAPPINGS.items():
                if other_entity != entity:
                    if any(t in prompt_clean for t in other_terms):
                        confidence -= CROSS_DOMAIN_PENALTY

        # Clamp
        confidence = max(0.0, min(confidence, MAX_CONFIDENCE))

        if confidence >= MIN_THRESHOLD:
            normalized_intents.append({
                "entity": entity,
                "confidence": round(confidence, 2)
            })

    # =============================
    # 3. MODIFIER EXTRACTION
    # =============================
    for key, val in TIME_MODIFIERS.items():
        if key in prompt_clean:
            if "last" in key:
                detected_modifiers["time_range"] = val
            else:
                detected_modifiers["frequency"] = val

    # =============================
    # 4. FALLBACK (STRONGER)
    # =============================
    if not normalized_intents:
        normalized_intents.append({
            "entity": DEFAULT_FALLBACK_ENTITY,
            "confidence": 0.3,   # 🔥 increased for fusion
            "fallback": True
        })

    # =============================
    # 5. SORT
    # =============================
    normalized_intents = sorted(
        normalized_intents,
        key=lambda x: x["confidence"],
        reverse=True
    )

    return {
        "normalized_intents": normalized_intents,
        "detected_modifiers": detected_modifiers,
        "raw_prompt": raw_input,
        "is_multi_entity": len(normalized_intents) > 1
    }