import { useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Upload, Sparkles, Loader2, FileText, Image as ImageIcon, X } from "lucide-react";
import { analyzeSpecialty, type SpecialtyAnalysis } from "@/lib/specialty-analyze.functions";
import { GlassCard, Bar, Pill } from "@/components/app/primitives";
import { useEncounter } from "@/lib/encounter-store";

type Specialty = "radiology" | "dermatology";

const PRESETS: Record<Specialty, { ctx: string; report: string; label: string }> = {
  radiology: {
    label: "Sample CXR",
    ctx: "54M with chest pain and dyspnea. History of HTN, T2DM, HLD.",
    report:
      "Chest, 2 views. Heart size enlarged with CT ratio ~0.58. Mild pulmonary vascular congestion. Small bilateral pleural effusions, R>L. No focal consolidation or pneumothorax. Bony thorax intact.",
  },
  dermatology: {
    label: "Sample lesion",
    ctx: "62F new pigmented lesion on left shoulder, evolving over 3 months.",
    report:
      "Asymmetric pigmented macule, 8x6 mm, irregular borders, color variegation brown to black, satellite pigment noted. No ulceration.",
  },
};

export function ReportAnalyzer({ specialty }: { specialty: Specialty }) {
  const analyze = useServerFn(analyzeSpecialty);
  const { pushFeed } = useEncounter();
  const [reportText, setReportText] = useState("");
  const [contextText, setContextText] = useState("");
  const [imageDataUrl, setImageDataUrl] = useState<string | undefined>();
  const [imageName, setImageName] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SpecialtyAnalysis | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function onFile(f: File | undefined) {
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) {
      setError("Image too large (max 5 MB)");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setImageDataUrl(reader.result as string);
      setImageName(f.name);
      setError(null);
    };
    reader.readAsDataURL(f);
  }

  async function run() {
    setError(null);
    if (!reportText.trim() && !imageDataUrl) {
      setError("Provide a report text or upload an image.");
      return;
    }
    setLoading(true);
    try {
      const r = await analyze({ data: { specialty, reportText, imageDataUrl, context: contextText } });
      setResult(r);
      pushFeed({
        agent: specialty === "radiology" ? "Radiology" : "Dermatology",
        text: `Analysis complete — risk ${r.riskScore}%`,
        tone: r.riskScore > 60 ? "critical" : "ai",
      });
    } catch (e: any) {
      setError(e?.message ?? "Analysis failed");
    } finally {
      setLoading(false);
    }
  }

  function loadPreset() {
    const p = PRESETS[specialty];
    setReportText(p.report);
    setContextText(p.ctx);
    setImageDataUrl(undefined);
    setImageName(undefined);
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
      <GlassCard className="xl:col-span-2" glow="ai">
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm font-semibold flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[var(--color-ai)]" /> Analyze a report
          </div>
          <button onClick={loadPreset} className="text-[11px] rounded-md bg-white/5 hover:bg-white/10 px-2 py-1">
            Load {PRESETS[specialty].label}
          </button>
        </div>

        <label className="text-[10px] uppercase tracking-widest text-muted-foreground">Clinical context</label>
        <textarea
          value={contextText}
          onChange={(e) => setContextText(e.target.value.slice(0, 2000))}
          rows={2}
          placeholder="Age, sex, presenting complaint, relevant history…"
          className="mt-1 mb-3 w-full rounded-lg border border-white/10 bg-white/[0.03] p-2.5 text-sm placeholder:text-muted-foreground/60 focus:border-[var(--color-ai)]/40 focus:outline-none"
        />

        <label className="text-[10px] uppercase tracking-widest text-muted-foreground">
          {specialty === "radiology" ? "Radiology report / findings text" : "Lesion description / chart text"}
        </label>
        <textarea
          value={reportText}
          onChange={(e) => setReportText(e.target.value.slice(0, 20000))}
          rows={8}
          placeholder={specialty === "radiology" ? "Paste study findings, impression, prior reads…" : "Describe lesion: location, size, ABCDE, evolution…"}
          className="mt-1 mb-3 w-full rounded-lg border border-white/10 bg-white/[0.03] p-2.5 text-sm font-mono placeholder:text-muted-foreground/60 focus:border-[var(--color-ai)]/40 focus:outline-none"
        />

        <div className="flex flex-wrap items-center gap-2 mb-3">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => onFile(e.target.files?.[0])}
          />
          <button
            onClick={() => fileRef.current?.click()}
            className="text-xs inline-flex items-center gap-1.5 rounded-md bg-white/5 hover:bg-white/10 px-3 py-1.5"
          >
            <Upload className="h-3.5 w-3.5" /> {specialty === "radiology" ? "Upload study image" : "Upload lesion photo"}
          </button>
          {imageName && (
            <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
              <ImageIcon className="h-3 w-3" /> {imageName}
              <button onClick={() => { setImageDataUrl(undefined); setImageName(undefined); }} className="ml-1 rounded hover:bg-white/10 p-0.5">
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          <span className="ml-auto text-[10px] text-muted-foreground">{reportText.length}/20000</span>
        </div>

        {imageDataUrl && (
          <div className="mb-3 rounded-lg overflow-hidden border border-white/10">
            <img src={imageDataUrl} alt="uploaded" className="block w-full max-h-48 object-contain bg-black/30" />
          </div>
        )}

        <button
          onClick={run}
          disabled={loading}
          className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-[var(--color-ai)] text-[var(--color-background)] px-3 py-2 text-sm font-semibold hover:opacity-90 disabled:opacity-60"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {loading ? "Analyzing…" : "Run AI Analysis"}
        </button>
        {error && <div className="mt-3 text-xs text-[var(--color-critical)]">{error}</div>}
      </GlassCard>

      <GlassCard className="xl:col-span-3" glow={result && result.riskScore > 60 ? "critical" : "clinical"}>
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm font-semibold flex items-center gap-2">
            <FileText className="h-4 w-4 text-[var(--color-clinical)]" /> AI Analysis
          </div>
          {result && (
            <Pill tone={result.riskScore > 60 ? "critical" : result.riskScore > 30 ? "warning" : "success"}>
              Risk {result.riskScore}%
            </Pill>
          )}
        </div>

        {!result && !loading && (
          <div className="text-sm text-muted-foreground">
            Provide context, paste a report, optionally attach an image, then run analysis. The AI returns
            structured findings, impression, differential, recommended coding, and a risk score.
          </div>
        )}
        {loading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin text-[var(--color-ai)]" /> Reasoning through the case…
          </div>
        )}

        {result && (
          <div className="space-y-4 text-sm">
            {result.summary && (
              <div className="rounded-lg border border-white/5 bg-white/[0.02] p-3">
                <div className="text-[10px] uppercase tracking-widest text-[var(--color-ai)] mb-1">Summary</div>
                <p className="text-foreground/90 leading-relaxed">{result.summary}</p>
              </div>
            )}

            {result.findings.length > 0 && (
              <div>
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Findings</div>
                <div className="space-y-2">
                  {result.findings.map((f, i) => (
                    <div key={i}>
                      <div className="flex items-baseline justify-between mb-1">
                        <span>{f.label}</span>
                        <span className="font-mono text-[11px] text-muted-foreground">{f.severity} · {f.confidence}%</span>
                      </div>
                      <Bar value={f.confidence} tone={f.severity === "negative" ? "success" : f.severity === "severe" || f.severity === "moderate" ? "critical" : "warning"} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {result.impression && (
              <div className="rounded-lg border border-white/5 bg-white/[0.02] p-3">
                <div className="text-[10px] uppercase tracking-widest text-[var(--color-ai)] mb-1">Impression</div>
                <p className="text-foreground/90 leading-relaxed">{result.impression}</p>
              </div>
            )}

            {result.differential.length > 0 && (
              <div>
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Differential</div>
                <div className="space-y-2">
                  {result.differential.map((d, i) => (
                    <div key={i}>
                      <div className="flex items-baseline justify-between mb-1">
                        <span>{d.name} <span className="text-xs text-muted-foreground">({d.code})</span></span>
                        <span className="font-mono text-[11px]">{d.confidence}%</span>
                      </div>
                      <Bar value={d.confidence} tone={d.confidence > 50 ? "critical" : "clinical"} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {result.recommendations.length > 0 && (
              <div className="rounded-lg border border-white/5 bg-white/[0.02] p-3">
                <div className="text-[10px] uppercase tracking-widest text-[var(--color-ai)] mb-1">Recommendations</div>
                <ul className="list-disc pl-5 space-y-1 text-foreground/90 leading-relaxed">
                  {result.recommendations.map((r, i) => <li key={i}>{r}</li>)}
                </ul>
              </div>
            )}

            {result.coding.length > 0 && (
              <div>
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Suggested Coding</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {result.coding.map((c, i) => (
                    <div key={i} className="rounded-lg border border-white/5 bg-white/[0.02] p-2.5">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs text-[var(--color-revenue)]">{c.type} {c.code}</span>
                        <span className="font-mono text-[11px] text-muted-foreground">{c.confidence}%</span>
                      </div>
                      <div className="text-[12px] text-foreground/85">{c.name}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {result.riskRationale && (
              <div className="rounded-lg border border-[var(--color-critical)]/20 bg-[var(--color-critical)]/5 p-3">
                <div className="text-[10px] uppercase tracking-widest text-[var(--color-critical)] mb-1">Risk rationale</div>
                <p className="text-foreground/90 leading-relaxed">{result.riskRationale}</p>
              </div>
            )}
          </div>
        )}
      </GlassCard>
    </div>
  );
}