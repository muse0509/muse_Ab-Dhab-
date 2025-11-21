// components/header.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useLanguage } from "./language-provider";
import { Globe2, Menu, X } from "lucide-react"; // Menu, X アイコンを追加

const sections = [
  { id: "top", labelEn: "Top", labelJa: "トップ" },
  { id: "story", labelEn: "Story", labelJa: "ストーリー" },
  { id: "plan", labelEn: "Plan", labelJa: "プラン" },
  { id: "tiers", labelEn: "Tiers", labelJa: "ティア" }, // IDを mint ではなく tiers としている場合はこれでOK
];

export function Header() {
  const { lang, toggleLang } = useLanguage();
  const isEn = lang === "en";
  
  // モバイルメニューの開閉状態管理
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // リンククリック時にメニューを閉じる関数
  const handleLinkClick = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-slate-800/70 bg-slate-950/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:px-6">
        {/* ロゴ */}
        <Link href="#top" className="flex items-center gap-2 z-50 relative">
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold tracking-tight">
              Muse to AbuDhabi
            </span>
            <span className="text-[10px] text-slate-400">
              Axis Global Launch
            </span>
          </div>
        </Link>

        {/* デスクトップ用ナビゲーション (スマホでは非表示) */}
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

        {/* 右側のコントロール群 */}
        <div className="flex items-center gap-2 md:gap-3 z-50 relative">
          {/* 言語切り替えボタン */}
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

          {/* デスクトップ用ウォレットボタン (スマホでは非表示) */}
          <div className="hidden md:block">
            <WalletMultiButton className="!h-9 !rounded-full !border !border-emerald-400/40 !bg-emerald-500/10 !px-3 !text-xs !font-semibold hover:!bg-emerald-500/20" />
          </div>

          {/* ハンバーガーメニューボタン (PCでは非表示) */}
          <button
            className="flex items-center justify-center rounded-full p-1 text-slate-300 hover:bg-slate-800 md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* ▼▼▼ モバイルメニュー (スマホのみ表示) ▼▼▼ */}
      {isMobileMenuOpen && (
        <div className="absolute inset-x-0 top-full h-screen border-t border-slate-800 bg-slate-950/95 px-4 py-6 backdrop-blur-xl md:hidden">
          <div className="flex flex-col space-y-6">
            {/* ナビゲーションリンク */}
            <nav className="flex flex-col gap-4">
              {sections.map((s) => (
                <Link
                  key={s.id}
                  href={`#${s.id}`}
                  onClick={handleLinkClick}
                  className="border-b border-slate-800 pb-3 text-sm font-medium text-slate-300 transition hover:text-emerald-300"
                >
                  {isEn ? s.labelEn : s.labelJa}
                </Link>
              ))}
            </nav>

            {/* スマホ用ウォレット接続ボタン */}
            <div className="pt-2">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Wallet Connection
              </p>
              <div className="flex justify-center">
                <WalletMultiButton className="!w-full !justify-center !h-10 !rounded-xl !border !border-emerald-500/50 !bg-emerald-500/20 !px-4 !text-sm !font-bold hover:!bg-emerald-500/30" />
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}