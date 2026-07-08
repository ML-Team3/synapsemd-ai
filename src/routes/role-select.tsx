import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Stethoscope, ScanLine, Sparkles, Coins, Receipt, ShieldCheck, Server, ArrowRight, Check } from "lucide-react";
import { useAuth, ROLE_HOME, type Role } from "@/lib/auth-store";

export const Route = createFileRoute("/role-select")({
  head: () => ({ meta: [{ title: "Select Role · SynapseMD AI" }] }),
  component: RolePage,
});

const ROLES: { id: Role; icon: any; title: string; desc: string; modules: string[]; tone: "ai"|"clinical"|"revenue" }[] = [
  { id: "physician", icon: Stethoscope, title: "Physician",
    desc: "Clinical workflows, ambient documentation, and decision support.",
    modules: ["Command Center", "Clinical Intelligence", "Ambient AI Scribe", "Orders"], tone: "clinical" },
  { id: "radiologist", icon: ScanLine, title: "Radiologist",
    desc: "Radiology workflow with imaging studies, AI findings, and report generation.",
    modules: ["Radiology Workspace", "Imaging Studies", "AI Findings", "Report Builder"], tone: "ai" },
  { id: "dermatologist", icon: Sparkles, title: "Dermatologist",
    desc: "Dermatology workflow with lesion analysis, risk assessment, and treatment planning.",
    modules: ["Dermatology Workspace", "Lesion Analysis", "Risk Assessment", "Treatment Plan"], tone: "ai" },
  { id: "coder", icon: Coins, title: "Medical Coder",
    desc: "Coding workflow for ICD/CPT review, HCC capture, and claim preparation.",
    modules: ["Coding Workbench", "ICD/CPT Review", "HCC Capture", "Claim Validation"], tone: "revenue" },
  { id: "billing", icon: Receipt, title: "Billing Specialist",
    desc: "Revenue workflow for claim validation, denial review, and payer follow-up.",
    modules: ["Claim Validation", "Denial Risk", "Revenue Recovery", "Payer Review"], tone: "revenue" },
  { id: "compliance", icon: ShieldCheck, title: "Compliance Officer",
    desc: "Compliance workflow for audit logs, PHI access, and user activity monitoring.",
    modules: ["Audit Logs", "PHI Access", "User Activity", "Compliance Dashboard"], tone: "clinical" },
  { id: "admin", icon: Server, title: "System Administrator",
    desc: "Administrative workflow for users, roles, integrations, and system access control.",
    modules: ["User Management", "Integrations", "RBAC", "System Health", "Full Platform Access"], tone: "ai" },
];

function RolePage() {
  const navigate = useNavigate();
  const { user, rolePending, mfaPending, setRole } = useAuth();
  const [picked, setPicked] = useState<Role | null>(null);

  useEffect(() => {
    if (!user) navigate({ to: "/login" });
    else if (mfaPending) navigate({ to: "/mfa" });
  }, [user, mfaPending, navigate]);

  function go() {
    if (!picked) return;
    setRole(picked);
    navigate({ to: ROLE_HOME[picked] });
  }

  const pickedTitle = ROLES.find((r) => r.id === picked)?.title;

  return (
    <div className="min-h-screen p-6 lg:p-10 bg-[#070B17]">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-2 mb-2 text-[10px] uppercase tracking-[0.22em] text-[var(--color-ai)]">
          <Sparkles className="h-4 w-4" /> Step 3 of 3 · Workspace
        </div>
        <h1 className="text-3xl font-display font-bold">Select Your Role</h1>
        <p className="text-sm text-muted-foreground mt-1">Choose your workspace. Permissions and your starting module will be tailored to your role.</p>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {ROLES.map((r) => {
            const Icon = r.icon;
            const active = picked === r.id;
            return (
              <button
                key={r.id}
                onClick={() => setPicked(r.id)}
                className={`text-left glass rounded-2xl p-5 transition-all hover:-translate-y-0.5 ${active ? "border-[var(--color-ai)]/50 shadow-[0_0_60px_-20px_var(--color-ai)]" : ""}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="h-10 w-10 rounded-xl grid place-items-center" style={{ background: `color-mix(in oklab, var(--color-${r.tone}) 18%, transparent)`, color: `var(--color-${r.tone})` }}>
                    <Icon className="h-5 w-5" />
                  </div>
                  {active && <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--color-ai)]">Selected</span>}
                </div>
                <div className="text-base font-semibold">{r.title}</div>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{r.desc}</p>
                <div className="mt-4 pt-3 border-t border-white/5">
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Access Modules</div>
                  <ul className="space-y-1.5">
                    {r.modules.map((m) => (
                      <li key={m} className="flex items-center gap-2 text-xs text-foreground/90">
                        <Check className="h-3 w-3 shrink-0" style={{ color: `var(--color-${r.tone})` }} />
                        <span className="truncate">{m}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-8 flex items-center justify-end gap-3">
          <span className="text-xs text-muted-foreground">Signed in as <span className="text-foreground">{user?.email}</span></span>
          <button disabled={!picked} onClick={go} className="rounded-lg bg-gradient-to-r from-[var(--color-ai)] to-[var(--color-clinical)] text-[var(--color-background)] font-semibold px-5 py-2.5 text-sm flex items-center gap-2 shadow-[0_0_40px_-12px_var(--color-ai)] disabled:opacity-50">
            {pickedTitle ? `Continue as ${pickedTitle}` : "Continue"} <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}