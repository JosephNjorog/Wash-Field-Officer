import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "leaflet/dist/leaflet.css";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthHydrator } from "@/components/shared/auth-hydrator";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

const SITE_URL = "https://washfieldofficer.vercel.app";
const TITLE = "FieldWatch | WASH Field Officer Monitoring & Service Delivery";
const DESCRIPTION =
  "FieldWatch is a digital platform for water and sanitation institutions in Kenya and East Africa to manage field officer inspections, infrastructure assets, customer complaints, and service delivery in real time.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    template: "%s | FieldWatch",
  },
  description: DESCRIPTION,
  keywords: [
    "WASH monitoring",
    "field officer management",
    "water and sanitation Kenya",
    "service delivery management",
    "infrastructure asset registry",
    "complaint management system",
    "East Africa WASH platform",
  ],
  authors: [{ name: "FieldWatch" }],
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/icons/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "FieldWatch",
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "FieldWatch",
    title: TITLE,
    description: DESCRIPTION,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "FieldWatch — WASH Field Officer Monitoring & Service Delivery Management",
      },
    ],
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1A3C6E",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn(inter.variable)}>
      <body className="font-sans antialiased">
        <TooltipProvider delayDuration={200}>
          <AuthHydrator />
          {children}
          <Toaster richColors position="top-right" />
        </TooltipProvider>
      </body>
    </html>
  );
}
