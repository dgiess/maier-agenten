import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Rolf Maier & Co AG - KI-Agentensystem",
  description: "Internes KI-System mit Leon, Lorena, Sabrina und Mirjam",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  );
}
