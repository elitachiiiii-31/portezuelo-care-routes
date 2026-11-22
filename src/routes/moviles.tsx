import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Car, MapPin, Navigation, RefreshCw, Route as RouteIcon } from "lucide-react";
import { PageHeader, Btn } from "../components/AppShell";

export const Route = createFileRoute("/moviles")({
  component: EstadoMovilesPage,
});

type EstadoOperativoMovil =
  | "En ruta activa"
  | "En atención domiciliaria"
  | "En base / Retorno";

interface EstadoMovil {
  id: string;
  movil: string;
  chofer: string;
  equipoClinico: string;
  rutaAsignada: string;
  sectorActual: string;
  proximaParada: string;
  estadoOperativo: EstadoOperativoMovil;
  kmRecorridos: number;
  progresoVisitas: string;
  lat: number;
  lng: number;
}

const MOVILES_INICIALES: EstadoMovil[] = [
  {
    id: "m-1",
    movil: "Móvil 1",
    chofer: "Marcos Ruiz",
    equipoClinico: "Enf. Carla Soto",
    rutaAsignada: "Ruta Norte · Urbano y Buenos Aires",
    sectorActual: "Buenos Aires",
    proximaParada: "Héctor Muñoz (08:30 hrs)",
    estadoOperativo: "En ruta activa",
    kmRecorridos: 11.6,
    progresoVisitas: "1 / 2 visitas",
    lat: -36.542,
    lng: -72.419,
  },
  {
    id: "m-2",
    movil: "Móvil 2",
    chofer: "Patricio Lagos",
    equipoClinico: "TENS Diego Rojas",
    rutaAsignada: "Ruta Oriente · Cucha Cucha y Chudal",
    sectorActual: "Cucha Cucha",
    proximaParada: "Luis Cartes (09:15 hrs)",
    estadoOperativo: "En ruta activa",
    kmRecorridos: 20.6,
    progresoVisitas: "0 / 2 visitas",
    lat: -36.551,
    lng: -72.462,
  },
  {
    id: "m-3",
    movil: "Móvil 3",
    chofer: "Claudio Vera",
    equipoClinico: "Kine. Ana Vidal",
    rutaAsignada: "Ruta Sur-Poniente · Llahuecuy y Tauco",
    sectorActual: "Tauco",
    proximaParada: "Juan Riquelme (10:30 hrs)",
    estadoOperativo: "En atención domiciliaria",
    kmRecorridos: 23.4,
    progresoVisitas: "1 / 2 visitas",
    lat: -36.564,
    lng: -72.445,
  },
];

function EstadoMovilesPage() {
  const [filtroEstado, setFiltroEstado] = useState<string>("Todos");
  const [moviles, setMoviles] = useState<EstadoMovil[]>(MOVILES_INICIALES);
  const [ultimaActualizacion, setUltimaActualizacion] = useState<string>(
    new Date().toLocaleTimeString("es-CL")
  );

  const movilesFiltrados = useMemo(() => {
    if (filtroEstado === "Todos") return moviles;
    return moviles.filter((m) => m.estadoOperativo === filtroEstado);
  }, [moviles, filtroEstado]);

  function refrescarEstado() {
    setMoviles([...MOVILES_INICIALES]);
    setUltimaActualizacion(new Date().toLocaleTimeString("es-CL"));
  }

  return (
    <div className="max-w-5xl">
      <PageHeader
        title="Estado de Móviles · Coordinación"
        subtitle="Seguimiento operativo de móviles, ruta en curso, sector actual y avance por equipo"
        action={
          <Btn variant="ghost" onClick={refrescarEstado}>
            <RefreshCw className="h-4 w-4" />
            Actualizar ({ultimaActualizacion})
          </Btn>
        }
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card p-4">
        <div className="flex flex-wrap items-center gap-2">
          {(
            [
              "Todos",
              "En ruta activa",
              "En atención domiciliaria",
              "En base / Retorno",
            ] as const
          ).map((estado) => (
            <Btn
              key={estado}
              variant={filtroEstado === estado ? "primary" : "ghost"}
              onClick={() => setFiltroEstado(estado)}
            >
              {estado}
            </Btn>
          ))}
        </div>

        <span className="text-xs text-muted-foreground">
          Móviles visibles: <strong>{movilesFiltrados.length}</strong>
        </span>
      </div>

      <div className="space-y-4">
        {movilesFiltrados.map((m) => {
          const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${m.lat},${m.lng}`;

          return (
            <div key={m.id} className="rounded-xl border bg-card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1 font-semibold text-foreground">
                      <Car className="h-4 w-4" /> {m.movil}
                    </span>
                    <span>· Chofer: {m.chofer}</span>
                    <span>· Equipo: {m.equipoClinico}</span>
                  </div>

                  <h2 className="mt-1 inline-flex items-center gap-1.5 text-lg font-semibold">
                    <RouteIcon className="h-4 w-4 text-primary" />
                    {m.rutaAsignada}
                  </h2>
                </div>

                <span className="rounded-full border bg-background px-3 py-1 text-xs font-medium">
                  {m.estadoOperativo}
                </span>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-3">
                <div className="rounded-lg border bg-background p-3">
                  <span className="block text-xs text-muted-foreground">
                    Sector en curso
                  </span>
                  <span className="inline-flex items-center gap-1 font-medium">
                    <MapPin className="h-3.5 w-3.5 text-primary" />
                    {m.sectorActual}
                  </span>
                </div>

                <div className="rounded-lg border bg-background p-3">
                  <span className="block text-xs text-muted-foreground">
                    Próxima parada
                  </span>
                  <span className="font-medium">{m.proximaParada}</span>
                </div>

                <div className="rounded-lg border bg-background p-3">
                  <span className="block text-xs text-muted-foreground">
                    Avance / Distancia
                  </span>
                  <span className="font-medium">
                    {m.progresoVisitas} · {m.kmRecorridos} km
                  </span>
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg border bg-background px-3.5 py-2 text-sm font-medium hover:bg-muted"
                >
                  <Navigation className="h-4 w-4" />
                  Ver ubicación en mapa
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}