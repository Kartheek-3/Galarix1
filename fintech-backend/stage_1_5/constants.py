ENTITY_MAPPINGS = {
    "credit_card_activity": [
        "credit card", "card", "swipe", "merchant", "pos"
    ],

    "payroll": [
        "salary", "payroll", "employee", "wages", "payslip", "compensation"
    ],

    "saas_billing": [
        "subscription", "billing", "invoice", "plan", "pricing", "saas"
    ],

    "investment_statement": [
        "investment", "portfolio", "stock", "equity", "dividend", "returns"
    ],

    "insurance_claims": [
        "insurance", "claim", "claims", "policy", "coverage"
    ],

    "loans": [
        "loan", "loans", "emi", "interest", "repayment",
        "lending", "borrow", "debt"
    ]
}
# =====================================================
# GENERIC TERMS (IMPORTANT FOR VAGUE PROMPTS)
# =====================================================

GENERIC_TERMS = [
    "data", "dataset", "generate", "create", "show", "give", "make"
]
# =====================================================
# WEIGHTS & THRESHOLDS
# =====================================================

DOMAIN_TERM_WEIGHT = 0.3
GENERIC_TERM_WEIGHT = 0.1
CROSS_DOMAIN_PENALTY = 0.05
AMBIGUITY_GAP = 0.6
MAX_CONFIDENCE = 1.0
MIN_THRESHOLD = 0.2
# =====================================================
# RESOLUTION THRESHOLDS (FOR resolver.py)
# =====================================================

CONFIDENCE_THRESHOLD = 0.5
MULTI_ENTITY_THRESHOLD = 0.25


DEFAULT_FALLBACK_ENTITY = None
TIME_MODIFIERS = {
    "last month": "last_month",
    "monthly": "monthly",
    "weekly": "weekly",
    
    "daily": "daily"
}
SUPPORTED_ENTITIES = [
    "credit_card_activity",
    "payroll",
    "saas_billing",
    "investment_statement",
    "insurance_claims",
    "loans"
]