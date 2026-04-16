from typing import List, Dict, Any, TypedDict, Optional

# =====================================================
# SEMANTIC TYPES (STAGE 1.5)
# =====================================================

class IntentSignal(TypedDict):
    entity: str
    confidence: float
    fallback: Optional[bool]


class SemanticOutput(TypedDict):
    normalized_intents: List[IntentSignal]
    detected_modifiers: Dict[str, Any]
    raw_prompt: str
    is_multi_entity: bool


# =====================================================
# RESOLUTION TYPES (STAGE 1.5 → STAGE 1)
# =====================================================

class ResolutionResult(TypedDict):
    status: str  # 'resolved', 'multi_entity_detected', 'fallback'
    entity: Optional[str]
    entities: Optional[List[str]]
    modifiers: Dict[str, Any]
    confidence: float
    reason: Optional[str]
    confidence_profile: Optional[Dict[str, float]]  # 🔥 added


# =====================================================
# DISTRIBUTION TYPES (STAGE 2 READY)
# =====================================================

class Distribution(TypedDict, total=False):
    family: str
    params: Dict[str, Any]
    categories: List[Any]
    weights: List[float]
    base: str
    rate: float
    tiers: Dict[str, Any]


# =====================================================
# DEPENDENCY TYPES (ALIGNED WITH CONTRACTS)
# =====================================================

class ConditionalDependency(TypedDict):
    if_: Dict[str, Any]   # internal safe name
    then: Dict[str, Any]


class Correlation(TypedDict):
    between: List[str]
    strength: str


class DerivedField(TypedDict):
    target: str
    formula: str


class Dependencies(TypedDict, total=False):
    conditionals: List[Dict[str, Any]]  # keep flexible for now
    correlations: List[Correlation]
    derived: List[DerivedField]


# =====================================================
# CONSTRAINT TYPES
# =====================================================

class Constraint(TypedDict, total=False):
    min: float
    max: float


# =====================================================
# DATA CONTRACT (FULL ARCHITECTURE)
# =====================================================

class DataContract(TypedDict):
    meta: Dict[str, Any]
    variables: Dict[str, Dict[str, Any]]
    distributions: Dict[str, Distribution]
    dependencies: Dependencies
    constraints: Dict[str, Constraint]


# =====================================================
# FINAL OUTPUT PAYLOAD TYPE
# =====================================================

class FinalPayload(TypedDict):
    done: bool
    concept: str
    status: str
    schema: Dict[str, str]
    dataContract: DataContract
    active_entities: List[str]
    modifiers: Dict[str, Any]
    confidence: float
    transactions: List[Dict[str, Any]]
    meta: Dict[str, Any]