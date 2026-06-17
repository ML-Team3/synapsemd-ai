import type { ReactNode } from "react";

export function GlassCard({
  children,
  className = "",
  glow,
}: {
  children: ReactNode;
  className?: string;
  glow?: "ai" | "clinical" | "revenue" | "critical";
}) {
  const glowMap: Record<string, string> = {
    ai: "shadow-[0_0_60px_-20px_var(--color-ai)]",
    clinical: "shadow-[0_0_60px_-20px_var(--color-clinical)]",
    revenue: "shadow-[0_0_60px_-20px_var(--color-revenue)]",
    critical: "shadow-[0_0_60px_-20px_var(--color-critical)]",
  };
  return (
    <div
      className={`glass rounded-2xl p-5 ${glow ? glowMap[glow] : ""} ${className}`}
    >
      {children}
    </div>
  );
}

export function SectionHeader({ eyebrow, title, subtitle, right }: { eyebrow?: string; title: string; subtitle?: string; right?: ReactNode }) {
  return (
    <div className="flex items-end justify-between mb-5 gap-4">
      <div>
        {eyebrow && <div className="text-[10px] uppercase tracking-[0.2em] text-[var(--color-ai)] mb-1">{eyebrow}</div>}
        <h1 className="text-2xl font-display font-bold tracking-tight">{title}</h1>
        {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
      </div>
      {right}
    </div>
  );
}

export function Bar({ value, tone = "ai" }: { value: number; tone?: "ai" | "clinical" | "revenue" | "success" | "warning" | "critical" }) {
  const c = `var(--color-${tone})`;
  return (
    <div className="h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${Math.min(100, Math.max(0, value))}%`, background: `linear-gradient(90deg, ${c}, color-mix(in oklab, ${c} 50%, white))` }} />
    </div>
  );
}

export function Pill({ children, tone = "ai" }: { children: ReactNode; tone?: "ai" | "clinical" | "revenue" | "success" | "warning" | "critical" | "muted" }) {
  const cls =
    tone === "muted"
      ? "bg-white/5 text-muted-foreground border-white/10"
      : `text-[var(--color-${tone})] border-[var(--color-${tone})]/30 bg-[var(--color-${tone})]/10`;
  return <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${cls}`}>{children}</span>;
}

export function StatusDot({ tone = "success" }: { tone?: "success" | "warning" | "critical" | "ai" | "clinical" }) {
  return (
    <span className="relative inline-flex h-2 w-2">
      <span className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-70`} style={{ background: `var(--color-${tone})` }} />
      <span className="relative inline-flex h-2 w-2 rounded-full" style={{ background: `var(--color-${tone})` }} />
    </span>
  );
}