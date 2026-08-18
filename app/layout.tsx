import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/components/providers/query-provider";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Tip4ServScript } from "@/components/providers/tip4serv-script";
import { getStoreWhoami } from "@/lib/api-client";

const inter = Inter({ variable: "--font-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Cloudy | Rust Store",
  description: "The official Cloudy Rust store for ranks, kits and exclusive server perks.",
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const initialStore = await getStoreWhoami();

  return (
    <html lang="en">
      <body className={inter.variable + " antialiased"} suppressHydrationWarning>
        <QueryProvider>
          <Tip4ServScript />
          <div className="min-h-screen flex flex-col">
            <Header initialStore={initialStore} />
            <main className="flex-1">{children}</main>
            <Footer initialStore={initialStore} />
          </div>
        </QueryProvider>
      </body>
    </html>
  );
}
