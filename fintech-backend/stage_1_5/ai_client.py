from typing import Dict, Any

# =====================================================
# LLM CLIENT (OPTIONAL - NOT USED IN MVP PIPELINE)
# =====================================================

USE_LLM = False  # keep disabled for now


def call_llm(prompt: str) -> Dict[str, Any]:
    """
    Optional LLM-based semantic enhancer (Stage 1.5 extension)

    NOTE:
    - Not used in current pipeline (semantic_router handles everything)
    - This is future-ready for advanced reasoning

    Returns:
    {
        "normalized_intents": [],
        "detected_modifiers": {},
        "raw_prompt": str
    }
    """

    if not USE_LLM:
        return {
            "normalized_intents": [],
            "detected_modifiers": {},
            "raw_prompt": prompt
        }

    # 🔥 FUTURE IMPLEMENTATION (LLM call)
    # Example:
    # response = openai.chat.completions.create(...)
    # parsed = json.loads(response)

    return {
        "normalized_intents": [],
        "detected_modifiers": {},
        "raw_prompt": prompt
    }