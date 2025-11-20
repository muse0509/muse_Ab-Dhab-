// app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SolanaWalletProvider } from "@/components/solana-wallet-provider";
import { LanguageProvider } from "@/components/language-provider";
import { Header } from "@/components/header";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Muse to AbuDhabi | Axis Global Launch",
  description:
    "Support Muse, a 20-year-old founder, to join Solana Breakpoint / SEZ in Abu Dhabi and create the global challenge playbook.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} bg-slate-950 text-slate-50 antialiased`}
      >
        <SolanaWalletProvider>
          <LanguageProvider>
            <Header />
            <main className="pt-20">{children}</main>
          </LanguageProvider>
        </SolanaWalletProvider>
      </body>
    </html>
  );
}
