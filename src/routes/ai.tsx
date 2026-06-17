import { createFileRoute } from "@tanstack/react-router";
import { Brain, ShieldCheck } from "lucide-react";
import { GlassCard, SectionHeader, Bar, Pill } from "@/components/app/primitives";

export const Route = createFileRoute("/ai")({
  head: () => ({ meta: [{ title: "AI Intelligence Center · VoxelMed AI" }] }),
  component: AIIntel,
});

const FLOW = ["Transcript", "Diagnosis", "Risk", "Guidelines", "Orders", "Coding", "Claim", "EHR Export"];

const NODES = [
  { label: "Chest pain", type: "Symptom" },
  { label: "Jaw radiation", type: "Symptom" },
  { label: "ST depression V4-V6", type: "ECG" },
  { label: "Troponin pending", type: "Lab" },
  { label: "ACS / NSTEMI", type: "Diagnosis" },
  { label: "AHA 2024 NSTEMI", type: "Guideline" },
  { label: "ASA 325mg", type: "Order" },
  { label: "I21.4", type: "Code" },
  { label: "Claim CL-7741", type: "Claim" },
];

const VALIDATIONS = [
  { l: "Hallucination Detection", v: 99, note: "0 unsupported claims in note" },
  { l: "Guideline Compliance", v: 96, note: "Matches AHA 2024 NSTEMI" },
  { l: "Coding Validation", v: 91, note: "I21.4 supported by ECG + symptoms" },
  { l: "Medication Validation", v: 100, note: "No allergy/interaction breaches" },
  { l: "Clinical Validation", v: 94, note: "HEART score reproducible" },
];

function AIIntel() {
  const cx = 300, cy = 160;
  const positions = NODES.map((_, i) => {
    const angle = (i / NODES.length) * Math.PI * 2 - Math.PI / 2;
    return { x: cx + Math.cos(angle) * 130, y: cy + Math.sin(angle) * 110 };
  });
  return (
    <div className="space-y-6">
      <SectionHeader eyebrow="Transparency & Orchestration" title="AI Intelligence Center" subtitle="See exactly how the model reasoned, what it touched, and what it validated" right={<Pill tone="ai"><Brain className="h-3 w-3 mr-1" /> Explainability ON</Pill>} />

      <GlassCard glow="ai">
        <div className="text-sm font-semibold mb-4">AI Workflow Visualization</div>
        <div className="flex flex-wrap items-center gap-2">
          {FLOW.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className="rounded-xl border border-[var(--color-ai)]/30 bg-[var(--color-ai)]/10 px-3 py-2 text-xs font-medium">
                <span className="text-[10px] font-mono text-[var(--color-ai)] mr-1">{String(i + 1).padStart(2, "0")}</span>{s}
              </div>
              {i < FLOW.length - 1 && <span className="text-[var(--color-ai)]/50">→</span>}
            </div>
          ))}
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <GlassCard className="xl:col-span-2" glow="clinical">
          <div className="text-sm font-semibold mb-3">AI Reasoning Network</div>
          <svg viewBox="0 0 600 320" className="w-full h-[320px]">
            <defs>
              <radialGradient id="node" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="oklch(0.82 0.16 185)" stopOpacity="0.9" />
                <stop offset="100%" stopColor="oklch(0.82 0.16 185)" stopOpacity="0.1" />
              </radialGradient>
            </defs>
            {positions.map((p, i) => (
              <line key={`l-${i}`} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="oklch(0.82 0.16 185 / 0.3)" strokeWidth="1" />
            ))}
            {positions.map((p, i) =>
              positions.slice(i + 2, i + 4).map((q, j) => (
                <line key={`x-${i}-${j}`} x1={p.x} y1={p.y} x2={q.x} y2={q.y} stroke="oklch(0.75 0.15 235 / 0.18)" strokeWidth="1" />
              )),
            )}
            {positions.map((p, i) => (
              <g key={`n-${i}`}>
                <circle cx={p.x} cy={p.y} r={22} fill="url(#node)" />
                <circle cx={p.x} cy={p.y} r={6} fill="oklch(0.82 0.16 185)" />
                <text x={p.x} y={p.y + 38} textAnchor="middle" fontSize="10" fill="white" opacity={0.8}>{NODES[i].label}</text>
                <text x={p.x} y={p.y + 50} textAnchor="middle" fontSize="8" fill="oklch(0.82 0.16 185)">{NODES[i].type}</text>
              </g>
            ))}
            <circle cx={cx} cy={cy} r={28} fill="oklch(0.75 0.15 235 / 0.25)" stroke="oklch(0.75 0.15 235)" />
            <text x={cx} y={cy + 4} textAnchor="middle" fontSize="11" fill="white" fontWeight="600">Encounter</text>
          </svg>
        </GlassCard>

        <GlassCard glow="ai">
          <div className="flex items-center gap-2 mb-3"><ShieldCheck className="h-4 w-4 text-[var(--color-success)]" /><div className="text-sm font-semibold">Safety Validation</div></div>
          <div className="space-y-3">
            {VALIDATIONS.map((v) => (
              <div key={v.l}>
                <div className="flex items-baseline justify-between mb-1">
                  <span className="text-sm">{v.l}</span>
                  <span className="font-mono text-sm text-[var(--color-success)]">{v.v}%</span>
                </div>
                <Bar value={v.v} tone="success" />
                <div className="text-[10px] text-muted-foreground mt-1">{v.note}</div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}