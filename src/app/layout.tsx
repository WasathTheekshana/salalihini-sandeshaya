import type { Metadata, Viewport } from "next";
import {
  Cormorant_Garamond,
  Geist,
  Noto_Sans_Sinhala,
  Noto_Serif_Sinhala,
} from "next/font/google";
import { Suspense } from "react";
import { Header } from "@/components/Header";
import { LoadingScreen } from "@/components/LoadingScreen";
import { PrefsProvider } from "@/components/providers/Prefs";
import Backdrop from "@/components/scene/Backdrop";
import SceneLoader from "@/components/scene/SceneLoader";
import "./globals.css";

const sans = Geist({ variable: "--font-sans-ui", subsets: ["latin"] });
const display = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});
const elu = Noto_Serif_Sinhala({
  variable: "--font-elu",
  subsets: ["sinhala", "latin"],
});
const sinhala = Noto_Sans_Sinhala({
  variable: "--font-sinhala",
  subsets: ["sinhala", "latin"],
});

const SITE_DESCRIPTION =
  "Read all 111 verses of the fifteenth-century Sinhala classic Salalihini Sandeshaya (The Starling's Message) with explanations in Sinhala and English, as a starling flies from Kotte to Kelaniya.";

export const metadata: Metadata = {
  title: {
    default: "සැළලිහිණි සංදේශය · Salalihini Sandeshaya",
    template: "%s · Salalihini Sandeshaya",
  },
  description: SITE_DESCRIPTION,
  applicationName: "Salalihini Sandeshaya",
  keywords: [
    "Salalihini Sandeshaya",
    "සැළලිහිණි සංදේශය",
    "Selalihini Sandesaya",
    "Thotagamuwe Sri Rahula",
    "Sinhala poetry",
    "Sandesha Kavya",
    "Kotte",
    "Kelaniya",
  ],
  openGraph: {
    title: "සැළලිහිණි සංදේශය · The Starling's Message",
    description: SITE_DESCRIPTION,
    type: "website",
    locale: "en_LK",
    alternateLocale: ["si_LK"],
  },
};

export const viewport: Viewport = {
  themeColor: "#0b0820",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${sans.variable} ${display.variable} ${elu.variable} ${sinhala.variable} h-full antialiased`}
    >
      <body className="relative min-h-dvh">
        <PrefsProvider>
          <LoadingScreen />
          <Suspense fallback={null}>
            <Backdrop />
            <SceneLoader />
            <Header />
          </Suspense>
          <a
            href="#main"
            className="fixed left-4 top-3 z-[70] -translate-y-16 rounded-full bg-gold px-4 py-2 text-sm font-medium text-black focus:translate-y-0"
          >
            Skip to content
          </a>
          {children}
        </PrefsProvider>
      </body>
    </html>
  );
}
