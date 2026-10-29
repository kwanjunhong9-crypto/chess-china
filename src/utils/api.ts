// Cloud App Base URL
export const CLOUD_SERVER_URL = 'https://ais-dev-iiofbklgkjac3wlg3rx5gl-540677228773.asia-east1.run.app';

/**
 * Returns the proper API URL based on current runtime environment:
 * - If running in native Capacitor (capacitor://), file://, or standalone mobile build,
 *   it directs requests to the remote cloud server so all devices share the same live database.
 * - If running in standard browser/PWA, it uses relative paths (/api/...) directly.
 */
export function getApiUrl(path: string): string {
  if (typeof window === 'undefined') return path;

  const isNativeApp =
    window.location.protocol === 'file:' ||
    window.location.protocol === 'capacitor:' ||
    (window.location.hostname === 'localhost' && window.location.port !== '3000');

  if (isNativeApp) {
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${CLOUD_SERVER_URL}${cleanPath}`;
  }

  return path;
}
