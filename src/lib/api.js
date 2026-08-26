/* The frontend is hosted on cPanel while the Express API runs on Railway, so
   requests must be sent to an absolute URL in production.

   In development VITE_API_BASE_URL is left unset and this resolves to a plain
   relative path, which the Vite dev proxy forwards to localhost:3001. */
function normalizeBase(raw) {
  const trimmed = (raw || '').trim().replace(/\/+$/, '');
  if (!trimmed) return '';

  /* A host with no scheme ("api.example.com") is treated by the browser as a
     relative path and gets appended to the current origin, producing requests
     to localhost:5173/api.example.com/api/... — so default it to https. */
  if (!/^https?:\/\//i.test(trimmed)) {
    return `https://${trimmed}`;
  }
  return trimmed;
}

const BASE = normalizeBase(import.meta.env.VITE_API_BASE_URL);

/* apiUrl('/api/jobs') -> 'https://your-api.up.railway.app/api/jobs' in
                          production, '/api/jobs' in development. */
export function apiUrl(path) {
  return `${BASE}${path}`;
}
