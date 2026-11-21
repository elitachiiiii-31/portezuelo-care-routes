# Portezuelo Care Routes

Panel web de coordinación logística para la atención domiciliaria rural del **CESFAM Portezuelo**, orientado a la planificación de visitas, georreferenciación de sectores rurales, optimización de rutas y trazabilidad de cierres.

## Módulos principales

- **Dashboard de KPIs:** Seguimiento de visitas programadas, cumplimiento, tiempos promedio, distancia recorrida y distribución por sectores rurales.
- **Integración (Rayen):** Importación y validación de datos de pacientes y prestaciones desde el sistema clínico Rayen hacia el backend.
- **Mapa interactivo rural:** Georreferenciación de sectores y domicilios rurales para la coordinación en terreno.
- **Planificador diario:** Optimización logística de rutas mediante **Google OR-Tools** y organización diaria de visitas.
- **Supervisión en tiempo real:** Monitoreo del estado de las rutas y visitas activas durante la jornada.
- **Auditoría y trazabilidad:** Registro y revisión de cierres de visita manuales y automáticos por GPS.

## Stack tecnológico

- **Frontend:** React, TypeScript, Vite, TanStack Router y Tailwind CSS.
- **Backend y datos:** Python, Django, PostgreSQL / Supabase, Google OR-Tools y Google Maps API.

## Desarrollo local

1. Clona el repositorio e instala las dependencias:

```sh
git clone <url-de-tu-repositorio>
cd portezuelo-care-routes
npm install