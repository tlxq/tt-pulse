import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TT-Pulse | Home-lab Dashboard",
  description: "Real-time monitoring for your nodes",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sv" className="dark">
      <body className={`${inter.className} bg-[#020617] text-slate-200 antialiased`}>
        {children}
      </body>
    </html>
  );
}
