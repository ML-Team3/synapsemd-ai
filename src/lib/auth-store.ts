import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Role =
  | "physician"
  | "radiologist"
  | "dermatologist"
  | "coder"
  | "billing"
  | "compliance"
  | "admin";

export interface AuthUser {
  name: string;
  email: string;
  role: Role | null;
  loginAt: number;
  lastLogin?: number;
  device: string;
  ip: string;
}

export const ROLE_LABEL: Record<Role, string> = {
  physician: "Physician",
  radiologist: "Radiologist",
  dermatologist: "Dermatologist",
  coder: "Medical Coder",
  billing: "Billing Specialist",
  compliance: "Compliance Officer",
  admin: "System Administrator",
};

export const ROLE_HOME: Record<Role, string> = {
  physician: "/",
  radiologist: "/radiology",
  dermatologist: "/dermatology",
  coder: "/revenue",
  billing: "/revenue",
  compliance: "/operations",
  admin: "/admin",
};

interface AuthState {
  user: AuthUser | null;
  mfaPending: boolean;
  rolePending: boolean;
  signIn: (email: string) => void;
  verifyMfa: () => void;
  setRole: (r: Role) => void;
  signOut: () => void;
  touch: () => void;
  lastActivity: number;
}

function detectDevice() {
  if (typeof navigator === "undefined") return "Unknown";
  const ua = navigator.userAgent;
  if (/iPhone|iPad/.test(ua)) return "iOS";
  if (/Android/.test(ua)) return "Android";
  if (/Mac/.test(ua)) return "macOS · Chrome";
  if (/Windows/.test(ua)) return "Windows · Chrome";
  return "Web";
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      mfaPending: false,
      rolePending: false,
      lastActivity: Date.now(),
      signIn: (email) => {
        const prev = get().user?.loginAt;
        set({
          mfaPending: true,
          rolePending: false,
          user: {
            name: email.split("@")[0].split(".").map((s) => s[0]?.toUpperCase() + s.slice(1)).join(" ") || "Dr. John Smith",
            email,
            role: null,
            loginAt: Date.now(),
            lastLogin: prev,
            device: detectDevice(),
            ip: "10.42.18.221",
          },
        });
      },
      verifyMfa: () => set({ mfaPending: false, rolePending: true }),
      setRole: (r) =>
        set((s) => ({
          rolePending: false,
          user: s.user ? { ...s.user, role: r } : s.user,
        })),
      signOut: () => set({ user: null, mfaPending: false, rolePending: false }),
      touch: () => set({ lastActivity: Date.now() }),
    }),
    { name: "synapsemd-auth" },
  ),
);

export function isAuthRoute(path: string) {
  return (
    path === "/login" ||
    path === "/mfa" ||
    path === "/role-select" ||
    path === "/forgot-password" ||
    path === "/reset-password"
  );
}