import { createFileRoute } from "@tanstack/react-router";
import { LineChart, Line, ResponsiveContainer, AreaChart, Area, Tooltip, XAxis } from "recharts";
import { GlassCard, SectionHeader, Bar, Pill } from "@/components/app/primitives";
import { ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/operations")({
  head: () => ({ meta: [{ title: "Operations Center · VoxelMed AI" }] }),
  component: Operations,
});

const trend = Array.from({ length: 24 }).map((_, i) => ({ x: `${i}h`, claims: 60 + Math.sin(i / 2) * 12 + i * 1.2, denials: 12 - Math.sin(i / 3) * 4 }));

const AUDIT = [
  { t: "08:14:22", who: "AI · Coding Agent", what: "Promoted R07.9 → I21.4 (conf 71%)", tone: "revenue" as const },
  { t: "08:13:51", who: "Dr. Chen", what: "Approved ASA 325mg PO order", tone: "success" as const },
  { t: "08:12:39", who: "AI · Claim Agent", what: "Validated medical necessity for CL-7741", tone: "success" as const },
  { t: "08:11:08", who: "EHR · Epic", what: "Patient John Doe synced", tone: "ai" as const },
  { t: "08:10:44", who: "AI · Risk Agent", what: "Cardiac event risk 58% → 84%", tone: "critical" as const },
  { t: "08:09:12", who: "RN J. Park", what: "Captured vitals BP 162/98, HR 104", tone: "muted" as const },
];

function Operations() {
  return (
    <div className="space-y-6">
      <SectionHeader eyebrow="Executive Oversight" title="Operations Center" subtitle="Governance, compliance, revenue cycle, and audit — at a glance" right={<Pill tone="success"><ShieldCheck className="h-3 w-3 mr-1" />HIPAA Compliant</Pill>} />

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {[
          { l: "AI Utilization", v: "94%", tone: "ai" },
          { l: "Coding Accuracy", v: "98.2%", tone: "revenue" },
          { l: "Doc Quality", v: "A+", tone: "clinical" },
          { l: "Revenue Recovered", v: "$2.4M", tone: "success" },
          { l: "Denials Prevented", v: "1,184", tone: "success" },
          { l: "Time Saved", v: "11.4 h/MD/wk", tone: "ai" },
          { l: "Productivity", v: "+38%", tone: "clinical" },
        ].map((k) => (
          <GlassCard key={k.l} className="!p-4">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">{k.l}</div>
            <div className="text-xl font-display font-bold" style={{ color: `var(--color-${k.tone})` }}>{k.v}</div>
          </GlassCard>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <GlassCard className="xl:col-span-2" glow="revenue">
          <div className="text-sm font-semibold mb-3">Revenue Cycle Trend (24h)</div>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.83 0.16 85)" stopOpacity={0.6} />
                    <stop offset="100%" stopColor="oklch(0.83 0.16 85)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.65 0.24 25)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="oklch(0.65 0.24 25)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="x" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "rgba(20,25,40,0.9)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12 }} />
                <Area type="monotone" dataKey="claims" stroke="oklch(0.83 0.16 85)" fill="url(#g1)" />
                <Area type="monotone" dataKey="denials" stroke="oklch(0.65 0.24 25)" fill="url(#g2)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
            {[
              { l: "Clean Claim Rate", v: 97.4, raw: undefined as string | undefined },
              { l: "First Pass Resolution", v: 91.2, raw: undefined as string | undefined },
              { l: "Days in AR", v: 24.3, raw: "24.3 d" as string | undefined },
              { l: "Denial Recovery", v: 86, raw: undefined as string | undefined },
            ].map((r) => (
              <div key={r.l}>
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">{r.l}</div>
                <div className="text-lg font-display font-bold text-[var(--color-revenue)]">{r.raw ?? `${r.v}%`}</div>
                <Bar value={Math.min(r.v, 100)} tone="revenue" />
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard glow="ai">
          <div className="text-sm font-semibold mb-3">Compliance</div>
          <div className="space-y-3">
            {[
              { l: "HIPAA Status", v: 100, t: "All controls in effect" },
              { l: "Security Score", v: 96, t: "SOC 2 Type II" },
              { l: "Audit Readiness", v: 92, t: "Quarterly review on track" },
              { l: "Encryption", v: 100, t: "AES-256 @ rest · TLS 1.3 in transit" },
              { l: "PHI Monitoring", v: 98, t: "0 unauthorized access in 90d" },
            ].map((c) => (
              <div key={c.l}>
                <div className="flex items-baseline justify-between text-sm mb-1">
                  <span>{c.l}</span>
                  <span className="font-mono text-[var(--color-success)]">{c.v}%</span>
                </div>
                <Bar value={c.v} tone="success" />
                <div className="text-[10px] text-muted-foreground mt-1">{c.t}</div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      <GlassCard>
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm font-semibold">Audit Timeline</div>
          <div className="h-[40px] w-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend}>
                <Line type="monotone" dataKey="claims" stroke="oklch(0.82 0.16 185)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="space-y-2">
          {AUDIT.map((a, i) => (
            <div key={i} className="flex items-center gap-3 rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2 text-sm">
              <span className="font-mono text-[11px] text-muted-foreground w-20">{a.t}</span>
              <Pill tone={a.tone}>{a.who}</Pill>
              <span className="flex-1 truncate">{a.what}</span>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}