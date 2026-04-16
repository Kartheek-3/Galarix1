from flask import Flask, request, jsonify, Response
from flask_cors import CORS
import json
import time
import datetime
import random
from typing import Dict, Any

from stage_1_5.semantic_router import semantic_route
from stage_1_5.resolution import resolve_intent

app = Flask(__name__)
CORS(app)

print("\n" + "="*70)
print("🚀 GALARIX ENGINE v13 (STREAM FIXED)")
print("="*70 + "\n")

# =====================================================
# DATA CONTRACTS
# =====================================================

CONTRACTS = {
    "credit_card_activity": {
        "meta": {"entity": "credit_card_activity"},
        "variables": {
            "transaction_date": {"type": "date"},
            "amount": {"type": "float"},
            "merchant": {"type": "string"},
            "category": {"type": "string"}
        }
    },
    "payroll": {
        "meta": {"entity": "payroll"},
        "variables": {
            "employee_id": {"type": "string"},
            "salary": {"type": "float"},
            "tax": {"type": "float"},
            "net_salary": {"type": "float"}
        }
    },
    "saas_billing": {
        "meta": {"entity": "saas_billing"},
        "variables": {
            "customer_id": {"type": "string"},
            "plan": {"type": "string"},
            "billing_cycle": {"type": "string"},
            "amount": {"type": "float"},
            "status": {"type": "string"}
        }
    },
    "investment_statement": {
        "meta": {"entity": "investment_statement"},
        "variables": {
            "asset": {"type": "string"},
            "investment_amount": {"type": "float"},
            "returns": {"type": "float"},
            "date": {"type": "date"}
        }
    },
    "insurance_claims": {
        "meta": {"entity": "insurance_claims"},
        "variables": {
            "claim_id": {"type": "string"},
            "claim_amount": {"type": "float"},
            "approved_amount": {"type": "float"},
            "status": {"type": "string"},
            "fraud_flag": {"type": "string"}
        }
    },
    "loans": {
        "meta": {"entity": "loans"},
        "variables": {
            "loan_id": {"type": "string"},
            "loan_amount": {"type": "float"},
            "interest_rate": {"type": "float"},
            "emi": {"type": "float"},
            "tenure": {"type": "int"}
        }
    }
}

# =====================================================
# VALUE GENERATOR
# =====================================================

def generate_value(meta):
    t = meta["type"]

    if t == "float":
        return round(random.uniform(100, 10000), 2)

    if t == "int":
        return random.randint(1, 60)

    if t == "string":
        return random.choice(["Active", "Pending", "Completed", "Failed"])

    if t == "date":
        return str(datetime.date.today() - datetime.timedelta(days=random.randint(1, 30)))

    return None

# =====================================================
# DATA GENERATION
# =====================================================

def generate_data(contract: Dict[str, Any], n=12):
    data = []
    for _ in range(n):
        row = {}
        for field, meta in contract["variables"].items():
            row[field] = generate_value(meta)
        data.append(row)
    return data

def merge_contracts(entities):
    merged = {"meta": {"entities": entities}, "variables": {}}
    for entity in entities:
        contract = CONTRACTS.get(entity, {})
        for field, meta in contract.get("variables", {}).items():
            merged["variables"][field] = meta
    return merged

def generate_merged_data(entities, n=12):
    merged_contract = merge_contracts(entities)
    data = []

    for _ in range(n):
        row = {}
        for field, meta in merged_contract["variables"].items():
            row[field] = generate_value(meta)
        data.append(row)

    return merged_contract, data

# =====================================================
# RESOLUTION
# =====================================================

def resolve_entities(prompt: str):
    semantic_output = semantic_route(prompt)
    resolved = resolve_intent(semantic_output)

    if resolved.get("entities"):
        return resolved["entities"], resolved.get("modifiers", {}), semantic_output

    if resolved.get("entity"):
        return [resolved["entity"]], resolved.get("modifiers", {}), semantic_output

    return ["credit_card_activity"], {}, semantic_output

# =====================================================
# STREAM ROUTE
# =====================================================

@app.route("/generate-stream", methods=["POST"])
def generate_stream_route():

    data = request.get_json()
    prompt = data.get("prompt", "")

    def generate():
        try:
            # 🔥 STEP 1 — THINKING
            yield f"data: {json.dumps({'stage': 'thinking'})}\n\n"
            time.sleep(0.3)

            # 🔥 STEP 2 — RESOLVE
            entities, modifiers, semantic_output = resolve_entities(prompt)

            yield f"data: {json.dumps({'stage': 'resolved'})}\n\n"

            # 🔥 STEP 3 — SEND AI TEXT
            yield f"data: {json.dumps({
                'text': f'Generating synthetic dataset for: {", ".join(entities)}...'
            })}\n\n"
            time.sleep(0.3)

            confidence_map = {
                i["entity"]: i.get("confidence", 0.5)
                for i in semantic_output.get("normalized_intents", [])
            }

            # =====================================================
            # MULTI ENTITY
            # =====================================================

            if len(entities) > 1:
                merged_contract, merged_data = generate_merged_data(entities)

                schema = {
                    field: meta["type"]
                    for field, meta in merged_contract["variables"].items()
                }

                results = [{
                    "entity": "merged_dataset",
                    "entities": entities,
                    "schema": schema,
                    "dataContract": merged_contract,
                    "data": merged_data,
                    "confidence": 1.0
                }]

            else:
                results = []

                for entity in entities:
                    if entity not in CONTRACTS:
                        continue

                    contract = CONTRACTS[entity]

                    schema = {
                        field: meta["type"]
                        for field, meta in contract["variables"].items()
                    }

                    data_rows = generate_data(contract, 12)

                    results.append({
                        "entity": entity,
                        "schema": schema,
                        "dataContract": contract,
                        "data": data_rows,
                        "confidence": round(confidence_map.get(entity, 0.5), 2)
                    })

                results = sorted(results, key=lambda x: x["confidence"], reverse=True)

            # 🔥 STEP 4 — SEND SCHEMA + DATA
            yield f"data: {json.dumps({
                'stage': 'schema',
                'results': results
            })}\n\n"

            time.sleep(0.2)

            # 🔥 STEP 5 — DONE
            yield f"data: {json.dumps({'stage': 'done'})}\n\n"

        except Exception as e:
            yield f"data: {json.dumps({
                'stage': 'error',
                'error': str(e)
            })}\n\n"

    return Response(
        generate(),
        mimetype="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
            "Access-Control-Allow-Origin": "*",
        },
    )

# =====================================================

@app.route("/")
def home():
    return jsonify({
        "status": "running",
        "engine": "Galarix v13 STREAM FIXED"
    })

# =====================================================

if __name__ == "__main__":
    app.run(debug=True, port=5000)