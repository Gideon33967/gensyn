import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GenSyn Node Simulator",
  description: "Run a GenSyn node in your browser",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body>{children}</body>
    </html>
  );
}
