import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  MapPin,
  Navigation,
  RefreshCw,
  UserPlus,
  Wifi,
  WifiOff,
  CheckCircle2,
  Clock,
  MessageCircle,
} from "lucide-react";
import { PageHeader, Btn } from "../components/AppShell";
import {
  obtenerRutaOptimizada,
  actualizarEstadoVisitaAPI,
  crearPacienteTerrenoAPI,
  type NuevoPacienteTerreno,
  type PayloadEstadoVisita,
} from "../api";

export const Route = createFileRoute("/terreno")({
  component: VistaTerrenoPage,
});

type EstadoVisita =
  | "Pendiente"
  | "En ruta"
  | "En visita"
  | "Completada"
  | "Rechazada";

type EstadoConfirmacion = "Pendiente aviso" | "Confirmada" | "Cancelada";

interface TareaTrabajador {
  id: string | number;
  hora: string;
  paciente: string;
  telefono: string;
  sector: string;
  equipo: string;
  referencia: string;
  reqClinico: string;
  lat?: number;
  lng?: number;
  estado: EstadoVisita;
  confirmacion: EstadoConfirmacion;
  observacion?: string;
}

const EQUIPOS_DISPONIBLES = [
  "Enf. Carla Soto",
  "TENS Diego Rojas",
  "Kine. Ana Vidal",
];

const SECTORES_PORTEZUELO = [
  "Portezuelo Urbano",
  "Capellanía",
  "Trancoyán",
  "Llahuecuy",
  "Orilla de Itata",
  "Chudal",
  "Buenos Aires",
  "Tauco",
  "Cucha Cucha",
  "Llahuen Bajo",
];

const STORAGE_ESTADOS_KEY = "optiruta_terreno_estados_v1";
const STORAGE_COLA_VISITAS_KEY = "optiruta_terreno_cola_visitas_v1";
const STORAGE_COLA_PACIENTES_KEY = "optiruta_terreno_cola_pacientes_v1";
const STORAGE_CONFIRMACIONES = "optiruta_confirmaciones_paciente_v1";

const TAREAS_INICIALES: TareaTrabajador[] = [
  {
    id: "v-1",
    hora: "08:00",
    paciente: "Rosa Henríquez",
    telefono: "56981234567",
    sector: "Portezuelo Urbano",
    equipo: "Enf. Carla Soto",
    referencia: "Pasaje cercano a plaza, casa reja blanca",
    reqClinico: "Curación avanzada y control signos vitales",
    lat: -36.533,
    lng: -72.438,
    estado: "Pendiente",
    confirmacion: "Confirmada",
  },
  {
    id: "v-2",
    hora: "08:30",
    paciente: "Luis Cartes",
    telefono: "56983456789",
    sector: "Cucha Cucha",
    equipo: "TENS Diego Rojas",
    referencia: "Camino rural Cucha Cucha, portón verde tras curva",
    reqClinico: "Control presión arterial y apoyo movilización",
    lat: -36.551,
    lng: -72.462,
    estado: "En ruta",
    confirmacion: "Pendiente aviso",
  },
  {
    id: "v-3",
    hora: "09:00",
    paciente: "Ernestina Sáez",
    telefono: "56985678901",
    sector: "Llahuecuy",
    equipo: "Kine. Ana Vidal",
    referencia: "Sector Llahuecuy, segunda casa después del puente",
    reqClinico: "Rehabilitación respiratoria y motora",
    lat: -36.518,
    lng: -72.475,
    estado: "Completada",
    confirmacion: "Confirmada",
  },
  {
    id: "v-4",
    hora: "09:30",
    paciente: "Héctor Muñoz",
    telefono: "56982345678",
    sector: "Buenos Aires",
    equipo: "Enf. Carla Soto",
    referencia: "Sector Buenos Aires km 3, casa madera junto a nogal",
    reqClinico: "Administración tratamiento endovenoso",
    lat: -36.542,
    lng: -72.419,
    estado: "Completada",
    confirmacion: "Confirmada",
  },
  {
    id: "v-5",
    hora: "10:00",
    paciente: "Marta Fuentealba",
    telefono: "56984567890",
    sector: "Chudal",
    equipo: "TENS Diego Rojas",
    referencia: "Camino a Chudal, frente a posta rural antigua",
    reqClinico: "Control glicemia capilar y entrega insumos",
    lat: -36.509,
    lng: -72.411,
    estado: "Pendiente",
    confirmacion: "Confirmada",
  },
  {
    id: "v-6",
    hora: "10:30",
    paciente: "Juan Riquelme",
    telefono: "56986789012",
    sector: "Tauco",
    equipo: "Kine. Ana Vidal",
    referencia: "Sector Tauco alto, portón metálico gris",
    reqClinico: "Kinesioterapia motora post-operatoria",
    lat: -36.564,
    lng: -72.445,
    estado: "En visita",
    confirmacion: "Confirmada",
  },
];

function normalizarTareasDesdeRuta(data: unknown): TareaTrabajador[] {
  const rawList = Array.isArray(data)
    ? data
    : (data as { visitas?: unknown[]; paradas?: unknown[]; ruta?: unknown[] })
        ?.visitas ??
      (data as { paradas?: unknown[] })?.paradas ??
      (data as { ruta?: unknown[] })?.ruta ??
      [];

  if (!Array.isArray(rawList) || rawList.length === 0) {
    return TAREAS_INICIALES;
  }

  return rawList.map((item, idx) => {
    const obj = item as Record<string, unknown>;
    const estadoRaw = String(obj.estado ?? obj.estado_visita ?? "Pendiente");
    const estadoNormalizado: EstadoVisita = (
      ["Pendiente", "En ruta", "En visita", "Completada", "Rechazada"].includes(
        estadoRaw
      )
        ? estadoRaw
        : "Pendiente"
    ) as EstadoVisita;

    return {
      id: (obj.id as string | number) ?? `visita-${idx + 1}`,
      hora: String(obj.hora ?? obj.ventana_inicio ?? "08:30"),
      paciente: String(
        obj.paciente ??
          obj.paciente_nombre ??
          obj.nombre_completo ??
          `Paciente ${idx + 1}`
      ),
      telefono: String(obj.telefono ?? "56981234567"),
      sector: String(obj.sector ?? obj.sector_comunal ?? "Portezuelo Urbano"),
      equipo: String(
        obj.equipo ??
          obj.equipo_asignado ??
          obj.profesional ??
          EQUIPOS_DISPONIBLES[idx % EQUIPOS_DISPONIBLES.length]
      ),
      referencia: String(
        obj.referencia ??
          obj.referencia_acceso ??
          obj.direccion ??
          "Sin referencia registrada"
      ),
      reqClinico: String(
        obj.req_clinico ??
          obj.requerimiento ??
          "Atención hospitalización domiciliaria"
      ),
      lat: typeof obj.lat === "number" ? obj.lat : undefined,
      lng: typeof obj.lng === "number" ? obj.lng : undefined,
      estado: estadoNormalizado,
      confirmacion: "Pendiente aviso",
      observacion: typeof obj.observacion === "string" ? obj.observacion : "",
    };
  });
}

function VistaTerrenoPage() {
  const [trabajadorActivo, setTrabajadorActivo] = useState<string>(
    EQUIPOS_DISPONIBLES[0]
  );
  const [pestana, setPestana] = useState<"ruta" | "nuevo-paciente">("ruta");
  const [online, setOnline] = useState<boolean>(
    typeof navigator !== "undefined" ? navigator.onLine : true
  );
  const [tareas, setTareas] = useState<TareaTrabajador[]>(TAREAS_INICIALES);
  const [cargando, setCargando] = useState<boolean>(false);
  const [mensaje, setMensaje] = useState<string>("");

  const [colaVisitas, setColaVisitas] = useState<PayloadEstadoVisita[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_COLA_VISITAS_KEY) || "[]");
    } catch {
      return [];
    }
  });

  const [colaPacientes, setColaPacientes] = useState<NuevoPacienteTerreno[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_COLA_PACIENTES_KEY) || "[]");
    } catch {
      return [];
    }
  });

  const [run, setRun] = useState("");
  const [nombreCompleto, setNombreCompleto] = useState("");
  const [fichaClinica, setFichaClinica] = useState("");
  const [sector, setSector] = useState(SECTORES_PORTEZUELO[1]);
  const [referenciaAcceso, setReferenciaAcceso] = useState("");
  const [telefonoCuidador, setTelefonoCuidador] = useState("");
  const [reqClinico, setReqClinico] = useState("Curación / Control domiciliario");
  const [latitud, setLatitud] = useState<number | null>(null);
  const [longitud, setLongitud] = useState<number | null>(null);
  const [obteniendoGps, setObteniendoGps] = useState(false);

  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_COLA_VISITAS_KEY, JSON.stringify(colaVisitas));
  }, [colaVisitas]);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_COLA_PACIENTES_KEY,
      JSON.stringify(colaPacientes)
    );
  }, [colaPacientes]);

  async function cargarRutaDelDia() {
    setCargando(true);
    setMensaje("");
    try {
      const data = await obtenerRutaOptimizada();
      const lista = normalizarTareasDesdeRuta(data);
      let overrides: Record<
        string,
        { estado: EstadoVisita; observacion?: string }
      > = {};
      let confs: Record<string, EstadoConfirmacion> = {};
      try {
        overrides = JSON.parse(
          localStorage.getItem(STORAGE_ESTADOS_KEY) || "{}"
        );
        confs = JSON.parse(
          localStorage.getItem(STORAGE_CONFIRMACIONES) || "{}"
        );
      } catch {
        overrides = {};
        confs = {};
      }

      const combinadas = lista.map((t) => {
        const saved = overrides[String(t.id)];
        const conf = confs[String(t.id)];
        return {
          ...t,
          ...(saved ?? {}),
          confirmacion: conf ?? t.confirmacion,
        };
      });
      setTareas(combinadas);
    } catch {
      setMensaje("Modo terreno activo con ruta cargada en memoria local.");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarRutaDelDia();
  }, []);

  const tareasFiltradas = useMemo(() => {
    return tareas.filter(
      (t) => t.equipo.toLowerCase() === trabajadorActivo.toLowerCase()
    );
  }, [tareas, trabajadorActivo]);

  const resumenEquipo = useMemo(() => {
    const total = tareasFiltradas.length;
    const completadas = tareasFiltradas.filter(
      (t) => t.estado === "Completada"
    ).length;
    const pendientes = total - completadas;
    return { total, completadas, pendientes };
  }, [tareasFiltradas]);

  async function handleCambiarEstado(
    tarea: TareaTrabajador,
    nuevoEstado: EstadoVisita
  ) {
    const obsActual = tarea.observacion ?? "";
    setTareas((prev) =>
      prev.map((item) =>
        item.id === tarea.id ? { ...item, estado: nuevoEstado } : item
      )
    );

    try {
      const saved = JSON.parse(
        localStorage.getItem(STORAGE_ESTADOS_KEY) || "{}"
      );
      saved[String(tarea.id)] = { estado: nuevoEstado, observacion: obsActual };
      localStorage.setItem(STORAGE_ESTADOS_KEY, JSON.stringify(saved));
    } catch {
      // Ignorar errores de storage
    }

    const payload: PayloadEstadoVisita = {
      visitaId: tarea.id,
      estado: nuevoEstado,
      observacion: obsActual,
      timestamp: new Date().toISOString(),
    };

    try {
      await actualizarEstadoVisitaAPI(payload);
      setMensaje(`Visita de ${tarea.paciente} actualizada a "${nuevoEstado}".`);
    } catch {
      setColaVisitas((prev) => [...prev, payload]);
      setMensaje(
        `Registrado localmente para ${tarea.paciente} ("${nuevoEstado}"). Se sincronizará con el servidor al reconectar.`
      );
    }
  }

  function handleObservacionChange(id: string | number, texto: string) {
    setTareas((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, observacion: texto } : item
      )
    );
  }

  function capturarGpsActual() {
    if (!navigator.geolocation) {
      setMensaje("Este dispositivo no soporta geolocalización GPS.");
      return;
    }
    setObteniendoGps(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitud(Number(pos.coords.latitude.toFixed(6)));
        setLongitud(Number(pos.coords.longitude.toFixed(6)));
        setObteniendoGps(false);
        setMensaje("Coordenadas GPS capturadas correctamente.");
      },
      () => {
        setObteniendoGps(false);
        setMensaje(
          "No se pudo obtener GPS. Verifica los permisos de ubicación del navegador."
        );
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  async function handleGuardarPaciente(e: React.FormEvent) {
    e.preventDefault();
    if (!nombreCompleto.trim() || !referenciaAcceso.trim()) {
      setMensaje(
        "Completa al menos el nombre del paciente y la referencia de acceso rural."
      );
      return;
    }

    const nuevo: NuevoPacienteTerreno = {
      run: run.trim() || "Sin RUN",
      nombreCompleto: nombreCompleto.trim(),
      fichaClinica:
        fichaClinica.trim() || `PTZ-${Date.now().toString().slice(-6)}`,
      sector,
      referenciaAcceso: referenciaAcceso.trim(),
      telefonoCuidador: telefonoCuidador.trim(),
      reqClinico: reqClinico.trim(),
      latitud,
      longitud,
      registradoPor: trabajadorActivo,
      timestamp: new Date().toISOString(),
    };

    try {
      await crearPacienteTerrenoAPI(nuevo);
      setMensaje(
        `Paciente ${nuevo.nombreCompleto} enviado correctamente al sistema central.`
      );
    } catch {
      setColaPacientes((prev) => [...prev, nuevo]);
      setMensaje(
        `Paciente ${nuevo.nombreCompleto} guardado en cola local para sincronización.`
      );
    }

    setRun("");
    setNombreCompleto("");
    setFichaClinica("");
    setReferenciaAcceso("");
    setTelefonoCuidador("");
  }

  async function sincronizarPendientes() {
    let visitasRestantes = [...colaVisitas];
    let pacientesRestantes = [...colaPacientes];

    for (const v of colaVisitas) {
      try {
        await actualizarEstadoVisitaAPI(v);
        visitasRestantes = visitasRestantes.filter((item) => item !== v);
      } catch {
        break;
      }
    }

    for (const p of colaPacientes) {
      try {
        await crearPacienteTerrenoAPI(p);
        pacientesRestantes = pacientesRestantes.filter((item) => item !== p);
      } catch {
        break;
      }
    }

    setColaVisitas(visitasRestantes);
    setColaPacientes(pacientesRestantes);
    setMensaje(
      `Sincronización completada. Pendientes en cola: ${
        visitasRestantes.length + pacientesRestantes.length
      }.`
    );
  }

  function construirLinkWhatsApp(tarea: TareaTrabajador) {
    const texto = encodeURIComponent(
      `Hola ${tarea.paciente}, le escribimos de CESFAM Portezuelo. Hoy está programada su visita domiciliaria cerca de las ${tarea.hora} hrs (${tarea.sector}). ¿Confirma que estará en casa?`
    );
    return `https://wa.me/${tarea.telefono}?text=${texto}`;
  }

  const totalPendientesCola = colaVisitas.length + colaPacientes.length;

  return (
    <div className="max-w-5xl">
      <PageHeader
        title="Vista Terreno · Equipos Clínicos"
        subtitle="Ruta optimizada asignada por profesional, control de visitas en vivo y registro domiciliario"
        action={
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${
                online
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-amber-200 bg-amber-50 text-amber-800"
              }`}
            >
              {online ? (
                <>
                  <Wifi className="h-3.5 w-3.5" /> Señal activa
                </>
              ) : (
                <>
                  <WifiOff className="h-3.5 w-3.5" /> Modo sin conexión
                </>
              )}
            </span>

            {totalPendientesCola > 0 && (
              <Btn onClick={sincronizarPendientes}>
                <RefreshCw className="h-4 w-4" />
                Sincronizar ({totalPendientesCola})
              </Btn>
            )}
          </div>
        }
      />

      <div className="mb-6 grid grid-cols-1 gap-4 rounded-xl border bg-card p-4 md:grid-cols-3 md:items-end">
        <div>
          <label
            htmlFor="trabajador-select"
            className="mb-1.5 block text-xs font-medium text-muted-foreground"
          >
            Trabajador / Equipo clínico
          </label>
          <select
            id="trabajador-select"
            value={trabajadorActivo}
            onChange={(e) => setTrabajadorActivo(e.target.value)}
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm font-medium"
          >
            {EQUIPOS_DISPONIBLES.map((eq) => (
              <option key={eq} value={eq}>
                {eq}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-4 text-sm">
          <div className="rounded-lg border bg-background px-3 py-2">
            <span className="block text-xs text-muted-foreground">Asignadas</span>
            <span className="text-lg font-semibold">{resumenEquipo.total}</span>
          </div>
          <div className="rounded-lg border bg-background px-3 py-2">
            <span className="block text-xs text-muted-foreground">Pendientes</span>
            <span className="text-lg font-semibold">
              {resumenEquipo.pendientes}
            </span>
          </div>
          <div className="rounded-lg border bg-background px-3 py-2">
            <span className="block text-xs text-muted-foreground">Completadas</span>
            <span className="text-lg font-semibold">
              {resumenEquipo.completadas}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 md:justify-end">
          <Btn
            variant={pestana === "ruta" ? "primary" : "ghost"}
            onClick={() => setPestana("ruta")}
          >
            Mis rutas y tareas
          </Btn>
          <Btn
            variant={pestana === "nuevo-paciente" ? "primary" : "ghost"}
            onClick={() => setPestana("nuevo-paciente")}
          >
            <UserPlus className="h-4 w-4" />
            Ingresar paciente
          </Btn>
        </div>
      </div>

      {mensaje && (
        <div className="mb-5 rounded-xl border bg-muted/60 px-4 py-3 text-sm">
          {mensaje}
        </div>
      )}

      {pestana === "ruta" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Hoja de ruta designada para{" "}
              <strong className="text-foreground">{trabajadorActivo}</strong>
            </p>
            <Btn
              variant="ghost"
              onClick={cargarRutaDelDia}
              disabled={cargando}
            >
              <RefreshCw
                className={`h-4 w-4 ${cargando ? "animate-spin" : ""}`}
              />
              Actualizar
            </Btn>
          </div>

          {tareasFiltradas.map((tarea, idx) => {
            const mapsUrl =
              tarea.lat && tarea.lng
                ? `https://www.google.com/maps/search/?api=1&query=${tarea.lat},${tarea.lng}`
                : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    `${tarea.sector}, Portezuelo, Chile`
                  )}`;

            return (
              <div
                key={tarea.id}
                className="rounded-xl border bg-card p-5 shadow-xs transition-all"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="font-semibold text-foreground">
                        Parada #{idx + 1}
                      </span>
                      <span>·</span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" /> {tarea.hora} hrs
                      </span>
                      <span>·</span>
                      <span>{tarea.sector}</span>
                    </div>
                    <h2 className="mt-1 text-lg font-semibold">
                      {tarea.paciente}
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      {tarea.reqClinico}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="rounded-full border bg-background px-3 py-1 text-xs font-medium">
                      Cita: {tarea.confirmacion}
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full border bg-background px-3 py-1 text-xs font-medium">
                      {tarea.estado === "Completada" && (
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                      )}
                      {tarea.estado}
                    </span>
                  </div>
                </div>

                <div className="mt-3 rounded-lg border bg-background px-3.5 py-2.5 text-sm">
                  <span className="font-medium">Referencia rural:</span>{" "}
                  {tarea.referencia}
                </div>

                <div className="mt-3">
                  <input
                    type="text"
                    value={tarea.observacion ?? ""}
                    onChange={(e) =>
                      handleObservacionChange(tarea.id, e.target.value)
                    }
                    placeholder="Agregar observación clínica o incidencia en domicilio..."
                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                  />
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  {(
                    [
                      "En ruta",
                      "En visita",
                      "Completada",
                      "Rechazada",
                    ] as EstadoVisita[]
                  ).map((estadoBtn) => (
                    <Btn
                      key={estadoBtn}
                      variant={tarea.estado === estadoBtn ? "primary" : "ghost"}
                      onClick={() => handleCambiarEstado(tarea, estadoBtn)}
                    >
                      {estadoBtn}
                    </Btn>
                  ))}

                  <a
                    href={construirLinkWhatsApp(tarea)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg border bg-background px-3.5 py-2 text-sm font-medium hover:bg-muted"
                  >
                    <MessageCircle className="h-4 w-4" />
                    Avisar paciente
                  </a>

                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="ml-auto inline-flex items-center gap-2 rounded-lg border bg-background px-3.5 py-2 text-sm font-medium hover:bg-muted"
                  >
                    <Navigation className="h-4 w-4" />
                    Navegar GPS
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {pestana === "nuevo-paciente" && (
        <form
          onSubmit={handleGuardarPaciente}
          className="space-y-4 rounded-xl border bg-card p-6"
        >
          <div>
            <h2 className="text-lg font-semibold">
              Ingreso de paciente en terreno
            </h2>
            <p className="text-sm text-muted-foreground">
              Registra pacientes captados en ronda rural o actualiza referencias
              domiciliarias con coordenadas GPS.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                Nombre completo *
              </label>
              <input
                type="text"
                required
                value={nombreCompleto}
                onChange={(e) => setNombreCompleto(e.target.value)}
                placeholder="Ej. María Soto Parra"
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                RUN
              </label>
              <input
                type="text"
                value={run}
                onChange={(e) => setRun(e.target.value)}
                placeholder="Ej. 12.345.678-9"
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                N° Ficha Clínica
              </label>
              <input
                type="text"
                value={fichaClinica}
                onChange={(e) => setFichaClinica(e.target.value)}
                placeholder="Ej. PTZ-100250"
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                Sector de Portezuelo
              </label>
              <select
                value={sector}
                onChange={(e) => setSector(e.target.value)}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
              >
                {SECTORES_PORTEZUELO.map((sec) => (
                  <option key={sec} value={sec}>
                    {sec}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                Teléfono cuidador / respaldo
              </label>
              <input
                type="tel"
                value={telefonoCuidador}
                onChange={(e) => setTelefonoCuidador(e.target.value)}
                placeholder="+56 9 ..."
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                Requerimiento clínico / insumos
              </label>
              <input
                type="text"
                value={reqClinico}
                onChange={(e) => setReqClinico(e.target.value)}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">
              Referencia de acceso / dirección rural *
            </label>
            <textarea
              required
              rows={2}
              value={referenciaAcceso}
              onChange={(e) => setReferenciaAcceso(e.target.value)}
              placeholder="Ej. Pasado el puente Llahuecuy, portón verde a mano izquierda"
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-background p-3.5">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <MapPin className="h-4 w-4 text-primary" />
              <span>
                <strong>GPS actual:</strong>{" "}
                {latitud !== null && longitud !== null
                  ? `${latitud}, ${longitud}`
                  : "Sin capturar"}
              </span>
            </div>
            <Btn
              type="button"
              variant="ghost"
              onClick={capturarGpsActual}
              disabled={obteniendoGps}
            >
              {obteniendoGps ? "Obteniendo GPS..." : "Capturar GPS actual"}
            </Btn>
          </div>

          <div className="flex justify-end pt-2">
            <Btn type="submit">
              <UserPlus className="h-4 w-4" />
              Guardar paciente
            </Btn>
          </div>
        </form>
      )}
    </div>
  );
}