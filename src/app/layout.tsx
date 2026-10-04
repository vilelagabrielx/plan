import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Planner de Vida - Alessandra",
  description: "Sistema operacional pessoal mobile-first no padrão Apple HIG.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Planner de Vida",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="h-full" suppressHydrationWarning>
      <head suppressHydrationWarning>
        <meta name="theme-color" content="#EF7689" />
      </head>
      <body className="h-full bg-[#E5E5EA] dark:bg-[#09070D] antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
