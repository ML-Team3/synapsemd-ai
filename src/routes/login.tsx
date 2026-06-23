import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Activity, Eye, EyeOff, Lock, Mail, ShieldCheck, Sparkles, Stethoscope, Coins, GitBranch, Layers, KeyRound, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth-store";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in · SynapseMD AI" }] }),
  component: LoginPage,
});

const METRICS = [
  { label: "Coding Accuracy", value: 98, suffix: "%", tone: "ai" as const },
  { label: "Documentation Time Reduction", value: 35, suffix: "%", tone: "clinical" as const },
  { label: "Faster Clinical Decisions", value: 42, suffix: "%", tone: "revenue" as const },
  { label: "Revenue Leakage Prevention", value: 29, suffix: "%", tone: "success" as const },
];

function useCount(target: number, ms = 1400) {
  const [n, setN] = useState(0);
  useEffect(() => {
    const start = performance.now();
    let raf = 0;
    const step = (t: number) => {
      const p = Math.min(1, (t - start) / ms);
      setN(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, ms]);
  return n;
}

function MetricCard({ label, value, suffix, tone }: { label: string; value: number; suffix: string; tone: "ai"|"clinical"|"revenue"|"success" }) {
  const n = useCount(value);
  return (
    <div className="glass rounded-xl p-3">
      <div className="text-2xl font-display font-bold" style={{ color: `var(--color-${tone})` }}>{n}{suffix}</div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1">{label}</div>
    </div>
  );
}

function NeuralVisual() {
  const nodes = Array.from({ length: 14 }, (_, i) => ({
    cx: 40 + ((i * 53) % 360),
    cy: 30 + ((i * 71) % 260),
    r: 3 + (i % 3),
  }));
  return (
    <svg viewBox="0 0 420 320" className="w-full h-full opacity-90">
      <defs>
        <radialGradient id="glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#00E5C4" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#00E5C4" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="ln" x1="0" x2="1">
          <stop offset="0%" stopColor="#00E5C4" stopOpacity="0.0" />
          <stop offset="50%" stopColor="#38BDF8" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#00E5C4" stopOpacity="0.0" />
        </linearGradient>
      </defs>
      <circle cx="210" cy="160" r="180" fill="url(#glow)" />
      {nodes.map((a, i) =>
        nodes.slice(i + 1, i + 4).map((b, j) => (
          <line key={`${i}-${j}`} x1={a.cx} y1={a.cy} x2={b.cx} y2={b.cy} stroke="url(#ln)" strokeWidth="0.6">
            <animate attributeName="stroke-opacity" values="0.1;0.9;0.1" dur={`${3 + ((i + j) % 4)}s`} repeatCount="indefinite" />
          </line>
        )),
      )}
      {nodes.map((n, i) => (
        <g key={i}>
          <circle cx={n.cx} cy={n.cy} r={n.r + 4} fill="#00E5C4" opacity="0.15">
            <animate attributeName="r" values={`${n.r + 2};${n.r + 8};${n.r + 2}`} dur={`${2 + (i % 3)}s`} repeatCount="indefinite" />
          </circle>
          <circle cx={n.cx} cy={n.cy} r={n.r} fill={i % 3 === 0 ? "#38BDF8" : "#00E5C4"} />
        </g>
      ))}
      {/* pulse line */}
      <path d="M0 240 L60 240 L72 200 L84 280 L96 180 L108 240 L420 240" fill="none" stroke="#00E5C4" strokeWidth="1.2" opacity="0.85">
        <animate attributeName="stroke-dasharray" values="0,1000;500,1000" dur="3s" repeatCount="indefinite" />
      </path>
    </svg>
  );
}

function LoginPage() {
  const navigate = useNavigate();
  const signIn = useAuth((s) => s.signIn);
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setLoading(true);
    setTimeout(() => {
      const ok =
        (email === "demo@synapsemd.ai" && pass === "Demo@123") ||
        (email.includes("@") && pass.length >= 6);
      setLoading(false);
      if (!ok) {
        setErr("Invalid credentials. Please try again.");
        return;
      }
      signIn(email);
      navigate({ to: "/mfa" });
    }, 700);
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-[1.1fr_1fr]">
      {/* LEFT */}
      <section className="relative hidden lg:flex flex-col justify-between p-10 overflow-hidden border-r border-white/5">
        <div className="absolute inset-0 -z-10">
          <NeuralVisual />
        </div>
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-[#070B17] via-[#070B17]/70 to-[#111827]" />

        <div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[var(--color-ai)] to-[var(--color-clinical)] grid place-items-center text-[var(--color-background)] font-black">S</div>
            <div>
              <div className="font-display text-2xl font-bold tracking-tight">SynapseMD <span className="text-gradient-ai">AI</span></div>
              <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Clinical Intelligence & Revenue Optimization Platform</div>
            </div>
          </div>

          <h1 className="mt-12 max-w-xl text-4xl xl:text-5xl font-display font-bold leading-[1.05] tracking-tight">
            Transforming clinical decisions through
            <span className="text-gradient-ai"> connected intelligence.</span>
          </h1>
          <p className="mt-4 max-w-md text-sm text-muted-foreground">
            From conversation to claim — one healthcare AI operating system that captures, reasons, codes, and reconciles in real time.
          </p>

          <div className="mt-8 grid grid-cols-2 gap-2 max-w-md text-xs">
            {[
              { i: Stethoscope, t: "Clinical Intelligence" },
              { i: Layers, t: "Specialty Intelligence" },
              { i: Coins, t: "Revenue Intelligence" },
              { i: GitBranch, t: "Interoperability" },
              { i: ShieldCheck, t: "Compliance & Governance" },
            ].map(({ i: I, t }) => (
              <div key={t} className="flex items-center gap-2 rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2">
                <I className="h-3.5 w-3.5 text-[var(--color-ai)]" /> {t}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 max-w-2xl">
          {METRICS.map((m) => <MetricCard key={m.label} {...m} />)}
        </div>
      </section>

      {/* RIGHT */}
      <section className="flex items-center justify-center p-6 lg:p-12 bg-[#070B17]">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8 text-center">
            <div className="font-display text-xl font-bold">SynapseMD <span className="text-gradient-ai">AI</span></div>
          </div>

          <div className="glass-strong rounded-2xl p-7 shadow-[0_0_80px_-30px_var(--color-ai)]">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="h-4 w-4 text-[var(--color-ai)]" />
              <span className="text-[10px] uppercase tracking-[0.22em] text-[var(--color-ai)]">Secure Access</span>
            </div>
            <h2 className="text-2xl font-display font-bold">Welcome Back</h2>
            <p className="text-sm text-muted-foreground mt-1">Sign in to continue to SynapseMD</p>

            <form className="mt-6 space-y-4" onSubmit={submit}>
              <Field icon={Mail} label="Email Address">
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@hospital.org" className="bg-transparent outline-none w-full text-sm placeholder:text-muted-foreground/60" />
              </Field>
              <Field icon={Lock} label="Password" right={
                <button type="button" onClick={() => setShow(!show)} className="text-muted-foreground hover:text-foreground">
                  {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              }>
                <input type={show ? "text" : "password"} required value={pass} onChange={(e) => setPass(e.target.value)} placeholder="••••••••" className="bg-transparent outline-none w-full text-sm placeholder:text-muted-foreground/60" />
              </Field>

              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 cursor-pointer text-muted-foreground">
                  <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="accent-[var(--color-ai)]" />
                  Remember me
                </label>
                <Link to="/forgot-password" className="text-[var(--color-ai)] hover:underline">Forgot Password?</Link>
              </div>

              {err && <div className="text-xs text-[var(--color-critical)] bg-[var(--color-critical)]/10 border border-[var(--color-critical)]/30 rounded-lg px-3 py-2">{err}</div>}

              <button disabled={loading} type="submit" className="w-full rounded-lg bg-gradient-to-r from-[var(--color-ai)] to-[var(--color-clinical)] text-[var(--color-background)] font-semibold py-2.5 text-sm flex items-center justify-center gap-2 shadow-[0_0_40px_-12px_var(--color-ai)] hover:opacity-95 transition disabled:opacity-60">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
                {loading ? "Authenticating…" : "Sign In"}
              </button>

              <button type="button" className="w-full rounded-lg border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] font-medium py-2.5 text-sm flex items-center justify-center gap-2 transition">
                <ShieldCheck className="h-4 w-4 text-[var(--color-clinical)]" />
                Sign in with Enterprise SSO
              </button>
            </form>

            {/* Demo */}
            <div className="mt-6 rounded-xl border border-dashed border-[var(--color-ai)]/30 bg-[var(--color-ai)]/[0.05] p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase tracking-widest text-[var(--color-ai)]">Demo Access</span>
                <Activity className="h-3.5 w-3.5 text-[var(--color-ai)]" />
              </div>
              <div className="text-[11px] text-muted-foreground space-y-0.5 font-mono">
                <div>Email: demo@synapsemd.ai</div>
                <div>Password: Demo@123</div>
              </div>
              <button type="button" onClick={() => { setEmail("demo@synapsemd.ai"); setPass("Demo@123"); }} className="mt-2 w-full rounded-md border border-[var(--color-ai)]/40 bg-[var(--color-ai)]/10 text-[var(--color-ai)] text-xs font-medium py-1.5 hover:bg-[var(--color-ai)]/20 transition">
                Use Demo Account
              </button>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-2 text-[10px] text-muted-foreground">
            {["HIPAA Compliant", "End-to-End Encryption", "Enterprise SSO Enabled", "MFA Protected"].map((t) => (
              <div key={t} className="flex items-center gap-1.5"><ShieldCheck className="h-3 w-3 text-[var(--color-success)]" /> {t}</div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function Field({ icon: Icon, label, children, right }: { icon: any; label: string; children: React.ReactNode; right?: React.ReactNode }) {
  return (
    <label className="block">
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">{label}</div>
      <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5 focus-within:border-[var(--color-ai)]/50 focus-within:shadow-[0_0_0_3px_color-mix(in_oklab,var(--color-ai)_15%,transparent)] transition">
        <Icon className="h-4 w-4 text-muted-foreground" />
        {children}
        {right}
      </div>
    </label>
  );
}