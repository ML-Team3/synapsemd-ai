import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";
import { AuthShell } from "./mfa";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({ meta: [{ title: "Forgot Password · SynapseMD AI" }] }),
  component: ForgotPage,
});

function ForgotPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => { setLoading(false); setSent(true); }, 700);
  }
  return (
    <AuthShell>
      <div className="text-[10px] uppercase tracking-[0.22em] text-[var(--color-ai)] mb-1">Account Recovery</div>
      <h2 className="text-2xl font-display font-bold">Forgot Password</h2>
      <p className="text-sm text-muted-foreground mt-1">Enter your email and we'll send a secure reset link.</p>

      {sent ? (
        <div className="mt-6 space-y-4">
          <div className="flex items-center gap-2 rounded-lg border border-[var(--color-success)]/30 bg-[var(--color-success)]/10 px-3 py-2.5 text-sm text-[var(--color-success)]">
            <CheckCircle2 className="h-4 w-4" /> Reset link sent successfully.
          </div>
          <Link to="/reset-password" className="block text-center text-xs text-[var(--color-ai)] hover:underline">Continue to reset password →</Link>
        </div>
      ) : (
        <form onSubmit={submit} className="mt-6 space-y-4">
          <label className="block">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Email Address</div>
            <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <input type="email" required value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="you@hospital.org" className="bg-transparent outline-none w-full text-sm" />
            </div>
          </label>
          <button disabled={loading} className="w-full rounded-lg bg-gradient-to-r from-[var(--color-ai)] to-[var(--color-clinical)] text-[var(--color-background)] font-semibold py-2.5 text-sm flex items-center justify-center gap-2 disabled:opacity-60">
            {loading && <Loader2 className="h-4 w-4 animate-spin" />} Send Reset Link
          </button>
        </form>
      )}

      <Link to="/login" className="mt-5 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-3 w-3" /> Back to login
      </Link>
    </AuthShell>
  );
}