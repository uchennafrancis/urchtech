export function fmtNaira(kobo: number | bigint, compact = false): string {
  const n = typeof kobo === "bigint" ? Number(kobo) : kobo;
  if (compact) {
    if (n >= 1_000_000_000) return `₦${(n / 1_000_000_000).toFixed(1)}B`;
    if (n >= 1_000_000)     return `₦${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000)         return `₦${(n / 1_000).toFixed(0)}K`;
  }
  return `₦${n.toLocaleString("en-NG")}`;
}

export function fmtUSD(naira: number | bigint, rate = 1500): string {
  const n = typeof naira === "bigint" ? Number(naira) : naira;
  const usd = n / rate;
  if (usd >= 1_000_000) return `$${(usd / 1_000_000).toFixed(1)}M`;
  if (usd >= 1_000)     return `$${(usd / 1_000).toFixed(0)}K`;
  return `$${usd.toFixed(0)}`;
}

export function fmtPct(v: number, decimals = 1): string {
  return `${v.toFixed(decimals)}%`;
}

export function fmtDate(d: Date | string): string {
  return new Date(d).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });
}

export function daysUntil(d: Date | string): number {
  return Math.ceil((new Date(d).getTime() - Date.now()) / 86400000);
}

export function daysAgo(d: Date | string): number {
  return Math.floor((Date.now() - new Date(d).getTime()) / 86400000);
}
