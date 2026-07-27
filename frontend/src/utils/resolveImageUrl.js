// Recipe photos are stored as paths like "/uploads/169...jpg" relative to the API server.
// In dev, Vite proxies that path to the backend automatically. In production, if the
// frontend is deployed separately from the API (its own domain), we need to prefix the
// path with the API's origin, derived from VITE_API_URL, or the images will 404.
const apiBaseUrl = import.meta.env.VITE_API_URL || '';
const apiOrigin = apiBaseUrl.replace(/\/api\/?$/, '');

export function resolveImageUrl(path) {
  if (!path) return '';
  if (/^https?:\/\//i.test(path)) return path; // already absolute
  return `${apiOrigin}${path}`;
}
