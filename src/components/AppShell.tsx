import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import {
  LayoutDashboard,
  DatabaseZap,
  Map,
  Route as RouteIcon,
  Activity,
  ShieldCheck,
  Stethoscope,
  Car,
  Truck,
  LogIn,
  PanelLeft,
} from "lucide-react";

const items = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/integracion", label: "Integración Rayen", icon: DatabaseZap },
  { to: "/mapa", label: "Georreferenciación", icon: Map },
  { to: "/planificador", label: "Planificador", icon: RouteIcon },
  { to: "/supervision", label: "Supervisión", icon: Activity },
  { to: "/moviles", label: "Estado Móviles", icon: Truck },
  { to: "/terreno", label: "Vista Terreno", icon: Stethoscope },
  { to: "/chofer", label: "Vista Chofer", icon: Car },
  { to: "/auditoria", label: "Auditoría", icon: ShieldCheck },
  { to: "/login", label: "Iniciar Sesión", icon: LogIn },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState<boolean>(() =>
    typeof window !== "undefined" ? window.innerWidth >= 768 : true
  );
  const path = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      setOpen(false);
    }
  }, [path]);

  return (
    <div className="flex min-h-screen w-full">
      <aside
        className={`${
          open ? "w-60 sm:w-64" : "w-14 sm:w-16"
        } sticky top-0 h-screen shrink-0 border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-all`}
      >
        <div className="flex h-16 items-center gap-3 px-3 sm:px-4">
          <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary font-display text-primary-foreground">
            P
          </div>
          {open && (
            <div className="min-w-0 leading-tight">
              <p className="truncate font-display text-sm sm:text-base">
                CESFAM Portezuelo
              </p>
              <p className="truncate text-xs text-muted-foreground">
                Atención domiciliaria
              </p>
            </div>
          )}
        </div>
        <nav className="mt-4 space-y-1 px-2">
          {items.map((it) => {
            const active = path === it.to;
            return (
              <Link
                key={it.to}
                to={it.to}
                title={it.label}
                className={`flex items-center gap-3 rounded-lg px-2.5 py-2.5 text-sm transition-colors sm:px-3 ${
                  active
                    ? "bg-sidebar-accent font-semibold shadow-sm"
                    : "hover:bg-sidebar-accent/60"
                }`}
              >
                <it.icon className="h-4 w-4 shrink-0" />
                {open && <span className="truncate">{it.label}</span>}
              </Link>
            );
          })}
        </nav>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b px-4 sm:px-6">
          <button
            onClick={() => setOpen(!open)}
            className="rounded-md p-2 hover:bg-muted"
            aria-label="Alternar menú"
          >
            <PanelLeft className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-2 text-xs text-muted-foreground sm:gap-3 sm:text-sm">
            <span className="flex items-center gap-1.5">
              <span className="pulse-dot h-2 w-2 rounded-full bg-success" /> En
              línea
            </span>
            <span className="hidden md:inline">
              · Coordinación · {new Date().toLocaleDateString("es-CL")}
            </span>
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl sm:text-3xl">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
      </div>
      {action}
    </div>
  );
}

export function Btn({
  children,
  variant = "primary",
  ...p
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost";
}) {
  const v =
    variant === "primary"
      ? "bg-primary text-primary-foreground hover:bg-primary/90"
      : "border bg-card hover:bg-muted";
  return (
    <button
      {...p}
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors disabled:opacity-50 ${v} ${
        p.className ?? ""
      }`}
    >
      {children}
    </button>
  );
}