// app/api/verify/route.ts
import { NextResponse } from 'next/server';
import nacl from 'tweetnacl';
import bs58 from 'bs58';
import { HELIUS_RPC_URL, COLLECTION_ADDRESS } from '@/lib/constants';

// ★ ここに「見せたいコンテンツ」を定義 (本番ではDBや別ファイル管理推奨)
const SECURE_CONTENT = {
  platinum: {
    title: "Platinum Benefits",
    links: [
      { label: "1on1 Booking", url: "https://calendly.com/..." },
      { label: "Exclusive Group", url: "https://t.me/+..." }
    ]
  },
  gold: {
    title: "Gold Benefits",
    links: [
      { label: "Abu Dhabi Playbook (Full)", url: "https://..." },
      { label: "Music Performance Video", url: "https://vimeo.com/..." }
    ]
  },
  silver: {
    title: "Silver Benefits",
    links: [
      { label: "Preparation Mini Report", url: "https://..." }
    ]
  },
  bronze: {
    title: "Bronze Benefits",
    links: [
      { label: "Supporter Discord", url: "https://discord.gg/..." }
    ]
  }
};

export async function POST(req: Request) {
  try {
    const { publicKey, signature, message } = await req.json();
    console.log("--- Verify Request ---");
    console.log("User Wallet:", publicKey);
    console.log("Target Collection Address:", COLLECTION_ADDRESS);
    console.log("Using RPC:", HELIUS_RPC_URL);
    // 1. 署名検証
    const verified = nacl.sign.detached.verify(
      new TextEncoder().encode(message),
      bs58.decode(signature),
      bs58.decode(publicKey)
    );

    if (!verified) return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });

    // 2. Helius DAS APIで保有チェック
    // ※APIキーつきのURLを使用してください
    const response = await fetch(HELIUS_RPC_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 'verify-tier',
        method: 'searchAssets',
        params: {
          ownerAddress: publicKey,
          grouping: ["collection", COLLECTION_ADDRESS],
          page: 1,
          limit: 100
        },
      }),
    });

    const { result } = await response.json();
    
    if (!result || result.items.length === 0) {
      return NextResponse.json({ error: 'NFT not found' }, { status: 403 });
    }

    // 3. 最上位Tierの判定
    // メタデータのAttributesから "Tier" を探す、あるいは名前から判定する
    const tiersFound = new Set<string>();

    result.items.forEach((nft: any) => {
      // 例: Attributeに "Tier": "Gold" が入っている場合
      const tierAttr = nft.content.metadata.attributes?.find((a: any) => a.trait_type === "Tier");
      if (tierAttr) tiersFound.add(tierAttr.value.toLowerCase());
      
      // もしAttribute設定がない場合、名前に含まれるか簡易チェックも可能
      // if (nft.content.metadata.name.includes("Gold")) tiersFound.add("gold");
    });

    let userTier = "none";
    if (tiersFound.has("platinum")) userTier = "platinum";
    else if (tiersFound.has("gold")) userTier = "gold";
    else if (tiersFound.has("silver")) userTier = "silver";
    else if (tiersFound.has("bronze")) userTier = "bronze";

    if (userTier === "none") {
      return NextResponse.json({ error: 'Valid Tier not found' }, { status: 403 });
    }

    // 4. コンテンツの累積（上位は下位も見れる）
    let content: any = { tier: userTier, downloads: [] };
    
    // Platinumなら全部入り
    if (userTier === "platinum") {
      content.downloads = [...SECURE_CONTENT.platinum.links, ...SECURE_CONTENT.gold.links, ...SECURE_CONTENT.silver.links, ...SECURE_CONTENT.bronze.links];
    } else if (userTier === "gold") {
      content.downloads = [...SECURE_CONTENT.gold.links, ...SECURE_CONTENT.silver.links, ...SECURE_CONTENT.bronze.links];
    } else if (userTier === "silver") {
      content.downloads = [...SECURE_CONTENT.silver.links, ...SECURE_CONTENT.bronze.links];
    } else {
      content.downloads = [...SECURE_CONTENT.bronze.links];
    }

    return NextResponse.json(content);

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}