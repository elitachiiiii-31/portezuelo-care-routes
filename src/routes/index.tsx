import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/AppShell";
import { Users, CheckCircle2, Timer, Fuel, MapPin, TrendingUp } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard · CESFAM Portezuelo" },
      { name: "description", content: "KPIs de la atención domiciliaria del CESFAM Portezuelo." },
      { property: "og:title", content: "Dashboard · CESFAM Portezuelo" },
      { property: "og:description", content: "KPIs de la atención domiciliaria del CESFAM Portezuelo." },
    ],
  }),
  component: Dashboard,
});

const kpis = [
  { label: "Visitas programadas hoy", value: "42", delta: "+6 vs ayer", icon: Users },
  { label: "Cumplimiento", value: "87%", delta: "+4 pts semana", icon: CheckCircle2 },
  { label: "Tiempo promedio visita", value: "38 min", delta: "−3 min", icon: Timer },
  { label: "Km recorridos", value: "214 km", delta: "−12% con OR-Tools", icon: Fuel },
  { label: "Cierres por GPS", value: "76%", delta: "24% manuales", icon: MapPin },
  { label: "Pacientes activos", value: "318", delta: "+9 este mes", icon: TrendingUp },
];

const semana = [
  { d: "Lun", v: 36 }, { d: "Mar", v: 41 }, { d: "Mié", v: 38 }, { d: "Jue", v: 44 }, { d: "Vie", v: 40 }, { d: "Sáb", v: 18 }, { d: "Hoy", v: 42 },
];
const sectores = [
  { s: "Portezuelo Urbano", v: 34 }, { s: "Cucha Cucha", v: 22 }, { s: "Llahuecuy", v: 18 }, { s: "Buenos Aires", v: 14 }, { s: "Chudal", v: 7 }, { s: "Tauco", v: 5 },
];

function Dashboard() {
  const max = Math.max(...semana.map((x) => x.v));
  return (
    <>
      <PageHeader title="Dashboard" subtitle="Indicadores clave de la atención domiciliaria rural" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {kpis.map((k) => (
          <div key={k.label} className="card-surface p-5">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-sm">{k.label}</span>
              <k.icon className="h-4 w-4" />
            </div>
            <p className="mt-3 font-display text-4xl">{k.value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{k.delta}</p>
          </div>
        ))}
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-5">
        <div className="card-surface p-6 lg:col-span-3">
          <h2 className="text-lg">Visitas realizadas · últimos 7 días</h2>
          <div className="mt-6 flex h-48 items-end gap-3">
            {semana.map((x) => (
              <div key={x.d} className="flex flex-1 flex-col items-center gap-2">
                <span className="text-xs text-muted-foreground">{x.v}</span>
                <div className="w-full rounded-t-md bg-primary/80" style={{ height: `${(x.v / max) * 100}%` }} />
                <span className="text-xs">{x.d}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="card-surface p-6 lg:col-span-2">
          <h2 className="text-lg">Distribución por sector</h2>
          <div className="mt-5 space-y-3">
            {sectores.map((x) => (
              <div key={x.s}>
                <div className="flex justify-between text-sm"><span>{x.s}</span><span className="text-muted-foreground">{x.v}%</span></div>
                <div className="mt-1 h-2 rounded-full bg-muted"><div className="h-2 rounded-full bg-primary/70" style={{ width: `${x.v}%` }} /></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
