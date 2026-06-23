import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Lock, CheckCircle2, Loader2 } from "lucide-react";
import { AuthShell } from "./mfa";

export const Route = createFileRoute("/reset-password")({
  head: () => ({ meta: [{ title: "Reset Password · SynapseMD AI" }] }),
  component: ResetPage,
});

function ResetPage() {
  const navigate = useNavigate();
  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const [err, setErr] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    if (a.length < 8) return setErr("Password must be at least 8 characters.");
    if (a !== b) return setErr("Passwords do not match.");
    setLoading(true);
    setTimeout(() => {
      setLoading(false); setDone(true);
      setTimeout(() => navigate({ to: "/login" }), 1200);
    }, 700);
  }

  return (
    <AuthShell>
      <div className="text-[10px] uppercase tracking-[0.22em] text-[var(--color-ai)] mb-1">Account Recovery</div>
      <h2 className="text-2xl font-display font-bold">Reset Password</h2>
      <p className="text-sm text-muted-foreground mt-1">Choose a strong new password for your account.</p>

      {done ? (
        <div className="mt-6 flex items-center gap-2 rounded-lg border border-[var(--color-success)]/30 bg-[var(--color-success)]/10 px-3 py-2.5 text-sm text-[var(--color-success)]">
          <CheckCircle2 className="h-4 w-4" /> Password updated successfully. Redirecting…
        </div>
      ) : (
        <form onSubmit={submit} className="mt-6 space-y-4">
          <PwField label="New Password" value={a} onChange={setA} />
          <PwField label="Confirm Password" value={b} onChange={setB} />
          {err && <div className="text-xs text-[var(--color-critical)]">{err}</div>}
          <button disabled={loading} className="w-full rounded-lg bg-gradient-to-r from-[var(--color-ai)] to-[var(--color-clinical)] text-[var(--color-background)] font-semibold py-2.5 text-sm flex items-center justify-center gap-2 disabled:opacity-60">
            {loading && <Loader2 className="h-4 w-4 animate-spin" />} Update Password
          </button>
        </form>
      )}
    </AuthShell>
  );
}

function PwField({ label, value, onChange }: { label: string; value: string; onChange: (s: string)=>void }) {
  return (
    <label className="block">
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">{label}</div>
      <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5">
        <Lock className="h-4 w-4 text-muted-foreground" />
        <input type="password" required value={value} onChange={(e)=>onChange(e.target.value)} placeholder="••••••••" className="bg-transparent outline-none w-full text-sm" />
      </div>
    </label>
  );
}