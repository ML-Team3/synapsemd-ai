import { Link, Outlet, useLocation } from "@tanstack/react-router";
import { Activity, BrainCircuit, Coins, GitBranch, Mic, Network, Radar, ScanLine, Stethoscope, Sparkles } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { useEncounter, formatDuration } from "@/lib/encounter-store";

const NAV = [
  { to: "/", label: "Command Center", icon: Radar },
  { to: "/scribe", label: "Ambient AI Scribe", icon: Mic },
  { to: "/clinical", label: "Clinical Intelligence", icon: Stethoscope },
  { to: "/radiology", label: "Radiology AI", icon: ScanLine },
  { to: "/dermatology", label: "Dermatology AI", icon: Sparkles },
  { to: "/revenue", label: "Revenue Intelligence", icon: Coins },
  { to: "/ai", label: "AI Intelligence Center", icon: BrainCircuit },
  { to: "/interop", label: "Interoperability Hub", icon: GitBranch },
  { to: "/operations", label: "Operations Center", icon: Network },
] as const;

function GlobalEncounterBar() {
  const { patient, startedAt } = useEncounter();
  // Avoid SSR/client hydration mismatch — render time only after mount.
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="glass-strong sticky top-0 z-20 flex flex-wrap items-center gap-4 px-6 py-3 border-b border-white/5">
      <div className="flex items-center gap-3">
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--color-critical)] opacity-70" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[var(--color-critical)]" />
        </span>
        <span className="text-xs font-mono uppercase tracking-widest text-[var(--color-critical)]">Live Encounter</span>
      </div>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-sm">
        <span className="font-semibold">{patient.name}</span>
        <span className="text-muted-foreground">{patient.age}{patient.sex[0]} · Room {patient.room}</span>
        <span className="text-muted-foreground">MRN {patient.mrn}</span>
        <span className="text-[var(--color-critical)]">Priority: {patient.priority}</span>
        <span className="text-[var(--color-warning)]">⚠ Allergy: {patient.allergies.join(", ")}</span>
        <span className="text-muted-foreground">Duration: <span className="text-foreground font-mono">{now ? formatDuration(now - startedAt) : "--"}</span></span>
      </div>
      <div className="ml-auto flex items-center gap-2 text-xs">
        <Activity className="h-4 w-4 text-[var(--color-ai)]" />
        <span className="text-[var(--color-ai)]">8 AI agents active</span>
      </div>
    </div>
  );
}

export function AppShell({ children }: { children?: ReactNode }) {
  const loc = useLocation();
  return (
    <div className="min-h-screen flex">
      <aside className="w-64 shrink-0 border-r border-white/5 bg-[oklch(0.13_0.022_265)]/80 backdrop-blur-xl flex flex-col">
        <div className="px-5 py-5 border-b border-white/5">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-[var(--color-ai)] to-[var(--color-clinical)] grid place-items-center text-[var(--color-background)] font-black">V</div>
            <div>
              <div className="font-display text-base font-bold tracking-tight">VoxelMed <span className="text-gradient-ai">AI</span></div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Clinical Intelligence OS</div>
            </div>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV.map((n) => {
            const Icon = n.icon;
            const active = loc.pathname === n.to;
            return (
              <Link
                key={n.to}
                to={n.to}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all ${
                  active
                    ? "bg-white/8 text-foreground border border-white/10 shadow-[0_0_24px_-12px_var(--color-ai)]"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                }`}
              >
                <Icon className={`h-4 w-4 ${active ? "text-[var(--color-ai)]" : ""}`} />
                {n.label}
              </Link>
            );
          })}
        </nav>
        <div className="px-4 py-3 text-[10px] text-muted-foreground border-t border-white/5">
          <div>From Clinical Encounter to Reimbursement</div>
          <div className="text-[var(--color-ai)]">Powered by Explainable AI</div>
        </div>
      </aside>
      <main className="flex-1 min-w-0 flex flex-col">
        <GlobalEncounterBar />
        <div className="flex-1 p-6 lg:p-8">{children ?? <Outlet />}</div>
      </main>
    </div>
  );
}