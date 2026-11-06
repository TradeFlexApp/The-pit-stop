import type { Metadata, Viewport } from "next";
import { Bebas_Neue, Geist } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

const geist = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const bebas = Bebas_Neue({ weight: "400", variable: "--font-bebas", subsets: ["latin"] });

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000");

export const viewport: Viewport = { themeColor: "#0d0d0d", width: "device-width", initialScale: 1 };

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "The Pit Stop | Smash Burgers & Breakfast in Fort McMurray", template: "%s | The Pit Stop" },
  description:
    "Fresh beef smashed to order, breakfast sandwiches till 11, loaded fries and hand-spun shakes. 530 MacKenzie Blvd, Fort McMurray. Pick your engine size: 1500, 2500 or 3500.",
  openGraph: {
    title: "The Pit Stop | Smash Burgers & Breakfast in Fort McMurray",
    description: "Fresh beef smashed to order. Breakfast till 11. 530 MacKenzie Blvd, Fort McMurray.",
    images: ["/media/hero-poster.jpg"],
    locale: "en_CA",
    type: "website",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-CA" className={`${geist.variable} ${bebas.variable}`}>
      <body className="antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
