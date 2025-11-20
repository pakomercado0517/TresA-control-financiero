import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navigation } from "./components/navigation";
import { Footer } from "./components/footer";
import { Toaster } from "sonner";
import { ServiceWorkerRegister } from "./components/service-worker-register";
import { AuthProvider } from "@/lib/supabase/auth-context";
import { SupabaseSync } from "./components/supabase-sync";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TresA Control Financiero",
  description:
    "Sistema de control financiero mediante procesamiento de facturas XML (CFDI México). Controla tus ingresos y gastos de forma simple y profesional.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "TresA Control",
  },
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: [{ url: "/favicon.ico", type: "image/x-icon" }],
  },
};

export function generateViewport() {
  return {
    themeColor: "#0047AB", // Azul cobalto corporativo
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <SupabaseSync />
          <ServiceWorkerRegister />
          <Navigation />
          <main className="min-h-screen bg-gray-50">{children}</main>
          <Footer />
          <Toaster position="top-right" richColors />
        </AuthProvider>
      </body>
    </html>
  );
}
