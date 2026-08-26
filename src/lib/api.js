/* The frontend is hosted on cPanel while the Express API runs on a separate
   host, so requests must be sent to an absolute URL in production.

   In development VITE_API_BASE_URL is left unset and this resolves to a plain
   relative path, which the Vite dev proxy forwards to localhost:3001. */
const BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '');

/* apiUrl('/api/jobs') -> 'https://api.example.com/api/jobs' in production,
                       -> '/api/jobs' in development. */
export function apiUrl(path) {
  return `${BASE}${path}`;
}
