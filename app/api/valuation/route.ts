import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM = `You are a Nigerian real estate valuation expert with deep knowledge of Lagos, Abuja, Port Harcourt and other major cities. You provide data-driven property valuations in Nigerian Naira (₦).

Always respond with valid JSON matching this exact shape:
{
  "estimate": "₦NNNm",
  "low": "₦NNNm",
  "high": "₦NNNm",
  "rentalYield": "N.N%",
  "capitalGrowth": "+N.N% YoY",
  "confidenceScore": 0-100,
  "comparables": [
    { "address": "string", "price": "₦NNNm", "sqm": number, "date": "Mon YYYY" }
  ],
  "factors": [
    { "label": "string", "impact": "positive"|"negative"|"neutral", "detail": "string" }
  ]
}

Use realistic Nigerian property market values. Comparables should reference real neighbourhoods. Provide 3 comparables and 4 factors.`;

export async function POST(req: NextRequest) {
  try {
    const { address, type, beds, sqm, condition } = await req.json();

    if (!address) {
      return NextResponse.json({ error: "Address is required" }, { status: 400 });
    }

    const userMessage = `Provide a valuation for this Nigerian property:
- Address: ${address}
- Type: ${type || "APARTMENT"}
- Bedrooms: ${beds || "3"}
- Size: ${sqm ? sqm + " sqm" : "not specified"}
- Condition: ${condition || "GOOD"}

Respond only with the JSON object, no other text.`;

    const message = await client.messages.create({
      model:      "claude-sonnet-4-6",
      max_tokens: 1024,
      system:     SYSTEM,
      messages:   [{ role: "user", content: userMessage }],
    });

    const raw = message.content[0].type === "text" ? message.content[0].text : "";

    // Extract JSON from Claude's response (may be wrapped in ```json blocks)
    const jsonMatch = raw.match(/```json\s*([\s\S]*?)```/) || raw.match(/(\{[\s\S]*\})/);
    const jsonStr   = jsonMatch ? jsonMatch[1] : raw;
    const result    = JSON.parse(jsonStr.trim());

    return NextResponse.json(result);
  } catch (err) {
    console.error("[valuation]", err);
    return NextResponse.json({ error: "Valuation failed: " + String(err) }, { status: 500 });
  }
}
