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
export interface PayloadEstadoVisita {
  visitaId: string | number;
  estado: "Pendiente" | "En ruta" | "En visita" | "Completada" | "Rechazada";
  observacion?: string;
  timestamp: string;
}

export interface NuevoPacienteTerreno {
  run: string;
  nombreCompleto: string;
  fichaClinica: string;
  sector: string;
  referenciaAcceso: string;
  telefonoCuidador: string;
  reqClinico: string;
  latitud?: number | null;
  longitud?: number | null;
  registradoPor: string;
  timestamp: string;
}

export async function actualizarEstadoVisitaAPI(payload: PayloadEstadoVisita) {
  const response = await fetch(`${API_BASE_URL}/visitas/${payload.visitaId}/`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      estado: payload.estado,
      observacion: payload.observacion ?? "",
      ultima_senal: payload.timestamp,
    }),
  });

  if (!response.ok) {
    throw new Error(`Error al actualizar visita (${response.status})`);
  }

  return await response.json();
}

export async function crearPacienteTerrenoAPI(paciente: NuevoPacienteTerreno) {
  const response = await fetch(`${API_BASE_URL}/pacientes/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(paciente),
  });

  if (!response.ok) {
    throw new Error(`Error al guardar paciente (${response.status})`);
  }

  return await response.json();
}