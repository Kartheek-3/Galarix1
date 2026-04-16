import { model } from "../firebase";

export async function detectIntent(prompt) {
  try {
    const systemPrompt = `
You are a fintech intent classifier.

STRICT:
- Return ONLY JSON
- No explanation

Format:
{ "entities": [] }

Entities:
credit_card_activity, payroll, saas_billing,
investment_statement, insurance_claims, loans

Examples:
loan and insurance fraud → {"entities":["loans","insurance_claims"]}
credit card transactions → {"entities":["credit_card_activity"]}
salary and investment → {"entities":["payroll","investment_statement"]}

Prompt: ${prompt}
`;

    const result = await model.generateContent(systemPrompt);

    const text = result.response.text();

    console.log("🔥 RAW AI:", text);

    const match = text.match(/\{[\s\S]*\}/);

    if (!match) {
      console.error("❌ No JSON");
      return { entities: [] };
    }

    const parsed = JSON.parse(match[0]);

    // ✅ safety
    if (!parsed.entities || !Array.isArray(parsed.entities)) {
      return { entities: [] };
    }

    // ✅ remove duplicates
    const unique = [...new Set(parsed.entities)];

    console.log("✅ FINAL:", unique);

    return { entities: unique };

  } catch (err) {
    console.error("❌ AI ERROR:", err);
    return { entities: [] };
  }
}