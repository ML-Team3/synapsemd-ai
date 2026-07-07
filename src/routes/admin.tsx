import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Users, UserPlus, ShieldCheck, Lock, Mail, Search, MoreHorizontal,
  KeyRound, RefreshCw, UserX, Eye, Pencil, ScrollText, X, CheckCircle2,
  AlertTriangle, Building2, Sparkles,
} from "lucide-react";
import { ROLE_LABEL, type Role } from "@/lib/auth-store";
import { ROLE_PERMISSIONS } from "@/lib/rbac";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "User & Access Management · SynapseMD AI" }] }),
  component: AdminPage,
});

// -------- Mock data (backend-ready shape) --------
// In production, replace with getUsers() / createUser() / updateUserRole() /
// sendInvite() / resetPassword() / deactivateUser() / getUserAuditLogs()
// calls to the RBAC + Identity service. Passwords must never round-trip via
// the client — use invite-based onboarding with server-side hashing (argon2).

type UserStatus = "active" | "invited" | "locked" | "disabled";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  department: string;
  access: string;
  status: UserStatus;
  mfa: boolean;
  lastLogin: string;
}

const SEED_USERS: AdminUser[] = [
  { id: "u1", name: "Dr. Sarah Mitchell", email: "physician@synapsemd.ai",    role: "physician",    department: "Emergency Department", access: "Full Clinical Access",              status: "active", mfa: true,  lastLogin: "2m ago" },
  { id: "u2", name: "Dr. Adam Carter",    email: "radiologist@synapsemd.ai",  role: "radiologist",  department: "Radiology",            access: "Imaging + Reporting",               status: "active", mfa: true,  lastLogin: "18m ago" },
  { id: "u3", name: "Dr. Lisa Morgan",    email: "dermatologist@synapsemd.ai",role: "dermatologist",department: "Dermatology",          access: "Lesion Analysis + Treatment Planning",status:"active", mfa: true,  lastLogin: "1h ago" },
  { id: "u4", name: "Michael Brown",      email: "coder@synapsemd.ai",        role: "coder",        department: "HIM",                  access: "Coding Workbench",                  status: "active", mfa: true,  lastLogin: "3h ago" },
  { id: "u5", name: "Emma Wilson",        email: "billing@synapsemd.ai",      role: "billing",      department: "RCM",                  access: "Revenue Cycle",                     status: "active", mfa: false, lastLogin: "Yesterday" },
  { id: "u6", name: "James Lee",          email: "compliance@synapsemd.ai",   role: "compliance",   department: "Compliance",           access: "Read + Audit Access",               status: "active", mfa: true,  lastLogin: "2d ago" },
  { id: "u7", name: "Admin User",         email: "admin@synapsemd.ai",        role: "admin",        department: "Enterprise IT",        access: "Full Platform Access",              status: "active", mfa: true,  lastLogin: "Just now" },
  { id: "u8", name: "Dr. Priya Rao",      email: "priya.rao@synapsemd.ai",    role: "physician",    department: "Cardiology",           access: "Full Clinical Access",              status: "invited", mfa: false, lastLogin: "—" },
  { id: "u9", name: "Kevin Zhao",         email: "kevin.zhao@synapsemd.ai",   role: "coder",        department: "HIM",                  access: "Coding Workbench",                  status: "locked", mfa: true,  lastLogin: "6d ago" },
];

type AuditEntry = { at: string; actor: string; action: string; target: string; tone: "ai"|"success"|"warning"|"critical" };

const SEED_AUDIT: AuditEntry[] = [
  { at: "09:41", actor: "Admin User", action: "User created",           target: "priya.rao@synapsemd.ai",   tone: "ai" },
  { at: "09:38", actor: "Admin User", action: "Invite sent",            target: "priya.rao@synapsemd.ai",   tone: "ai" },
  { at: "08:57", actor: "System",     action: "Account locked",         target: "kevin.zhao@synapsemd.ai",  tone: "critical" },
  { at: "Yesterday", actor: "Admin User", action: "Role updated → Radiologist", target: "adam.carter@synapsemd.ai", tone: "warning" },
  { at: "Yesterday", actor: "Admin User", action: "MFA enabled",        target: "billing@synapsemd.ai",     tone: "success" },
  { at: "2d ago", actor: "Admin User", action: "Password reset requested", target: "coder@synapsemd.ai",    tone: "warning" },
  { at: "3d ago", actor: "Admin User", action: "User deactivated",      target: "old.contractor@synapsemd.ai", tone: "critical" },
];

const STATUS_STYLE: Record<UserStatus, { label: string; color: string }> = {
  active:   { label: "Active",     color: "var(--color-success)" },
  invited:  { label: "Invited",    color: "var(--color-ai)" },
  locked:   { label: "Locked",     color: "var(--color-critical)" },
  disabled: { label: "Disabled",   color: "var(--color-warning)" },
};

function AdminPage() {
  const [users, setUsers] = useState<AdminUser[]>(SEED_USERS);
  const [audit, setAudit] = useState<AuditEntry[]>(SEED_AUDIT);
  const [q, setQ] = useState("");
  const [roleFilter, setRoleFilter] = useState<Role | "all">("all");
  const [openCreate, setOpenCreate] = useState(false);
  const [menuFor, setMenuFor] = useState<string | null>(null);

  const filtered = useMemo(
    () =>
      users.filter(
        (u) =>
          (roleFilter === "all" || u.role === roleFilter) &&
          (q === "" ||
            u.name.toLowerCase().includes(q.toLowerCase()) ||
            u.email.toLowerCase().includes(q.toLowerCase()) ||
            u.department.toLowerCase().includes(q.toLowerCase())),
      ),
    [users, roleFilter, q],
  );

  const stats = useMemo(() => {
    return {
      total: users.length,
      active: users.filter((u) => u.status === "active").length,
      invited: users.filter((u) => u.status === "invited").length,
      mfa: users.filter((u) => u.mfa).length,
      locked: users.filter((u) => u.status === "locked").length,
    };
  }, [users]);

  function logAudit(action: string, target: string, tone: AuditEntry["tone"] = "ai") {
    setAudit((a) => [{ at: "just now", actor: "Admin User", action, target, tone }, ...a].slice(0, 40));
  }

  // Backend-ready action handlers (mock)
  function handleCreate(u: AdminUser) {
    setUsers((list) => [u, ...list]);
    logAudit("User created", u.email, "ai");
    logAudit("Invite sent", u.email, "ai");
  }
  function handleAction(id: string, action: string) {
    const u = users.find((x) => x.id === id);
    if (!u) return;
    setMenuFor(null);
    switch (action) {
      case "reset":
        logAudit("Password reset requested", u.email, "warning"); break;
      case "resend":
        logAudit("Invite sent", u.email, "ai"); break;
      case "lock":
        setUsers((l) => l.map((x) => x.id === id ? { ...x, status: "locked" } : x));
        logAudit("Account locked", u.email, "critical"); break;
      case "deactivate":
        setUsers((l) => l.map((x) => x.id === id ? { ...x, status: "disabled" } : x));
        logAudit("User deactivated", u.email, "critical"); break;
      case "mfa":
        setUsers((l) => l.map((x) => x.id === id ? { ...x, mfa: !x.mfa } : x));
        logAudit(u.mfa ? "MFA disabled" : "MFA enabled", u.email, u.mfa ? "warning" : "success"); break;
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-[var(--color-ai)]"><Sparkles className="h-3.5 w-3.5" /> System Administrator</div>
          <h1 className="text-3xl font-display font-bold mt-1">User &amp; Access Management</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage platform users, roles, permissions, MFA, and access control.</p>
        </div>
        <button onClick={() => setOpenCreate(true)} className="rounded-lg bg-gradient-to-r from-[var(--color-ai)] to-[var(--color-clinical)] text-[var(--color-background)] font-semibold px-4 py-2.5 text-sm flex items-center gap-2 shadow-[0_0_40px_-12px_var(--color-ai)]">
          <UserPlus className="h-4 w-4" /> Create User
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Stat icon={Users}       label="Total Users"    value={stats.total}   tone="ai" />
        <Stat icon={CheckCircle2} label="Active Users"  value={stats.active}  tone="success" />
        <Stat icon={Mail}        label="Pending Invites" value={stats.invited} tone="clinical" />
        <Stat icon={ShieldCheck} label="MFA Enabled"    value={stats.mfa}     tone="success" />
        <Stat icon={Lock}        label="Locked Accounts" value={stats.locked}  tone="critical" />
      </div>

      {/* Users table */}
      <div className="glass rounded-2xl overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 p-4 border-b border-white/5">
          <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 flex-1 min-w-[220px]">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search users, email, department…" className="bg-transparent outline-none text-sm w-full" />
          </div>
          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value as Role | "all")} className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm">
            <option value="all">All Roles</option>
            {(Object.keys(ROLE_LABEL) as Role[]).map((r) => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-[10px] uppercase tracking-widest text-muted-foreground">
              <tr className="border-b border-white/5">
                {["Name","Email","Role","Department","Access Level","Status","MFA","Last Login",""].map((h) => (
                  <th key={h} className="text-left font-medium px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => {
                const s = STATUS_STYLE[u.status];
                const initials = u.name.split(" ").map((s) => s[0]).slice(0,2).join("");
                return (
                  <tr key={u.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-full bg-gradient-to-br from-[var(--color-ai)]/40 to-[var(--color-clinical)]/40 grid place-items-center text-[10px] font-bold">{initials}</div>
                        <span className="font-medium">{u.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground font-mono text-xs">{u.email}</td>
                    <td className="px-4 py-3"><span className="text-[11px] rounded-md border border-white/10 bg-white/[0.03] px-2 py-1">{ROLE_LABEL[u.role]}</span></td>
                    <td className="px-4 py-3 text-muted-foreground">{u.department}</td>
                    <td className="px-4 py-3 text-muted-foreground">{u.access}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-medium" style={{ color: s.color }}>
                        <span className="h-1.5 w-1.5 rounded-full" style={{ background: s.color }} /> {s.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {u.mfa ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-[var(--color-success)]"><ShieldCheck className="h-3 w-3" /> On</span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] text-[var(--color-warning)]"><AlertTriangle className="h-3 w-3" /> Off</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">{u.lastLogin}</td>
                    <td className="px-4 py-3 relative text-right">
                      <button onClick={() => setMenuFor(menuFor === u.id ? null : u.id)} className="p-1.5 rounded-md hover:bg-white/10">
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                      {menuFor === u.id && (
                        <div className="absolute right-4 mt-1 w-56 glass-strong rounded-xl p-1.5 z-20 text-left shadow-[0_20px_60px_-20px_rgba(0,0,0,0.6)]">
                          <RowAction icon={Eye}     label="View Profile"       onClick={() => setMenuFor(null)} />
                          <RowAction icon={Pencil}  label="Edit Role"          onClick={() => setMenuFor(null)} />
                          <RowAction icon={KeyRound}label="Reset Password"     onClick={() => handleAction(u.id, "reset")} />
                          <RowAction icon={RefreshCw} label="Resend Invite"    onClick={() => handleAction(u.id, "resend")} />
                          <RowAction icon={ShieldCheck} label={u.mfa ? "Disable MFA" : "Enable MFA"} onClick={() => handleAction(u.id, "mfa")} />
                          <RowAction icon={Lock}    label="Lock Account"       onClick={() => handleAction(u.id, "lock")} />
                          <RowAction icon={UserX}   label="Deactivate User"    onClick={() => handleAction(u.id, "deactivate")} tone="critical" />
                          <RowAction icon={ScrollText} label="View Audit Log"  onClick={() => setMenuFor(null)} />
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Permission matrix */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <ShieldCheck className="h-4 w-4 text-[var(--color-ai)]" />
            <h2 className="text-sm font-semibold uppercase tracking-widest">Role Permission Matrix</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            {(Object.keys(ROLE_PERMISSIONS) as Role[]).map((r) => (
              <div key={r} className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Building2 className="h-3.5 w-3.5 text-[var(--color-clinical)]" />
                  <span className="text-sm font-semibold">{ROLE_LABEL[r]}</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {ROLE_PERMISSIONS[r].map((p) => (
                    <span key={p} className="text-[10px] rounded-md border border-white/10 bg-white/[0.03] px-2 py-1 text-muted-foreground">{p}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Audit trail */}
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <ScrollText className="h-4 w-4 text-[var(--color-ai)]" />
            <h2 className="text-sm font-semibold uppercase tracking-widest">Audit Trail</h2>
          </div>
          <ol className="space-y-3 max-h-[520px] overflow-auto pr-1">
            {audit.map((e, i) => (
              <li key={i} className="flex gap-3 text-xs">
                <span className="mt-1 h-1.5 w-1.5 rounded-full shrink-0" style={{ background: `var(--color-${e.tone})` }} />
                <div className="min-w-0">
                  <div className="text-foreground/90">{e.action} <span className="text-muted-foreground">·</span> <span className="font-mono text-muted-foreground">{e.target}</span></div>
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground mt-0.5">{e.actor} · {e.at}</div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>

      {openCreate && <CreateUserModal onClose={() => setOpenCreate(false)} onCreate={(u) => { handleCreate(u); setOpenCreate(false); }} />}
    </div>
  );
}

function Stat({ icon: Icon, label, value, tone }: { icon: any; label: string; value: number; tone: "ai"|"success"|"clinical"|"critical" }) {
  return (
    <div className="glass rounded-xl p-4">
      <div className="flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</span>
        <Icon className="h-4 w-4" style={{ color: `var(--color-${tone})` }} />
      </div>
      <div className="text-2xl font-display font-bold mt-1" style={{ color: `var(--color-${tone})` }}>{value}</div>
    </div>
  );
}

function RowAction({ icon: Icon, label, onClick, tone }: { icon: any; label: string; onClick: () => void; tone?: "critical" }) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-2 rounded-md px-2.5 py-2 text-xs hover:bg-white/5 ${tone === "critical" ? "text-[var(--color-critical)]" : "text-foreground/90"}`}>
      <Icon className="h-3.5 w-3.5 opacity-80" /> {label}
    </button>
  );
}

function CreateUserModal({ onClose, onCreate }: { onClose: () => void; onCreate: (u: AdminUser) => void }) {
  const [form, setForm] = useState({
    name: "", email: "", role: "physician" as Role, department: "",
    access: "Full Clinical Access", startingModule: "/",
    requireMfa: true, status: "invited" as UserStatus,
  });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    // Production: call createUser() → server hashes nothing (no password),
    // generates invite token, sends email via provider. sendInvite() would
    // be a separate call for resends.
    setTimeout(() => {
      setSending(false);
      setSent(true);
      onCreate({
        id: `u${Math.random().toString(36).slice(2, 8)}`,
        name: form.name || "New User",
        email: form.email,
        role: form.role,
        department: form.department || "—",
        access: form.access,
        status: form.status,
        mfa: form.requireMfa,
        lastLogin: "—",
      });
    }, 600);
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="glass-strong rounded-2xl p-6 w-full max-w-lg relative" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-3 right-3 text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
        <div className="flex items-center gap-2 mb-1"><UserPlus className="h-4 w-4 text-[var(--color-ai)]" /><span className="text-[10px] uppercase tracking-[0.22em] text-[var(--color-ai)]">Invite Onboarding</span></div>
        <h3 className="text-xl font-display font-bold">Create New User</h3>
        <p className="text-xs text-muted-foreground mt-1">The user will receive a secure invite email to set their password. Passwords are never stored or transmitted in plain text.</p>

        <form onSubmit={submit} className="mt-5 grid grid-cols-2 gap-3">
          <Input label="Full Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />
          <Input label="Email Address" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} required />
          <Select label="Role" value={form.role} onChange={(v) => setForm({ ...form, role: v as Role })} options={(Object.keys(ROLE_LABEL) as Role[]).map((r) => ({ value: r, label: ROLE_LABEL[r] }))} />
          <Input label="Department / Area" value={form.department} onChange={(v) => setForm({ ...form, department: v })} />
          <Input label="Access Level" value={form.access} onChange={(v) => setForm({ ...form, access: v })} />
          <Input label="Starting Module" value={form.startingModule} onChange={(v) => setForm({ ...form, startingModule: v })} />
          <Select label="Account Status" value={form.status} onChange={(v) => setForm({ ...form, status: v as UserStatus })} options={[
            { value: "invited", label: "Invited (pending)" },
            { value: "active", label: "Active" },
            { value: "disabled", label: "Disabled" },
          ]} />
          <label className="col-span-2 flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5 text-xs cursor-pointer">
            <input type="checkbox" checked={form.requireMfa} onChange={(e) => setForm({ ...form, requireMfa: e.target.checked })} className="accent-[var(--color-ai)]" />
            Require MFA on first sign-in
          </label>

          <div className="col-span-2 mt-2 flex items-center justify-between">
            {sent ? (
              <div className="text-xs text-[var(--color-success)] flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5" /> Invite sent to {form.email}</div>
            ) : <span className="text-[10px] text-muted-foreground">No password is set here. The user creates it via the invite link.</span>}
            <button disabled={sending || sent} type="submit" className="rounded-lg bg-gradient-to-r from-[var(--color-ai)] to-[var(--color-clinical)] text-[var(--color-background)] font-semibold px-4 py-2 text-sm disabled:opacity-60 flex items-center gap-2">
              <Mail className="h-4 w-4" /> {sending ? "Sending…" : sent ? "Sent" : "Send Invite"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Input({ label, value, onChange, type = "text", required }: { label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean }) {
  return (
    <label className="block">
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">{label}</div>
      <input type={type} required={required} value={value} onChange={(e) => onChange(e.target.value)} className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-[var(--color-ai)]/50" />
    </label>
  );
}
function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <label className="block">
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">{label}</div>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-[var(--color-ai)]/50">
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </label>
  );
}