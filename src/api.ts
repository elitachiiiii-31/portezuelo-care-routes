// URL base de tu backend corriendo en Docker
const API_BASE_URL = "http://localhost:8000/api";

// 1. Obtener métricas para el Dashboard
export async function fetchDashboardMetrics() {
  const response = await fetch(`${API_BASE_URL}/dashboard-metrics/`);
  return await response.json();
}

// 2. Simular importación desde Rayen (Petición POST)
export async function importarDesdeRayen() {
  const response = await fetch(`${API_BASE_URL}/importar-rayen/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });
  return await response.json();
}

// 3. Obtener la ruta optimizada con Google OR-Tools
export async function obtenerRutaOptimizada() {
  const response = await fetch(`${API_BASE_URL}/optimizar-ruta/`);
  return await response.json();
}