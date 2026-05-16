const TENANT_STORAGE_KEY = 'app_tenant';

const COMMON_PREFIXES = ['www', 'app', 'admin', 'api', 'mail'];

export function getTenantFromHostname() {
  if (typeof window === 'undefined') return null;
  const hostname = window.location.hostname;

  if (!hostname || hostname === 'localhost' || hostname === '127.0.0.1') return null;

  const parts = hostname.split('.');

  if (parts.length < 3) return null;

  const subdomain = parts[0].toLowerCase();

  if (COMMON_PREFIXES.includes(subdomain)) return null;

  return subdomain;
}

export function getTenantFromParams() {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  return params.get('tenant') || null;
}

export function getTenantFromURL() {
  const fromHostname = getTenantFromHostname();
  if (fromHostname) return fromHostname;
  return getTenantFromParams();
}

export function getStoredTenant() {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(TENANT_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setStoredTenant(tenant) {
  if (typeof window === 'undefined') return;
  try {
    if (tenant) {
      localStorage.setItem(TENANT_STORAGE_KEY, tenant);
    } else {
      localStorage.removeItem(TENANT_STORAGE_KEY);
    }
  } catch {}
}
