import { createFileRoute } from "@tanstack/react-router";
import { Coins, ShieldCheck, TrendingUp } from "lucide-react";
import { useEncounter } from "@/lib/encounter-store";
import { GlassCard, SectionHeader, Bar, Pill } from "@/components/app/primitives";

export const Route = createFileRoute("/revenue")({
  head: () => ({ meta: [{ title: "Revenue Intelligence · SynapseMD AI" }] }),
  component: Revenue,
});

const PAYERS = [
  { name: "Medicare", denial: 6, reasons: ["Insufficient documentation of HPI", "Missing E/M time"], fix: "Append time-based note ≥40min" },
  { name: "BCBS", denial: 11, reasons: ["Modifier 25 missing", "LCD L34568 not met"], fix: "Add modifier 25, link LCD references" },
  { name: "Aetna", denial: 9, reasons: ["Prior auth for CT-PA"], fix: "Submit auth #AET-7741 (auto-prefilled)" },
  { name: "UnitedHealthcare", denial: 14, reasons: ["NCD review for hs-troponin freq.", "Bundled diagnostic"], fix: "Unbundle 93010, justify medical necessity" },
];

function Revenue() {
  const { coding, claimReadiness } = useEncounter();
  const totalRvu = coding.reduce((a, b) => a + b.rvu, 0);
  return (
    <div className="space-y-6">
      <SectionHeader eyebrow="Coding & Reimbursement" title="Revenue Intelligence" subtitle="From clinical truth to clean claim — automatically" right={<Pill tone="revenue"><Coins className="h-3 w-3 mr-1" /> $1,284 projected</Pill>} />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <GlassCard className="xl:col-span-2" glow="revenue">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm font-semibold">Coding Intelligence</div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">Total RVU <span className="font-mono text-[var(--color-revenue)]">{totalRvu.toFixed(2)}</span></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {coding.map((c) => (
              <div key={c.code} className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
                <div className="flex items-baseline justify-between mb-1">
                  <div>
                    <div className="font-mono text-sm text-[var(--color-revenue)]">{c.code}</div>
                    <div className="text-xs">{c.name}</div>
                  </div>
                  <Pill tone="muted">{c.type}</Pill>
                </div>
                <div className="flex items-center justify-between text-[11px] mt-2 mb-1 text-muted-foreground">
                  <span>Confidence</span><span className="font-mono text-foreground">{c.confidence}%</span>
                </div>
                <Bar value={c.confidence} tone="revenue" />
                {c.rvu > 0 && <div className="mt-2 text-[11px] text-muted-foreground">RVU <span className="text-foreground font-mono">{c.rvu.toFixed(2)}</span> · revenue impact <span className="text-[var(--color-success)]">+$324</span></div>}
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-xl border border-[var(--color-revenue)]/20 bg-[var(--color-revenue)]/5 p-4">
            <div className="text-[10px] uppercase tracking-widest text-[var(--color-revenue)] mb-2">Live Coding Evolution</div>
            <div className="flex items-center gap-3 text-sm font-mono">
              <span className="line-through text-muted-foreground">R07.9 Chest Pain (52%)</span>
              <TrendingUp className="h-4 w-4 text-[var(--color-revenue)]" />
              <span className="text-[var(--color-revenue)]">I21.4 NSTEMI (71% ↑)</span>
            </div>
            <div className="text-[11px] text-muted-foreground mt-2">Promoted as ECG ST-depression evidence and jaw radiation symptom were ingested.</div>
          </div>
        </GlassCard>

        <GlassCard glow="revenue">
          <div className="flex items-center gap-2 mb-3"><ShieldCheck className="h-4 w-4 text-[var(--color-success)]" /><div className="text-sm font-semibold">Claim Intelligence</div></div>
          <div className="text-xs text-muted-foreground">Claim Readiness Score</div>
          <div className="text-4xl font-display font-bold text-[var(--color-revenue)] mb-2">{claimReadiness}%</div>
          <Bar value={claimReadiness} tone="revenue" />
          <div className="mt-4 space-y-2 text-xs">
            {[
              { l: "Medical Necessity", ok: true },
              { l: "Modifier Validation", ok: true },
              { l: "LCD/NCD Validation", ok: claimReadiness > 75 },
              { l: "Provider signature", ok: false },
            ].map((r) => (
              <div key={r.l} className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2">
                <span>{r.l}</span>
                <Pill tone={r.ok ? "success" : "warning"}>{r.ok ? "Validated" : "Pending"}</Pill>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-lg bg-[var(--color-critical)]/10 border border-[var(--color-critical)]/30 p-3 text-[11px]">
            <div className="text-[var(--color-critical)] font-semibold mb-1">Denial Risk: 12%</div>
            Most common: signature timing, modifier 25 omission, NCD freq for troponin.
          </div>
        </GlassCard>
      </div>

      <GlassCard>
        <div className="text-sm font-semibold mb-3">Payer Intelligence</div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
          {PAYERS.map((p) => (
            <div key={p.name} className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="font-semibold text-sm">{p.name}</div>
                <Pill tone={p.denial > 10 ? "critical" : p.denial > 8 ? "warning" : "success"}>{p.denial}% denial</Pill>
              </div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Common rejections</div>
              <ul className="text-[11px] text-foreground/80 list-disc list-inside space-y-0.5 mb-2">{p.reasons.map((r) => <li key={r}>{r}</li>)}</ul>
              <div className="rounded-lg bg-[var(--color-ai)]/10 border border-[var(--color-ai)]/20 p-2 text-[11px] text-[var(--color-ai)]"><span className="font-semibold">Auto-fix:</span> {p.fix}</div>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}