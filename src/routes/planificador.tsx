import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Btn, PageHeader } from "@/components/AppShell";
import { CESFAM, equipos, pacientes, prioridadClass, type Paciente } from "@/lib/data";
import { Cpu, GripVertical, Loader2 } from "lucide-react";

export const Route = createFileRoute("/planificador")({
  head: () => ({
    meta: [
      { title: "Planificador diario · CESFAM Portezuelo" },
      { name: "description", content: "Optimización de rutas domiciliarias con OR-Tools y asignación drag-and-drop." },
      { property: "og:title", content: "Planificador diario · CESFAM Portezuelo" },
      { property: "og:description", content: "Optimización logística de rutas domiciliarias." },
    ],
  }),
  component: Planificador,
});

type Cols = Record<string, Paciente[]>;
const dist = (a: { lat: number; lng: number }, b: { lat: number; lng: number }) => Math.hypot((a.lat - b.lat) * 111, (a.lng - b.lng) * 89);
const km = (r: Paciente[]) => r.reduce((acc, p, i) => acc + dist(i === 0 ? CESFAM : r[i - 1], p), 0) + (r.length ? dist(r[r.length - 1]!, CESFAM) : 0);

// Simulación de un solver VRP (OR-Tools): agrupa por ángulo y ordena por vecino más cercano.
function optimizar(): Cols {
  const ang = (p: Paciente) => Math.atan2(p.lat - CESFAM.lat, p.lng - CESFAM.lng);
  const sorted = [...pacientes].sort((a, b) => ang(a) - ang(b));
  const size = Math.ceil(sorted.length / equipos.length);
  const out: Cols = { pool: [] };
  equipos.forEach((e, i) => {
    const grupo = sorted.slice(i * size, (i + 1) * size);
    const ruta: Paciente[] = [];
    let cur: { lat: number; lng: number } = CESFAM;
    while (grupo.length) {
      grupo.sort((a, b) => dist(cur, a) - dist(cur, b));
      cur = grupo.shift()!; ruta.push(cur as Paciente);
    }
    out[e.id] = ruta;
  });
  return out;
}

function Planificador() {
  const [cols, setCols] = useState<Cols>({ pool: pacientes, E1: [], E2: [], E3: [] });
  const [drag, setDrag] = useState<{ id: string; from: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const drop = (to: string, index?: number) => {
    if (!drag) return;
    setCols((c) => {
      const item = (c[drag.from] ?? []).find((p) => p.id === drag.id)!;
      const next = { ...c, [drag.from]: (c[drag.from] ?? []).filter((p) => p.id !== drag.id) };
      const dest = [...(next[to] ?? [])];
      dest.splice(index ?? dest.length, 0, item);
      return { ...next, [to]: dest };
    });
    setDrag(null);
  };

  const run = () => { setBusy(true); setTimeout(() => { setCols(optimizar()); setBusy(false); }, 1200); };

  const Column = ({ id, title, sub }: { id: string; title: string; sub?: string }) => (
    <div onDragOver={(e) => e.preventDefault()} onDrop={() => drop(id)} className="card-surface flex min-h-[420px] flex-col p-4">
      <div className="mb-3">
        <h2 className="text-base">{title}</h2>
        {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
        {id !== "pool" && <p className="mt-1 text-xs">{(cols[id] ?? []).length} visitas · {km((cols[id] ?? [])).toFixed(1)} km est.</p>}
      </div>
      <div className="flex-1 space-y-2">
        {(cols[id] ?? []).map((p, i) => (
          <div key={p.id} draggable onDragStart={() => setDrag({ id: p.id, from: id })}
            onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.stopPropagation(); drop(id, i); }}
            className="flex cursor-grab items-center gap-2 rounded-lg border bg-background p-2.5 text-sm active:cursor-grabbing">
            <GripVertical className="h-4 w-4 text-muted-foreground" />
            {id !== "pool" && <span className="grid h-5 w-5 place-items-center rounded-full bg-primary text-[10px] text-primary-foreground">{i + 1}</span>}
            <div className="min-w-0 flex-1"><p className="truncate font-medium">{p.nombre}</p><p className="truncate text-xs text-muted-foreground">{p.sector} · {p.prestacion}</p></div>
            <span className={`rounded-full px-2 text-[10px] ${prioridadClass[p.prioridad]}`}>{p.prioridad}</span>
          </div>
        ))}
        {(cols[id] ?? []).length === 0 && <p className="rounded-lg border border-dashed p-6 text-center text-xs text-muted-foreground">Arrastre visitas aquí</p>}
      </div>
    </div>
  );

  const total = equipos.reduce((a, e) => a + km(cols[e.id] ?? []), 0);
  return (
    <>
      <PageHeader title="Planificador diario" subtitle={`Optimización logística (VRP · Google OR-Tools simulado) · Total estimado ${total.toFixed(1)} km`}
        action={<div className="flex gap-2"><Btn variant="ghost" onClick={() => setCols({ pool: pacientes, E1: [], E2: [], E3: [] })}>Reiniciar</Btn><Btn onClick={run} disabled={busy}>{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Cpu className="h-4 w-4" />}Optimizar rutas</Btn></div>} />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Column id="pool" title="Visitas sin asignar" sub="Agenda importada" />
        {equipos.map((e) => <Column key={e.id} id={e.id} title={e.nombre} sub={e.vehiculo} />)}
      </div>
    </>
  );
}
