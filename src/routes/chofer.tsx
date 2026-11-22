import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Car,
  CheckCircle2,
  XCircle,
  MessageCircle,
  Navigation,
  Fuel,
  RotateCcw,
} from "lucide-react";
import { PageHeader, Btn } from "../components/AppShell";
import { obtenerRutaOptimizada } from "../api";

export const Route = createFileRoute("/chofer")({
  component: VistaChoferPage,
});

type EstadoConfirmacion = "Pendiente aviso" | "Confirmada" | "Cancelada";

interface ParadaChofer {
  id: string | number;
  hora: string;
  paciente: string;
  telefono: string;
  sector: string;
  movil: string;
  referencia: string;
  kmTramo: number;
  lat?: number;
  lng?: number;
  confirmacion: EstadoConfirmacion;
}

const MOVILES = [
  "Móvil 1 · Chofer Marcos Ruiz (Enf. Carla Soto)",
  "Móvil 2 · Chofer Patricio Lagos (TENS Diego Rojas)",
  "Móvil 3 · Chofer Claudio Vera (Kine. Ana Vidal)",
];

const PARADAS_BASE: ParadaChofer[] = [
  {
    id: "c-1",
    hora: "08:00",
    paciente: "Rosa Henríquez",
    telefono: "56981234567",
    sector: "Portezuelo Urbano",
    movil: MOVILES[0],
    referencia: "Pasaje cercano a plaza, casa reja blanca",
    kmTramo: 3.2,
    lat: -36.533,
    lng: -72.438,
    confirmacion: "Confirmada",
  },
  {
    id: "c-2",
    hora: "08:30",
    paciente: "Héctor Muñoz",
    telefono: "56982345678",
    sector: "Buenos Aires",
    movil: MOVILES[0],
    referencia: "Sector Buenos Aires km 3, casa madera junto a nogal",
    kmTramo: 8.4,
    lat: -36.542,
    lng: -72.419,
    confirmacion: "Pendiente aviso",
  },
  {
    id: "c-3",
    hora: "09:15",
    paciente: "Luis Cartes",
    telefono: "56983456789",
    sector: "Cucha Cucha",
    movil: MOVILES[1],
    referencia: "Camino rural Cucha Cucha, portón verde tras curva",
    kmTramo: 11.5,
    lat: -36.551,
    lng: -72.462,
    confirmacion: "Pendiente aviso",
  },
  {
    id: "c-4",
    hora: "10:00",
    paciente: "Marta Fuentealba",
    telefono: "56984567890",
    sector: "Chudal",
    movil: MOVILES[1],
    referencia: "Camino a Chudal, frente a posta rural antigua",
    kmTramo: 9.1,
    lat: -36.509,
    lng: -72.411,
    confirmacion: "Confirmada",
  },
  {
    id: "c-5",
    hora: "09:00",
    paciente: "Ernestina Sáez",
    telefono: "56985678901",
    sector: "Llahuecuy",
    movil: MOVILES[2],
    referencia: "Sector Llahuecuy, segunda casa después del puente",
    kmTramo: 12.8,
    lat: -36.518,
    lng: -72.475,
    confirmacion: "Pendiente aviso",
  },
  {
    id: "c-6",
    hora: "10:30",
    paciente: "Juan Riquelme",
    telefono: "56986789012",
    sector: "Tauco",
    movil: MOVILES[2],
    referencia: "Sector Tauco alto, portón metálico gris",
    kmTramo: 10.6,
    lat: -36.564,
    lng: -72.445,
    confirmacion: "Confirmada",
  },
];

const STORAGE_CONFIRMACIONES = "optiruta_confirmaciones_paciente_v1";

function VistaChoferPage() {
  const [movilActivo, setMovilActivo] = useState<string>(MOVILES[0]);
  const [paradas, setParadas] = useState<ParadaChofer[]>(() => {
    try {
      const saved = JSON.parse(
        localStorage.getItem(STORAGE_CONFIRMACIONES) || "{}"
      );
      return PARADAS_BASE.map((p) =>
        saved[String(p.id)] ? { ...p, confirmacion: saved[String(p.id)] } : p
      );
    } catch {
      return PARADAS_BASE;
    }
  });
  const [aviso, setAviso] = useState<string>("");

  useEffect(() => {
    obtenerRutaOptimizada().catch(() => {
      // Mantiene datos base si el endpoint no entrega paradas con formato propio
    });
  }, []);

  function actualizarConfirmacion(
    id: string | number,
    nuevoEstado: EstadoConfirmacion
  ) {
    setParadas((prev) => {
      const next = prev.map((p) =>
        p.id === id ? { ...p, confirmacion: nuevoEstado } : p
      );
      try {
        const mapa: Record<string, EstadoConfirmacion> = {};
        next.forEach((item) => {
          mapa[String(item.id)] = item.confirmacion;
        });
        localStorage.setItem(STORAGE_CONFIRMACIONES, JSON.stringify(mapa));
      } catch {
        // Ignorar errores de almacenamiento
      }
      return next;
    });

    const target = paradas.find((p) => p.id === id);
    if (target) {
      setAviso(
        nuevoEstado === "Cancelada"
          ? `Cita de ${target.paciente} marcada como CANCELADA: tramo excluido para ahorrar combustible.`
          : `Cita de ${target.paciente} marcada como "${nuevoEstado}".`
      );
    }
  }

  function recalcularSinCanceladas() {
    setAviso(
      "Secuencia de conducción recalculada excluyendo paradas canceladas para reducir kilómetros y consumo de combustible."
    );
  }

  const paradasDelMovil = useMemo(
    () => paradas.filter((p) => p.movil === movilActivo),
    [paradas, movilActivo]
  );

  const paradasActivas = useMemo(
    () => paradasDelMovil.filter((p) => p.confirmacion !== "Cancelada"),
    [paradasDelMovil]
  );

  const kmActivos = useMemo(
    () =>
      Number(
        paradasActivas.reduce((acc, p) => acc + p.kmTramo, 0).toFixed(1)
      ),
    [paradasActivas]
  );

  const kmAhorrados = useMemo(
    () =>
      Number(
        paradasDelMovil
          .filter((p) => p.confirmacion === "Cancelada")
          .reduce((acc, p) => acc + p.kmTramo, 0)
          .toFixed(1)
      ),
    [paradasDelMovil]
  );

  function construirLinkWhatsApp(parada: ParadaChofer) {
    const texto = encodeURIComponent(
      `Hola ${parada.paciente}, le saludamos desde CESFAM Portezuelo. Hoy tenemos visita domiciliaria programada cerca de las ${parada.hora} hrs en ${parada.sector}. ¿Estará en su domicilio para recibir al equipo? Responda CONFIRMO o CANCELO.`
    );
    return `https://wa.me/${parada.telefono}?text=${texto}`;
  }

  return (
    <div className="max-w-5xl">
      <PageHeader
        title="Vista Chofer · Logística y Confirmaciones"
        subtitle="Confirmación previa de pacientes, exclusión de cancelaciones y control de distancia"
        action={
          <Btn variant="ghost" onClick={recalcularSinCanceladas}>
            <RotateCcw className="h-4 w-4" />
            Recalcular ruta activa
          </Btn>
        }
      />

      <div className="mb-6 grid grid-cols-1 gap-4 rounded-xl border bg-card p-4 md:grid-cols-3 md:items-end">
        <div>
          <label
            htmlFor="movil-select"
            className="mb-1.5 block text-xs font-medium text-muted-foreground"
          >
            Móvil / Chofer asignado
          </label>
          <select
            id="movil-select"
            value={movilActivo}
            onChange={(e) => setMovilActivo(e.target.value)}
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm font-medium"
          >
            {MOVILES.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3 text-sm">
          <div className="rounded-lg border bg-background px-3 py-2">
            <span className="block text-xs text-muted-foreground">
              Paradas activas
            </span>
            <span className="text-lg font-semibold">
              {paradasActivas.length}/{paradasDelMovil.length}
            </span>
          </div>
          <div className="rounded-lg border bg-background px-3 py-2">
            <span className="block text-xs text-muted-foreground">
              Km activos
            </span>
            <span className="text-lg font-semibold">{kmActivos} km</span>
          </div>
        </div>

        <div className="rounded-lg border bg-background px-3.5 py-2.5 text-sm md:text-right">
          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <Fuel className="h-3.5 w-3.5 text-primary" /> Distancia evitada por
            cancelaciones
          </span>
          <p className="text-lg font-semibold">{kmAhorrados} km ahorrados</p>
        </div>
      </div>

      {aviso && (
        <div className="mb-5 rounded-xl border bg-muted/60 px-4 py-3 text-sm">
          {aviso}
        </div>
      )}

      <div className="space-y-4">
        {paradasDelMovil.map((parada, idx) => {
          const cancelada = parada.confirmacion === "Cancelada";
          const mapsUrl =
            parada.lat && parada.lng
              ? `https://www.google.com/maps/search/?api=1&query=${parada.lat},${parada.lng}`
              : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  `${parada.sector}, Portezuelo, Chile`
                )}`;

          return (
            <div
              key={parada.id}
              className={`rounded-xl border bg-card p-5 transition-opacity ${
                cancelada ? "opacity-60" : ""
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1 font-semibold text-foreground">
                      <Car className="h-3.5 w-3.5" /> Tramo #{idx + 1}
                    </span>
                    <span>· {parada.hora} hrs</span>
                    <span>· {parada.sector}</span>
                    <span>· {parada.kmTramo} km</span>
                  </div>
                  <h2 className="mt-1 text-lg font-semibold">
                    {parada.paciente}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {parada.referencia}
                  </p>
                </div>

                <span className="rounded-full border bg-background px-3 py-1 text-xs font-medium">
                  {parada.confirmacion}
                </span>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <a
                  href={construirLinkWhatsApp(parada)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg border bg-background px-3.5 py-2 text-sm font-medium hover:bg-muted"
                >
                  <MessageCircle className="h-4 w-4" />
                  Notificar visita
                </a>

                <Btn
                  variant={
                    parada.confirmacion === "Confirmada" ? "primary" : "ghost"
                  }
                  onClick={() =>
                    actualizarConfirmacion(parada.id, "Confirmada")
                  }
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Paciente confirma
                </Btn>

                <Btn
                  variant={cancelada ? "primary" : "ghost"}
                  onClick={() =>
                    actualizarConfirmacion(
                      parada.id,
                      cancelada ? "Pendiente aviso" : "Cancelada"
                    )
                  }
                >
                  <XCircle className="h-4 w-4" />
                  {cancelada ? "Reactivar cita" : "Cancelar cita"}
                </Btn>

                {!cancelada && (
                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="ml-auto inline-flex items-center gap-2 rounded-lg border bg-background px-3.5 py-2 text-sm font-medium hover:bg-muted"
                  >
                    <Navigation className="h-4 w-4" />
                    Abrir GPS
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
