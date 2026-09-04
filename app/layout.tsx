import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

const inter = Inter({ variable: "--font-sans", subsets: ["latin"] });
const CLOUDY_LOGO_URL = "https://raw.githubusercontent.com/Dylano24/Cloudy/main/assets/cloudy-c-logo-auf-auf.gif";

export const metadata: Metadata = {
  title: "Cloudy | Rust Store",
  description: "The official Cloudy Rust website for server information, ranks and future store access.",
  icons: {
    icon: CLOUDY_LOGO_URL,
    shortcut: CLOUDY_LOGO_URL,
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={inter.variable + " antialiased"} suppressHydrationWarning>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
