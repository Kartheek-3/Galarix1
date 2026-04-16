from typing import Dict, Any, List

from stage_1_5.constants import (
    CONFIDENCE_THRESHOLD,
    DEFAULT_FALLBACK_ENTITY,
    SUPPORTED_ENTITIES
)

# =====================================================
# RESOLVER (CLEAN + ROBUST MULTI-ENTITY)
# =====================================================

def resolve_intent(semantic_output: Dict[str, Any]) -> Dict[str, Any]:
    """
    Converts semantic signals → final intent decision
    """

    intents = semantic_output.get("normalized_intents", [])
    modifiers = semantic_output.get("detected_modifiers", {})

    # =============================
    # 1. FILTER VALID ENTITIES
    # =============================
    valid_intents = [
        i for i in intents if i.get("entity") in SUPPORTED_ENTITIES
    ]

    # =============================
    # 2. SORT BY CONFIDENCE
    # =============================
    sorted_intents = sorted(
        valid_intents,
        key=lambda x: x.get("confidence", 0),
        reverse=True
    )

    print(f"\n[RESOLVER] Intents: {[(i['entity'], i.get('confidence', 0)) for i in sorted_intents]}")

    # =============================
    # 3. NO SIGNAL → HARD FALLBACK
    # =============================
    if not sorted_intents:
     return {
        "status": "no_detection",
        "entities": [],
        "confidence": 0.0,
        "modifiers": modifiers
    }

    top_intent = sorted_intents[0]

    # =============================
    # 4. MULTI-ENTITY DETECTION (FIXED)
    # =============================
    entities: List[str] = []

    if len(sorted_intents) >= 2:
        top_score = sorted_intents[0]["confidence"]

        # ✅ collect strong entities
        for intent in sorted_intents:
            score = intent["confidence"]

            if score >= 0.5:
                entities.append(intent["entity"])

        # ✅ ensure at least 2 if second is meaningful
        if len(entities) < 2:
            second = sorted_intents[1]

            if second["confidence"] >= 0.35:
                entities = [
                    sorted_intents[0]["entity"],
                    second["entity"]
                ]

        # ✅ final multi-entity decision
        if len(entities) >= 2:
            print("[RESOLVER] MULTI ENTITY:", entities)

            return {
                "status": "multi_entity_detected",
                "entities": entities,
                "confidence_profile": {
                    i["entity"]: i["confidence"] for i in sorted_intents
                },
                "explanation": f"Selected based on confidence. Top={top_score}, Entities={entities}",
                "confidence": top_score,
                "modifiers": modifiers
            }

    print("[RESOLVER] Only one entity → skipping multi-entity logic")

    # =============================
    # 5. SINGLE ENTITY (STRONG)
    # =============================
    if top_intent.get("confidence", 0) >= CONFIDENCE_THRESHOLD:
        print(f"[RESOLVER] SINGLE ENTITY: {top_intent['entity']}")

        return {
            "status": "resolved",
            "entity": top_intent["entity"],
            "confidence": top_intent.get("confidence", 0),
            "modifiers": modifiers
        }

    # =============================
    # 6. WEAK SIGNAL → SOFT FALLBACK
    # =============================
    print(f"[RESOLVER] WEAK SIGNAL → {top_intent['entity']}")

    return {
        "status": "fallback",
        "entity": top_intent["entity"],
        "reason": "weak_signal",
        "confidence": top_intent.get("confidence", 0),
        "modifiers": modifiers
    }