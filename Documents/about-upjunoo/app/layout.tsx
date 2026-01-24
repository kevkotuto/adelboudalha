import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "UPJUNOO - Solutions intelligentes pour un monde connecté",
  description: "Découvrez notre écosystème complet de solutions interconnectées au service de la mobilité, du commerce, des paiements, de la donnée et des services numériques.",
  icons: {
    icon: [
      { url: "/logo_carrer.png", sizes: "32x32", type: "image/png" },
      { url: "/logo_carrer.png", sizes: "16x16", type: "image/png" }
    ],
    apple: "/logo_carrer.png",
    shortcut: "/logo_carrer.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
