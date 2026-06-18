import { createFileRoute } from "@tanstack/react-router";
import { Sparkles, Upload, CheckCircle2, Send } from "lucide-react";
import { useState } from "react";
import { GlassCard, SectionHeader, Bar, Pill, StatusDot } from "@/components/app/primitives";
import { useEncounter } from "@/lib/encounter-store";

export const Route = createFileRoute("/dermatology")({
  head: () => ({ meta: [{ title: "Dermatology AI · VoxelMed AI" }] }),
  component: DermatologyAI,
});

const LESIONS = [
  { id: "l1", region: "Left shoulder", type: "Pigmented", size: "8 × 6 mm", risk: 82 },
  { id: "l2", region: "Right forearm", type: "Seborrheic", size: "12 × 9 mm", risk: 14 },
  { id: "l3", region: "Upper back", type: "Pigmented, asymmetric", size: "10 × 7 mm", risk: 64 },
];

const DIFFERENTIAL = [
  { name: "Melanoma (suspicious)", code: "C43.62", conf: 71 },
  { name: "Atypical nevus", code: "D22.5", conf: 22 },
  { name: "Seborrheic keratosis", code: "L82.1", conf: 7 },
];

function DermatologyAI() {
  const { pushFeed } = useEncounter();
  const [active, setActive] = useState(LESIONS[0]);

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Specialty Intelligence"
        title="Dermatology AI"
        subtitle="Lesion intelligence — clinical photo, dermoscopy and risk stratification"
        right={<Pill tone="ai"><StatusDot tone="ai" /> <span className="ml-2">3 lesions analyzed</span></Pill>}
      />

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        <GlassCard className="xl:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-semibold">Lesions</div>
            <button className="text-[11px] inline-flex items-center gap-1 rounded-md bg-white/5 hover:bg-white/10 px-2 py-1"><Upload className="h-3 w-3" /> New photo</button>
          </div>
          <div className="space-y-2">
            {LESIONS.map((l) => (
              <button key={l.id} onClick={() => setActive(l)} className={`w-full text-left rounded-xl border p-3 transition-all ${
                active.id === l.id ? "border-[var(--color-ai)]/40 bg-[var(--color-ai)]/10" : "border-white/5 bg-white/[0.02] hover:bg-white/[0.05]"
              }`}>
                <div className="flex items-center justify-between mb-1">
                  <div className="text-sm font-medium">{l.region}</div>
                  <Pill tone={l.risk > 70 ? "critical" : l.risk > 40 ? "warning" : "success"}>{l.risk > 70 ? "High risk" : l.risk > 40 ? "Moderate" : "Low risk"}</Pill>
                </div>
                <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>{l.type} · {l.size}</span>
                  <span className="font-mono">Risk {l.risk}%</span>
                </div>
              </button>
            ))}
          </div>

          <div className="mt-4 rounded-xl border border-white/5 bg-white/[0.02] p-3">
            <div className="text-[11px] uppercase tracking-widest text-muted-foreground mb-2">Similar case match</div>
            <div className="grid grid-cols-3 gap-2">
              {["oklch(0.45 0.06 30)", "oklch(0.38 0.05 25)", "oklch(0.5 0.07 35)"].map((c, i) => (
                <div key={i} className="aspect-square rounded-md border border-white/10" style={{ background: `radial-gradient(circle at 40% 40%, ${c}, oklch(0.15 0.02 250))` }} />
              ))}
            </div>
            <div className="mt-2 text-[11px] text-muted-foreground">Top 3 of 12,418 cases · cosine 0.91</div>
          </div>
        </GlassCard>

        <GlassCard className="xl:col-span-3" glow="ai">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-[var(--color-ai)]" /><div className="text-sm font-semibold">{active.region} · {active.type}</div></div>
            <Pill tone={active.risk > 70 ? "critical" : "warning"}>Melanoma risk {active.risk}%</Pill>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Mock dermoscopy view */}
            <div className="relative rounded-xl overflow-hidden border border-white/10" style={{ aspectRatio: "1/1", background: "radial-gradient(circle at 45% 45%, oklch(0.38 0.06 35) 0%, oklch(0.22 0.04 30) 55%, oklch(0.10 0.02 260) 100%)" }}>
              <svg viewBox="0 0 200 200" className="absolute inset-0 h-full w-full">
                <ellipse cx="100" cy="100" rx="46" ry="38" fill="oklch(0.22 0.04 30)" stroke="oklch(0.78 0.18 25)" strokeWidth="1.5" strokeDasharray="4 3" />
                <circle cx="84" cy="92" r="8" fill="oklch(0.15 0.02 260)" />
                <circle cx="118" cy="108" r="6" fill="oklch(0.15 0.02 260)" />
                <text x="150" y="70" fill="oklch(0.78 0.18 25)" fontSize="8" fontFamily="monospace">ABCDE: 4/5</text>
              </svg>
              <div className="absolute top-2 left-2 text-[10px] font-mono text-white/70">DERMOSCOPY · 20x</div>
            </div>

            <div>
              <div className="text-[11px] uppercase tracking-widest text-muted-foreground mb-2">ABCDE Analysis</div>
              <div className="space-y-2">
                {[
                  { k: "Asymmetry", v: 78 },
                  { k: "Border irregularity", v: 81 },
                  { k: "Color variation", v: 73 },
                  { k: "Diameter > 6mm", v: 100 },
                  { k: "Evolution (vs prior)", v: 64 },
                ].map((a) => (
                  <div key={a.k}>
                    <div className="flex items-baseline justify-between mb-1 text-sm"><span>{a.k}</span><span className="font-mono text-[11px]" style={{ color: a.v > 70 ? "var(--color-critical)" : "var(--color-warning)" }}>{a.v}%</span></div>
                    <Bar value={a.v} tone={a.v > 70 ? "critical" : "warning"} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <div className="text-[11px] uppercase tracking-widest text-muted-foreground mb-2">Differential</div>
              <div className="space-y-2">
                {DIFFERENTIAL.map((d) => (
                  <div key={d.code}>
                    <div className="flex items-baseline justify-between mb-1 text-sm"><span>{d.name} <span className="text-xs text-muted-foreground">({d.code})</span></span><span className="font-mono text-[11px]" style={{ color: d.conf > 50 ? "var(--color-critical)" : "var(--color-muted-foreground)" }}>{d.conf}%</span></div>
                    <Bar value={d.conf} tone={d.conf > 50 ? "critical" : "clinical"} />
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-widest text-muted-foreground mb-2">Treatment Plan</div>
              <ul className="text-sm text-foreground/90 leading-relaxed list-disc pl-5 space-y-1">
                <li>Excisional biopsy with 2 mm margin</li>
                <li>Send to dermatopathology (rule out melanoma)</li>
                <li>Full-body skin exam at 4 weeks</li>
                <li>Photo-document remaining nevi</li>
              </ul>
              <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
                <Pill tone="revenue">CPT 11102 · biopsy</Pill>
                <Pill tone="revenue">CPT 88305 · path</Pill>
                <Pill tone="clinical">ICD D48.5</Pill>
              </div>
            </div>
          </div>

          <div className="mt-5 flex items-center gap-2">
            <button onClick={() => pushFeed({ agent: "Dermatology", text: `Biopsy ordered for ${active.region}`, tone: "warning" })} className="text-xs rounded-md bg-[var(--color-ai)] text-[var(--color-background)] px-3 py-1.5 font-semibold inline-flex items-center gap-1.5 hover:opacity-90"><Send className="h-3 w-3" /> Order biopsy &amp; document</button>
            <button className="text-xs rounded-md bg-white/5 hover:bg-white/10 px-3 py-1.5 inline-flex items-center gap-1.5"><CheckCircle2 className="h-3 w-3" /> Schedule follow-up</button>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}