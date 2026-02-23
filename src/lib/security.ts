// ==========================================
// Frontend Security Utilities
// ==========================================

// Rate limiter - prevents rapid repeated actions
const rateLimitMap = new Map<string, number[]>();

export function checkRateLimit(key: string, maxAttempts: number = 5, windowMs: number = 60000): boolean {
  const now = Date.now();
  const attempts = rateLimitMap.get(key) || [];
  const recent = attempts.filter(t => now - t < windowMs);
  if (recent.length >= maxAttempts) return false;
  recent.push(now);
  rateLimitMap.set(key, recent);
  return true;
}

// Session timeout manager
const SESSION_TIMEOUT_KEY = "session_timeout_minutes";
const LAST_ACTIVITY_KEY = "last_activity_timestamp";

export function setSessionTimeout(minutes: number) {
  localStorage.setItem(SESSION_TIMEOUT_KEY, String(minutes));
}

export function getSessionTimeout(): number {
  return parseInt(localStorage.getItem(SESSION_TIMEOUT_KEY) || "60", 10);
}

export function updateLastActivity() {
  localStorage.setItem(LAST_ACTIVITY_KEY, String(Date.now()));
}

export function isSessionExpired(): boolean {
  const timeout = getSessionTimeout();
  if (timeout <= 0) return false; // 0 = no timeout
  const lastActivity = parseInt(localStorage.getItem(LAST_ACTIVITY_KEY) || "0", 10);
  if (!lastActivity) return false;
  return Date.now() - lastActivity > timeout * 60 * 1000;
}

// Last login tracking
export function recordLastLogin(userId: string) {
  const loginHistory = JSON.parse(localStorage.getItem("login_history") || "[]");
  loginHistory.unshift({
    userId,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
  });
  // Keep only last 10 entries
  localStorage.setItem("login_history", JSON.stringify(loginHistory.slice(0, 10)));
}

export function getLoginHistory(): Array<{ userId: string; timestamp: string; userAgent: string }> {
  return JSON.parse(localStorage.getItem("login_history") || "[]");
}

// Input sanitizer - strip potential XSS
export function sanitizeInput(input: string): string {
  return input
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
    .replace(/javascript:/gi, "")
    .replace(/on\w+=/gi, "");
}

// Validate URL to prevent open redirects
export function isSafeUrl(url: string): boolean {
  try {
    const parsed = new URL(url, window.location.origin);
    return parsed.origin === window.location.origin;
  } catch {
    return url.startsWith("/") && !url.startsWith("//");
  }
}
