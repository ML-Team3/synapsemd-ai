import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const InputSchema = z.object({
  specialty: z.enum(["radiology", "dermatology"]),
  reportText: z.string().max(20000).optional().default(""),
  imageDataUrl: z.string().max(8_000_000).optional(),
  context: z.string().max(2000).optional().default(""),
});

export interface SpecialtyAnalysis {
  summary: string;
  findings: { label: string; confidence: number; severity: "negative" | "mild" | "moderate" | "severe" }[];
  impression: string;
  differential: { name: string; code: string; confidence: number }[];
  recommendations: string[];
  coding: { code: string; type: string; name: string; confidence: number }[];
  riskScore: number;
  riskRationale: string;
}

const RADIOLOGY_SYSTEM = `You are a board-certified radiologist AI assistant for SynapseMD AI.
Analyze the provided imaging study and/or radiology report text. Produce a structured,
evidence-based interpretation. Be specific and clinically accurate. Confidence is 0-100.
Return ONLY JSON matching the schema. Do not include markdown code fences.`;

const DERMATOLOGY_SYSTEM = `You are a board-certified dermatologist AI assistant for SynapseMD AI.
Analyze the provided clinical/dermoscopy image and/or chart text. Apply ABCDE criteria where
a pigmented lesion is present. Return ONLY JSON matching the schema. No markdown fences.`;

const SCHEMA_HINT = `Schema:
{
  "summary": string,
  "findings": [{ "label": string, "confidence": number (0-100), "severity": "negative"|"mild"|"moderate"|"severe" }],
  "impression": string,
  "differential": [{ "name": string, "code": string (ICD-10 if applicable), "confidence": number }],
  "recommendations": [string],
  "coding": [{ "code": string, "type": "CPT"|"ICD-10"|"HCPCS"|"HCC", "name": string, "confidence": number }],
  "riskScore": number (0-100, overall clinical concern),
  "riskRationale": string
}`;

function stripFences(s: string) {
  return s.replace(/^\s*```(?:json)?\s*/i, "").replace(/\s*```\s*$/i, "").trim();
}

export const analyzeSpecialty = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => InputSchema.parse(data))
  .handler(async ({ data }): Promise<SpecialtyAnalysis> => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("LOVABLE_API_KEY not configured");

    const system = data.specialty === "radiology" ? RADIOLOGY_SYSTEM : DERMATOLOGY_SYSTEM;
    const userText = [
      data.specialty === "radiology"
        ? "Analyze this radiology study and/or report."
        : "Analyze this dermatology image and/or chart context.",
      data.context ? `\nClinical context: ${data.context}` : "",
      data.reportText ? `\nReport / chart text:\n${data.reportText}` : "",
      `\n\n${SCHEMA_HINT}`,
    ].join("");

    const content: Array<Record<string, unknown>> = [{ type: "text", text: userText }];
    if (data.imageDataUrl) {
      content.push({ type: "image_url", image_url: { url: data.imageDataUrl } });
    }

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: system },
          { role: "user", content },
        ],
        response_format: { type: "json_object" },
        temperature: 0.2,
      }),
    });

    if (!res.ok) {
      const t = await res.text().catch(() => "");
      if (res.status === 429) throw new Error("Rate limited — try again in a moment.");
      if (res.status === 402) throw new Error("AI credits exhausted. Add credits to continue.");
      throw new Error(`AI Gateway ${res.status}: ${t.slice(0, 240)}`);
    }

    const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    const raw = json.choices?.[0]?.message?.content ?? "{}";
    let parsed: SpecialtyAnalysis;
    try {
      parsed = JSON.parse(stripFences(raw));
    } catch {
      throw new Error("Model returned non-JSON response");
    }
    return {
      summary: parsed.summary ?? "",
      findings: Array.isArray(parsed.findings) ? parsed.findings : [],
      impression: parsed.impression ?? "",
      differential: Array.isArray(parsed.differential) ? parsed.differential : [],
      recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : [],
      coding: Array.isArray(parsed.coding) ? parsed.coding : [],
      riskScore: typeof parsed.riskScore === "number" ? parsed.riskScore : 0,
      riskRationale: parsed.riskRationale ?? "",
    };
  });