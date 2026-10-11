import { useCallback, useEffect, useState } from 'react';

// FastAPI errors: detail is a string, a list of field errors, or an object ({message, ...}).
export function errMsg(err, fallback = 'Something went wrong') {
  const d = err?.response?.data?.detail;
  if (!d) return err?.message || fallback;
  if (typeof d === 'string') return d;
  if (Array.isArray(d)) return d.map((e) => `${(e.loc || []).slice(1).join('.')}: ${e.msg}`).join('; ');
  return d.message || fallback;
}

export const inr = (n) => (n == null ? '—' : `₹${Math.round(n).toLocaleString('en-IN')}`);
export const num = (n) => (n == null ? '—' : Number(n).toLocaleString('en-IN'));
export const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—');
export const fmtDateTime = (d) =>
  d ? new Date(d).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—';
export const label = (s) => (s ? s.replace(/_/g, ' ') : '');
export const today = () => new Date().toISOString().slice(0, 10);

// Loads data on mount / when deps change; exposes reload().
export function useAsync(fn, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await fn());
    } catch (e) {
      setError(errMsg(e));
    } finally {
      setLoading(false);
    }
  }, deps);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, error, reload: load, setData };
}

// Admin lists are capped at 200 per request by the backend; page through to get everything.
export async function fetchAll(getPage, pageSize = 200) {
  const out = [];
  for (let offset = 0; ; offset += pageSize) {
    const page = await getPage({ limit: pageSize, offset });
    out.push(...page);
    if (page.length < pageSize) return out;
  }
}

// Debounce a fast-changing value (search boxes) before it triggers a request.
export function useDebounced(value, ms = 300) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}

export const ROLE_LABEL = { central_admin: 'Central admin', student: 'Student', visitor: 'Visitor' };
