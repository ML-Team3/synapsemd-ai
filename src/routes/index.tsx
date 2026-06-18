import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { Activity, ArrowRight, CheckCircle2, Loader2, Sparkles, ScanLine, Stethoscope, Mic, Coins, BrainCircuit, GitBranch, Network, ShieldCheck } from "lucide-react";
import { useEncounter, STAGES } from "@/lib/encounter-store";
import { GlassCard, SectionHeader, Bar, Pill, StatusDot } from "@/components/app/primitives";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [{ title: "Command Center · VoxelMed AI" }] }),
  component: CommandCenter,
});

function CommandCenter() {
  const { patient, stageIndex, agents, diagnoses, riskScore, riskPrev, orders, coding, claimReadiness, ehrSync, feed, pushFeed, tick } = useEncounter();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const samples = [
      { agent: "Ambient", text: "Captured: 'pressure radiates to jaw'", tone: "ai" as const },
      { agent: "Diagnostic", text: "ACS posterior probability holding at 78%", tone: "clinical" as const },
      { agent: "Evidence", text: "Linked AHA 2024 NSTEMI Class I rec", tone: "clinical" as const },
      { agent: "Coding", text: "I21.4 confidence +3% (now 74%)", tone: "revenue" as const },
      { agent: "Claim", text: "Medical necessity validated", tone: "success" as const },
      { agent: "EHR", text: "Heartbeat to Epic Hyperdrive OK", tone: "success" as const },
    ];
    const t = setInterval(() => {
      pushFeed(samples[Math.floor(Math.random() * samples.length)]);
      tick();
    }, 4500);
    return () => clearInterval(t);
  }, [pushFeed, tick]);

  const topDx = diagnoses[0];
  const topCpt = coding.find((c) => c.type === "CPT");

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Mission Control"
        title="Command Center"
        subtitle="Live orchestration of the VoxelMed AI Clinical Intelligence OS — from encounter to reimbursement"
        right={<Pill tone="ai"><Sparkles className="h-3 w-3 mr-1" /> Autonomous mode</Pill>}
      />

      {/* Stage progress */}
      <GlassCard glow="ai">
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm font-semibold">Live Encounter Progress</div>
          <div className="text-xs text-muted-foreground">Stage {stageIndex + 1} of {STAGES.length}</div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2">
          {STAGES.map((s, i) => {
            const done = i < stageIndex;
            const current = i === stageIndex;
            return (
              <div key={s} className={`rounded-xl border p-3 text-xs transition-all ${
                done ? "border-[var(--color-success)]/30 bg-[var(--color-success)]/10" :
                current ? "border-[var(--color-ai)]/40 bg-[var(--color-ai)]/10 shadow-[0_0_24px_-12px_var(--color-ai)]" :
                "border-white/5 bg-white/[0.02] text-muted-foreground"
              }`}>
                <div className="flex items-center gap-1.5 mb-2">
                  {done ? <CheckCircle2 className="h-3.5 w-3.5 text-[var(--color-success)]" /> :
                   current ? <Loader2 className="h-3.5 w-3.5 text-[var(--color-ai)] animate-spin" /> :
                   <div className="h-3.5 w-3.5 rounded-full border border-white/20" />}
                  <span className="text-[10px] uppercase tracking-wider">{i + 1}</span>
                </div>
                <div className="font-medium leading-tight">{s}</div>
              </div>
            );
          })}
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* AI Agent board */}
        <GlassCard className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-sm font-semibold">AI Agent Status Board</div>
              <div className="text-xs text-muted-foreground">Real-time agent telemetry</div>
            </div>
            <Pill tone="success"><StatusDot tone="success" /> <span className="ml-2">All agents healthy</span></Pill>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {agents.map((a) => {
              const toneMap: Record<string, "ai" | "clinical" | "warning" | "success" | "critical"> = {
                listening: "ai", thinking: "clinical", idle: "warning", complete: "success", alert: "critical",
              };
              const t = toneMap[a.status];
              return (
                <div key={a.id} className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <StatusDot tone={t} />
                      <div className="text-sm font-medium">{a.name}</div>
                    </div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">{a.status}</span>
                  </div>
                  <div className="text-xs text-muted-foreground mb-2">{a.task}</div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-muted-foreground">Confidence</span>
                    <span className="font-mono text-foreground">{a.confidence}%</span>
                  </div>
                  <Bar value={a.confidence} tone={t === "critical" ? "critical" : t === "warning" ? "warning" : "ai"} />
                  <div className="mt-2 text-[11px] text-muted-foreground italic line-clamp-1">{a.lastAction}</div>
                </div>
              );
            })}
          </div>
        </GlassCard>

        {/* Live feed */}
        <GlassCard>
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-semibold">Live Activity Feed</div>
            <Activity className="h-4 w-4 text-[var(--color-ai)]" />
          </div>
          <div className="space-y-2 max-h-[480px] overflow-auto pr-1">
            {feed.map((f) => (
              <div key={f.id} className="rounded-lg border border-white/5 bg-white/[0.02] p-2.5 text-xs" style={{ animation: "ticker 0.4s ease-out" }}>
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-[10px] uppercase tracking-wider" style={{ color: `var(--color-${f.tone ?? "ai"})` }}>{f.agent}</span>
                  <span className="text-[10px] font-mono text-muted-foreground">{mounted ? new Date(f.ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }) : "--:--:--"}</span>
                </div>
                <div className="text-foreground/90">{f.text}</div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Snapshot */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Snap label="Top Diagnosis" value={topDx.name} sub={`${topDx.code} · ${topDx.confidence}%`} tone="clinical" />
        <Snap label="Cardiac Risk" value={`${riskScore}%`} sub={`from ${riskPrev}% · HEART 7`} tone="critical" />
        <Snap label="Orders" value={`${orders.filter((o) => o.approved).length}/${orders.length}`} sub={`${orders.filter(o=>o.sentToEhr).length} sent to EHR`} tone="ai" />
        <Snap label="Coding Conf." value={`${topCpt?.confidence}%`} sub={`${topCpt?.code} ${topCpt?.name}`} tone="revenue" />
        <Snap label="Claim Readiness" value={`${claimReadiness}%`} sub="Medical necessity ✓" tone="revenue" />
        <Snap label="EHR Sync" value={`${ehrSync}%`} sub="Epic Hyperdrive" tone="ai" />
      </div>

      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <ArrowRight className="h-3 w-3" />
        Continue to <span className="text-[var(--color-ai)]">Ambient AI Scribe</span> for live conversation
      </div>

      {/* Platform module map (SRS v3.0) */}
      <SectionHeader eyebrow="Platform" title="Healthcare AI Operating System" subtitle="One ecosystem · shared patient, documentation, coding, compliance & EHR services" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <ModuleCard to="/scribe" icon={Mic} tone="ai" title="Ambient Documentation" desc="Real-time listening, SOAP & order detection." kpis={["97% ASR", "Auto SOAP", "Order capture"]} />
        <ModuleCard to="/clinical" icon={Stethoscope} tone="clinical" title="Clinical Intelligence" desc="Differential, guidelines, risk, med safety." kpis={["HEART/TIMI", "AHA 2024", "Drug-allergy"]} />
        <ModuleCard to="/radiology" icon={ScanLine} tone="ai" title="Radiology AI" desc="X-Ray, CT, MRI, US — findings & reports." kpis={["PACS", "DICOM", "Auto-impression"]} />
        <ModuleCard to="/dermatology" icon={Sparkles} tone="ai" title="Dermatology AI" desc="Lesion intelligence & melanoma risk." kpis={["ABCDE", "Similar-case", "Tx planning"]} />
        <ModuleCard to="/revenue" icon={Coins} tone="revenue" title="Revenue Intelligence" desc="ICD/CPT/HCPCS, HCC, denials." kpis={["I21.4 NSTEMI", "RAF +0.31", "Denial 8%"]} />
        <ModuleCard to="/ai" icon={BrainCircuit} tone="ai" title="AI Intelligence Center" desc="Explainability, agent orchestration, safety." kpis={["10 agents", "XAI", "Hallucination ✓"]} />
        <ModuleCard to="/interop" icon={GitBranch} tone="clinical" title="Interoperability Hub" desc="Epic, Cerner, Athena · FHIR R4 · HL7." kpis={["FHIR R4", "SMART", "C-CDA"]} />
        <ModuleCard to="/operations" icon={Network} tone="revenue" title="Operations & Analytics" desc="Clinical, financial, executive KPIs." kpis={["Time saved", "Accuracy", "Revenue"]} />
      </div>

      <GlassCard className="!p-4">
        <div className="flex flex-wrap items-center gap-4 text-xs">
          <div className="flex items-center gap-2 text-[var(--color-success)]"><ShieldCheck className="h-4 w-4" /> HIPAA · GDPR · SOC 2 controls active</div>
          <span className="text-muted-foreground">Audit logging on · PHI access monitored · RBAC + MFA enforced</span>
          <span className="ml-auto text-muted-foreground">VoxelMed AI v3.0 · Clinician-in-the-loop</span>
        </div>
      </GlassCard>
    </div>
  );
}

function Snap({ label, value, sub, tone }: { label: string; value: string; sub: string; tone: "ai" | "clinical" | "revenue" | "critical" }) {
  return (
    <GlassCard className="!p-4">
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">{label}</div>
      <div className="text-lg font-display font-bold" style={{ color: `var(--color-${tone})` }}>{value}</div>
      <div className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">{sub}</div>
    </GlassCard>
  );
}

function ModuleCard({ to, icon: Icon, tone, title, desc, kpis }: { to: string; icon: any; tone: "ai" | "clinical" | "revenue"; title: string; desc: string; kpis: string[] }) {
  return (
    <Link to={to} className="group">
      <GlassCard className="!p-4 transition-all group-hover:-translate-y-0.5 group-hover:shadow-[0_0_40px_-16px_var(--color-ai)]">
        <div className="flex items-center justify-between mb-2">
          <div className="h-9 w-9 rounded-lg grid place-items-center" style={{ background: `color-mix(in oklab, var(--color-${tone}) 18%, transparent)`, color: `var(--color-${tone})` }}>
            <Icon className="h-4 w-4" />
          </div>
          <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-[var(--color-ai)]" />
        </div>
        <div className="text-sm font-semibold">{title}</div>
        <div className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">{desc}</div>
        <div className="mt-3 flex flex-wrap gap-1">
          {kpis.map((k) => (<Pill key={k} tone="muted">{k}</Pill>))}
        </div>
      </GlassCard>
    </Link>
  );
}
