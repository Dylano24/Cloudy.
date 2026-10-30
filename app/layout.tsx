import type { Metadata } from "next";
import { Space_Grotesk, Geist } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { QueryProvider } from "@/components/providers/query-provider";
import { Tip4ServScript } from "@/components/providers/tip4serv-script";
import { CloudyHelp } from "@/components/help/cloudy-help";
import { DecorativeVisibility } from "@/components/providers/decorative-visibility";

// Unified Cloudy typography across the storefront, VPN, Bot, documentation and dashboard.
// The fonts are bundled by Next.js, not fetched from a third-party runtime URL.
const displayFont = Space_Grotesk({ subsets: ["latin"], variable: "--font-display", display: "swap" });
const bodyFont = Geist({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const CLOUDY_LOGO_URL = "https://cdn.jsdelivr.net/gh/Dylano24/Cloudy@f2fc2ba3873d420bcdda0e3ea260cf5d312e528a/assets/cloudy-c-logo-auf-auf.gif";

const SITE_TITLE = "Cloudy Inc. Where games meet quality";
const SITE_DESCRIPTION = "Cloudy Inc. is a gaming company creating and operating gaming projects, digital services and community experiences.";

export const metadata: Metadata = {
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  icons: {
    icon: CLOUDY_LOGO_URL,
    shortcut: CLOUDY_LOGO_URL,
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${displayFont.variable} ${bodyFont.variable} antialiased`} suppressHydrationWarning>
        <QueryProvider>
          <Tip4ServScript />
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
            <CloudyHelp />
            <DecorativeVisibility />
          </div>
        </QueryProvider>
      </body>
    </html>
  );
}
