import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Weva — Voce in Preventivi",
  description:
    "Registra una nota audio e trasformala in un preventivo professionale con AI on-device. Nessun server, nessun costo, totale privacy.",
  openGraph: {
    title: "Weva — Voce in Preventivi",
    description: "Trasforma la tua voce in preventivi professionali con AI on-device.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it">
      <body className={`${geistSans.variable} antialiased`}>{children}</body>
    </html>
  );
}
