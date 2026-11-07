import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/AppShell";
import { equipos, pacientes, type Estado } from "@/lib/data";

export const Route = createFileRoute("/supervision")({
  head: () => ({
    meta: [
      { title: "Supervisión en tiempo real · CESFAM Portezuelo" },
      { name: "description", content: "Seguimiento en vivo del estado de las visitas domiciliarias." },
      { property: "og:title", content: "Supervisión en tiempo real · CESFAM Portezuelo" },
      { property: "og:description", content: "Seguimiento en vivo de visitas domiciliarias." },
    ],
  }),
  component: Supervision,
});

const flujo: Estado[] = ["Pendiente", "En ruta", "En visita", "Completada"];
const estilo: Record<Estado, string> = {
  Pendiente: "bg-muted text-muted-foreground",
  "En ruta": "bg-info/15 text-info",
  "En visita": "bg-warning/20 text-foreground",
  Completada: "bg-success/15 text-success",
  Cancelada: "bg-destructive/15 text-destructive",
};

const inicial = pacientes.map((p, i) => ({ ...p, equipo: equipos[i % 3]!.nombre.split("·")[1]!.trim(), estado: flujo[i % 4] as Estado, hora: `${8 + Math.floor(i / 2)}:${i % 2 ? "30" : "00"}`, act: 0 }));

function Supervision() {
  const [rows, setRows] = useState(inicial);
  useEffect(() => {
    const t = setInterval(() => {
      setRows((r) => {
        const i = Math.floor(Math.random() * r.length);
        return r.map((x, j) => {
          if (j !== i || x.estado === "Completada") return { ...x, act: x.act + 3 };
          return { ...x, estado: flujo[flujo.indexOf(x.estado) + 1] ?? x.estado, act: 0 };
        });
      });
    }, 3000);
    return () => clearInterval(t);
  }, []);
  const c = (e: Estado) => rows.filter((r) => r.estado === e).length;
  return (
    <>
      <PageHeader title="Supervisión en tiempo real" subtitle="Actualización automática cada 3 segundos" />
      <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        {flujo.map((e) => <div key={e} className="card-surface p-4"><p className="text-xs text-muted-foreground">{e}</p><p className="font-display text-3xl">{c(e)}</p></div>)}
      </div>
      <div className="card-surface overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b text-left text-muted-foreground"><tr>{["Hora", "Paciente", "Sector", "Equipo", "Estado", "Última señal"].map((h) => <th key={h} className="px-4 py-3 font-medium">{h}</th>)}</tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b last:border-0">
                <td className="px-4 py-3 font-mono text-xs">{r.hora}</td><td className="px-4 py-3">{r.nombre}</td><td className="px-4 py-3">{r.sector}</td><td className="px-4 py-3">{r.equipo}</td>
                <td className="px-4 py-3"><span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs ${estilo[r.estado]}`}>{r.estado !== "Completada" && r.estado !== "Pendiente" && <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-current" />}{r.estado}</span></td>
                <td className="px-4 py-3 text-xs text-muted-foreground">hace {r.act} s</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
