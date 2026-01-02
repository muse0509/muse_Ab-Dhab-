"use client";

import React, { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { useWallet } from "@solana/wallet-adapter-react";
import bs58 from "bs58";
import {
  Loader2,
  Lock,
  Unlock,
  Download,
  ExternalLink,
  FileText,
  Music,
  Calendar,
  Users,
} from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "@/components/language-provider";

const WalletMultiButtonDynamic = dynamic(
  async () => (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
  { ssr: false }
);

// --- コンテンツ定義 ---
const TIER_CONTENT = {
  bronze: [
    {
      id: "discord",
      type: "discord",
      label_ja: "サポーター限定 Telegram Group",
      label_en: "Supporter Telegram Group",
      url: {
        ja: "https://discord.gg/ja-link",
        en: "https://discord.gg/en-link",
      },
    },
  ],
  silver: [
    {
      id: "report_silver",
      type: "pdf",
      label_ja: "準備編レポート: 300円からの逆転劇",
      label_en: "Report: The Road to Abu Dhabi",
      url: {
        ja: "/contents/ja/MuseSilver_JP.pdf",
        en: "/contents/en/MuseSilver_EN.pdf",
      },
    },
  ],
  gold: [
    {
      id: "report_gold",
      type: "pdf",
      label_ja: "攻略本レポート: Playbook",
      label_en: "Report: The Global Playbook",
      url: {
        ja: "/contents/ja/MuseGlobalJP.pdf",
        en: "/contents/en/MuseGlobalEN.pdf",
      },
    },
    {
      id: "music_form",
      type: "form",
      label_ja: "演奏リクエストフォーム",
      label_en: "Music Performance Request",
      url: "https://docs.google.com/forms/d/e/1FAIpQLSdK5639vZI45NL3jubr17ic_ByceIjHpE2yVAI-aHD3LfQ6Ig/viewform",
    },
  ],
  platinum: [
    {
      id: "calendly",
      type: "calendar",
      label_ja: "1:1 セッション予約 (Calendly)",
      label_en: "Book 1:1 Session",
      url: "https://calendly.com/your_link",
    },
  ],
};

const getTierContent = (tier: string) => {
  const c = TIER_CONTENT;
  let items: any[] = [];

  if (tier === "bronze") items = [...c.bronze];
  if (tier === "silver") items = [...c.bronze, ...c.silver];
  if (tier === "gold") items = [...c.bronze, ...c.silver, ...c.gold];
  if (tier === "platinum") items = [...c.bronze, ...c.silver, ...c.gold, ...c.platinum];

  return items;
};

// url(string | {ja,en,...}) を必ず string href に解決する
const resolveHref = (url: any, lang: string) => {
  if (typeof url === "string") return url;
  if (url && typeof url === "object") {
    return url[lang] ?? url.ja ?? url.en ?? "";
  }
  return "";
};

export default function DashboardPage() {
  const { publicKey, signMessage } = useWallet();
  const { lang } = useLanguage(); // "ja" | "en" 想定
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState<any>(null);
  const [error, setError] = useState("");

  const t = useMemo(() => {
    return {
      title: lang === "en" ? "Supporter Dashboard" : "サポーター限定ダッシュボード",
      connectWallet: lang === "en" ? "Connect Wallet" : "ウォレットを接続",
      connectMsg:
        lang === "en"
          ? "Please connect the wallet holding the NFT."
          : "NFTが入っているウォレットを接続してください。",
      verificationRequired: lang === "en" ? "Verification Required" : "認証が必要です",
      verifyOwnership: lang === "en" ? "Verify Ownership" : "保有状況を確認する",
      verifying: lang === "en" ? "Verifying..." : "確認中...",
      verifiedTitle: lang === "en" ? "Verification Complete" : "認証完了",
      verifiedMsg:
        lang === "en"
          ? "Access granted. Below are your exclusive benefits based on your tier."
          : "あなたのサポーターランクに応じた特典が表示されています。",
      clickAccess: lang === "en" ? "Click to access content" : "クリックしてアクセス",
      errorMessage:
        lang === "en"
          ? "Verification failed. Please check if you hold the NFT."
          : "認証に失敗しました。対象のNFTを保有しているか確認してください。",
    };
  }, [lang]);

  const handleVerify = async () => {
    if (!publicKey || !signMessage) return;
    setLoading(true);
    setError("");

    try {
      const message = `Login to Axis Dashboard\nWallet: ${publicKey.toBase58()}\nTimestamp: ${Date.now()}`;
      const encodedMessage = new TextEncoder().encode(message);
      const signature = await signMessage(encodedMessage);

      const res = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          publicKey: publicKey.toBase58(),
          signature: bs58.encode(signature),
          message,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Verification failed");

      setContent({
        tier: data.tier,
        downloads: getTierContent(data.tier),
      });
    } catch (err: any) {
      console.error(err);
      setError(t.errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "pdf":
        return <FileText className="w-6 h-6 text-slate-400 group-hover:text-emerald-400" />;
      case "form":
        return <Music className="w-6 h-6 text-slate-400 group-hover:text-pink-400" />;
      case "calendar":
        return <Calendar className="w-6 h-6 text-slate-400 group-hover:text-sky-400" />;
      case "discord":
        return <Users className="w-6 h-6 text-slate-400 group-hover:text-indigo-400" />;
      default:
        return <Download className="w-6 h-6 text-slate-400 group-hover:text-emerald-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 px-4 py-12 relative">
      <div className="max-w-3xl mx-auto space-y-12 relative z-10">
        {/* Header */}
        <header className="flex justify-between items-center border-b border-slate-800 pb-6">
          <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            {t.title}
          </h1>
          <WalletMultiButtonDynamic />
        </header>

        <main className="space-y-8">
          {/* ウォレット未接続 */}
          {!publicKey && (
            <div className="text-center py-20 bg-slate-900/50 rounded-3xl border border-slate-800">
              <Lock className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <h2 className="text-lg font-semibold mb-2">{t.connectWallet}</h2>
              <p className="text-slate-400">{t.connectMsg}</p>
            </div>
          )}

          {/* 認証待機 (ウォレット接続済み かつ コンテンツ未表示) */}
          {publicKey && !content && (
            <div className="text-center py-20 bg-slate-900/50 rounded-3xl border border-slate-800">
              <div className="mb-6">
                <h2 className="text-sm text-emerald-400 font-semibold tracking-wider uppercase mb-2">
                  {t.verificationRequired}
                </h2>
                <p className="text-slate-400 text-sm">
                  {lang === "en" ? "Please verify your ownership." : "保有確認を行ってください。"}
                </p>
              </div>

              <button
                onClick={handleVerify}
                disabled={loading}
                className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-8 py-3 rounded-full font-bold transition disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" /> : <Unlock className="w-4 h-4" />}
                {loading ? t.verifying : t.verifyOwnership}
              </button>

              {error && (
                <p className="mt-6 text-rose-400 text-sm bg-rose-950/30 p-3 rounded-lg inline-block">
                  {error}
                </p>
              )}
            </div>
          )}

          {/* コンテンツ表示エリア */}
          {content && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="bg-emerald-950/30 border border-emerald-500/30 p-4 rounded-xl flex items-center gap-3">
                <span className="bg-emerald-500 text-slate-950 text-xs font-bold px-2 py-1 rounded uppercase">
                  {content.tier}
                </span>
                <div>
                  <p className="font-bold text-emerald-100 text-sm">{t.verifiedTitle}</p>
                  <p className="text-emerald-200/70 text-xs">{t.verifiedMsg}</p>
                </div>
                <button onClick={() => setContent(null)} className="ml-auto text-xs text-slate-500 hover:text-slate-300 underline">
                  Reset
                </button>
              </div>

              <div className="grid gap-4">
                {content.downloads.map((item: any) => {
                  const href = resolveHref(item.url, lang);
                  return (
                    <a
                      key={item.id}
                      href={href}
                      target="_blank"
                      rel="noreferrer"
                      className="group block bg-slate-900 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-800 p-6 rounded-2xl transition relative overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition duration-500" />
                      <div className="flex items-center justify-between relative z-10">
                        <div className="flex items-center gap-4">
                          <div className={`p-3 rounded-xl transition bg-slate-950 group-hover:bg-slate-900`}>
                            {getIcon(item.type)}
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg text-slate-200 group-hover:text-emerald-100 transition">
                              {lang === "en" ? item.label_en : item.label_ja}
                            </h3>
                            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">{t.clickAccess}</p>
                          </div>
                        </div>
                        <ExternalLink className="w-5 h-5 text-slate-600 group-hover:text-emerald-400 opacity-0 group-hover:opacity-100 transition -translate-x-2 group-hover:translate-x-0" />
                      </div>
                    </a>
                  );
                })}
              </div>
            </motion.div>
          )}
        </main>
      </div>
    </div>
  );
}