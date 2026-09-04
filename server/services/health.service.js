export function getHealthStatus() {
  return {
    success: true,
    status: "ok",
    service: "trendgo-api",
    timestamp: new Date().toISOString(),
  };
}
