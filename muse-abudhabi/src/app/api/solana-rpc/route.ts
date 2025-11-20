// src/app/api/solana-rpc/route.ts
import { NextRequest } from "next/server";

const SOLANA_RPC_ENDPOINT =
  process.env.HELIUS_RPC_URL ?? "https://api.mainnet-beta.solana.com";

export async function POST(req: NextRequest) {
  if (!SOLANA_RPC_ENDPOINT) {
    return new Response(
      JSON.stringify({
        error: "HELIUS_RPC_URL is not configured on the server.",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  const body = await req.text();

  const upstream = await fetch(SOLANA_RPC_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body,
  });

  const text = await upstream.text();

  return new Response(text, {
    status: upstream.status,
    headers: {
      "Content-Type": "application/json",
    },
  });
}
