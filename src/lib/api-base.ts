const configuredApiBaseUrl = import.meta.env["VITE_API_BASE_URL"] ?? "http://localhost:5000/api";

export function getApiBaseUrl() {
  if (typeof window === "undefined") return configuredApiBaseUrl;

  const browserHost = window.location.hostname;
  if (browserHost === "localhost" || browserHost === "127.0.0.1" || browserHost === "[::1]") {
    return configuredApiBaseUrl;
  }

  try {
    const apiUrl = new URL(configuredApiBaseUrl);
    if (apiUrl.hostname === "localhost" || apiUrl.hostname === "127.0.0.1") {
      apiUrl.hostname = browserHost;
    }
    return apiUrl.toString().replace(/\/$/, "");
  } catch {
    return configuredApiBaseUrl;
  }
}
