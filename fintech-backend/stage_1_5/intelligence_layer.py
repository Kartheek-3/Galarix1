from rapidfuzz import process
import re

from stage_1_5.constants import ENTITY_MAPPINGS
from stage_1_5.synonym_engine import SYNONYMS


# =====================================================
# 🔤 TYPO CORRECTION (SAFE + FAST)
# =====================================================

def fuzzy_match(word, vocabulary):
    match = process.extractOne(word, vocabulary)
    return match[0] if match and match[1] > 80 else word


def correct_typos(prompt: str) -> str:
    words = prompt.lower().split()
    corrected = []

    all_terms = set()

    # collect all domain keywords
    for words_list in ENTITY_MAPPINGS.values():
        all_terms.update(words_list)

    # also include synonyms for better correction
    for syns in SYNONYMS.values():
        all_terms.update(syns)

    for word in words:
        corrected.append(fuzzy_match(word, all_terms))

    return " ".join(corrected)


# =====================================================
# 🧠 PHRASE INTELLIGENCE
# =====================================================

# =====================================================
# 🧠 PHRASE INTELLIGENCE
# =====================================================

PHRASE_MAP = {
    "credit card transactions": "credit_card_activity",
    "card payments": "credit_card_activity",

    "loan repayment": "loans",
    "loan emi": "loans",

    "insurance fraud": "insurance_claims",
    "insurance claims": "insurance_claims",

    "employee salary": "payroll",
    "salary data": "payroll",
    "employee compensation": "payroll",

    "investment portfolio": "investment_statement",

    "subscription billing": "saas_billing"
}

# 🔥 EXTENDED PHRASES (ADD HERE, NOT ABOVE)
PHRASE_MAP.update({
    "credit card spending": "credit_card_activity",
    "card expenses": "credit_card_activity",

    "loan payment": "loans",
    "emi payment": "loans",

    "salary payout": "payroll",
    "monthly payroll": "payroll",

    "investment returns": "investment_statement",

    "subscription payment": "saas_billing",
})

def detect_phrases(prompt: str):
    detected = []

    if not prompt:
        return detected

    for phrase, entity in PHRASE_MAP.items():
        if phrase in prompt:
            detected.append(entity)

    return detected


# =====================================================
# 🚀 CONTEXT BOOST (AI-GRADE)
# =====================================================

def context_boost(entity, prompt):
    prompt = prompt.lower()

    strong_context = {
        "credit_card_activity": ["card", "transaction", "transactions", "spending"],

        # 🔥 FIXED (merged properly)
        "loans": ["loan", "emi", "interest", "repayment", "lending"],

        "payroll": ["salary", "employee", "compensation"],

        "investment_statement": ["portfolio", "investment", "returns"],

        "insurance_claims": ["insurance", "claim", "fraud"],

        "saas_billing": ["subscription", "billing", "invoice"]
    }

    boost = 0.0

    for word in strong_context.get(entity, []):
        if re.search(rf"\b{word}\b", prompt):
            boost += 0.2

    return boost


# =====================================================
# 📊 CONFIDENCE (STRICT + SMART)
# =====================================================

def compute_confidence(entity, prompt):
    score = 0.0
    prompt_lower = prompt.lower()

    # 🔥 keyword strength
    for kw in ENTITY_MAPPINGS.get(entity, []):
        if re.search(rf"\b{kw}\b", prompt_lower):
            score += 0.5

    # 🔥 synonym strength (stronger now)
    for syn in SYNONYMS.get(entity, []):
        if re.search(rf"\b{syn}\b", prompt_lower):
            score += 0.5

    # 🔥 phrase strength (strongest)
    for phrase, ent in PHRASE_MAP.items():
        if ent == entity and phrase in prompt_lower:
            score += 0.7

    # 🔥 context boost
    score += context_boost(entity, prompt_lower)

    return min(score, 1.0)


# =====================================================
# 🧾 EXPLANATION ENGINE
# =====================================================

def explain_detection(entity, prompt):
    reasons = []
    prompt_lower = prompt.lower()

    for kw in ENTITY_MAPPINGS.get(entity, []):
        if re.search(rf"\b{kw}\b", prompt_lower):
            reasons.append(f"keyword: '{kw}'")

    for syn in SYNONYMS.get(entity, []):
        if re.search(rf"\b{syn}\b", prompt_lower):
            reasons.append(f"synonym: '{syn}'")

    for phrase, ent in PHRASE_MAP.items():
        if ent == entity and phrase in prompt_lower:
            reasons.append(f"phrase: '{phrase}'")

    return reasons if reasons else ["context inference"]


# =====================================================
# 🚀 DOMAIN BOOST (STRICT — NO FALSE POSITIVES)
# =====================================================

def apply_domain_boost(prompt: str, entities: list):
    prompt_lower = prompt.lower()

    if entities is None:
        entities = []

    boosted = list(entities)

    # 🔥 insurance → must be strong signal
    if "insurance" in prompt_lower and "claim" in prompt_lower:
        if "insurance_claims" not in boosted:
            boosted.append("insurance_claims")

    # 🔥 loans → include lending
    if any(word in prompt_lower for word in ["loan", "emi", "repayment", "lending"]):
        if "loans" not in boosted:
            boosted.append("loans")

    # 🔥 payroll → include compensation
    if any(word in prompt_lower for word in ["salary", "employee", "compensation"]):
        if "payroll" not in boosted:
            boosted.append("payroll")

    return list(set(boosted))