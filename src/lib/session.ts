// Backend-ready session helpers. The frontend detects device/browser locally
// today; IP address / last login / MFA status must eventually come from
// GET /auth/session (backed by request headers like X-Forwarded-For,
// X-Real-IP, CF-Connecting-IP or the reverse-proxy trusted client IP).

export interface DeviceInfo {
  os: string;
  browser: string;
  deviceType: "Desktop" | "Mobile" | "Tablet" | "Unknown";
  label: string; // e.g. "Windows · Chrome"
}

export function detectDeviceInfo(): DeviceInfo {
  if (typeof navigator === "undefined") {
    return { os: "Unknown", browser: "Unknown", deviceType: "Unknown", label: "Unknown" };
  }
  const ua = navigator.userAgent;

  let os = "Unknown";
  if (/Windows NT/i.test(ua)) os = "Windows";
  else if (/Mac OS X|Macintosh/i.test(ua)) os = "macOS";
  else if (/iPhone|iPad|iPod/i.test(ua)) os = /iPad/i.test(ua) ? "iPad" : "iPhone";
  else if (/Android/i.test(ua)) os = "Android";
  else if (/Linux/i.test(ua)) os = "Linux";

  let browser = "Browser";
  if (/Edg\//i.test(ua)) browser = "Edge";
  else if (/OPR\/|Opera/i.test(ua)) browser = "Opera";
  else if (/Chrome\//i.test(ua) && !/Edg\//i.test(ua)) browser = /Mobile/i.test(ua) ? "Chrome" : "Chrome";
  else if (/Firefox\//i.test(ua)) browser = "Firefox";
  else if (/Safari\//i.test(ua) && !/Chrome\//i.test(ua)) browser = /Mobile/i.test(ua) ? "Mobile Safari" : "Safari";

  let deviceType: DeviceInfo["deviceType"] = "Desktop";
  if (/iPad|Tablet/i.test(ua)) deviceType = "Tablet";
  else if (/Mobile|iPhone|Android/i.test(ua)) deviceType = "Mobile";

  return { os, browser, deviceType, label: `${os} · ${browser}` };
}

export interface SessionDetails {
  user: { name: string; email: string; role: string };
  session: {
    status: "Online" | "Not Active";
    mfa_verified: boolean;
    session_secured: boolean;
    last_login: string; // formatted for display
    device: string;
    ip_address: string;
  };
}

// Frontend-shaped session fetcher. Wire this to `GET /auth/session` when the
// backend is available; return the exact same shape so components don't change.
export function getSessionDetails(input: {
  name: string;
  email: string;
  role: string;
  authenticated: boolean;
  mfaVerified: boolean;
  lastLoginMs?: number;
}): SessionDetails {
  const device = detectDeviceInfo().label;
  const last = input.lastLoginMs
    ? new Date(input.lastLoginMs).toLocaleString([], {
        month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
      })
    : "—";
  return {
    user: { name: input.name, email: input.email, role: input.role },
    session: {
      status: input.authenticated ? "Online" : "Not Active",
      mfa_verified: input.mfaVerified,
      session_secured: input.authenticated,
      last_login: last,
      device,
      // IP MUST come from backend (request headers). Never fabricate on client.
      ip_address: "Pending backend connection",
    },
  };
}