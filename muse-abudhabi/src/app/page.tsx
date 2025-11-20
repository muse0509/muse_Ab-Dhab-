"use client";

import React, { FC, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useLanguage } from "@/components/language-provider";
import { useWallet } from "@solana/wallet-adapter-react";
import {
  ArrowRight,
  ShieldCheck,
  PlaneTakeoff,
  Music2,
  Star,
  ExternalLink,
} from "lucide-react";

import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { publicKey, generateSigner, some} from "@metaplex-foundation/umi";

import {
  mplCandyMachine,
  fetchCandyMachine,
  safeFetchCandyGuard,
  mintV2, 
} from "@metaplex-foundation/mpl-candy-machine";

import {
  fetchMetadata,
  findMetadataPda,
} from "@metaplex-foundation/mpl-token-metadata";

import { findAssociatedTokenPda, SPL_TOKEN_PROGRAM_ID, setComputeUnitLimit } from "@metaplex-foundation/mpl-toolbox";
import { walletAdapterIdentity } from "@metaplex-foundation/umi-signer-wallet-adapters";
import { AnimatePresence } from "framer-motion";


// ---------- Tier 定義 ----------

type TierId = "bronze" | "silver" | "gold" | "platinum";

type Tier = {
  id: TierId;
  nameEn: string;
  nameJa: string;
  label: string;
  descriptionEn: string;
  descriptionJa: string;
  priceUsd: number;
  approxSol: number;
  highlight?: boolean;
  imageSrc: string;
  candyMachineId: string;
  candyGuardId: string;  
};

const TIERS: Tier[] = [
  {
    id: "bronze",
    nameEn: "Bronze Supporter",
    nameJa: "Bronze サポーター",
    label: "BRONZE",
    descriptionEn: "First supporter badge & access to supporter Discord.",
    descriptionJa: "最初のサポーターバッジ & サポーターディスコード",
    priceUsd: 10,
    approxSol: 0.05,
    imageSrc: "/nft/bronze.png",
    candyMachineId: "AC9mqM8w9ch4ZbL4Ue4wM4NzJacNmYHCh6vwde37eoaJ",
    candyGuardId: "9ALMywxctSLHoUoyVoDaFqTHvQ7Ttf4X3yE7biq2Yg7A",
  },
  {
    id: "silver",
    nameEn: "Silver Supporter",
    nameJa: "Silver サポーター",
    label: "SILVER",
    descriptionEn:
      'Learning pass & mini report: "How I prepared for Abu Dhabi".',
    descriptionJa: "Learning pass & ミニレポート「どう準備したか」",
    priceUsd: 50,
    approxSol: 0.25,
    imageSrc: "/nft/silver.png",
    candyMachineId: "AWh6ZPoxHAJJMjNS62vZjS3UbsV1x2en3dtFb7vyHYAH",
    candyGuardId: "4wGVYEbGJwbVTUu6G4KBem1XYy37GPKnun79UxsiCDo",
  },
  {
    id: "gold",
    nameEn: "Gold Supporter",
    nameJa: "Gold サポーター",
    label: "GOLD",
    descriptionEn:
      'Deep dive report: "Abu Dhabi Playbook" + exclusive music performance.',
    descriptionJa:
      "Abu Dhabi Playbook 詳細レポート + 限定音楽パフォーマンス動画",
    priceUsd: 150,
    approxSol: 0.8,
    highlight: true,
    imageSrc: "/nft/gold.png",
    candyMachineId: "B5i94xUb8ttwhypABCJo28m42PYGdX8BympFAuwZTP6C",
    candyGuardId: "8xWoGdSr9iqf2BZxaGyGW7hDvuSPs8Mx1fjbmJ9kbi21",
  },
  {
    id: "platinum",
    nameEn: "Platinum Supporter",
    nameJa: "Platinum サポーター",
    label: "PLATINUM",
    descriptionEn: "1:1 session + Private Group Session Invitation",
    descriptionJa: "1on1 セッション + 非公開セッション招待",
    priceUsd: 250,
    approxSol: 1.6,
    imageSrc: "/nft/platinum.png",
    candyMachineId: "HbpqzJdyKSTwG8SjvuP9NKgQhCCHksEoQWb3tTTqcZz7",
    candyGuardId: "ELWHqqKEWPCodMFF8AYEoJCDcXZG7fJyV8eU67ei6ehh",
  },
];

// ---------- Umi / RPC ----------

const RPC_ENDPOINT =
  process.env.NEXT_PUBLIC_HELIUS_RPC ??
  "https://api.mainnet-beta.solana.com";

  function useUmi() {
    const wallet = useWallet();
  
    // console.log("Using RPC endpoint (Umi):", RPC_ENDPOINT);
  
    const umi = useMemo(
      () =>
        createUmi(RPC_ENDPOINT)
          .use(walletAdapterIdentity(wallet))
          .use(mplCandyMachine()), // ▼▼▼ 変更点 2: Core版ではなく通常版を使用
      [wallet]
    );
  
    return umi;
}


// ---------- Funding constants ----------

const MIN_GOAL_USD = 1000;
const TARGET_USD = 2500;
const STRETCH_GOAL_USD = 3000;

// =====================================================
// ページ本体
// =====================================================

const HomePage: FC = () => {
  const { lang } = useLanguage(); // "en" | "ja"
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [mintedTier, setMintedTier] = useState<Tier | null>(null);

  return (
    <div
      id="top"
      className="mx-auto flex max-w-6xl flex-col gap-20 px-4 pb-24 pt-12 md:px-6 md:pb-28 md:pt-16"
    >
      <HeroSection currentLanguage={lang} />
      <ProgressSection currentLanguage={lang} />
      <StorySection currentLanguage={lang} />
      <PlanSection currentLanguage={lang} />
      <MintSection 
        currentLanguage={lang} 
        onMintSuccess={(tier) => {
          setMintedTier(tier);
          setShowSuccessModal(true);
        }}
      />
      <Footer currentLanguage={lang} />
      <AnimatePresence>
        {showSuccessModal && (
          <SuccessModal 
            isOpen={showSuccessModal} 
            onClose={() => setShowSuccessModal(false)} 
            tier={mintedTier}
            currentLanguage={lang}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default HomePage;

// =====================================================
// Hero
// =====================================================

type LangProps = { currentLanguage: "en" | "ja" };

const HeroSection: FC<LangProps> = ({ currentLanguage }) => {
  const isEn = currentLanguage === "en";

  return (
    <section className="grid gap-10 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] md:items-center">
      {/* Left */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        <p className="inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-500/10 px-3 py-1 text-[11px] font-medium text-emerald-200 shadow-soft">
          <PlaneTakeoff className="h-3 w-3" />
          {isEn
            ? "Axis Global Launch · Solana Breakpoint / SEZ"
            : "Axis Global Launch · Solana Breakpoint / SEZ"}
        </p>

        <h1 className="text-3xl font-semibold leading-tight tracking-tight md:text-4xl lg:text-5xl">
          {isEn ? (
            <>
              Send <span className="text-emerald-300">Muse</span> to Abu Dhabi.
              <br />
              Axis, ready for global takeoff.
            </>
          ) : (
            <>
              <span className="text-emerald-300">Muse</span>をアブダビへ。
              <br />
              Axis、世界への挑戦。
            </>
          )}
        </h1>

        <p className="max-w-xl text-sm leading-relaxed text-slate-300 md:text-[15px]">
          {isEn ? (
            <>
              I&apos;m not an idol or an influencer — I&apos;m a 20-year-old
              startup founder. I want to prove that young founders from Japan can
              simply show up on global stages, so I decided to challenge Solana
              SEZ Abu Dhabi. This NFT is not just travel funding; it&apos;s a
              ticket to an experiment in how young founders from Japan can go
              global, documenting the whole journey.
            </>
          ) : (
            <>
              僕はアイドルでもインフルエンサーでもなく、
              ただの20歳のスタートアップFounderです。
              それでも「日本の若い起業家も、普通に世界の場に出ていけるよね」を
              実証したくて、Solana SEZ AbuDhabi への挑戦を決めました。
              このNFTはただの渡航費ではなく、
              「日本の若手Founderが世界に出ていくための実験」によって
              グローバル起業していく様子を記録・追体験するチケットです。
              成功すれば、このモデルをそのまま次の若手Founderにも渡せる。
              最初の一例を、ぜひ一緒につくってください。
            </>
          )}
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <a
            href="#mint"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-400 via-indigo-500 to-fuchsia-500 px-4 py-2 text-xs font-semibold text-slate-950 shadow-soft transition hover:brightness-110"
          >
            {isEn ? "Support the Journey" : "挑戦をサポートする"}
            <ArrowRight className="h-3.5 w-3.5" />
          </a>
          <a
            href="#story"
            className="inline-flex items-center gap-2 text-xs font-medium text-slate-300 hover:text-emerald-300"
          >
            {isEn ? "Read the story" : "ストーリーを読む"}
          </a>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
          <p>
            {isEn
              ? "You’re backing a real founder, not a persona."
              : "「キャラ」ではなく、実際に挑戦する一人のFounderを支えるNFTです。"}
          </p>
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-700/70 bg-slate-900/70 px-2.5 py-1">
            <span className="text-[10px] text-slate-400">
              {isEn ? "Supported by" : "サポート"}
            </span>
            <Image
              src="/superteamJapan.png"
              alt="Superteam Japan"
              width={72}
              height={18}
              className="h-4 w-auto"
            />
          </div>
        </div>

        <a
          href="https://x.com/muse_jp_sol"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-emerald-300"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          {isEn ? "Follow updates on X" : "Xで進捗を追う"}
        </a>
      </motion.div>

      {/* Right card */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.08 }}
        className="relative"
      >
        <div className="relative overflow-hidden rounded-3xl border border-slate-800/80 bg-slate-900/80 p-5 md:p-6 shadow-soft md:min-h-[260px]">
          <div className="mb-4 flex items-center gap-3">
            <div className="h-16 w-16 overflow-hidden rounded-2xl bg-slate-800">
              <Image
                src="/muse-portrait.JPG"
                alt="Muse profile"
                width={64}
                height={64}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="space-y-1">
              <p className="text-base font-semibold leading-tight">
                Muse / Founder
              </p>
              <p className="text-[12px] text-slate-400">
                {isEn
                  ? "20-year-old founder building Axis from Japan."
                  : "日本から Axis を立ち上げる 20 歳の Founder。"}
              </p>
            </div>
          </div>

          <div className="grid gap-3 text-sm text-slate-300 md:grid-cols-2">
            <div className="rounded-2xl bg-slate-900/90 p-4">
              <p className="mb-1 text-[11px] uppercase tracking-[0.16em] text-slate-400">
                {isEn ? "Why this trip" : "なぜこの渡航か"}
              </p>
              <p>
                {isEn
                  ? "To be on the ground where global Solana builders meet, ship, and design the next decade of crypto."
                  : "世界中の Solana ビルダーが集まり、これからのクリプトの 10 年を形にしていく「現場」に自分も立つため。"}
              </p>
            </div>
            <div className="rounded-2xl bg-slate-900/90 p-4">
              <p className="mb-1 text-[11px] uppercase tracking-[0.16em] text-slate-400">
                {isEn ? "What you get" : "あなたが得るもの"}
              </p>
              <p>
                {isEn
                  ? "A front-row seat to a real global challenge, plus concrete learnings turned into a playbook."
                  : "リアルな海外挑戦の最前列と、その学びが詰まったプレイブック。"}
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

// =====================================================
// Progress (On-chain 集計)
// =====================================================

const ProgressSection: FC<LangProps> = ({ currentLanguage }) => {
  const isEn = currentLanguage === "en";
  const umi = useUmi();

  const [raisedUsd, setRaisedUsd] = useState(0);
  const [totalMinted, setTotalMinted] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const fetchStats = async () => {
      try {
        const cms = await Promise.all(
          TIERS.map((tier) =>
            fetchCandyMachine(umi, publicKey(tier.candyMachineId))
          )
        );

        if (cancelled) return;

        let raised = 0;
        let minted = 0;

        cms.forEach((cm, index) => {
          const redeemed = Number(cm.itemsRedeemed ?? 0);
          minted += redeemed;
          raised += redeemed * TIERS[index].priceUsd;
        });

        setRaisedUsd(raised);
        setTotalMinted(minted);
      } catch (e) {
        console.error("Failed to fetch candy machine stats:", e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchStats();

    return () => {
      cancelled = true;
    };
  }, [umi]);

  const percent = Math.min(
    100,
    Math.round((raisedUsd / TARGET_USD) * 100)
  );

  return (
    <section className="mx-auto mt-16 max-w-5xl px-4">
      <div className="rounded-3xl border border-slate-800 bg-slate-950/70 p-6 md:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold tracking-[0.2em] text-slate-400">
              {isEn ? "CURRENT FUNDING" : "現在の達成額"}
            </p>
            <div className="mt-2 flex items-baseline gap-2">
              <p className="text-2xl font-semibold tabular-nums">
                {loading ? (
                  <span className="text-slate-400">
                    {isEn ? "Loading..." : "読み込み中..."}
                  </span>
                ) : (
                  <>
                    ${raisedUsd.toLocaleString()}{" "}
                    <span className="text-sm text-slate-400">
                      / ${TARGET_USD.toLocaleString()} target
                    </span>
                  </>
                )}
              </p>
            </div>
            {!loading && (
              <p className="mt-1 text-xs text-slate-400">
                {isEn
                  ? `${totalMinted} NFTs minted across all tiers.`
                  : `全ティア合計で ${totalMinted} 枚が Mint 済み。`}
              </p>
            )}
          </div>
          <div className="space-y-1 text-xs text-slate-400">
            <p>
              {isEn
                ? `Minimum goal: $${MIN_GOAL_USD.toLocaleString()} (full refund if not reached).`
                : `最低目標: $${MIN_GOAL_USD.toLocaleString()}（未達の場合は全額返金）。`}
            </p>
            <p>
              {isEn
                ? `Stretch goal: $${STRETCH_GOAL_USD.toLocaleString()}+`
                : `ストレッチゴール: $${STRETCH_GOAL_USD.toLocaleString()}+`}
            </p>
          </div>
        </div>

        <div className="mt-6">
          <div className="relative h-2 overflow-hidden rounded-full bg-slate-900">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-sky-400 to-fuchsia-400 transition-[width] duration-700"
              style={{ width: loading ? "0%" : `${percent}%` }}
            />
          </div>
          <div className="mt-2 flex justify-between text-[11px] text-slate-400">
            <span>{isEn ? "0%" : "0％"}</span>
            <span>{percent}%</span>
            <span>100%</span>
          </div>
        </div>
      </div>
    </section>
  );
};

// =====================================================
// Story
// =====================================================

const StorySection: FC<LangProps> = ({ currentLanguage }) => {
  const isEn = currentLanguage === "en";

  return (
    <section
      id="story"
      className="grid gap-10 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] md:items-start"
    >
      <div className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-300">
          {isEn ? "Story" : "ストーリー"}
        </h2>
        <h3 className="text-xl font-semibold text-slate-50">
          {isEn
            ? "Not an influencer. Just a founder."
            : "アイドルでもインフルエンサーでもない、ただの20歳のFounderとして。"}
        </h3>
        <div className="space-y-3 text-sm leading-relaxed text-slate-300">
          <p>
            {isEn
              ? "I'm not trying to become an influencer. I simply want to be a proof that a 20-year-old founder from Japan can stand in global arenas like Solana SEZ Abu Dhabi as something completely normal."
              : "アイドルでもインフルエンサーでもなく、ただの20歳のスタートアップFounderとして、「日本の若い起業家も、普通に世界の場に出ていけるよね」を証明したい。そのために、Solana SEZ AbuDhabi への挑戦を決めました。"}
          </p>
          <p>
            {isEn
              ? "This NFT is not just about covering one trip. It’s a ticket to an experiment: can we turn a single founder’s journey into a reusable model for the next generation of young founders going global?"
              : "このNFTは、ただの渡航費ではありません。「日本の若手Founderが世界に出ていくための実験」を一緒につくるチケットです。うまくいけば、そのモデルをそのまま次の若手Founderに渡すことができます。"}
          </p>
          <p>
            {isEn
              ? "If we make this first example work, it becomes a playbook and a pattern that anyone after us can reuse."
              : "最初の一例を一緒につくることができれば、それはプレイブックとなり、次に続く誰かの背中を押す「パターン」になるはずです。"}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="rounded-3xl border border-slate-800 bg-slate-950/70 p-4">
          <div className="overflow-hidden rounded-2xl bg-slate-900">
            <Image
              src="/muse-performance.png"
              alt="Muse performing at age 11"
              width={1280}
              height={720}
              className="h-auto w-full object-contain"
            />
          </div>
          <p className="mt-3 text-[11px] text-slate-400">
            {isEn
              ? "Muse playing music at age 11."
              : "11歳のときの Muse の演奏シーン。"}
          </p>
        </div>
      </div>
    </section>
  );
};

// =====================================================
// Plan (円グラフ)
// =====================================================

const PlanSection: FC<LangProps> = ({ currentLanguage }) => {
  const isEn = currentLanguage === "en";

  const breakdown = [
    { labelEn: "Flights", labelJa: "フライト", percent: 40, color: "#22c55e" },
    { labelEn: "Stay", labelJa: "滞在費", percent: 25, color: "#38bdf8" },
    {
      labelEn: "Event & local",
      labelJa: "イベント・現地費用",
      percent: 20,
      color: "#a855f7",
    },
    {
      labelEn: "Production & ops",
      labelJa: "制作・運営",
      percent: 15,
      color: "#eab308",
    },
  ];

  let currentDeg = 0;
  const parts: string[] = [];
  for (const b of breakdown) {
    const start = currentDeg;
    const end = currentDeg + (b.percent / 100) * 360;
    parts.push(`${b.color} ${start}deg ${end}deg`);
    currentDeg = end;
  }
  const gradient = `conic-gradient(${parts.join(",")})`;

  return (
    <section id="plan" className="space-y-6">
      <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-300">
        {isEn ? "Plan & Budget Protection" : "プランと資金の保護方針"}
      </h2>

      <div className="grid gap-6 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <div className="space-y-3 rounded-3xl border border-slate-800 bg-slate-950/70 p-4 md:p-5">
          <p className="text-sm font-semibold text-slate-50">
            {isEn
              ? "Where your support goes"
              : "あなたの支援はどこに使われるのか"}
          </p>
          <ul className="space-y-2 text-sm text-slate-300">
            <li>
              •{" "}
              {isEn
                ? "Flights and basic accommodation in Abu Dhabi"
                : "アブダビへの航空券および基本的な滞在費"}
            </li>
            <li>
              •{" "}
              {isEn
                ? "Solana Breakpoint / SEZ tickets and local transportation"
                : "Solana Breakpoint / SEZ 参加費と現地での移動費"}
            </li>
            <li>
              •{" "}
              {isEn
                ? "Production costs for the playbook and content"
                : "プレイブックおよびコンテンツ制作のためのコスト"}
            </li>
          </ul>

          <div className="mt-3 rounded-2xl border border-emerald-400/40 bg-emerald-500/10 p-3 text-[11px] text-emerald-100">
            <p className="mb-1 text-[11px] font-semibold">
              {isEn ? "Refund Policy" : "返金ポリシー"}
            </p>
            <p>
              {isEn
                ? "If the minimum goal of $1,000 is not reached by the end of the campaign, all funds will be fully refunded to supporters."
                : "キャンペーン終了時点でミニマムゴール（$1,000）に届かなかった場合、支援いただいた資金は全額返金します。"}
            </p>
          </div>
        </div>

        <div className="space-y-3 rounded-3xl border border-slate-800 bg-slate-950/70 p-4 md:p-5">
          <p className="text-sm font-semibold text-slate-50">
            {isEn ? "High-level breakdown" : "おおまかな資金配分"}
          </p>
          <div className="mt-2 flex items-center gap-5">
            <div
              className="h-32 w-32 rounded-full border border-slate-800 bg-slate-900"
              style={{ backgroundImage: gradient }}
            />
            <ul className="space-y-2 text-[11px] text-slate-300">
              {breakdown.map((b) => (
                <li key={b.labelEn} className="flex items-center gap-2">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: b.color }}
                  />
                  <span className="flex-1">
                    {isEn ? b.labelEn : b.labelJa}
                  </span>
                  <span className="font-semibold text-slate-100">
                    {b.percent}%
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <p className="mt-2 text-[11px] text-slate-400">
            {isEn
              ? "Exact numbers and receipts will be shared to supporters after the journey."
              : "実際の金額とレシートは、旅の終了後にサポーター向けに開示します。"}
          </p>
        </div>
      </div>
    </section>
  );
};

// =====================================================
// Mint Section (USDC支払い対応版)
// =====================================================

const IS_DEV_MODE = false; // ← 開発モードの切り替え

type MintSectionProps = {
  currentLanguage: "en" | "ja";
  onMintSuccess: (tier: Tier) => void; 
};



const MintSection: FC<MintSectionProps> = ({
  currentLanguage,
  onMintSuccess,
}) => {
  const isEn = currentLanguage === "en";
  const wallet = useWallet();
  const umi = useUmi();
  
  const [mintingTier, setMintingTier] = useState<TierId | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleMint = async (tier: Tier) => {
    if (!wallet.connected || !wallet.publicKey) {
      setErrorMessage(isEn ? "Please connect your wallet first." : "まずウォレットを接続してください。");
      return;
    }

    if (IS_DEV_MODE) {
      console.log("🚧 DEV MODE: Skipping blockchain transaction...");
      setMintingTier(tier.id);
      
      // 2秒待機して「処理中」を演出
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      console.log("🚧 DEV MODE: Mock success!");
      setMintingTier(null);
      
      // ★ここで成功時のコールバックを強制実行してモーダルを開く
      onMintSuccess(tier); 
      return; // ここで関数を終了（実際のMintへは進まない）
    }
    
    try {
      setMintingTier(tier.id);
      setMessage(null);
      setErrorMessage(null);

      // 1. Candy Machine 取得
      console.log(`Fetching Candy Machine: ${tier.candyMachineId}`);
      const candyMachine = await fetchCandyMachine(umi, publicKey(tier.candyMachineId));

      // 2. Candy Guard 取得
      console.log(`Fetching Candy Guard: ${tier.candyGuardId}`);
      const candyGuard = await safeFetchCandyGuard(umi, publicKey(tier.candyGuardId));

      if (!candyGuard) {
        throw new Error(isEn ? "Candy Guard not found." : "Candy Guard が見つかりません。");
      }

      // 3. コレクション権限の取得
      const collectionMetadataPda = findMetadataPda(umi, { mint: candyMachine.collectionMint });
      const collectionMetadata = await fetchMetadata(umi, collectionMetadataPda);

      // 4. Mint 引数の準備
      const nftMint = generateSigner(umi);
      const mintArgs: any = {};

      // ▼▼▼ 変更点: Token Payment (USDC) の処理 ▼▼▼
      const tokenPayment = candyGuard.guards.tokenPayment;
      
      // ユーザーのUSDC口座（ATA）を特定するための変数
      let userTokenAccount: (ReturnType<typeof publicKey>) | null = null;

      if (tokenPayment && tokenPayment.__option === "Some") {
        const usdcMint = tokenPayment.value.mint;
        const destinationAta = tokenPayment.value.destinationAta;
      
        mintArgs.tokenPayment = some({
          mint: usdcMint,
          destinationAta,
        });
      
        // PDAを計算
        const userTokenAccountPda = findAssociatedTokenPda(umi, {
          mint: usdcMint,
          owner: umi.identity.publicKey,
        });
      
        // ★ PublicKey部分だけ抜く（Pda = [pubkey, bump]）
        userTokenAccount = userTokenAccountPda[0];
      
        console.log("User USDC Account:", userTokenAccount.toString());
      }

      // Mint Limitなど他のガード設定
      const mintLimit = candyGuard.guards.mintLimit;
      if (mintLimit && mintLimit.__option === "Some") {
        mintArgs.mintLimit = some({ id: mintLimit.value.id });
      }

      console.log("Starting USDC Mint V2 transaction...");

      // 5. トランザクション構築
      let txBuilder = mintV2(umi, {
        candyMachine: candyMachine.publicKey,
        collectionMint: candyMachine.collectionMint, 
        collectionUpdateAuthority: collectionMetadata.updateAuthority,
        candyGuard: candyGuard.publicKey,
        nftMint,
        mintArgs,
      });

      // ▼▼▼ 修正点: Compute Unit (CU) の上限を引き上げる ▼▼▼
      // デフォルト20万CUでは足りないため、80万CUに設定します。
      // prepend() を使って、処理の一番最初にこの設定を追加します。
      txBuilder = txBuilder.prepend(
        setComputeUnitLimit(umi, { units: 800_000 })
      );

      // Remaining Accounts (USDC口座) の追加
      if (userTokenAccount) {
        txBuilder = txBuilder.addRemainingAccounts({
          pubkey: userTokenAccount,
          isWritable: true,
          isSigner: false,
        });
        
        txBuilder = txBuilder.addRemainingAccounts({
          pubkey: publicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"),
          isWritable: false,
          isSigner: false,
        });
      }

      // 送信
      const tx = await txBuilder.sendAndConfirm(umi);

      console.log("Mint successful:", tx);
      onMintSuccess(tier);

    } catch (err: any) {
      console.error("Mint error:", err);
      if (err.logs) console.error("Logs:", err.logs);
      let userFriendlyError = err?.message || "Unknown error";
      
      // USDC残高不足の場合のエラーハンドリング例
      if (err?.message?.includes("0x1771") || err?.message?.includes("NotEnoughTokenBalance")) {
        userFriendlyError = isEn ? "Insufficient USDC balance." : "USDCの残高が不足しています。";
      }

      setErrorMessage(userFriendlyError);
    } finally {
      setMintingTier(null);
    }
  };

  return (
    <section
      id="mint"
      className="mx-auto mt-16 max-w-5xl px-4 pb-24 lg:mt-20"
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-[0.2em] text-emerald-400">
            NFT TIERS
          </p>
          <h2 className="mt-2 text-xl font-semibold md:text-2xl">
            {isEn
              ? "Choose how you want to back this journey."
              : "この挑戦を、どの形で支援しますか？"}
          </h2>
          <p className="mt-2 max-w-xl text-sm text-slate-400">
            {isEn
              ? "All NFTs are part of a single Solana collection. Each tier comes with different utilities—from a supporter badge to deep-dive reports and music sessions."
              : "すべてのNFTは1つのSolanaコレクションに属し、ティアごとにサポーターバッジから詳細レポート、音楽セッションまで異なるユーティリティを持ちます。"}
          </p>
        </div>
        <div className="hidden items-center gap-2 text-[11px] text-slate-400 md:flex">
          <Star className="h-3.5 w-3.5 text-emerald-300" />
          <span>
            {isEn
              ? "Gold & Platinum include an exclusive music performance utility."
              : "Gold / Platinum には限定の音楽パフォーマンス特典が含まれます。"}
          </span>
        </div>
      </div>

      <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {TIERS.map((tier) => (
          <div
            key={tier.id}
            className={`relative flex h-full flex-col rounded-3xl border bg-slate-950/70 p-4 transition hover:border-slate-600 ${
              tier.highlight
                ? "border-emerald-500/60 shadow-[0_0_40px_rgba(16,185,129,0.2)]"
                : "border-slate-800"
            }`}
          >
            {tier.highlight && (
              <div className="absolute right-4 top-4 rounded-full border border-emerald-400/50 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-300">
                {isEn ? "Recommended" : "おすすめ"}
              </div>
            )}

            {/* NFT 画像 */}
            <div className="mt-2 flex items-center justify-center">
              <div className="flex w-full items-center justify-center rounded-2xl bg-slate-900/80 px-3 py-2">
                <div className="relative h-32 w-full max-w-[260px]">
                  <Image
                    src={tier.imageSrc}
                    alt={tier.nameEn}
                    fill
                    sizes="(min-width: 1024px) 260px, 100vw"
                    className="object-contain"
                  />
                </div>
              </div>
            </div>

            <div className="mt-4 flex-1">
              <p className="text-[11px] font-semibold tracking-[0.2em] text-slate-400">
                {tier.label}
              </p>
              <p className="mt-1 text-sm font-semibold">
                {isEn ? tier.nameEn : tier.nameJa}
              </p>
              <p className="mt-1 text-xs text-slate-400">
                {isEn ? tier.descriptionEn : tier.descriptionJa}
              </p>

              <div className="mt-4 space-y-1">
                <p className="text-lg font-semibold tabular-nums">
                  ${tier.priceUsd.toLocaleString()}
                </p>
                <p className="text-[11px] text-slate-500">
                  ≈ {tier.approxSol} SOL (est.)
                </p>
              </div>
            </div>

            {/* Mint ボタン */}
            <button
              type="button"
              onClick={() => handleMint(tier)}
              disabled={mintingTier === tier.id}
              className={`mt-4 inline-flex items-center justify-center rounded-full px-3 py-2 text-xs font-semibold transition border ${
                mintingTier === tier.id
                  ? "cursor-wait bg-slate-900 text-slate-500 border-slate-700"
                  : "bg-slate-50 text-slate-900 border-slate-300 hover:bg-slate-100 hover:border-slate-400 hover:text-slate-950"
              }`}
            >
              {mintingTier === tier.id
                ? isEn
                  ? "Minting..."
                  : "Mint中..."
                : wallet.connected
                ? isEn
                  ? "Mint this tier"
                  : "このティアをMint"
                : isEn
                ? "Connect wallet to mint"
                : "ウォレット接続でMint"}
            </button>
          </div>
        ))}
      </div>

      {(message || errorMessage) && (
        <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
          {message && (
            <p className="text-sm text-emerald-400 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" />
              {message}
            </p>
          )}
          {errorMessage && (
            <div className="text-sm text-rose-400">
              <p className="font-semibold mb-1">Error:</p>
              <p className="text-xs">{errorMessage}</p>
            </div>
          )}
        </div>
      )}

      {/* モバイル用の一言 */}
      <div className="mt-4 flex items-center gap-2 text-[11px] text-slate-400 md:hidden">
        <Music2 className="h-3.5 w-3.5 text-emerald-300" />
        <span>
          {isEn
            ? "Gold & Platinum include an exclusive performance recorded just for supporters."
            : "Gold / Platinum では、サポーターのためだけに収録した限定演奏をお届けします。"}
        </span>
      </div>
    </section>
  );
};

// =====================================================
// Success Modal Component
// =====================================================
const GOOGLE_FORM_URL = "https://forms.gle/GUWoUCUfokS1aUDn8"; // ★ここにGoogleフォームのURLを入れてください

type SuccessModalProps = {
  isOpen: boolean;
  onClose: () => void;
  tier: Tier | null;
  currentLanguage: "en" | "ja";
};

const SuccessModal: FC<SuccessModalProps> = ({
  isOpen,
  onClose,
  tier,
  currentLanguage,
}) => {
  const isEn = currentLanguage === "en";

  if (!isOpen || !tier) return null;

  // X (Twitter) シェア用URL作成
  const shareText = isEn
    ? `I just supported @muse_jp_sol's journey to Abu Dhabi by minting a ${tier.nameEn}! 🇦🇪✈️ \n\nLet's go global. \n\n#MuseToAbuDhabi`
    : `.@muse_sol_jpのアブダビ渡航プロジェクトを支援して ${tier.nameJa} をMintしました！🇦🇪✈️ \n\n日本から世界へ!\n\n#MuseToAbuDhabi`;
  
  // サイトのURL (必要に応じて書き換えてください)
  const siteUrl = "https://www.axis-protocol.xyz/"; 
  
  const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(siteUrl)}`;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center px-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
      />

      {/* Modal Content */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-md overflow-hidden rounded-3xl border border-emerald-500/30 bg-slate-900 shadow-2xl shadow-emerald-500/20"
      >
        {/* Header Image / Icon */}
        <div className="relative h-32 bg-gradient-to-b from-emerald-900/40 to-slate-900 flex items-center justify-center">
           <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-30" />
           <div className="relative h-24 w-24 drop-shadow-xl">
              <Image 
                src={tier.imageSrc} 
                alt={tier.nameEn} 
                fill 
                className="object-contain" 
              />
           </div>
        </div>

        <div className="p-6 text-center space-y-6">
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-white">
              {isEn ? "Mint Successful!" : "Mint 完了！"}
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              {isEn 
                ? "Thank you for your support. You are now part of the journey." 
                : "ご支援ありがとうございます。これであなたも旅の仲間です。"}
            </p>
          </div>

          {/* Action 1: Google Form (Priority) */}
          <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-4 space-y-3">
            <p className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
              {isEn ? "Next Step" : "次のステップ"}
            </p>
            <p className="text-sm text-slate-200">
              {isEn
                ? "Please fill out the form to join the exclusive Telegram group."
                : "限定Telegramグループへ招待します。以下のフォームを送信してください。"}
            </p>
            <a
              href={GOOGLE_FORM_URL}
              target="_blank"
              rel="noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-3 text-sm font-bold text-slate-950 hover:bg-emerald-400 transition shadow-lg shadow-emerald-500/20"
            >
              <ExternalLink className="w-4 h-4" />
              {isEn ? "Open Google Form" : "Googleフォームを開く"}
            </a>
          </div>

          {/* Action 2: Share on X */}
          <div className="space-y-3 pt-2">
            <p className="text-xs text-slate-500">
              {isEn ? "Share your support" : "購入をシェアして応援する"}
            </p>
            <a
              href={shareUrl}
              target="_blank"
              rel="noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-700 transition"
            >
              {/* X Logo SVG */}
              <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-current">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              {isEn ? "Post on X" : "Xでポストする"}
            </a>
          </div>
        </div>

        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-3 right-3 p-2 rounded-full bg-black/20 hover:bg-black/40 text-slate-400 hover:text-white transition"
        >
          <span className="sr-only">Close</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>

      </motion.div>
    </div>
  );
};

// =====================================================
// Footer
// =====================================================

const Footer: FC<LangProps> = ({ currentLanguage }) => {
  const isEn = currentLanguage === "en";

  return (
    <footer className="mt-12 border-t border-slate-800/70 pt-6 text-[11px] text-slate-500">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <p>
          {isEn
            ? "Built on Solana. Designed for young founders who dare to go global."
            : "Solana の上に構築された、世界に挑む若手 Founder のためのプロジェクト。"}
        </p>
        <p className="text-slate-600">
          © {new Date().getFullYear()} Muse / Axis
        </p>
      </div>
    </footer>
  );
};
