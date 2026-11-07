import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Btn, PageHeader } from "@/components/AppShell";
import { pacientes, prioridadClass } from "@/lib/data";
import { DatabaseZap, Loader2, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/integracion")({
  head: () => ({
    meta: [
      { title: "Integración Rayen · CESFAM Portezuelo" },
      { name: "description", content: "Importación simulada de pacientes desde la ficha clínica Rayen." },
      { property: "og:title", content: "Integración Rayen · CESFAM Portezuelo" },
      { property: "og:description", content: "Importación simulada de pacientes desde Rayen." },
    ],
  }),
  component: Integracion,
});

const pasos = ["Conectando con API Rayen…", "Autenticando credenciales institucionales…", "Descargando agenda domiciliaria…", "Normalizando direcciones y geocodificando…", "Validando RUT y duplicados…"];

function Integracion() {
  const [estado, setEstado] = useState<"idle" | "running" | "done">("idle");
  const [log, setLog] = useState<string[]>([]);
  const [count, setCount] = useState(0);

  const importar = () => {
    setEstado("running"); setLog([]); setCount(0);
    pasos.forEach((p, i) => setTimeout(() => {
      setLog((l) => [...l, `[${new Date().toLocaleTimeString("es-CL")}] ${p}`]);
      if (i === pasos.length - 1) {
        let n = 0;
        const t = setInterval(() => { n++; setCount(n); if (n >= pacientes.length) { clearInterval(t); setEstado("done"); } }, 120);
      }
    }, i * 600));
  };

  return (
    <>
      <PageHeader title="Integración Rayen" subtitle="Módulo simulado de importación de agenda y pacientes"
        action={<Btn onClick={importar} disabled={estado === "running"}>{estado === "running" ? <Loader2 className="h-4 w-4 animate-spin" /> : <DatabaseZap className="h-4 w-4" />}Importar desde Rayen</Btn>} />
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="card-surface p-5">
          <h2 className="text-lg">Estado de conexión</h2>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-muted-foreground">Endpoint</dt><dd>rayen.ssnuble.cl/api/v2</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">Establecimiento</dt><dd>CESFAM Portezuelo</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">Última sync</dt><dd>{estado === "done" ? "Ahora" : "Hoy 07:30"}</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">Registros</dt><dd>{count} / {pacientes.length}</dd></div>
          </dl>
          <div className="mt-4 h-2 rounded-full bg-muted"><div className="h-2 rounded-full bg-primary transition-all" style={{ width: `${(count / pacientes.length) * 100}%` }} /></div>
        </div>
        <div className="card-surface p-5 lg:col-span-2">
          <h2 className="text-lg">Registro de proceso</h2>
          <div className="mt-3 h-40 overflow-auto rounded-lg bg-muted p-3 font-mono text-xs leading-6">
            {log.length === 0 ? <span className="text-muted-foreground">Presione “Importar desde Rayen” para iniciar.</span> : log.map((l) => <div key={l}>{l}</div>)}
            {estado === "done" && <div className="flex items-center gap-1 text-success"><CheckCircle2 className="h-3 w-3" /> Importación completada: {pacientes.length} pacientes.</div>}
          </div>
        </div>
      </div>
      <div className="card-surface mt-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b text-left text-muted-foreground"><tr>{["RUT", "Paciente", "Sector", "Prestación", "Prioridad", "Coordenadas"].map((h) => <th key={h} className="px-4 py-3 font-medium">{h}</th>)}</tr></thead>
          <tbody>
            {pacientes.slice(0, count).map((p) => (
              <tr key={p.id} className="border-b last:border-0 animate-in fade-in">
                <td className="px-4 py-3 font-mono text-xs">{p.rut}</td><td className="px-4 py-3">{p.nombre}</td><td className="px-4 py-3">{p.sector}</td><td className="px-4 py-3">{p.prestacion}</td>
                <td className="px-4 py-3"><span className={`rounded-full px-2 py-0.5 text-xs ${prioridadClass[p.prioridad]}`}>{p.prioridad}</span></td>
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{p.lat.toFixed(4)}, {p.lng.toFixed(4)}</td>
              </tr>
            ))}
            {count === 0 && <tr><td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">Sin datos importados aún.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}
