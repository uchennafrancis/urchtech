import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function streamClaude(
  systemPrompt: string,
  userMessage: string,
  onChunk: (text: string) => void,
  onDone: () => void,
  onError: (err: Error) => void
) {
  try {
    const stream = await client.messages.stream({
      model:      "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system:     systemPrompt,
      messages:   [{ role: "user", content: userMessage }],
    });
    for await (const chunk of stream) {
      if (chunk.type === "content_block_delta" && chunk.delta.type === "text_delta") {
        onChunk(chunk.delta.text);
      }
    }
    onDone();
  } catch (err) {
    onError(err instanceof Error ? err : new Error(String(err)));
  }
}

export const WILLOW_AI_SYSTEM = `You are Willow AI, Africa's premier real estate intelligence engine, built by Urchmond Management & Investment Company. You provide expert analysis of Nigerian real estate markets — Lagos, Abuja, Port Harcourt, Enugu, and beyond. You use Naira (₦) for all values, cite specific neighbourhoods, and give actionable, data-driven recommendations. Be precise, confident, and concise.`;

export const VALUATION_SYSTEM = `${WILLOW_AI_SYSTEM} When providing valuations, cover: 1) Estimated Market Value with confidence range 2) Rental yield and monthly income potential 3) 5-year value forecast (3 scenarios: bear/base/bull) 4) Top 3 value drivers 5) Investment verdict (Buy/Hold/Wait) 6) One key market insight specific to this location. Use ₦, be specific, under 350 words.`;

export const INVESTOR_AI_SYSTEM = `${WILLOW_AI_SYSTEM} You analyse real estate investment portfolios. Provide ROI optimisation advice, market timing signals, yield enhancement strategies, and risk-adjusted return analysis. Reference current Nigerian macro conditions. Under 400 words per analysis.`;
