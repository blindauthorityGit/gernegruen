import type { Metadata } from "next";
import localFont from "next/font/local";
import { createPageMetadata } from "@/lib/seo";
import "react-day-picker/style.css";
import "./globals.css";

const nunito = localFont({
  src: "../public/fonts/Nunito-Variable.ttf",
  variable: "--font-nunito",
  weight: "400 800",
});

export const metadata: Metadata = createPageMetadata({
  title: "GerneGrün – Lebensmittel in Dreieich",
  description: "Entdecke Obst, Gemüse, Brot und mehr bei GerneGrün in Dreieich.",
  path: "/",
  keywords: ["Obst", "Gemüse", "Brot", "Lebensmittel"],
});

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="de"
      className={`${nunito.variable} h-full`}
    >
      <body>{children}</body>
    </html>
  );
}
