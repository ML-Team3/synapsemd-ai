import { createFileRoute } from "@tanstack/react-router";
import { ScanLine, Upload, CheckCircle2, AlertTriangle, FileText, Send } from "lucide-react";
import { useState } from "react";
import { GlassCard, SectionHeader, Bar, Pill, StatusDot } from "@/components/app/primitives";
import { useEncounter } from "@/lib/encounter-store";
import { ReportAnalyzer } from "@/components/app/ReportAnalyzer";

export const Route = createFileRoute("/radiology")({
  head: () => ({ meta: [{ title: "Radiology AI · VoxelMed AI" }] }),
  component: RadiologyAI,
});

const STUDIES = [
  { id: "s1", modality: "CXR", body: "Chest, 2 views", patient: "John Doe", mrn: "MRN-008-2241", status: "AI Analyzed", priority: "STAT" },
  { id: "s2", modality: "CT", body: "Head w/o contrast", patient: "Maria Lopez", mrn: "MRN-004-1187", status: "Awaiting Read", priority: "Routine" },
  { id: "s3", modality: "MRI", body: "Lumbar spine", patient: "Aiden Park", mrn: "MRN-002-9930", status: "Reported", priority: "Routine" },
  { id: "s4", modality: "US", body: "Abdomen complete", patient: "Sara Khan", mrn: "MRN-005-5512", status: "AI Analyzed", priority: "High" },
];

const FINDINGS = [
  { label: "Cardiomegaly", conf: 87, severity: "moderate" },
  { label: "Pulmonary vascular congestion", conf: 74, severity: "mild" },
  { label: "Small bilateral pleural effusions", conf: 68, severity: "mild" },
  { label: "No acute consolidation", conf: 94, severity: "negative" },
  { label: "No pneumothorax", conf: 98, severity: "negative" },
];

function RadiologyAI() {
  const { pushFeed } = useEncounter();
  const [active, setActive] = useState(STUDIES[0]);
  const [impression] = useState(
    "Cardiomegaly with mild pulmonary vascular congestion and small bilateral pleural effusions, consistent with mild cardiac decompensation. No acute consolidation or pneumothorax. Recommend correlation with BNP and clinical assessment of volume status.",
  );

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Specialty Intelligence"
        title="Radiology AI"
        subtitle="AI-assisted interpretation across X-Ray, CT, MRI, Ultrasound — PACS/DICOM connected"
        right={
          <div className="flex items-center gap-2">
            <Pill tone="ai"><StatusDot tone="ai" /> <span className="ml-2">PACS connected</span></Pill>
            <Pill tone="success">DICOM live</Pill>
          </div>
        }
      />

      <ReportAnalyzer specialty="radiology" />

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        <GlassCard className="xl:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-semibold">Worklist</div>
            <button className="text-[11px] inline-flex items-center gap-1 rounded-md bg-white/5 hover:bg-white/10 px-2 py-1">
              <Upload className="h-3 w-3" /> Upload study
            </button>
          </div>
          <div className="space-y-2">
            {STUDIES.map((s) => (
              <button
                key={s.id}
                onClick={() => setActive(s)}
                className={`w-full text-left rounded-xl border p-3 transition-all ${
                  active.id === s.id
                    ? "border-[var(--color-ai)]/40 bg-[var(--color-ai)]/10"
                    : "border-white/5 bg-white/[0.02] hover:bg-white/[0.05]"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--color-ai)]">{s.modality}</span>
                    {s.body}
                  </div>
                  <Pill tone={s.priority === "STAT" ? "critical" : s.priority === "High" ? "warning" : "muted"}>{s.priority}</Pill>
                </div>
                <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>{s.patient} · {s.mrn}</span>
                  <span>{s.status}</span>
                </div>
              </button>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="xl:col-span-3" glow="ai">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <ScanLine className="h-4 w-4 text-[var(--color-ai)]" />
              <div className="text-sm font-semibold">{active.modality} · {active.body}</div>
              <Pill tone="ai">AI inference complete</Pill>
            </div>
            <div className="text-[11px] text-muted-foreground font-mono">{active.patient} · {active.mrn}</div>
          </div>

          {/* Simulated DICOM viewer */}
          <div className="relative rounded-xl border border-white/10 overflow-hidden mb-4" style={{ aspectRatio: "16/10", background: "radial-gradient(ellipse at center, oklch(0.32 0.04 265) 0%, oklch(0.10 0.02 265) 80%)" }}>
            <svg viewBox="0 0 400 250" className="absolute inset-0 h-full w-full">
              {/* Mock chest silhouette */}
              <ellipse cx="200" cy="135" rx="110" ry="85" fill="none" stroke="oklch(0.75 0.02 250)" strokeOpacity="0.35" strokeWidth="1.2" />
              <path d="M150 80 Q130 140 150 200" stroke="oklch(0.75 0.02 250)" strokeOpacity="0.25" strokeWidth="1" fill="none" />
              <path d="M250 80 Q270 140 250 200" stroke="oklch(0.75 0.02 250)" strokeOpacity="0.25" strokeWidth="1" fill="none" />
              <ellipse cx="200" cy="155" rx="42" ry="32" fill="oklch(0.5 0.05 25)" fillOpacity="0.18" stroke="oklch(0.65 0.18 25)" strokeWidth="1.5" />
              <rect x="158" y="123" width="84" height="64" fill="none" stroke="oklch(0.78 0.18 25)" strokeWidth="1.5" strokeDasharray="4 3" />
              <text x="246" y="120" fill="oklch(0.78 0.18 25)" fontSize="9" fontFamily="monospace">Cardiomegaly · 87%</text>
              <rect x="120" y="180" width="160" height="18" fill="none" stroke="oklch(0.75 0.18 80)" strokeWidth="1" strokeDasharray="3 2" />
              <text x="282" y="194" fill="oklch(0.75 0.18 80)" fontSize="9" fontFamily="monospace">Effusion · 68%</text>
            </svg>
            <div className="absolute top-2 left-2 text-[10px] font-mono text-white/70">JOHN DOE · 54M · {active.modality}</div>
            <div className="absolute top-2 right-2 text-[10px] font-mono text-white/70">WL 50 / WW 350</div>
            <div className="absolute bottom-2 left-2 text-[10px] font-mono text-white/70">SE 1 · IM 1/1</div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <div className="text-[11px] uppercase tracking-widest text-muted-foreground mb-2">AI Findings</div>
              <div className="space-y-2">
                {FINDINGS.map((f) => (
                  <div key={f.label}>
                    <div className="flex items-baseline justify-between mb-1">
                      <span className="text-sm">{f.label}</span>
                      <span className="font-mono text-[11px]" style={{ color: f.severity === "negative" ? "var(--color-success)" : f.severity === "moderate" ? "var(--color-critical)" : "var(--color-warning)" }}>{f.conf}%</span>
                    </div>
                    <Bar value={f.conf} tone={f.severity === "negative" ? "success" : f.severity === "moderate" ? "critical" : "warning"} />
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-widest text-muted-foreground mb-2">Suggested Coding</div>
              <div className="space-y-2 text-sm">
                {[
                  { code: "71046", type: "CPT", name: "Radiologic exam, chest, 2 views", conf: 99 },
                  { code: "I50.9", type: "ICD-10", name: "Heart failure, unspecified", conf: 76 },
                  { code: "R09.89", type: "ICD-10", name: "Other specified symptoms of resp system", conf: 62 },
                ].map((c) => (
                  <div key={c.code} className="rounded-lg border border-white/5 bg-white/[0.02] p-2.5">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs text-[var(--color-revenue)]">{c.type} {c.code}</span>
                      <span className="font-mono text-[11px] text-muted-foreground">{c.conf}%</span>
                    </div>
                    <div className="text-[12px] text-foreground/85">{c.name}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <GlassCard className="lg:col-span-2" glow="clinical">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2"><FileText className="h-4 w-4 text-[var(--color-clinical)]" /><div className="text-sm font-semibold">AI-Generated Report</div></div>
            <Pill tone="success"><CheckCircle2 className="h-3 w-3 mr-1" /> Radiologist review pending</Pill>
          </div>
          <div className="space-y-3 text-sm">
            <div className="rounded-lg border border-white/5 bg-white/[0.02] p-3">
              <div className="text-[10px] uppercase tracking-widest text-[var(--color-ai)] mb-1">Findings</div>
              <p className="text-foreground/90 leading-relaxed">The cardiac silhouette is enlarged with a cardiothoracic ratio of approximately 0.58. There is mild pulmonary vascular congestion and small bilateral pleural effusions, right greater than left. The lungs are otherwise clear without focal consolidation. No pneumothorax. Bony thorax is intact.</p>
            </div>
            <div className="rounded-lg border border-white/5 bg-white/[0.02] p-3">
              <div className="text-[10px] uppercase tracking-widest text-[var(--color-ai)] mb-1">Impression</div>
              <p className="text-foreground/90 leading-relaxed">{impression}</p>
            </div>
            <div className="rounded-lg border border-white/5 bg-white/[0.02] p-3">
              <div className="text-[10px] uppercase tracking-widest text-[var(--color-ai)] mb-1">Follow-up Recommendations</div>
              <ul className="text-foreground/90 leading-relaxed list-disc pl-5 space-y-1">
                <li>Echocardiogram to evaluate LV function</li>
                <li>BNP, BMP, troponin (already pending)</li>
                <li>Repeat CXR after diuresis</li>
              </ul>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <button onClick={() => pushFeed({ agent: "Radiology", text: "Report signed and synced to Epic", tone: "success" })} className="text-xs rounded-md bg-[var(--color-ai)] text-[var(--color-background)] px-3 py-1.5 font-semibold inline-flex items-center gap-1.5 hover:opacity-90">
              <Send className="h-3 w-3" /> Sign &amp; Send to EHR
            </button>
            <button className="text-xs rounded-md bg-white/5 hover:bg-white/10 px-3 py-1.5">Request peer review</button>
          </div>
        </GlassCard>

        <GlassCard glow="revenue">
          <div className="text-sm font-semibold mb-3">Claim Readiness</div>
          <div className="space-y-3">
            {[
              { label: "Documentation complete", ok: true },
              { label: "Medical necessity (LCD L33665)", ok: true },
              { label: "Modifier validation", ok: true },
              { label: "Prior authorization", ok: false, note: "Not required" },
              { label: "Order linked to ICD", ok: true },
            ].map((c) => (
              <div key={c.label} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  {c.ok ? <CheckCircle2 className="h-4 w-4 text-[var(--color-success)]" /> : <AlertTriangle className="h-4 w-4 text-[var(--color-warning)]" />}
                  {c.label}
                </span>
                <span className="text-[11px] text-muted-foreground">{c.note ?? (c.ok ? "Passed" : "Review")}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-lg border border-[var(--color-revenue)]/30 bg-[var(--color-revenue)]/10 p-3">
            <div className="text-[10px] uppercase tracking-widest text-[var(--color-revenue)]">Estimated reimbursement</div>
            <div className="text-2xl font-display font-bold text-[var(--color-revenue)]">$184.20</div>
            <div className="text-[11px] text-muted-foreground">Medicare national, no modifiers</div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}