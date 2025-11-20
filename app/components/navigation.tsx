"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Upload,
  LayoutDashboard,
  ShoppingCart,
  Settings,
  LogOut,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
// Importar y Exportar - Comentado para implementación futura
// import { DataExportActions } from './data-export-actions';
import { useAuth } from "@/lib/supabase/auth-context";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

const navigation = [
  { name: "Ingresos", href: "/upload", icon: Upload },
  { name: "Gastos", href: "/expenses", icon: ShoppingCart },
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
];

export function Navigation() {
  const pathname = usePathname();
  const { user, signOut, loading } = useAuth();
  const router = useRouter();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const handleSignOut = async () => {
    await signOut();
    router.push("/auth/login");
  };

  // Cerrar menú al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setIsUserMenuOpen(false);
      }
    };

    if (isUserMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isUserMenuOpen]);

  // No mostrar navegación en páginas de auth
  if (pathname?.startsWith("/auth")) {
    return null;
  }

  // Si no está autenticado, redirigir a login
  if (!loading && !user) {
    router.push("/auth/login");
    return null;
  }

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center h-16 gap-4">
          {/* Logo - más a la izquierda */}
          <Link
            href="/"
            className="text-lg md:text-xl font-bold text-gray-900 whitespace-nowrap shrink-0"
          >
            <span className="hidden sm:inline">TresA Control Financiero</span>
            <span className="sm:hidden">TresA</span>
          </Link>

          {/* Navegación centrada */}
          {user && (
            <div className="flex items-center gap-1 flex-1 justify-center">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-1 md:gap-2 px-2 md:px-4 py-2 rounded-md text-xs md:text-sm font-medium transition-colors whitespace-nowrap",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    )}
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    <span className="hidden sm:inline">{item.name}</span>
                  </Link>
                );
              })}
            </div>
          )}

          {/* Menú de usuario */}
          {user && (
            <div className="relative" ref={userMenuRef}>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 shrink-0"
                title="Menú de usuario"
              >
                <User className="h-4 w-4" />
              </Button>

              {/* Menú desplegable */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50">
                  {/* Email */}
                  <div className="px-4 py-3 border-b border-gray-200">
                    <p className="text-sm font-medium text-gray-900">
                      {user.email}
                    </p>
                  </div>

                  {/* Opción Perfil */}
                  <Link
                    href="/settings"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <Settings className="h-4 w-4" />
                    Perfil
                  </Link>

                  {/* Separador */}
                  <div className="border-t border-gray-200 my-1" />

                  {/* Opción Salir */}
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      handleSignOut();
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    Salir
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
