interface ProgressBarProps {
  value: number;
  max?: number;
  color?: "gold" | "green" | "red";
  label?: string;
  showPct?: boolean;
  height?: number;
}

export function ProgressBar({ value, max = 100, color = "gold", label, showPct = false, height = 6 }: ProgressBarProps) {
  const pct = Math.min((value / max) * 100, 100);
  const colors = { gold: "#C9A84C", green: "#3DBA78", red: "#E05252" };

  return (
    <div className="space-y-1">
      {(label || showPct) && (
        <div className="flex justify-between text-xs text-[#7A9175]">
          {label && <span>{label}</span>}
          {showPct && <span>{pct.toFixed(0)}%</span>}
        </div>
      )}
      <div className="bg-[rgba(255,255,255,0.06)] rounded-full overflow-hidden" style={{ height }}>
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: colors[color] }} />
      </div>
    </div>
  );
}
