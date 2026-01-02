// src/lib/constants.ts

// 1. TierのIDの型定義
export type TierId = "bronze" | "silver" | "gold" | "platinum";

// 2. Tierオブジェクトの形の定義 (これが抜けていました)
export type Tier = {
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

// 3. 環境変数や共通設定 (APIルートでも使うのでここに置いておくと便利です)
export const HELIUS_RPC_URL = process.env.NEXT_PUBLIC_HELIUS_RPC || "https://api.mainnet-beta.solana.com";
// ★ここにあなたのコレクションアドレス（NFT Collection Address）を入れてください
export const COLLECTION_ADDRESS = process.env.NEXT_PUBLIC_COLLECTION_ADDRESS || "YOUR_COLLECTION_ADDRESS_HERE";


// 4. データ本体 (export をつけました)
export const TIERS: Tier[] = [
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