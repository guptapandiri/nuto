/**
 * The Netlify build sets VITE_API_URL to the public Cloud Run origin, e.g.
 * https://nuto-api-xxxxx-uc.a.run.app. Leaving it empty keeps local
 * development on Vite's /api proxy.
 */
const configuredApiUrl = import.meta.env.VITE_API_URL?.trim().replace(/\/+$/, '');

export function apiUrl(path: string): string {
  return configuredApiUrl ? `${configuredApiUrl}${path}` : path;
}
