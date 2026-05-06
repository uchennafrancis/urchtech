"use client";

import { useState } from "react";
import { PublicNav } from "@/components/layout/PublicNav";
import { KpiCard } from "@/components/ui/KpiCard";

interface ValuationResult {
  estimate: string;
  low: string;
  high: string;
  rentalYield: string;
  capitalGrowth: string;
  confidenceScore: number;
  comparables: { address: string; price: string; sqm: number; date: string }[];
  factors: { label: string; impact: "positive" | "negative" | "neutral"; detail: string }[];
}

export default function ValuationPage() {
  const [form, setForm] = useState({ address: "", type: "APARTMENT", beds: "3", sqm: "", condition: "GOOD" });
  const [loading, setLoading]   = useState(false);
  const [result, setResult]     = useState<ValuationResult | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setApiError(null);
    try {
      const res  = await fetch("/api/valuation", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Valuation failed");
      setResult(data as ValuationResult);
    } catch (err) {
      setApiError(String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#060C07]">
      <PublicNav />

      <div className="max-w-4xl mx-auto px-6 py-12 space-y-8">
        <div className="space-y-2">
          <div className="inline-block bg-[rgba(201,168,76,0.1)] border border-[rgba(201,168,76,0.2)] px-3 py-1 rounded-full text-[#C9A84C] text-xs">
            Powered by Claude AI
          </div>
          <h1 className="font-playfair text-4xl text-[#EDE9E1]">AI Property Valuation</h1>
          <p className="text-[#7A9175]">Get an instant, data-driven valuation using comparable sales and market intelligence</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-[#111A12] border border-[rgba(201,168,76,0.12)] rounded-xl p-6 space-y-5">
          <div className="space-y-1.5">
            <label className="text-[#7A9175] text-sm">Property Address</label>
            <input
              type="text"
              value={form.address}
              onChange={e => setForm(p => ({ ...p, address: e.target.value }))}
              placeholder="e.g. 14 Admiralty Way, Lekki Phase 1, Lagos"
              className="w-full bg-[#0C1410] border border-[rgba(201,168,76,0.15)] rounded-lg px-4 py-3 text-[#EDE9E1] placeholder-[#7A9175] text-sm focus:outline-none focus:border-[#C9A84C] transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <label className="text-[#7A9175] text-sm">Type</label>
              <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
                className="w-full bg-[#0C1410] border border-[rgba(201,168,76,0.15)] rounded-lg px-3 py-3 text-[#EDE9E1] text-sm focus:outline-none focus:border-[#C9A84C] transition-colors">
                {["APARTMENT","VILLA","PENTHOUSE","TOWNHOUSE","DETACHED","SEMI-D","STUDIO"].map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[#7A9175] text-sm">Bedrooms</label>
              <select value={form.beds} onChange={e => setForm(p => ({ ...p, beds: e.target.value }))}
                className="w-full bg-[#0C1410] border border-[rgba(201,168,76,0.15)] rounded-lg px-3 py-3 text-[#EDE9E1] text-sm focus:outline-none focus:border-[#C9A84C] transition-colors">
                {["1","2","3","4","5","6+"].map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[#7A9175] text-sm">Size (sqm)</label>
              <input type="number" value={form.sqm} onChange={e => setForm(p => ({ ...p, sqm: e.target.value }))}
                placeholder="210"
                className="w-full bg-[#0C1410] border border-[rgba(201,168,76,0.15)] rounded-lg px-3 py-3 text-[#EDE9E1] placeholder-[#7A9175] text-sm focus:outline-none focus:border-[#C9A84C] transition-colors" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[#7A9175] text-sm">Condition</label>
              <select value={form.condition} onChange={e => setForm(p => ({ ...p, condition: e.target.value }))}
                className="w-full bg-[#0C1410] border border-[rgba(201,168,76,0.15)] rounded-lg px-3 py-3 text-[#EDE9E1] text-sm focus:outline-none focus:border-[#C9A84C] transition-colors">
                {["EXCELLENT","GOOD","FAIR","RENOVATION"].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <button type="submit" disabled={loading || !form.address}
            className="w-full bg-[#C9A84C] hover:bg-[#d4b560] disabled:opacity-50 disabled:cursor-not-allowed text-[#060C07] py-3 rounded-xl font-bold transition-colors">
            {loading ? "Analysing with Claude AI..." : "Get Instant Valuation"}
          </button>
        </form>

        {apiError && (
          <div className="bg-[rgba(224,82,82,0.1)] border border-[rgba(224,82,82,0.3)] rounded-xl p-4 text-[#E05252] text-sm">
            {apiError}
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Main estimate */}
            <div className="bg-[#111A12] border border-[rgba(201,168,76,0.25)] rounded-xl p-6 text-center space-y-2">
              <div className="text-[#7A9175] text-sm">Estimated Market Value</div>
              <div className="font-playfair text-6xl text-[#C9A84C] font-bold">{result.estimate}</div>
              <div className="text-[#7A9175] text-sm">Range: {result.low} – {result.high}</div>
              <div className="inline-flex items-center gap-1.5 bg-[rgba(61,186,120,0.1)] text-[#3DBA78] px-3 py-1 rounded-full text-sm">
                <span>✓</span> {result.confidenceScore}% Confidence Score
              </div>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-2 gap-4">
              <KpiCard label="Rental Yield"    value={result.rentalYield}    icon="💰" accent="green" />
              <KpiCard label="Capital Growth"  value={result.capitalGrowth}  icon="📈" accent="gold" />
            </div>

            {/* Factors */}
            <div className="bg-[#111A12] border border-[rgba(201,168,76,0.12)] rounded-xl p-5 space-y-3">
              <h3 className="font-playfair text-lg text-[#EDE9E1]">Valuation Factors</h3>
              {result.factors.map(f => (
                <div key={f.label} className="flex items-start gap-3 py-2 border-b border-[rgba(201,168,76,0.06)] last:border-0">
                  <span className={`mt-0.5 flex-shrink-0 ${f.impact === "positive" ? "text-[#3DBA78]" : f.impact === "negative" ? "text-[#E05252]" : "text-[#7A9175]"}`}>
                    {f.impact === "positive" ? "▲" : f.impact === "negative" ? "▼" : "●"}
                  </span>
                  <div>
                    <div className="text-[#EDE9E1] text-sm font-medium">{f.label}</div>
                    <div className="text-[#7A9175] text-xs">{f.detail}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Comparables */}
            <div className="bg-[#111A12] border border-[rgba(201,168,76,0.12)] rounded-xl p-5 space-y-3">
              <h3 className="font-playfair text-lg text-[#EDE9E1]">Recent Comparables</h3>
              <div className="space-y-2">
                {result.comparables.map((c, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-[rgba(201,168,76,0.06)] last:border-0">
                    <div>
                      <div className="text-[#EDE9E1] text-sm">{c.address}</div>
                      <div className="text-[#7A9175] text-xs">{c.sqm} sqm · {c.date}</div>
                    </div>
                    <span className="font-playfair text-[#C9A84C] font-bold">{c.price}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
