import { useEffect, useRef } from "react";
import L from "leaflet";
import { CESFAM, pacientes } from "@/lib/data";

const color = { Alta: "#b4573f", Media: "#c49a4a", Baja: "#6b8f6b" } as const;

export default function RuralMap({ filtro }: { filtro: string }) {
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const layer = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!el.current || map.current) return;
    map.current = L.map(el.current).setView([CESFAM.lat, CESFAM.lng], 12);
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", { attribution: "© OpenStreetMap contributors" }).addTo(map.current);
    L.circleMarker([CESFAM.lat, CESFAM.lng], { radius: 10, color: "#4a3f35", fillColor: "#4a3f35", fillOpacity: 1 }).bindPopup(`<b>${CESFAM.nombre}</b>`).addTo(map.current);
    layer.current = L.layerGroup().addTo(map.current);
    return () => { map.current?.remove(); map.current = null; };
  }, []);

  useEffect(() => {
    layer.current?.clearLayers();
    pacientes.filter((p) => filtro === "Todos" || p.sector === filtro).forEach((p) => {
      L.circleMarker([p.lat, p.lng], { radius: 8, color: "#fff", weight: 2, fillColor: color[p.prioridad], fillOpacity: 0.95 })
        .bindPopup(`<b>${p.nombre}</b><br/>${p.sector}<br/>${p.prestacion} · Prioridad ${p.prioridad}`)
        .addTo(layer.current!);
    });
  }, [filtro]);

  return <div ref={el} className="h-[560px] w-full rounded-xl" />;
}
