type BadgeVariant = "gold" | "green" | "red" | "muted" | "blue" | "amber";

const VARIANTS: Record<BadgeVariant, string> = {
  gold:  "bg-[rgba(201,168,76,0.15)] text-[#C9A84C]  border-[rgba(201,168,76,0.3)]",
  green: "bg-[rgba(61,186,120,0.12)] text-[#3DBA78]  border-[rgba(61,186,120,0.3)]",
  red:   "bg-[rgba(224,82,82,0.12)]  text-[#E05252]  border-[rgba(224,82,82,0.3)]",
  muted: "bg-[rgba(122,145,117,0.1)] text-[#7A9175]  border-[rgba(122,145,117,0.2)]",
  blue:  "bg-[rgba(130,71,229,0.12)] text-[#a970ff]  border-[rgba(130,71,229,0.3)]",
  amber: "bg-[rgba(251,191,36,0.1)]  text-[#fbbf24]  border-[rgba(251,191,36,0.3)]",
};

export function Badge({ children, variant = "muted" }: { children: React.ReactNode; variant?: BadgeVariant }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${VARIANTS[variant]}`}>
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, BadgeVariant> = {
    ACTIVE: "green", PAID: "green", CONFIRMED: "green", COMPLETE: "green", COMPLETED: "green",
    PENDING: "amber", IN_PROGRESS: "amber", RESERVED: "amber", WARM: "amber", VIEWING_BOOKED: "amber",
    OVERDUE: "red",   EXPIRED: "red",   TERMINATED: "red",  COLD: "red",
    NEW: "blue",      HOT: "gold",   SALES: "gold",  OFFER_MADE: "gold",
    NOTICE: "amber",  CONSTRUCTION: "blue", PLANNING: "muted",
    AVAILABLE: "green", SOLD: "red", MANAGEMENT: "muted",
    CONTRACT_SIGNED: "green", CLOSING: "gold",
  };
  return <Badge variant={map[status] || "muted"}>{status.replace(/_/g, " ")}</Badge>;
}
