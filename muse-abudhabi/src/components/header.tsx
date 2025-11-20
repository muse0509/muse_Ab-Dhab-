// components/header.tsx
"use client";

import Link from "next/link";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useLanguage } from "./language-provider";
import { Globe2 } from "lucide-react";

const sections = [
  { id: "top", labelEn: "Top", labelJa: "トップ" },
  { id: "story", labelEn: "Story", labelJa: "ストーリー" },
  { id: "plan", labelEn: "Plan", labelJa: "プラン" },
  { id: "tiers", labelEn: "Tiers", labelJa: "ティア" },
];

export function Header() {
  const { lang, toggleLang } = useLanguage();
  const isEn = lang === "en";

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-slate-800/70 bg-slate-950/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:px-6">
        <Link href="#top" className="flex items-center gap-2">
          
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold tracking-tight">
              Muse to AbuDhabi
            </span>
            <span className="text-[10px] text-slate-400">
              Axis Global Launch
            </span>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 text-xs font-medium text-slate-300 md:flex">
          {sections.map((s) => (
            <Link
              key={s.id}
              href={`#${s.id}`}
              className="transition hover:text-emerald-300"
            >
              {isEn ? s.labelEn : s.labelJa}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 md:gap-3">
          <button
            type="button"
            onClick={toggleLang}
            className="inline-flex items-center gap-1 rounded-full border border-slate-700 bg-slate-900/80 px-2.5 py-1 text-[11px] font-medium text-slate-200 shadow-sm transition hover:border-emerald-500/70 hover:bg-slate-900"
          >
            <Globe2 className="h-3 w-3" />
            <span
              className={
                isEn ? "font-semibold text-emerald-300" : "text-slate-400"
              }
            >
              EN
            </span>
            <span className="text-slate-500">/</span>
            <span
              className={
                !isEn ? "font-semibold text-emerald-300" : "text-slate-400"
              }
            >
              日本語
            </span>
          </button>

          <div className="hidden md:block">
            <WalletMultiButton className="!h-9 !rounded-full !border !border-emerald-400/40 !bg-emerald-500/10 !px-3 !text-xs !font-semibold hover:!bg-emerald-500/20" />
          </div>
        </div>
      </div>
    </header>
  );
}
