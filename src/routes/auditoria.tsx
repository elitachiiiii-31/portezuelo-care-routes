import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/AppShell";
import { equipos, pacientes } from "@/lib/data";
import { Satellite, Hand, AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/auditoria")({
  head: () => ({
    meta: [
      { title: "Auditoría de cierres · CESFAM Portezuelo" },
      { name: "description", content: "Trazabilidad de cierres de visita manuales y automáticos por GPS." },
      { property: "og:title", content: "Auditoría de cierres · CESFAM Portezuelo" },
      { property: "og:description", content: "Trazabilidad de cierres de visita manuales y por GPS." },
    ],
  }),
  component: Auditoria,
});

const registros = pacientes.flatMap((p, i) => {
  const gps = i % 4 !== 1;
  const distancia = gps ? 8 + ((i * 7) % 30) : 40 + ((i * 53) % 400);
  return [{
    id: `AUD-${1040 + i}`, fecha: `07-11-2026 ${9 + Math.floor(i / 2)}:${(i * 13) % 60 < 10 ? "0" : ""}${(i * 13) % 60}`,
    paciente: p.nombre, funcionario: equipos[i % 3].nombre.split("·")[1].trim(),
    tipo: gps ? "GPS automático" : "Manual", distancia, geocerca: distancia <= 50,
    motivo: gps ? "Ingreso a geocerca 50 m + 20 min permanencia" : ["Sin señal móvil en sector", "GPS deshabilitado", "Paciente trasladado"][i % 3],
    coord: `${(p.lat + 0.0001 * i).toFixed(5)}, ${p.lng.toFixed(5)}`,
  }];
});

function Auditoria() {
  const [tipo, setTipo] = useState("Todos");
  const lista = registros.filter((r) => tipo === "Todos" || r.tipo === tipo);
  const manual = registros.filter((r) => r.tipo === "Manual").length;
  const fuera = registros.filter((r) => !r.geocerca).length;
  return (
    <>
      <PageHeader title="Auditoría" subtitle="Trazabilidad de cierres de visita manuales y automáticos por GPS" />
      <div className="mb-4 grid gap-3 md:grid-cols-3">
        <div className="card-surface flex items-center gap-4 p-4"><Satellite className="h-5 w-5 text-success" /><div><p className="text-xs text-muted-foreground">Cierres GPS</p><p className="font-display text-2xl">{registros.length - manual}</p></div></div>
        <div className="card-surface flex items-center gap-4 p-4"><Hand className="h-5 w-5 text-warning" /><div><p className="text-xs text-muted-foreground">Cierres manuales</p><p className="font-display text-2xl">{manual}</p></div></div>
        <div className="card-surface flex items-center gap-4 p-4"><AlertTriangle className="h-5 w-5 text-destructive" /><div><p className="text-xs text-muted-foreground">Fuera de geocerca</p><p className="font-display text-2xl">{fuera}</p></div></div>
      </div>
      <div className="mb-3 flex gap-2">
        {["Todos", "GPS automático", "Manual"].map((t) => <button key={t} onClick={() => setTipo(t)} className={`rounded-full border px-3 py-1 text-sm ${tipo === t ? "bg-primary text-primary-foreground" : "bg-card hover:bg-muted"}`}>{t}</button>)}
      </div>
      <div className="card-surface overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b text-left text-muted-foreground"><tr>{["ID", "Fecha/hora", "Paciente", "Funcionario", "Tipo cierre", "Coordenadas", "Dist. domicilio", "Justificación"].map((h) => <th key={h} className="whitespace-nowrap px-4 py-3 font-medium">{h}</th>)}</tr></thead>
          <tbody>
            {lista.map((r) => (
              <tr key={r.id} className="border-b last:border-0">
                <td className="px-4 py-3 font-mono text-xs">{r.id}</td><td className="whitespace-nowrap px-4 py-3 text-xs">{r.fecha}</td><td className="px-4 py-3">{r.paciente}</td><td className="px-4 py-3">{r.funcionario}</td>
                <td className="px-4 py-3"><span className={`whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs ${r.tipo === "Manual" ? "bg-warning/20" : "bg-success/15 text-success"}`}>{r.tipo}</span></td>
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{r.coord}</td>
                <td className={`px-4 py-3 text-xs ${r.geocerca ? "" : "font-semibold text-destructive"}`}>{r.distancia} m</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{r.motivo}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
