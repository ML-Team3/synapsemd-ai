import { create } from "zustand";

export type AgentStatus = "idle" | "listening" | "thinking" | "complete" | "alert";

export interface Agent {
  id: string;
  name: string;
  status: AgentStatus;
  confidence: number;
  task: string;
  lastAction: string;
}

export interface Diagnosis {
  code: string;
  name: string;
  confidence: number;
  evidence: string[];
}

export interface Order {
  id: string;
  name: string;
  category: string;
  approved: boolean;
  sentToEhr: boolean;
}

export interface TranscriptLine {
  id: string;
  speaker: "Dr. Chen" | "John Doe";
  text: string;
  ts: string;
  confidence: number;
}

export interface FeedItem {
  id: string;
  agent: string;
  text: string;
  ts: number;
  tone?: "ai" | "clinical" | "revenue" | "success" | "warning" | "critical";
}

export type Stage =
  | "Patient Intake"
  | "Clinical Assessment"
  | "Risk Evaluation"
  | "Orders Generated"
  | "Documentation Complete"
  | "Coding Complete"
  | "Claim Validation"
  | "EHR Synchronization";

export const STAGES: Stage[] = [
  "Patient Intake",
  "Clinical Assessment",
  "Risk Evaluation",
  "Orders Generated",
  "Documentation Complete",
  "Coding Complete",
  "Claim Validation",
  "EHR Synchronization",
];

interface EncounterState {
  patient: {
    name: string;
    age: number;
    sex: string;
    mrn: string;
    room: string;
    priority: "Critical" | "High" | "Routine";
    allergies: string[];
    pmh: string[];
    meds: string[];
    chiefComplaint: string[];
  };
  startedAt: number;
  stageIndex: number;
  agents: Agent[];
  diagnoses: Diagnosis[];
  riskScore: number;
  riskPrev: number;
  orders: Order[];
  transcript: TranscriptLine[];
  feed: FeedItem[];
  soap: { S: string; O: string; A: string; P: string };
  coding: { code: string; name: string; type: string; confidence: number; rvu: number }[];
  claimReadiness: number;
  ehrSync: number;
  approveOrder: (id: string) => void;
  removeOrder: (id: string) => void;
  sendOrdersToEhr: () => void;
  pushFeed: (item: Omit<FeedItem, "id" | "ts">) => void;
  tick: () => void;
}

const initialDiagnoses: Diagnosis[] = [
  { code: "I20.9", name: "Acute Coronary Syndrome", confidence: 41, evidence: ["Crushing chest pain", "Diaphoresis", "Male, 54", "HTN, DM2, HLD"] },
  { code: "I26.99", name: "Pulmonary Embolism", confidence: 24, evidence: ["Shortness of breath", "Acute onset"] },
  { code: "K21.9", name: "GERD", confidence: 15, evidence: ["Substernal pain"] },
  { code: "R07.2", name: "Precordial pain", confidence: 12, evidence: ["Chest pain NOS"] },
];

const initialAgents: Agent[] = [
  { id: "ambient", name: "Ambient Agent", status: "listening", confidence: 97, task: "Transcribing live conversation", lastAction: "Captured 'pressure in center of chest'" },
  { id: "diagnostic", name: "Diagnostic Agent", status: "thinking", confidence: 78, task: "Refining differential", lastAction: "Increased ACS probability to 78%" },
  { id: "evidence", name: "Evidence Agent", status: "thinking", confidence: 92, task: "Matching AHA 2024 NSTEMI guideline", lastAction: "Linked Class I troponin recommendation" },
  { id: "risk", name: "Risk Agent", status: "alert", confidence: 88, task: "HEART score recalculation", lastAction: "Risk elevated from 58% → 84%" },
  { id: "coding", name: "Coding Agent", status: "thinking", confidence: 71, task: "Evaluating I21.4 vs R07.9", lastAction: "Promoted to NSTEMI candidate" },
  { id: "claim", name: "Claim Agent", status: "idle", confidence: 64, task: "Awaiting documentation", lastAction: "Medical necessity 2/3 met" },
  { id: "safety", name: "Safety Agent", status: "complete", confidence: 99, task: "Drug & allergy screen", lastAction: "No PCN exposure in plan" },
  { id: "ehr", name: "EHR Agent", status: "idle", confidence: 100, task: "Queued for Epic sync", lastAction: "Connection healthy" },
];

let feedCounter = 0;
const mkId = () => `f${++feedCounter}_${Date.now()}`;

export const useEncounter = create<EncounterState>((set) => ({
  patient: {
    name: "John Doe",
    age: 54,
    sex: "Male",
    mrn: "MRN-008-2241",
    room: "ED-7",
    priority: "Critical",
    allergies: ["Penicillin"],
    pmh: ["Type 2 Diabetes", "Hypertension", "Hyperlipidemia"],
    meds: ["Metformin 1000mg BID", "Lisinopril 20mg QD", "Atorvastatin 40mg QHS"],
    chiefComplaint: ["Crushing chest pain", "Shortness of breath", "Diaphoresis"],
  },
  startedAt: Date.now() - 1000 * 60 * 14,
  stageIndex: 3,
  agents: initialAgents,
  diagnoses: initialDiagnoses,
  riskScore: 84,
  riskPrev: 58,
  orders: [
    { id: "o1", name: "Troponin I (high-sensitivity)", category: "Lab", approved: true, sentToEhr: false },
    { id: "o2", name: "CBC with differential", category: "Lab", approved: true, sentToEhr: false },
    { id: "o3", name: "Basic Metabolic Panel", category: "Lab", approved: true, sentToEhr: false },
    { id: "o4", name: "Chest X-Ray, 2 views", category: "Imaging", approved: false, sentToEhr: false },
    { id: "o5", name: "12-lead ECG", category: "Diagnostic", approved: true, sentToEhr: true },
    { id: "o6", name: "Aspirin 325mg PO STAT", category: "Medication", approved: false, sentToEhr: false },
  ],
  transcript: [
    { id: "t1", speaker: "Dr. Chen", text: "Can you describe your pain?", ts: "00:14", confidence: 0.99 },
    { id: "t2", speaker: "John Doe", text: "It feels like pressure in the center of my chest.", ts: "00:19", confidence: 0.97 },
    { id: "t3", speaker: "Dr. Chen", text: "Does it radiate anywhere?", ts: "00:24", confidence: 0.99 },
    { id: "t4", speaker: "John Doe", text: "Into my jaw and left arm.", ts: "00:28", confidence: 0.96 },
    { id: "t5", speaker: "Dr. Chen", text: "Any shortness of breath?", ts: "00:33", confidence: 0.99 },
    { id: "t6", speaker: "John Doe", text: "Yes, since about an hour ago.", ts: "00:37", confidence: 0.95 },
  ],
  feed: [
    { id: mkId(), agent: "Ambient", text: "Detected symptom: jaw radiation", ts: Date.now() - 60000, tone: "ai" },
    { id: mkId(), agent: "Diagnostic", text: "ACS probability increased to 78%", ts: Date.now() - 48000, tone: "clinical" },
    { id: mkId(), agent: "Risk", text: "Cardiac event risk 58% → 84%", tone: "critical", ts: Date.now() - 36000 },
    { id: mkId(), agent: "Order", text: "Generated Troponin, CBC, BMP, CXR", tone: "ai", ts: Date.now() - 24000 },
    { id: mkId(), agent: "Coding", text: "Recommendation: I21.4 NSTEMI (71% conf)", tone: "revenue", ts: Date.now() - 12000 },
    { id: mkId(), agent: "Safety", text: "Allergy check passed (Penicillin avoided)", tone: "success", ts: Date.now() - 4000 },
  ],
  soap: {
    S: "54M with crushing substernal chest pain x1h, radiating to jaw and left arm. Associated with dyspnea and diaphoresis. PMH: T2DM, HTN, HLD.",
    O: "BP 162/98, HR 104, RR 22, SpO2 94% RA. Diaphoretic, anxious. CV: regular, no murmurs. Lungs CTA bilaterally. ECG: ST depressions V4-V6.",
    A: "Acute Coronary Syndrome — high suspicion NSTEMI. HEART score 7 (high risk).",
    P: "ASA 325mg PO, heparin per protocol, serial troponins, cardiology consult, admit to telemetry. Continue home meds, hold metformin pending contrast.",
  },
  coding: [
    { code: "I21.4", name: "Non-ST elevation MI", type: "ICD-10", confidence: 71, rvu: 3.86 },
    { code: "I10", name: "Essential hypertension", type: "ICD-10", confidence: 98, rvu: 0.0 },
    { code: "E11.9", name: "Type 2 diabetes mellitus", type: "ICD-10", confidence: 98, rvu: 0.0 },
    { code: "99285", name: "ED visit, high complexity", type: "CPT", confidence: 94, rvu: 6.5 },
    { code: "93010", name: "ECG interpretation", type: "CPT", confidence: 99, rvu: 0.4 },
    { code: "HCC 86", name: "Acute MI", type: "HCC", confidence: 71, rvu: 0.0 },
  ],
  claimReadiness: 82,
  ehrSync: 64,

  approveOrder: (id) =>
    set((s) => ({
      orders: s.orders.map((o) => (o.id === id ? { ...o, approved: true } : o)),
      feed: [
        { id: mkId(), agent: "Order", text: `Approved: ${s.orders.find((o) => o.id === id)?.name}`, ts: Date.now(), tone: "success" as const },
        ...s.feed,
      ].slice(0, 40),
    })),
  removeOrder: (id) =>
    set((s) => ({ orders: s.orders.filter((o) => o.id !== id) })),
  sendOrdersToEhr: () =>
    set((s) => ({
      orders: s.orders.map((o) => (o.approved ? { ...o, sentToEhr: true } : o)),
      ehrSync: Math.min(100, s.ehrSync + 18),
      claimReadiness: Math.min(100, s.claimReadiness + 6),
      feed: [
        { id: mkId(), agent: "EHR", text: "Orders synchronized to Epic Hyperdrive", ts: Date.now(), tone: "success" as const },
        ...s.feed,
      ].slice(0, 40),
    })),
  pushFeed: (item) =>
    set((s) => ({
      feed: [{ id: mkId(), ts: Date.now(), ...item }, ...s.feed].slice(0, 40),
    })),
  tick: () =>
    set((s) => {
      // gently nudge a few metrics; rotate an agent status
      const nextAgents = s.agents.map((a, i) =>
        i === Math.floor(Math.random() * s.agents.length)
          ? { ...a, confidence: Math.min(99, a.confidence + (Math.random() > 0.5 ? 1 : -1)) }
          : a,
      );
      return { agents: nextAgents };
    }),
}));

export function formatDuration(ms: number) {
  const m = Math.floor(ms / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return `${m}m ${s.toString().padStart(2, "0")}s`;
}