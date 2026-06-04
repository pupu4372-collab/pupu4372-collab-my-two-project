/** App-level session policy (Supabase auth cookies stay on SSR defaults). */

export const AUTH_SESSION_MAX_MS = 3 * 60 * 60 * 1000;

const REMEMBER_KEY = "ksaju_auth_remember";
const LOGIN_AT_KEY = "ksaju_auth_login_at";
const SESSION_ALIVE_KEY = "ksaju_auth_session_alive";
const OAUTH_REMEMBER_COOKIE = "auth_remember_me";

function isBrowser() {
  return typeof window !== "undefined";
}

export function commitLoginPolicy(rememberMe: boolean) {
  if (!isBrowser()) return;

  localStorage.setItem(REMEMBER_KEY, rememberMe ? "1" : "0");
  localStorage.setItem(LOGIN_AT_KEY, String(Date.now()));

  if (rememberMe) {
    sessionStorage.removeItem(SESSION_ALIVE_KEY);
  } else {
    sessionStorage.setItem(SESSION_ALIVE_KEY, "1");
  }
}

/** Survives OAuth redirect (read in callback / first auth event). */
export function prepareOAuthLogin(rememberMe: boolean) {
  if (!isBrowser()) return;
  document.cookie = `${OAUTH_REMEMBER_COOKIE}=${rememberMe ? "1" : "0"}; path=/; max-age=600; SameSite=Lax`;
  if (!rememberMe) {
    sessionStorage.setItem(SESSION_ALIVE_KEY, "1");
  }
}

export function finalizeOAuthLoginPolicy() {
  if (!isBrowser()) return;

  const match = document.cookie.match(new RegExp(`(?:^|; )${OAUTH_REMEMBER_COOKIE}=([^;]*)`));
  if (!match) return;

  const rememberMe = decodeURIComponent(match[1] ?? "") === "1";
  commitLoginPolicy(rememberMe);

  document.cookie = `${OAUTH_REMEMBER_COOKIE}=; path=/; max-age=0`;
}

/** One-time for sessions created before this policy shipped. */
export function ensurePolicyInitialized(isAnonymous: boolean) {
  if (!isBrowser() || isAnonymous) return;
  if (localStorage.getItem(LOGIN_AT_KEY)) return;
  commitLoginPolicy(true);
  markSessionAlive();
}

export function markSessionAlive() {
  if (!isBrowser()) return;
  sessionStorage.setItem(SESSION_ALIVE_KEY, "1");
}

export function shouldInvalidateSession(): boolean {
  if (!isBrowser()) return false;

  const loginAt = Number(localStorage.getItem(LOGIN_AT_KEY) ?? "0");
  if (loginAt > 0 && Date.now() - loginAt > AUTH_SESSION_MAX_MS) {
    return true;
  }

  const rememberMe = localStorage.getItem(REMEMBER_KEY) === "1";
  if (!rememberMe && sessionStorage.getItem(SESSION_ALIVE_KEY) !== "1") {
    return true;
  }

  return false;
}

export function clearAuthSessionPolicy() {
  if (!isBrowser()) return;

  localStorage.removeItem(REMEMBER_KEY);
  localStorage.removeItem(LOGIN_AT_KEY);
  sessionStorage.removeItem(SESSION_ALIVE_KEY);
  document.cookie = `${OAUTH_REMEMBER_COOKIE}=; path=/; max-age=0`;
}
