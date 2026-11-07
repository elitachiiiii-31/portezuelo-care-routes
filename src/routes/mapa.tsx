import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense, useEffect, useState } from "react";
import { PageHeader } from "@/components/AppShell";
import { pacientes, prioridadClass } from "@/lib/data";

const RuralMap = lazy(() => import("@/components/RuralMap"));

export const Route = createFileRoute("/mapa")({
  head: () => ({
    meta: [
      { title: "Georreferenciación rural · CESFAM Portezuelo" },
      { name: "description", content: "Mapa interactivo de pacientes domiciliarios en sectores rurales de Portezuelo." },
      { property: "og:title", content: "Georreferenciación rural · CESFAM Portezuelo" },
      { property: "og:description", content: "Mapa interactivo de pacientes domiciliarios." },
    ],
  }),
  component: Mapa,
});

const sectores = ["Todos", ...Array.from(new Set(pacientes.map((p) => p.sector)))];

function Mapa() {
  const [filtro, setFiltro] = useState("Todos");
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  const lista = pacientes.filter((p) => filtro === "Todos" || p.sector === filtro);
  return (
    <>
      <PageHeader title="Georreferenciación rural" subtitle="Ubicación de pacientes y sectores de la comuna" />
      <div className="mb-4 flex flex-wrap gap-2">
        {sectores.map((s) => (
          <button key={s} onClick={() => setFiltro(s)} className={`rounded-full border px-3 py-1 text-sm ${filtro === s ? "bg-primary text-primary-foreground" : "bg-card hover:bg-muted"}`}>{s}</button>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-4">
        <div className="card-surface p-2 lg:col-span-3">
          {ready ? <Suspense fallback={<div className="h-[560px]" />}><RuralMap filtro={filtro} /></Suspense> : <div className="h-[560px]" />}
        </div>
        <div className="card-surface max-h-[576px] overflow-auto p-4">
          <h2 className="text-lg">{lista.length} pacientes</h2>
          <ul className="mt-3 space-y-2">
            {lista.map((p) => (
              <li key={p.id} className="rounded-lg border p-3 text-sm">
                <div className="flex justify-between"><span className="font-medium">{p.nombre}</span><span className={`rounded-full px-2 text-xs ${prioridadClass[p.prioridad]}`}>{p.prioridad}</span></div>
                <p className="text-xs text-muted-foreground">{p.sector} · {p.prestacion}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}
