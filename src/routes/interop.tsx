import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Database, Zap } from "lucide-react";
import { useEncounter } from "@/lib/encounter-store";
import { GlassCard, SectionHeader, Bar, Pill, StatusDot } from "@/components/app/primitives";

export const Route = createFileRoute("/interop")({
  head: () => ({ meta: [{ title: "Interoperability Hub · SynapseMD AI" }] }),
  component: Interop,
});

const SYSTEMS = [
  { name: "Epic Hyperdrive", status: "connected", standard: "FHIR R4" },
  { name: "Oracle Cerner", status: "connected", standard: "HL7 v2.5" },
  { name: "Athenahealth", status: "connected", standard: "SMART on FHIR" },
  { name: "Legend EHR", status: "syncing", standard: "FHIR R4" },
  { name: "Siesta EHR", status: "connected", standard: "HL7 v2.5" },
  { name: "Generic FHIR", status: "idle", standard: "FHIR R4" },
];

function Interop() {
  const { ehrSync, sendOrdersToEhr, pushFeed } = useEncounter();
  const [form, setForm] = useState({ name: "Epic - Production", url: "https://fhir.epic.com/r4", apiKey: "••••••••••••cz9k", clientId: "voxel-prod", clientSecret: "••••••••", fhir: "/api/FHIR/R4" });
  return (
    <div className="space-y-6">
      <SectionHeader eyebrow="Enterprise Integration" title="Interoperability Hub" subtitle="Bi-directional bridges to every major EHR" right={<Pill tone="success"><StatusDot tone="success" /> <span className="ml-2">5 of 6 systems healthy</span></Pill>} />

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {SYSTEMS.map((s) => {
          const tone: "success" | "ai" | "muted" = s.status === "connected" ? "success" : s.status === "syncing" ? "ai" : "muted";
          return (
            <GlassCard key={s.name} className="!p-3">
              <div className="flex items-center justify-between mb-2">
                <Database className="h-4 w-4 text-[var(--color-clinical)]" />
                <StatusDot tone={tone === "muted" ? "warning" : tone} />
              </div>
              <div className="text-sm font-semibold">{s.name}</div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{s.standard}</div>
              <div className="mt-2"><Pill tone={tone}>{s.status}</Pill></div>
            </GlassCard>
          );
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <GlassCard glow="clinical">
          <div className="text-sm font-semibold mb-3">Connection Configuration</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            {[
              { k: "name", l: "Connection Name" },
              { k: "url", l: "Base URL" },
              { k: "apiKey", l: "API Key" },
              { k: "clientId", l: "Client ID" },
              { k: "clientSecret", l: "Client Secret" },
              { k: "fhir", l: "FHIR Endpoint" },
            ].map((f) => (
              <label key={f.k} className="block">
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{f.l}</span>
                <input
                  className="mt-1 w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm font-mono outline-none focus:border-[var(--color-ai)]/60"
                  value={(form as Record<string, string>)[f.k]}
                  onChange={(e) => setForm({ ...form, [f.k]: e.target.value })}
                />
              </label>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button onClick={() => pushFeed({ agent: "EHR", text: `Connection saved: ${form.name}`, tone: "success" })} className="rounded-lg bg-[var(--color-ai)] text-[var(--color-background)] px-3 py-2 text-xs font-semibold">Save & Connect</button>
            <button className="rounded-lg bg-white/5 border border-white/10 text-foreground px-3 py-2 text-xs font-semibold">Test Connection</button>
            <button className="rounded-lg bg-[var(--color-critical)]/15 text-[var(--color-critical)] px-3 py-2 text-xs font-semibold">Disconnect</button>
          </div>
        </GlassCard>

        <GlassCard glow="ai">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-semibold">Synchronization Dashboard</div>
            <button onClick={sendOrdersToEhr} className="text-xs rounded-md bg-[var(--color-ai)]/15 text-[var(--color-ai)] px-2.5 py-1 inline-flex items-center gap-1"><Zap className="h-3 w-3" />Trigger sync</button>
          </div>
          <div className="space-y-3">
            {[
              { l: "Patient Import", v: 100, ok: "12,847 records", lat: "182ms" },
              { l: "Order Export", v: ehrSync, ok: "live", lat: "204ms" },
              { l: "Clinical Note Export", v: 71, ok: "queued", lat: "—" },
              { l: "Claim Export", v: 58, ok: "pending sig", lat: "—" },
            ].map((r) => (
              <div key={r.l}>
                <div className="flex items-baseline justify-between text-sm mb-1">
                  <span>{r.l}</span>
                  <span className="font-mono text-[var(--color-ai)]">{r.v}%</span>
                </div>
                <Bar value={r.v} tone="ai" />
                <div className="text-[10px] text-muted-foreground mt-1">{r.ok} · latency {r.lat}</div>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-lg border border-white/5 bg-white/[0.02] p-3 text-[11px] space-y-1 font-mono">
            <div><span className="text-[var(--color-success)]">✓</span> Patient John Doe (MRN-008-2241) synced</div>
            <div><span className="text-[var(--color-success)]">✓</span> 5 orders sent → Epic</div>
            <div><span className="text-[var(--color-ai)]">…</span> SOAP note exporting</div>
            <div><span className="text-muted-foreground">·</span> Claim awaiting attending signature</div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}