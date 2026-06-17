import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, BookOpen, ShieldAlert, Stethoscope } from "lucide-react";
import { useEncounter } from "@/lib/encounter-store";
import { GlassCard, SectionHeader, Bar, Pill } from "@/components/app/primitives";

export const Route = createFileRoute("/clinical")({
  head: () => ({ meta: [{ title: "Clinical Intelligence · VoxelMed AI" }] }),
  component: Clinical,
});

const GUIDELINES = [
  { src: "AHA/ACC 2023", text: "Obtain hs-troponin at presentation and 1–3h", level: "A", cls: "I", year: 2023 },
  { src: "AHA 2024 NSTEMI", text: "Initiate ASA 162–325mg unless contraindicated", level: "A", cls: "I", year: 2024 },
  { src: "Hospital ED Protocol v4.2", text: "HEART score ≥7 → admit telemetry, cards consult", level: "B", cls: "IIa", year: 2025 },
  { src: "CDC", text: "Statin continuation reduces 30-day mortality", level: "A", cls: "I", year: 2022 },
];

const INTERACTIONS = [
  { sev: "critical", a: "Aspirin 325mg", b: "Active GI bleed?", note: "Confirm absence of melena/hematemesis" },
  { sev: "high", a: "Metformin", b: "IV contrast (CT)", note: "Hold 48h if contrast administered" },
  { sev: "medium", a: "Lisinopril", b: "Hypotension risk", note: "Monitor BP <100 systolic" },
  { sev: "low", a: "Atorvastatin", b: "Grapefruit juice", note: "Counsel patient" },
];

const GAPS = [
  { item: "HbA1c (T2DM)", overdue: "8 months", action: "Add to admission orders" },
  { item: "Colonoscopy screening", overdue: "Age 54 — eligible", action: "Schedule outpatient" },
  { item: "Influenza vaccine", overdue: "This season", action: "Offer pre-discharge" },
  { item: "Lipid panel", overdue: "14 months", action: "Bundle with admit labs" },
];

function Clinical() {
  const { diagnoses } = useEncounter();
  return (
    <div className="space-y-6">
      <SectionHeader eyebrow="Clinical Reasoning" title="Clinical Intelligence" subtitle="Differential diagnosis, evidence, safety, and care gaps — all explainable" />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <GlassCard className="xl:col-span-2" glow="clinical">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2"><Stethoscope className="h-4 w-4 text-[var(--color-clinical)]" />
              <div className="text-sm font-semibold">Differential Diagnosis Center</div>
            </div>
            <Pill tone="clinical">4 candidates · live</Pill>
          </div>
          <div className="space-y-4">
            {diagnoses.map((d, i) => (
              <div key={d.code} className={`rounded-xl p-4 border ${i === 0 ? "border-[var(--color-critical)]/40 bg-[var(--color-critical)]/5" : "border-white/5 bg-white/[0.02]"}`}>
                <div className="flex items-baseline justify-between mb-2">
                  <div>
                    <div className="font-display font-semibold text-base">{d.name}</div>
                    <div className="text-[11px] font-mono text-muted-foreground">{d.code} · rank #{i + 1}</div>
                  </div>
                  <div className="font-mono text-xl" style={{ color: i === 0 ? "var(--color-critical)" : "var(--color-clinical)" }}>{d.confidence}%</div>
                </div>
                <Bar value={d.confidence} tone={i === 0 ? "critical" : "clinical"} />
                <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <div className="uppercase tracking-wider text-muted-foreground mb-1">Supporting evidence</div>
                    <div className="flex flex-wrap gap-1">{d.evidence.map((e) => <Pill key={e} tone="muted">{e}</Pill>)}</div>
                  </div>
                  <div>
                    <div className="uppercase tracking-wider text-muted-foreground mb-1">Recommended workup</div>
                    <div className="flex flex-wrap gap-1">
                      {i === 0 ? ["hs-Troponin", "12-lead ECG", "CXR", "ECHO"].map((x) => <Pill key={x} tone="ai">{x}</Pill>)
                       : ["D-dimer", "CT-PA"].map((x) => <Pill key={x} tone="ai">{x}</Pill>)}
                    </div>
                  </div>
                </div>
                {i === 0 && (
                  <div className="mt-3 rounded-lg bg-white/[0.03] p-3 text-[11px] border border-white/5">
                    <div className="uppercase tracking-widest text-[10px] text-[var(--color-ai)] mb-1">Why this recommendation?</div>
                    Symptoms (crushing pain + jaw radiation) + risk factors (DM2, HTN, HLD, age 54M) + ECG findings (ST depression V4–V6) collectively yield Bayesian posterior of {d.confidence}% for ACS. Matches AHA 2024 NSTEMI presentation criteria (Class I, LoE A).
                  </div>
                )}
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center gap-2 mb-3"><BookOpen className="h-4 w-4 text-[var(--color-ai)]" /><div className="text-sm font-semibold">Guideline Intelligence</div></div>
          <div className="space-y-2">
            {GUIDELINES.map((g, i) => (
              <div key={i} className="rounded-lg border border-white/5 bg-white/[0.02] p-3 text-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] uppercase tracking-widest text-[var(--color-ai)]">{g.src}</span>
                  <div className="flex gap-1"><Pill tone="ai">Class {g.cls}</Pill><Pill tone="muted">LoE {g.level}</Pill><Pill tone="muted">{g.year}</Pill></div>
                </div>
                <div className="text-foreground/90">{g.text}</div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard glow="critical">
          <div className="flex items-center gap-2 mb-3"><ShieldAlert className="h-4 w-4 text-[var(--color-critical)]" /><div className="text-sm font-semibold">Medication Safety</div></div>
          <div className="space-y-2">
            {INTERACTIONS.map((x, i) => {
              const tone = x.sev === "critical" ? "critical" : x.sev === "high" ? "warning" : x.sev === "medium" ? "clinical" : "muted";
              return (
                <div key={i} className="flex items-center justify-between gap-3 rounded-lg border border-white/5 bg-white/[0.02] p-3 text-sm">
                  <div>
                    <div className="font-medium">{x.a} ⇋ {x.b}</div>
                    <div className="text-[11px] text-muted-foreground">{x.note}</div>
                  </div>
                  <Pill tone={tone as "critical" | "warning" | "clinical" | "muted"}>{x.sev}</Pill>
                </div>
              );
            })}
          </div>
        </GlassCard>

        <GlassCard glow="ai">
          <div className="flex items-center gap-2 mb-3"><AlertTriangle className="h-4 w-4 text-[var(--color-warning)]" /><div className="text-sm font-semibold">Care Gap Detection</div></div>
          <div className="space-y-2">
            {GAPS.map((g, i) => (
              <div key={i} className="flex items-center justify-between gap-3 rounded-lg border border-white/5 bg-white/[0.02] p-3 text-sm">
                <div>
                  <div className="font-medium">{g.item}</div>
                  <div className="text-[11px] text-muted-foreground">Overdue: {g.overdue}</div>
                </div>
                <button className="text-[11px] rounded bg-[var(--color-ai)]/15 text-[var(--color-ai)] px-2.5 py-1 hover:bg-[var(--color-ai)]/25">{g.action}</button>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}