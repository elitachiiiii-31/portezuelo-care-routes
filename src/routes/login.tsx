import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Lock, UserCheck, LogOut } from "lucide-react";
import { PageHeader, Btn } from "../components/AppShell";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

export interface UsuarioSesion {
  usuario: string;
  nombre: string;
  rol: "Coordinador" | "Trabajador Terreno" | "Chofer";
  equipoAsignado?: string;
  movilAsignado?: string;
  destinoInicial: "/" | "/terreno" | "/chofer";
}

export const SESION_STORAGE_KEY = "optiruta_sesion_activa_v1";

const CUENTAS_DEMO: Array<{
  usuario: string;
  clave: string;
  perfil: UsuarioSesion;
}> = [
  {
    usuario: "coord.portezuelo",
    clave: "123",
    perfil: {
      usuario: "coord.portezuelo",
      nombre: "Coordinación CESFAM Portezuelo",
      rol: "Coordinador",
      destinoInicial: "/",
    },
  },
  {
    usuario: "carla.soto",
    clave: "123",
    perfil: {
      usuario: "carla.soto",
      nombre: "Enf. Carla Soto",
      rol: "Trabajador Terreno",
      equipoAsignado: "Enf. Carla Soto",
      destinoInicial: "/terreno",
    },
  },
  {
    usuario: "diego.rojas",
    clave: "123",
    perfil: {
      usuario: "diego.rojas",
      nombre: "TENS Diego Rojas",
      rol: "Trabajador Terreno",
      equipoAsignado: "TENS Diego Rojas",
      destinoInicial: "/terreno",
    },
  },
  {
    usuario: "ana.vidal",
    clave: "123",
    perfil: {
      usuario: "ana.vidal",
      nombre: "Kine. Ana Vidal",
      rol: "Trabajador Terreno",
      equipoAsignado: "Kine. Ana Vidal",
      destinoInicial: "/terreno",
    },
  },
  {
    usuario: "marcos.ruiz",
    clave: "123",
    perfil: {
      usuario: "marcos.ruiz",
      nombre: "Chofer Marcos Ruiz",
      rol: "Chofer",
      movilAsignado: "Móvil 1 · Chofer Marcos Ruiz (Enf. Carla Soto)",
      destinoInicial: "/chofer",
    },
  },
  {
    usuario: "patricio.lagos",
    clave: "123",
    perfil: {
      usuario: "patricio.lagos",
      nombre: "Chofer Patricio Lagos",
      rol: "Chofer",
      movilAsignado: "Móvil 2 · Chofer Patricio Lagos (TENS Diego Rojas)",
      destinoInicial: "/chofer",
    },
  },
];

function LoginPage() {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState("");
  const [clave, setClave] = useState("");
  const [error, setError] = useState("");

  const [sesionActual, setSesionActual] = useState<UsuarioSesion | null>(() => {
    try {
      const raw = localStorage.getItem(SESION_STORAGE_KEY);
      return raw ? (JSON.parse(raw) as UsuarioSesion) : null;
    } catch {
      return null;
    }
  });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    const encontrada = CUENTAS_DEMO.find(
      (c) =>
        c.usuario.toLowerCase() === usuario.trim().toLowerCase() &&
        c.clave === clave
    );

    if (!encontrada) {
      setError("Credenciales inválidas. Revisa el usuario y la contraseña.");
      return;
    }

    try {
      localStorage.setItem(SESION_STORAGE_KEY, JSON.stringify(encontrada.perfil));
    } catch {
      // Ignorar errores de storage
    }

    setSesionActual(encontrada.perfil);
    navigate({ to: encontrada.perfil.destinoInicial });
  }

  function handleCerrarSesion() {
    try {
      localStorage.removeItem(SESION_STORAGE_KEY);
    } catch {
      // Ignorar errores de storage
    }
    setSesionActual(null);
    setUsuario("");
    setClave("");
  }

  return (
    <div className="max-w-3xl">
      <PageHeader
        title="Acceso al Sistema · CESFAM Portezuelo"
        subtitle="Inicio de sesión con credenciales para coordinación, equipos de terreno y choferes"
      />

      {sesionActual && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card p-4">
          <div className="flex items-center gap-3 text-sm">
            <UserCheck className="h-5 w-5 text-primary" />
            <div>
              <p className="font-semibold">{sesionActual.nombre}</p>
              <p className="text-xs text-muted-foreground">
                Perfil: {sesionActual.rol} · Usuario: {sesionActual.usuario}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Btn
              variant="ghost"
              onClick={() => navigate({ to: sesionActual.destinoInicial })}
            >
              Ir a mi vista
            </Btn>
            <Btn variant="ghost" onClick={handleCerrarSesion}>
              <LogOut className="h-4 w-4" />
              Cerrar sesión
            </Btn>
          </div>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-xl border bg-card p-6"
      >
        <div>
          <h2 className="text-lg font-semibold">Iniciar sesión</h2>
          <p className="text-xs text-muted-foreground">
            Ingresa tus credenciales asignadas para cargar tu módulo de trabajo.
          </p>
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="login-usuario"
              className="mb-1 block text-xs font-medium text-muted-foreground"
            >
              Usuario institucional
            </label>
            <input
              id="login-usuario"
              type="text"
              required
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              placeholder="Ej. carla.soto"
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label
              htmlFor="login-clave"
              className="mb-1 block text-xs font-medium text-muted-foreground"
            >
              Contraseña
            </label>
            <input
              id="login-clave"
              type="password"
              required
              value={clave}
              onChange={(e) => setClave(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Btn type="submit">
            <Lock className="h-4 w-4" />
            Ingresar al sistema
          </Btn>
        </div>

        <div className="border-t pt-4 text-xs text-muted-foreground">
          <p className="font-medium text-foreground">
            Credenciales de prueba disponibles (clave: <code>123</code>):
          </p>
          <p className="mt-1">
            Coordinación: <code>coord.portezuelo</code> · Terreno:{" "}
            <code>carla.soto</code>, <code>diego.rojas</code>,{" "}
            <code>ana.vidal</code> · Choferes: <code>marcos.ruiz</code>,{" "}
            <code>patricio.lagos</code>
          </p>
        </div>
      </form>
    </div>
  );
}