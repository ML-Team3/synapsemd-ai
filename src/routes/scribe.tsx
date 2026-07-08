import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Mic, Check, X, Send, Pencil, Play, Pause, Square, Save, FileText, Trash2, ShieldAlert } from "lucide-react";
import { useEncounter } from "@/lib/encounter-store";
import { useAuth } from "@/lib/auth-store";
import { GlassCard, SectionHeader, Bar, Pill, StatusDot } from "@/components/app/primitives";

export const Route = createFileRoute("/scribe")({
  head: () => ({ meta: [{ title: "Ambient AI Scribe · SynapseMD AI" }] }),
  component: Scribe,
});

const FUTURE_LINES = [
  { speaker: "Dr. Chen" as const, text: "I'd like to order Troponin, CBC, BMP, and a Chest X-Ray.", ts: "00:42" },
  { speaker: "John Doe" as const, text: "Okay doctor, whatever you think is best.", ts: "00:47" },
  { speaker: "Dr. Chen" as const, text: "We'll also start aspirin while we wait for results.", ts: "00:52" },
  { speaker: "John Doe" as const, text: "I'm allergic to penicillin, just so you know.", ts: "00:56" },
  { speaker: "Dr. Chen" as const, text: "Noted — aspirin is safe with that allergy.", ts: "01:01" },
];

type RecState = "idle" | "recording" | "paused" | "stopped" | "saved" | "soap_generated";

const EMPTY_SOAP = { S: "", O: "", A: "", P: "" };

// Backend-ready audit hook. Wire to POST /audit/events when available.
function logAuditEvent(event: string, meta?: Record<string, unknown>) {
  // eslint-disable-next-line no-console
  console.info("[audit]", event, meta ?? {});
}

function Scribe() {
  const { soap: baseSoap, diagnoses, riskScore, riskPrev, orders, approveOrder, removeOrder, sendOrdersToEhr, pushFeed } = useEncounter();
  const { user } = useAuth();
  const canRecord = user?.role === "physician" || user?.role === "admin";
  const readOnly = user?.role === "compliance";

  const [state, setState] = useState<RecState>("idle");
  const [lines, setLines] = useState<typeof FUTURE_LINES extends readonly (infer _)[] ? any[] : any[]>([]);
  const [typing, setTyping] = useState<{ speaker: string; partial: string } | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [soap, setSoap] = useState<typeof baseSoap>(EMPTY_SOAP);
  const [toast, setToast] = useState<string | null>(null);
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const lineIdxRef = useRef(0);

  const isActive = state === "recording";
  const hasTranscript = lines.length > 0;

  // Stable per-bar opacity so the waveform doesn't trip SSR/client hydration.
  const bars = useMemo(
    () => Array.from({ length: 64 }, (_, i) => ({
      h: 20 + Math.abs(Math.sin(i * 0.4)) * 80,
      o: 0.55 + ((i * 37) % 40) / 100,
    })),
    [],
  );

  // Timer — only ticks while recording.
  useEffect(() => {
    if (state !== "recording") return;
    const t = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [state]);

  // Transcript simulation — only while recording.
  useEffect(() => {
    if (state !== "recording") return;
    let cancelled = false;
    let typer: any;
    const next = () => {
      if (cancelled) return;
      const i = lineIdxRef.current;
      if (i >= FUTURE_LINES.length) return;
      const line = FUTURE_LINES[i];
      let chars = 0;
      typer = setInterval(() => {
        if (cancelled) return clearInterval(typer);
        chars += 2;
        setTyping({ speaker: line.speaker, partial: line.text.slice(0, chars) });
        if (chars >= line.text.length) {
          clearInterval(typer);
          setLines((prev) => [...prev, { id: `lt${i}_${Date.now()}`, speaker: line.speaker, text: line.text, ts: line.ts, confidence: 0.96 }]);
          setTyping(null);
          lineIdxRef.current = i + 1;
          setTimeout(next, 1400);
        }
      }, 30);
    };
    const start = setTimeout(next, 1200);
    return () => { cancelled = true; clearTimeout(start); clearInterval(typer); setTyping(null); };
  }, [state]);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2400);
  }

  // Backend-ready action functions.
  function startRecording() { setState("recording"); logAuditEvent("scribe.recording.started"); pushFeed({ agent: "Ambient", text: "Recording started", tone: "ai" }); }
  function pauseRecording() { setState("paused"); logAuditEvent("scribe.recording.paused"); }
  function resumeRecording() { setState("recording"); logAuditEvent("scribe.recording.resumed"); }
  function stopRecording() { setState("stopped"); setTyping(null); logAuditEvent("scribe.recording.stopped"); pushFeed({ agent: "Ambient", text: "Recording completed", tone: "success" }); }
  function saveTranscript() { setState((s) => (s === "soap_generated" ? s : "saved")); logAuditEvent("scribe.transcript.saved", { lines: lines.length }); showToast("Transcript saved to encounter."); }
  function generateSoapNote() {
    setSoap(baseSoap);
    setState("soap_generated");
    logAuditEvent("scribe.soap.generated");
    pushFeed({ agent: "Documentation", text: "SOAP note generated", tone: "success" });
    showToast("SOAP note generated.");
  }
  function discardRecording() {
    setState("idle"); setLines([]); setTyping(null); setElapsed(0); setSoap(EMPTY_SOAP); lineIdxRef.current = 0;
    setConfirmDiscard(false);
    logAuditEvent("scribe.recording.discarded");
    showToast("Recording discarded.");
  }

  const statusLabel: Record<RecState, string> = {
    idle: "Ready to Record",
    recording: "Recording",
    paused: "Paused",
    stopped: "Recording Completed",
    saved: "Transcript Saved",
    soap_generated: "SOAP Note Generated",
  };
  const statusTone: Record<RecState, "ai"|"success"|"warning"|"muted"> = {
    idle: "muted", recording: "critical" as any, paused: "warning", stopped: "ai", saved: "success", soap_generated: "success",
  };

  if (!canRecord && !readOnly) {
    return (
      <div className="max-w-lg mx-auto mt-16 glass rounded-2xl p-8 text-center">
        <ShieldAlert className="h-8 w-8 text-[var(--color-warning)] mx-auto" />
        <h2 className="text-lg font-display font-bold mt-3">Access Restricted</h2>
        <p className="text-sm text-muted-foreground mt-1">Ambient AI Scribe is available for clinical users only.</p>
      </div>
    );
  }

  const mm = String(Math.floor(elapsed / 60)).padStart(2, "0");
  const ss = String(elapsed % 60).padStart(2, "0");

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Flagship Surface"
        title="Ambient AI Scribe"
        subtitle="Listening, transcribing, reasoning — in real time"
        right={
          <Pill tone={statusTone[state] as any}>
            {state === "recording" && (
              <span className="relative flex h-2 w-2 mr-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--color-critical)] opacity-70" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--color-critical)]" />
              </span>
            )}
            {statusLabel[state]} · {mm}:{ss}
          </Pill>
        }
      />

      {/* Recording Control Bar */}
      <GlassCard>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-3 pr-4 border-r border-white/10">
            <div className="h-10 w-10 rounded-full grid place-items-center"
              style={{ background: state === "recording" ? "rgba(239,68,68,0.15)" : "rgba(255,255,255,0.05)",
                       color: state === "recording" ? "var(--color-critical)" : "var(--color-muted-foreground)" }}>
              <Mic className="h-5 w-5" />
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Status</div>
              <div className="text-sm font-semibold">{statusLabel[state]}</div>
            </div>
            <div className="pl-4">
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Timer</div>
              <div className="text-sm font-mono">{mm}:{ss}</div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 ml-auto">
            {state === "idle" && (
              <button onClick={startRecording} disabled={readOnly}
                className="rounded-lg bg-gradient-to-r from-[var(--color-critical)] to-[var(--color-warning)] text-white font-semibold px-4 py-2 text-sm flex items-center gap-2 disabled:opacity-50">
                <Play className="h-4 w-4" /> Start Recording
              </button>
            )}
            {state === "recording" && (
              <>
                <button onClick={pauseRecording} className="rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 px-3 py-2 text-sm flex items-center gap-2"><Pause className="h-4 w-4" /> Pause</button>
                <button onClick={stopRecording} className="rounded-lg bg-[var(--color-critical)]/20 text-[var(--color-critical)] border border-[var(--color-critical)]/30 px-3 py-2 text-sm flex items-center gap-2"><Square className="h-4 w-4" /> Stop</button>
              </>
            )}
            {state === "paused" && (
              <>
                <button onClick={resumeRecording} className="rounded-lg bg-gradient-to-r from-[var(--color-ai)] to-[var(--color-clinical)] text-[var(--color-background)] font-semibold px-3 py-2 text-sm flex items-center gap-2"><Play className="h-4 w-4" /> Resume</button>
                <button onClick={stopRecording} className="rounded-lg bg-[var(--color-critical)]/20 text-[var(--color-critical)] border border-[var(--color-critical)]/30 px-3 py-2 text-sm flex items-center gap-2"><Square className="h-4 w-4" /> Stop</button>
              </>
            )}
            {(state === "stopped" || state === "saved" || state === "soap_generated") && (
              <button onClick={() => { setState("idle"); setLines([]); setElapsed(0); setSoap(EMPTY_SOAP); lineIdxRef.current = 0; }}
                className="rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 px-3 py-2 text-sm flex items-center gap-2"><Play className="h-4 w-4" /> New Session</button>
            )}

            <button onClick={saveTranscript} disabled={!(state === "stopped" || state === "soap_generated")}
              className="rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 px-3 py-2 text-sm flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed">
              <Save className="h-4 w-4" /> Save Transcript
            </button>
            <button onClick={generateSoapNote} disabled={!hasTranscript || state === "recording" || state === "paused"}
              className="rounded-lg bg-gradient-to-r from-[var(--color-ai)] to-[var(--color-clinical)] text-[var(--color-background)] font-semibold px-3 py-2 text-sm flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed">
              <FileText className="h-4 w-4" /> Generate SOAP Note
            </button>
            <button onClick={() => setConfirmDiscard(true)} disabled={!hasTranscript && state === "idle"}
              className="rounded-lg border border-[var(--color-critical)]/30 text-[var(--color-critical)] bg-[var(--color-critical)]/10 hover:bg-[var(--color-critical)]/20 px-3 py-2 text-sm flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed">
              <Trash2 className="h-4 w-4" /> Discard
            </button>
          </div>
        </div>
        {readOnly && (
          <div className="mt-3 text-xs text-[var(--color-warning)] flex items-center gap-2"><ShieldAlert className="h-3.5 w-3.5" /> Read-only access — Compliance role cannot control recording.</div>
        )}
      </GlassCard>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        <GlassCard className="xl:col-span-3" glow="ai">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Mic className="h-4 w-4 text-[var(--color-ai)]" />
              <div className="text-sm font-semibold">Live Conversation</div>
              {isActive && <Pill tone="success">Speaker detection: 99.2%</Pill>}
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <StatusDot tone={isActive ? "ai" : "success"} /> {isActive ? "streaming" : statusLabel[state]}
            </div>
          </div>
          <div className="mb-4 flex items-end gap-0.5 h-10">
            {bars.map((b, i) => (
              <div key={i} className={`flex-1 rounded-sm bg-gradient-to-t from-[var(--color-ai)]/30 to-[var(--color-clinical)] transition-all duration-300 ${isActive ? "" : "grayscale opacity-30"}`}
                style={{ height: `${isActive ? b.h : 10}%`, opacity: isActive ? b.o : 0.25 }} />
            ))}
          </div>

          <div className="space-y-3 max-h-[440px] overflow-auto pr-2">
            {lines.length === 0 && !typing && (
              <div className="text-center text-sm text-muted-foreground py-12 border border-dashed border-white/10 rounded-xl">
                Start recording to capture the patient conversation.
              </div>
            )}
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
            <Pill tone={state === "soap_generated" ? "success" : "muted"}>{state === "soap_generated" ? "Generated" : "Awaiting generation"}</Pill>
          </div>
          <div className="space-y-3 text-sm">
            {(["S", "O", "A", "P"] as const).map((k) => (
              <div key={k} className="rounded-lg border border-white/5 bg-white/[0.02] p-3">
                <div className="text-[10px] uppercase tracking-widest text-[var(--color-ai)] mb-1">
                  {k === "S" ? "Subjective" : k === "O" ? "Objective" : k === "A" ? "Assessment" : "Plan"}
                </div>
                <div className="text-foreground/90 leading-relaxed">
                  {soap[k] || <span className="text-muted-foreground italic">Generate SOAP note to populate this section.</span>}
                </div>
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

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 glass-strong rounded-lg px-4 py-3 text-sm border border-[var(--color-success)]/30 shadow-[0_0_40px_-16px_var(--color-success)]">
          {toast}
        </div>
      )}

      {confirmDiscard && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setConfirmDiscard(false)}>
          <div className="glass-strong rounded-2xl p-6 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-2 mb-1 text-[10px] uppercase tracking-[0.22em] text-[var(--color-critical)]"><Trash2 className="h-3.5 w-3.5" /> Discard Recording</div>
            <h3 className="text-lg font-display font-bold">Discard this recording?</h3>
            <p className="text-sm text-muted-foreground mt-1">This will clear the transcript, timer, and any generated SOAP note. This action cannot be undone.</p>
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setConfirmDiscard(false)} className="rounded-lg border border-white/10 bg-white/[0.04] px-4 py-2 text-sm hover:bg-white/[0.08]">Cancel</button>
              <button onClick={discardRecording} className="rounded-lg bg-[var(--color-critical)] text-white px-4 py-2 text-sm font-semibold hover:opacity-90">Discard</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}