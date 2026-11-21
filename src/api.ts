const rawApiUrl = import.meta.env.VITE_API_URL?.trim() || "http://localhost:8000/api";
const API_BASE_URL = rawApiUrl.replace(/\/+$/, "");

export async function fetchDashboardMetrics() {
  const response = await fetch(`${API_BASE_URL}/dashboard-metrics/`);
  if (!response.ok) {
    throw new Error(`Error al obtener métricas (${response.status})`);
  }
  return await response.json();
}

export async function importarDesdeRayen() {
  const response = await fetch(`${API_BASE_URL}/importar-rayen/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) {
    throw new Error(`Error al importar desde Rayen (${response.status})`);
  }
  return await response.json();
}

export async function obtenerRutaOptimizada() {
  const response = await fetch(`${API_BASE_URL}/optimizar-ruta/`);
  if (!response.ok) {
    throw new Error(`Error al optimizar ruta (${response.status})`);
  }
  return await response.json();
}