interface KpiCardProps {
  label: string;
  value: string;
  sub?: string;
  delta?: string;
  deltaPositive?: boolean;
  icon?: string;
  accent?: "gold" | "green" | "red";
}

export function KpiCard({ label, value, sub, delta, deltaPositive, icon, accent = "gold" }: KpiCardProps) {
  const accentColor = accent === "gold" ? "#C9A84C" : accent === "green" ? "#3DBA78" : "#E05252";

  return (
    <div className="bg-[#111A12] border border-[rgba(201,168,76,0.12)] rounded-xl p-5 space-y-2">
      <div className="flex items-start justify-between">
        <span className="text-[#7A9175] text-xs uppercase tracking-wider">{label}</span>
        {icon && <span className="text-xl">{icon}</span>}
      </div>
      <div className="font-playfair text-3xl font-bold" style={{ color: accentColor }}>{value}</div>
      {sub && <div className="text-[#7A9175] text-xs">{sub}</div>}
      {delta && (
        <div className={`text-xs font-medium ${deltaPositive ? "text-[#3DBA78]" : "text-[#E05252]"}`}>
          {deltaPositive ? "▲" : "▼"} {delta}
        </div>
      )}
    </div>
  );
}
