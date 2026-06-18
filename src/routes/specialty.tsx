import { createFileRoute, Link } from "@tanstack/react-router";
import { ScanLine, Sparkles, ArrowRight, ShieldCheck } from "lucide-react";
import { GlassCard, SectionHeader, Pill, StatusDot } from "@/components/app/primitives";

export const Route = createFileRoute("/specialty")({
  head: () => ({ meta: [{ title: "Specialty Intelligence · VoxelMed AI" }] }),
  component: SpecialtyHub,
});

const SPECIALTIES = [
  {
    to: "/radiology",
    title: "Radiology AI",
    desc: "AI-assisted interpretation across X-Ray, CT, MRI and Ultrasound. PACS / DICOM connected, automatic findings, impression and coding.",
    modalities: ["X-Ray", "CT", "MRI", "Ultrasound"],
    kpis: ["PACS · DICOM", "Auto-impression", "CPT + ICD suggest"],
    icon: ScanLine,
    glow: "ai" as const,
    accent: "var(--color-ai)",
  },
  {
    to: "/dermatology",
    title: "Dermatology AI",
    desc: "Lesion intelligence on clinical photos and dermoscopy. ABCDE analysis, melanoma risk, similar-case retrieval and treatment planning.",
    modalities: ["Clinical photo", "Dermoscopy", "Total body"],
    kpis: ["ABCDE", "Melanoma risk", "Biopsy planning"],
    icon: Sparkles,
    glow: "clinical" as const,
    accent: "var(--color-clinical)",
  },
];

function SpecialtyHub() {
  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Module 4"
        title="Specialty Intelligence"
        subtitle="Specialty-specific AI on top of the shared VoxelMed platform — patients, documentation, coding, claims, compliance and EHR."
        right={<Pill tone="ai"><StatusDot tone="ai" /> <span className="ml-2">2 specialties live</span></Pill>}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {SPECIALTIES.map((s) => {
          const Icon = s.icon;
          return (
            <Link key={s.to} to={s.to} className="group">
              <GlassCard glow={s.glow} className="!p-6 h-full transition-all group-hover:-translate-y-0.5">
                <div className="flex items-start justify-between mb-4">
                  <div className="h-12 w-12 rounded-xl grid place-items-center" style={{ background: `color-mix(in oklab, ${s.accent} 18%, transparent)`, color: s.accent }}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-[var(--color-ai)] transition-colors" />
                </div>
                <div className="font-display text-xl font-bold mb-1">{s.title}</div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">{s.desc}</p>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {s.modalities.map((m) => <Pill key={m} tone="muted">{m}</Pill>)}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {s.kpis.map((k) => <Pill key={k} tone="ai">{k}</Pill>)}
                </div>
              </GlassCard>
            </Link>
          );
        })}
      </div>

      <GlassCard className="!p-4">
        <div className="flex flex-wrap items-center gap-4 text-xs">
          <div className="flex items-center gap-2 text-[var(--color-success)]"><ShieldCheck className="h-4 w-4" /> Shared services: documentation · coding · claims · compliance · analytics · EHR</div>
          <span className="ml-auto text-muted-foreground">More specialties on the roadmap — Cardiology, Pathology, Ophthalmology</span>
        </div>
      </GlassCard>
    </div>
  );
}