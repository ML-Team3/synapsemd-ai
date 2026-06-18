import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Mic, Check, X, Send, Pencil } from "lucide-react";
import { useEncounter } from "@/lib/encounter-store";
import { GlassCard, SectionHeader, Bar, Pill, StatusDot } from "@/components/app/primitives";

export const Route = createFileRoute("/scribe")({
  head: () => ({ meta: [{ title: "Ambient AI Scribe · VoxelMed AI" }] }),
  component: Scribe,
});

const FUTURE_LINES = [
  { speaker: "Dr. Chen" as const, text: "I'd like to order Troponin, CBC, BMP, and a Chest X-Ray.", ts: "00:42" },
  { speaker: "John Doe" as const, text: "Okay doctor, whatever you think is best.", ts: "00:47" },
  { speaker: "Dr. Chen" as const, text: "We'll also start aspirin while we wait for results.", ts: "00:52" },
  { speaker: "John Doe" as const, text: "I'm allergic to penicillin, just so you know.", ts: "00:56" },
  { speaker: "Dr. Chen" as const, text: "Noted — aspirin is safe with that allergy.", ts: "01:01" },
];

function Scribe() {
  const { transcript, soap, diagnoses, riskScore, riskPrev, orders, approveOrder, removeOrder, sendOrdersToEhr, pushFeed } = useEncounter();
  const [lines, setLines] = useState(transcript);
  const [typing, setTyping] = useState<{ speaker: string; partial: string } | null>(null);
  // Stable per-bar opacity so the waveform doesn't trip SSR/client hydration.
  const bars = useMemo(
    () => Array.from({ length: 64 }, (_, i) => ({
      h: 20 + Math.abs(Math.sin(i * 0.4)) * 80,
      o: 0.55 + ((i * 37) % 40) / 100,
    })),
    [],
  );

  useEffect(() => {
    let cancelled = false;
    let i = 0;
    const next = () => {
      if (cancelled || i >= FUTURE_LINES.length) return;
      const line = FUTURE_LINES[i++];
      let chars = 0;
      const typer = setInterval(() => {
        if (cancelled) return clearInterval(typer);
        chars += 2;
        setTyping({ speaker: line.speaker, partial: line.text.slice(0, chars) });
        if (chars >= line.text.length) {
          clearInterval(typer);
          setLines((prev) => [...prev, { id: `lt${i}_${Date.now()}`, speaker: line.speaker, text: line.text, ts: line.ts, confidence: 0.95 + Math.random() * 0.04 }]);
          setTyping(null);
          setTimeout(next, 1400);
        }
      }, 30);
    };
    const start = setTimeout(next, 1800);
    return () => { cancelled = true; clearTimeout(start); };
  }, []);

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Flagship Surface"
        title="Ambient AI Scribe"
        subtitle="Listening, transcribing, reasoning — in real time"
        right={
          <Pill tone="ai">
            <span className="relative flex h-2 w-2 mr-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--color-ai)] opacity-70" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--color-ai)]" />
            </span>
            Recording · 02:14
          </Pill>
        }
      />

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        <GlassCard className="xl:col-span-3" glow="ai">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Mic className="h-4 w-4 text-[var(--color-ai)]" />
              <div className="text-sm font-semibold">Live Conversation</div>
              <Pill tone="success">Speaker detection: 99.2%</Pill>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <StatusDot tone="ai" /> streaming
            </div>
          </div>
          <div className="mb-4 flex items-end gap-0.5 h-10">
            {bars.map((b, i) => (
              <div key={i} className="flex-1 rounded-sm bg-gradient-to-t from-[var(--color-ai)]/30 to-[var(--color-clinical)] transition-all duration-300"
                style={{ height: `${b.h}%`, opacity: b.o }} />
            ))}
          </div>

          <div className="space-y-3 max-h-[440px] overflow-auto pr-2">
            {lines.map((l) => (
              <div key={l.id} className={`flex ${l.speaker === "Dr. Chen" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-sm ${
                  l.speaker === "Dr. Chen"
                    ? "bg-[var(--color-clinical)]/15 border border-[var(--color-clinical)]/30"
                    : "bg-white/5 border border-white/10"
                }`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] uppercase tracking-wider font-mono" style={{ color: l.speaker === "Dr. Chen" ? "var(--color-clinical)" : "var(--color-ai)" }}>{l.speaker}</span>
                    <span className="text-[10px] text-muted-foreground font-mono">{l.ts}</span>
                    <span className="text-[10px] text-muted-foreground">conf {(l.confidence * 100).toFixed(0)}%</span>
                  </div>
                  <div>{l.text}</div>
                </div>
              </div>
            ))}
            {typing && (
              <div className={`flex ${typing.speaker === "Dr. Chen" ? "justify-end" : "justify-start"}`}>
                <div className="max-w-[78%] rounded-2xl px-4 py-2.5 text-sm bg-white/5 border border-white/10 border-dashed">
                  <div className="text-[10px] uppercase tracking-wider font-mono mb-1" style={{ color: typing.speaker === "Dr. Chen" ? "var(--color-clinical)" : "var(--color-ai)" }}>{typing.speaker} · transcribing</div>
                  <div>{typing.partial}<span className="inline-block w-1.5 h-4 bg-[var(--color-ai)] ml-0.5 animate-pulse" /></div>
                </div>
              </div>
            )}
          </div>
        </GlassCard>

        <GlassCard className="xl:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-semibold">Dynamic SOAP Note</div>
            <Pill tone="success">Auto-updating</Pill>
          </div>
          <div className="space-y-3 text-sm">
            {(["S", "O", "A", "P"] as const).map((k) => (
              <div key={k} className="rounded-lg border border-white/5 bg-white/[0.02] p-3">
                <div className="text-[10px] uppercase tracking-widest text-[var(--color-ai)] mb-1">
                  {k === "S" ? "Subjective" : k === "O" ? "Objective" : k === "A" ? "Assessment" : "Plan"}
                </div>
                <div className="text-foreground/90 leading-relaxed">{soap[k]}</div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <GlassCard glow="clinical">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-semibold">Diagnosis Evolution</div>
            <Pill tone="clinical">Updated · jaw radiation</Pill>
          </div>
          <div className="space-y-3">
            {diagnoses.map((d) => (
              <div key={d.code}>
                <div className="flex items-baseline justify-between mb-1">
                  <span className="text-sm">{d.name} <span className="text-xs text-muted-foreground">({d.code})</span></span>
                  <span className="font-mono text-sm" style={{ color: d.confidence > 50 ? "var(--color-critical)" : "var(--color-muted-foreground)" }}>{d.confidence}%</span>
                </div>
                <Bar value={d.confidence} tone={d.confidence > 50 ? "critical" : "clinical"} />
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard glow="critical">
          <div className="text-sm font-semibold mb-2">Cardiac Event Risk</div>
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-4xl font-display font-bold text-[var(--color-critical)]">{riskScore}%</span>
            <span className="text-sm text-muted-foreground">from {riskPrev}%</span>
          </div>
          <Bar value={riskScore} tone="critical" />
          <div className="mt-4 text-xs text-muted-foreground leading-relaxed">
            Risk elevated because: <span className="text-foreground">jaw + arm radiation</span>, <span className="text-foreground">diaphoresis</span>, <span className="text-foreground">HTN + T2DM + HLD triad</span>, ST depressions V4–V6.
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            <Pill tone="critical">HEART score 7</Pill>
            <Pill tone="warning">TIMI 4</Pill>
            <Pill tone="muted">GRACE 132</Pill>
          </div>
        </GlassCard>

        <GlassCard glow="ai">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-semibold">Pending Order Basket</div>
            <button onClick={() => { sendOrdersToEhr(); pushFeed({ agent: "EHR", text: "Order basket sent to Epic", tone: "success" }); }}
              className="text-xs rounded-md bg-[var(--color-ai)] text-[var(--color-background)] px-2.5 py-1 font-semibold inline-flex items-center gap-1 hover:opacity-90">
              <Send className="h-3 w-3" /> Send to EHR
            </button>
          </div>
          <div className="space-y-2">
            {orders.map((o) => (
              <div key={o.id} className="flex items-center justify-between gap-2 rounded-lg border border-white/5 bg-white/[0.02] p-2.5 text-sm">
                <div className="flex items-center gap-2 min-w-0">
                  {o.approved ? <Check className="h-3.5 w-3.5 text-[var(--color-success)]" /> : <div className="h-3.5 w-3.5 rounded border border-white/20" />}
                  <div className="min-w-0">
                    <div className="truncate">{o.name}</div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{o.category} {o.sentToEhr && "· sent"}</div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {!o.approved && (
                    <button onClick={() => approveOrder(o.id)} className="text-[10px] rounded bg-[var(--color-success)]/20 text-[var(--color-success)] px-2 py-1 hover:bg-[var(--color-success)]/30">Approve</button>
                  )}
                  <button className="text-[10px] rounded bg-white/5 text-muted-foreground px-2 py-1 hover:bg-white/10"><Pencil className="h-3 w-3" /></button>
                  <button onClick={() => removeOrder(o.id)} className="text-[10px] rounded bg-[var(--color-critical)]/15 text-[var(--color-critical)] px-2 py-1 hover:bg-[var(--color-critical)]/25"><X className="h-3 w-3" /></button>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}