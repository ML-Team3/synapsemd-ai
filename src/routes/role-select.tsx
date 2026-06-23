import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Stethoscope, ScanLine, Sparkles, Coins, Receipt, ShieldCheck, Server, ArrowRight } from "lucide-react";
import { useAuth, ROLE_HOME, type Role } from "@/lib/auth-store";

export const Route = createFileRoute("/role-select")({
  head: () => ({ meta: [{ title: "Select Role · SynapseMD AI" }] }),
  component: RolePage,
});

const ROLES: { id: Role; icon: any; title: string; desc: string; access: string; specialty: string; tone: "ai"|"clinical"|"revenue" }[] = [
  { id: "physician", icon: Stethoscope, title: "Physician", desc: "Clinical workflows, ambient documentation, decision support.", access: "Full clinical", specialty: "General · ED · Cardiology", tone: "clinical" },
  { id: "radiologist", icon: ScanLine, title: "Radiologist", desc: "PACS, DICOM viewer, AI findings & impressions.", access: "Imaging + report", specialty: "Radiology", tone: "ai" },
  { id: "dermatologist", icon: Sparkles, title: "Dermatologist", desc: "Lesion intelligence, ABCDE, melanoma risk.", access: "Lesion + Tx plan", specialty: "Dermatology", tone: "ai" },
  { id: "coder", icon: Coins, title: "Medical Coder", desc: "ICD-10 / CPT / HCC review and submission.", access: "Coding workbench", specialty: "HIM", tone: "revenue" },
  { id: "billing", icon: Receipt, title: "Billing Specialist", desc: "Claim validation, denials, revenue recovery.", access: "Revenue cycle", specialty: "RCM", tone: "revenue" },
  { id: "compliance", icon: ShieldCheck, title: "Compliance Officer", desc: "Audit logs, PHI access, governance controls.", access: "Read + audit", specialty: "Compliance", tone: "clinical" },
  { id: "admin", icon: Server, title: "System Administrator", desc: "Tenancy, integrations, RBAC, observability.", access: "Full platform", specialty: "Enterprise IT", tone: "ai" },
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
                <div className="mt-3 grid grid-cols-2 gap-2 text-[10px]">
                  <div><div className="uppercase tracking-widest text-muted-foreground">Access</div><div className="text-foreground/90 mt-0.5">{r.access}</div></div>
                  <div><div className="uppercase tracking-widest text-muted-foreground">Specialty</div><div className="text-foreground/90 mt-0.5">{r.specialty}</div></div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-8 flex items-center justify-end gap-3">
          <span className="text-xs text-muted-foreground">Signed in as <span className="text-foreground">{user?.email}</span></span>
          <button disabled={!picked} onClick={go} className="rounded-lg bg-gradient-to-r from-[var(--color-ai)] to-[var(--color-clinical)] text-[var(--color-background)] font-semibold px-5 py-2.5 text-sm flex items-center gap-2 shadow-[0_0_40px_-12px_var(--color-ai)] disabled:opacity-50">
            Continue <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}