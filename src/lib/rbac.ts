// Role-based access control for SynapseMD (demo/mock).
// In production these permissions should come from backend JWT/session claims
// hydrated at login (e.g. RBAC service or hasura/postgrest policies) — NOT
// from client-side localStorage as they are here.
import type { Role } from "./auth-store";

// Route paths each role can access (in addition to auth routes).
export const ROLE_ROUTES: Record<Role, readonly string[]> = {
  physician:     ["/", "/clinical", "/scribe", "/revenue"],
  radiologist:   ["/radiology", "/specialty"],
  dermatologist: ["/dermatology", "/specialty"],
  coder:         ["/revenue"],
  billing:       ["/revenue"],
  compliance:    ["/operations"],
  admin:         ["/", "/admin", "/operations", "/interop", "/ai", "/clinical", "/scribe", "/specialty", "/radiology", "/dermatology", "/revenue"],
};

// Feature-level permission keys used across the platform. Keep in sync with
// backend permission strings when wired up.
export const ROLE_PERMISSIONS: Record<Role, readonly string[]> = {
  physician:     ["command-center", "clinical-intelligence", "ambient-scribe", "orders", "patient-timeline", "revenue-summary"],
  radiologist:   ["radiology-workspace", "imaging-studies", "ai-findings", "report-builder", "coding-suggestions"],
  dermatologist: ["dermatology-workspace", "lesion-analysis", "risk-assessment", "treatment-plan", "coding-suggestions"],
  coder:         ["coding-workbench", "icd-cpt-review", "hcc-capture", "claim-validation"],
  billing:       ["claim-validation", "denial-risk", "revenue-recovery", "payer-review"],
  compliance:    ["audit-logs", "phi-access", "user-activity", "compliance-dashboard"],
  admin:         ["admin-dashboard", "user-access-management", "user-roles", "integrations", "rbac", "system-health", "audit-logs"],
};

export function canAccessPage(role: Role | null | undefined, path: string): boolean {
  if (!role) return false;
  const allowed = ROLE_ROUTES[role];
  return allowed.includes(path);
}

export function getRolePermissions(role: Role | null | undefined): readonly string[] {
  return role ? ROLE_PERMISSIONS[role] : [];
}