import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/dark-mode/theme-provider";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Administración Municipal - San Luis",
  description: "Portal de administración municipal para la Ciudad de San Luis.",
  icons: {
    icon: [
      {
        url: "/web/icons8-city-block-hatch-16.png",
        sizes: "16x16",
        type: "image/png",
      },
      {
        url: "/web/icons8-city-block-hatch-32.png",
        sizes: "32x32",
        type: "image/png",
      },
      {
        url: "/web/icons8-city-block-hatch-57.png",
        sizes: "57x57",
        type: "image/png",
      },
      {
        url: "/web/icons8-city-block-hatch-60.png",
        sizes: "60x60",
        type: "image/png",
      },
      {
        url: "/web/icons8-city-block-hatch-70.png",
        sizes: "70x70",
        type: "image/png",
      },
      {
        url: "/web/icons8-city-block-hatch-72.png",
        sizes: "72x72",
        type: "image/png",
      },
      {
        url: "/web/icons8-city-block-hatch-76.png",
        sizes: "76x76",
        type: "image/png",
      },
      {
        url: "/web/icons8-city-block-hatch-96.png",
        sizes: "96x96",
        type: "image/png",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SidebarProvider>
            <AppSidebar />
            <SidebarInset className="flex flex-col min-h-screen">
              <Header />
              <div className="flex-1">{children}</div>
              <Footer />
            </SidebarInset>
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
