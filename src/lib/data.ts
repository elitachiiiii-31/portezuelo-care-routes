export type Estado = "Pendiente" | "En ruta" | "En visita" | "Completada" | "Cancelada";

export interface Paciente {
  id: string;
  nombre: string;
  rut: string;
  sector: string;
  prestacion: string;
  prioridad: "Alta" | "Media" | "Baja";
  lat: number;
  lng: number;
}

export const pacientes: Paciente[] = [
  { id: "P01", nombre: "Rosa Henríquez", rut: "5.234.112-3", sector: "Portezuelo Urbano", prestacion: "Curación avanzada", prioridad: "Alta", lat: -36.5295, lng: -72.4326 },
  { id: "P02", nombre: "Luis Cartes", rut: "6.112.908-1", sector: "Cucha Cucha", prestacion: "Control PA", prioridad: "Media", lat: -36.5702, lng: -72.4815 },
  { id: "P03", nombre: "Ernestina Sáez", rut: "4.887.231-K", sector: "Llahuecuy", prestacion: "Visita postrado", prioridad: "Alta", lat: -36.4931, lng: -72.4012 },
  { id: "P04", nombre: "Héctor Muñoz", rut: "7.009.445-2", sector: "Buenos Aires", prestacion: "Toma de muestras", prioridad: "Baja", lat: -36.5521, lng: -72.3714 },
  { id: "P05", nombre: "Marta Fuentealba", rut: "5.776.020-8", sector: "Chudal", prestacion: "Insulina", prioridad: "Alta", lat: -36.5098, lng: -72.4703 },
  { id: "P06", nombre: "Juan Riquelme", rut: "6.443.871-5", sector: "Tauco", prestacion: "Kinesiología", prioridad: "Media", lat: -36.5887, lng: -72.4122 },
  { id: "P07", nombre: "Olga Parra", rut: "4.651.300-6", sector: "Portezuelo Urbano", prestacion: "Control PA", prioridad: "Baja", lat: -36.5341, lng: -72.4289 },
  { id: "P08", nombre: "Segundo Vera", rut: "5.019.882-4", sector: "Cucha Cucha", prestacion: "Curación simple", prioridad: "Media", lat: -36.5815, lng: -72.4630 },
  { id: "P09", nombre: "Inés Contreras", rut: "6.998.130-9", sector: "Llahuecuy", prestacion: "Visita postrado", prioridad: "Alta", lat: -36.4812, lng: -72.4205 },
  { id: "P10", nombre: "Pedro Sandoval", rut: "7.340.567-1", sector: "Buenos Aires", prestacion: "Insulina", prioridad: "Media", lat: -36.5612, lng: -72.3902 },
];

export const CESFAM = { lat: -36.5318, lng: -72.4302, nombre: "CESFAM Portezuelo" };

export const equipos = [
  { id: "E1", nombre: "Equipo 1 · Enf. Carla Soto", vehiculo: "Camioneta 4x4 · KJTR-21" },
  { id: "E2", nombre: "Equipo 2 · TENS Diego Rojas", vehiculo: "Furgón · LPWS-08" },
  { id: "E3", nombre: "Equipo 3 · Kine. Ana Vidal", vehiculo: "Sedán · HXZK-44" },
];

export const prioridadClass: Record<Paciente["prioridad"], string> = {
  Alta: "bg-destructive/15 text-destructive",
  Media: "bg-warning/20 text-foreground",
  Baja: "bg-success/15 text-success",
};
