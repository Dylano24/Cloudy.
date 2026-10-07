import type { Metadata } from "next";
import { Anton, Manrope } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

const anton = Anton({ weight: "400", subsets: ["latin"], variable: "--font-display" });
const manrope = Manrope({ subsets: ["latin"], variable: "--font-sans" });
const CLOUDY_LOGO_URL = "https://cdn.jsdelivr.net/gh/Dylano24/Cloudy@f2fc2ba3873d420bcdda0e3ea260cf5d312e528a/assets/cloudy-c-logo-auf-auf.gif";

export const metadata: Metadata = {
  title: "Cloudy Inc. — Where Games Meet Quality",
  description: "Cloudy Inc. is a gaming company creating and operating gaming projects, digital services and community experiences.",
  icons: {
    icon: CLOUDY_LOGO_URL,
    shortcut: CLOUDY_LOGO_URL,
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${anton.variable} ${manrope.variable} antialiased`} suppressHydrationWarning>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
