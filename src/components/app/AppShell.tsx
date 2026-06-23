import { Link, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import {
  Activity, BrainCircuit, ChevronDown, Coins, GitBranch, Layers, LogOut, Mic, Network,
  Radar, Settings, ShieldCheck, Stethoscope, User as UserIcon, Clock, X, Loader2,
} from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useEncounter, formatDuration } from "@/lib/encounter-store";
import { useAuth, isAuthRoute, ROLE_LABEL } from "@/lib/auth-store";

const NAV = [
  { to: "/", label: "Command Center", icon: Radar },
  { to: "/scribe", label: "Ambient AI Scribe", icon: Mic },
  { to: "/clinical", label: "Clinical Intelligence", icon: Stethoscope },
  { to: "/specialty", label: "Specialty Intelligence", icon: Layers },
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
  const navigate = useNavigate();
  const { user, mfaPending, rolePending } = useAuth();
  const onAuth = isAuthRoute(loc.pathname);

  // Route guard
  useEffect(() => {
    if (onAuth) return;
    if (!user) navigate({ to: "/login" });
    else if (mfaPending) navigate({ to: "/mfa" });
    else if (rolePending || !user.role) navigate({ to: "/role-select" });
  }, [onAuth, user, mfaPending, rolePending, navigate]);

  if (onAuth) return <>{children ?? <Outlet />}</>;
  if (!user || mfaPending || !user.role) {
    return (
      <div className="min-h-screen grid place-items-center text-muted-foreground text-sm">
        <Loader2 className="h-5 w-5 animate-spin text-[var(--color-ai)]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 shrink-0 border-r border-white/5 bg-[oklch(0.13_0.022_265)]/80 backdrop-blur-xl flex flex-col">
        <div className="px-5 py-5 border-b border-white/5">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-[var(--color-ai)] to-[var(--color-clinical)] grid place-items-center text-[var(--color-background)] font-black">V</div>
            <div>
              <div className="font-display text-base font-bold tracking-tight">SynapseMD <span className="text-gradient-ai">AI</span></div>
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
        <TopBar />
        <GlobalEncounterBar />
        <div className="flex-1 p-6 lg:p-8">{children ?? <Outlet />}</div>
      </main>
      <SessionWatcher />
    </div>
  );
}

function TopBar() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [mounted, setMounted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    const onDoc = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);
  if (!user || !user.role) return null;
  const initials = user.name.split(" ").map((s) => s[0]).slice(0, 2).join("").toUpperCase();
  const roleLabel = ROLE_LABEL[user.role];

  function doLogout() {
    setSigningOut(true);
    setTimeout(() => {
      signOut();
      setSigningOut(false);
      setConfirm(false);
      navigate({ to: "/login" });
    }, 700);
  }

  return (
    <>
      <div className="flex items-center justify-end gap-3 px-6 py-2 border-b border-white/5 bg-[oklch(0.13_0.022_265)]/40 backdrop-blur-xl">
        <div className="hidden md:flex items-center gap-1.5 text-[10px] text-muted-foreground">
          <ShieldCheck className="h-3.5 w-3.5 text-[var(--color-success)]" /> Session secured · MFA verified
        </div>
        <div className="relative" ref={ref}>
          <button onClick={() => setOpen((o) => !o)} className="flex items-center gap-2 rounded-full pl-1 pr-3 py-1 border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] transition">
            <div className="relative">
              <div className="h-7 w-7 rounded-full bg-gradient-to-br from-[var(--color-ai)] to-[var(--color-clinical)] text-[var(--color-background)] grid place-items-center text-[10px] font-bold">{initials || "DR"}</div>
              <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-[var(--color-success)] border-2 border-[oklch(0.13_0.022_265)]" />
            </div>
            <div className="text-left leading-tight hidden sm:block">
              <div className="text-xs font-semibold">{user.name}</div>
              <div className="text-[10px] text-[var(--color-ai)]">{roleLabel}</div>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          </button>

          {open && (
            <div className="absolute right-0 mt-2 w-72 glass-strong rounded-xl p-2 z-30 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.6)]">
              <div className="p-3 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[var(--color-ai)] to-[var(--color-clinical)] text-[var(--color-background)] grid place-items-center text-xs font-bold">{initials}</div>
                  <div>
                    <div className="text-sm font-semibold">{user.name}</div>
                    <div className="text-[11px] text-muted-foreground">{user.email}</div>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-[10px]">
                  <Meta label="Role" value={roleLabel} tone="ai" />
                  <Meta label="Status" value="Online" tone="success" />
                  <Meta label="Last Login" value={mounted ? new Date(user.lastLogin ?? user.loginAt).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "—"} />
                  <Meta label="Device" value={user.device} />
                  <Meta label="IP Address" value={user.ip} />
                  <Meta label="Session" value={mounted ? formatDuration(Date.now() - user.loginAt) : "—"} />
                </div>
              </div>
              <MenuItem icon={UserIcon} label="Profile" />
              <MenuItem icon={Settings} label="Settings" />
              <MenuItem icon={ShieldCheck} label="Security" />
              <button onClick={() => { setOpen(false); setConfirm(true); }} className="w-full mt-1 flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-[var(--color-critical)] hover:bg-[var(--color-critical)]/10 transition">
                <LogOut className="h-4 w-4" /> Logout
              </button>
            </div>
          )}
        </div>
      </div>

      {confirm && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 backdrop-blur-sm p-4" onClick={() => !signingOut && setConfirm(false)}>
          <div className="glass-strong rounded-2xl p-6 w-full max-w-sm relative" onClick={(e) => e.stopPropagation()}>
            {!signingOut && <button onClick={() => setConfirm(false)} className="absolute top-3 right-3 text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>}
            <div className="flex items-center gap-2 mb-1">
              <LogOut className="h-4 w-4 text-[var(--color-critical)]" />
              <span className="text-[10px] uppercase tracking-[0.22em] text-[var(--color-critical)]">Sign Out</span>
            </div>
            <h3 className="text-lg font-display font-bold">Sign Out</h3>
            <p className="text-sm text-muted-foreground mt-1">Are you sure you want to log out of SynapseMD?</p>
            {signingOut ? (
              <div className="mt-5 flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Signing out…</div>
            ) : (
              <div className="mt-5 flex justify-end gap-2">
                <button onClick={() => setConfirm(false)} className="rounded-lg border border-white/10 bg-white/[0.04] px-4 py-2 text-sm hover:bg-white/[0.08]">Cancel</button>
                <button onClick={doLogout} className="rounded-lg bg-[var(--color-critical)] text-white px-4 py-2 text-sm font-semibold hover:opacity-90">Logout</button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

function Meta({ label, value, tone }: { label: string; value: string; tone?: "ai" | "success" }) {
  return (
    <div className="rounded-md border border-white/5 bg-white/[0.02] p-2">
      <div className="uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="mt-0.5 text-foreground/90 font-mono" style={tone ? { color: `var(--color-${tone})` } : undefined}>{value}</div>
    </div>
  );
}

function MenuItem({ icon: Icon, label }: { icon: any; label: string }) {
  return (
    <button className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground/90 hover:bg-white/5 transition">
      <Icon className="h-4 w-4 text-muted-foreground" /> {label}
    </button>
  );
}

const IDLE_LIMIT_MS = 15 * 60 * 1000;
const WARN_BEFORE_MS = 60 * 1000;

function SessionWatcher() {
  const navigate = useNavigate();
  const { user, signOut, lastActivity, touch } = useAuth();
  const [warn, setWarn] = useState(false);
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    const evts = ["mousemove", "keydown", "click", "scroll", "touchstart"];
    const onAct = () => touch();
    evts.forEach((e) => window.addEventListener(e, onAct, { passive: true }));
    return () => evts.forEach((e) => window.removeEventListener(e, onAct));
  }, [touch]);

  useEffect(() => {
    if (!user) return;
    const t = setInterval(() => {
      const idle = Date.now() - lastActivity;
      if (idle >= IDLE_LIMIT_MS) {
        signOut();
        navigate({ to: "/login" });
      } else if (idle >= IDLE_LIMIT_MS - WARN_BEFORE_MS) {
        setWarn(true);
        setCountdown(Math.max(0, Math.ceil((IDLE_LIMIT_MS - idle) / 1000)));
      } else {
        setWarn(false);
      }
    }, 1000);
    return () => clearInterval(t);
  }, [user, lastActivity, signOut, navigate]);

  if (!warn) return null;
  return (
    <div className="fixed bottom-6 right-6 z-50 glass-strong rounded-xl p-4 w-80 border border-[var(--color-warning)]/40 shadow-[0_0_60px_-20px_var(--color-warning)]">
      <div className="flex items-center gap-2 mb-1 text-[10px] uppercase tracking-[0.22em] text-[var(--color-warning)]"><Clock className="h-3.5 w-3.5" /> Session timeout</div>
      <div className="text-sm font-semibold">Your session is about to expire</div>
      <p className="text-xs text-muted-foreground mt-1">For your security, you'll be signed out in <span className="font-mono text-foreground">{countdown}s</span> due to inactivity.</p>
      <div className="mt-3 flex gap-2">
        <button onClick={() => { touch(); setWarn(false); }} className="flex-1 rounded-lg bg-gradient-to-r from-[var(--color-ai)] to-[var(--color-clinical)] text-[var(--color-background)] text-xs font-semibold py-2">Stay Logged In</button>
        <button onClick={() => { signOut(); navigate({ to: "/login" }); }} className="rounded-lg border border-white/10 bg-white/5 text-xs font-medium px-3">Logout</button>
      </div>
    </div>
  );
}