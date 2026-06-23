import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ShieldCheck, Loader2, ArrowLeft } from "lucide-react";
import { useAuth } from "@/lib/auth-store";

export const Route = createFileRoute("/mfa")({
  head: () => ({ meta: [{ title: "Verify Identity · SynapseMD AI" }] }),
  component: MfaPage,
});

function MfaPage() {
  const navigate = useNavigate();
  const { user, mfaPending, verifyMfa } = useAuth();
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(30);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!user) navigate({ to: "/login" });
    else if (!mfaPending) navigate({ to: "/role-select" });
  }, [user, mfaPending, navigate]);

  useEffect(() => {
    if (timer <= 0) return;
    const t = setTimeout(() => setTimer((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [timer]);

  function setDigit(i: number, v: string) {
    const ch = v.replace(/\D/g, "").slice(-1);
    const next = [...code];
    next[i] = ch;
    setCode(next);
    if (ch && i < 5) refs.current[i + 1]?.focus();
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    if (code.some((c) => !c)) { setErr("Enter all 6 digits."); return; }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      verifyMfa();
      navigate({ to: "/role-select" });
    }, 700);
  }

  return (
    <AuthShell>
      <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-[var(--color-ai)] mb-1">
        <ShieldCheck className="h-4 w-4" /> Multi-Factor Authentication
      </div>
      <h2 className="text-2xl font-display font-bold">Verify Your Identity</h2>
      <p className="text-sm text-muted-foreground mt-1">Enter the 6-digit code sent to your registered device.</p>

      <form onSubmit={submit} className="mt-6 space-y-5">
        <div className="flex gap-2 justify-between">
          {code.map((c, i) => (
            <input
              key={i}
              ref={(el) => { refs.current[i] = el; }}
              value={c}
              onChange={(e) => setDigit(i, e.target.value)}
              onKeyDown={(e) => { if (e.key === "Backspace" && !c && i > 0) refs.current[i - 1]?.focus(); }}
              inputMode="numeric"
              maxLength={1}
              className="w-12 h-14 text-center text-xl font-display font-bold rounded-lg border border-white/10 bg-white/[0.04] focus:border-[var(--color-ai)]/60 focus:shadow-[0_0_0_3px_color-mix(in_oklab,var(--color-ai)_15%,transparent)] outline-none transition"
            />
          ))}
        </div>

        {err && <div className="text-xs text-[var(--color-critical)]">{err}</div>}

        <button disabled={loading} type="submit" className="w-full rounded-lg bg-gradient-to-r from-[var(--color-ai)] to-[var(--color-clinical)] text-[var(--color-background)] font-semibold py-2.5 text-sm flex items-center justify-center gap-2 disabled:opacity-60">
          {loading && <Loader2 className="h-4 w-4 animate-spin" />} Verify
        </button>

        <div className="flex items-center justify-between text-xs">
          <Link to="/login" className="flex items-center gap-1 text-muted-foreground hover:text-foreground"><ArrowLeft className="h-3 w-3" /> Back to login</Link>
          {timer > 0 ? (
            <span className="text-muted-foreground font-mono">Resend in 00:{timer.toString().padStart(2, "0")}</span>
          ) : (
            <button type="button" onClick={() => setTimer(30)} className="text-[var(--color-ai)] hover:underline">Resend Code</button>
          )}
        </div>
      </form>
    </AuthShell>
  );
}

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen grid place-items-center p-6 bg-[#070B17] relative overflow-hidden">
      <div className="absolute inset-0 -z-10 opacity-50" style={{
        backgroundImage:
          "radial-gradient(at 20% 20%, color-mix(in oklab, var(--color-ai) 14%, transparent), transparent 50%),radial-gradient(at 80% 80%, color-mix(in oklab, var(--color-clinical) 12%, transparent), transparent 55%)",
      }} />
      <div className="w-full max-w-md">
        <div className="flex items-center gap-2 justify-center mb-6">
          <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-[var(--color-ai)] to-[var(--color-clinical)] grid place-items-center text-[var(--color-background)] font-black">S</div>
          <div className="font-display text-lg font-bold">SynapseMD <span className="text-gradient-ai">AI</span></div>
        </div>
        <div className="glass-strong rounded-2xl p-7 shadow-[0_0_80px_-30px_var(--color-ai)]">
          {children}
        </div>
      </div>
    </div>
  );
}