import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/navigation";
import { AuthProvider } from "@/components/auth-provider";
import DemoBanner from "@/components/demo-banner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "JuiceBox Factory - Discover the Best Developer Tools",
  description: "The definitive platform for discovering, comparing, and reviewing top-tier development tools. Find animation libraries, AI tools, no-code platforms, and more.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body
        className={`${inter.variable} font-sans antialiased min-h-full bg-gray-50 dark:bg-gray-950`}
      >
        <AuthProvider>
          <DemoBanner />
          <Navigation />
          <main className="min-h-screen">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
