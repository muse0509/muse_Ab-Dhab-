// src/hooks/useCandyMachineMint.ts
"use client";

import { useCallback, useState } from "react";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {
  generateSigner,
  publicKey,
  transactionBuilder,
  some,
} from "@metaplex-foundation/umi";
import { walletAdapterIdentity } from "@metaplex-foundation/umi-signer-wallet-adapters";
import { mplCandyMachine, mintV2 } from "@metaplex-foundation/mpl-candy-machine";
import { setComputeUnitLimit } from "@metaplex-foundation/mpl-toolbox";
import { useWallet } from "@solana/wallet-adapter-react";
import { base58 } from "@metaplex-foundation/umi/serializers";

type MintState = {
  loading: boolean;
  error: string | null;
  signature: string | null;
};

const RPC_ENDPOINT =
  process.env.NEXT_PUBLIC_HELIUS_RPC ??
  "https://api.mainnet-beta.solana.com";

const USDC_MINT = process.env.NEXT_PUBLIC_USDC_MINT!;
const USDC_DEST_ATA = process.env.NEXT_PUBLIC_USDC_DEST_ATA!;
const COLLECTION_MINT = process.env.NEXT_PUBLIC_COLLECTION_MINT!;
const COLLECTION_UPDATE_AUTH =
  process.env.NEXT_PUBLIC_COLLECTION_UPDATE_AUTH!;

export function useCandyMachineMint() {
  const wallet = useWallet();
  const [state, setState] = useState<MintState>({
    loading: false,
    error: null,
    signature: null,
  });

  const mint = useCallback(
    async (candyMachineId: string) => {
      if (!wallet.publicKey) {
        setState({
          loading: false,
          error: "ウォレットを接続してください。",
          signature: null,
        });
        return;
      }

      setState({ loading: true, error: null, signature: null });

      try {
        const umi = createUmi(RPC_ENDPOINT)
          .use(walletAdapterIdentity(wallet as any))
          .use(mplCandyMachine());

        const candyMachinePk = publicKey(candyMachineId);
        const nftMint = generateSigner(umi);

        const txBuilder = transactionBuilder()
          .add(setComputeUnitLimit(umi, { units: 600_000 }))
          .add(
            mintV2(umi, {
              candyMachine: candyMachinePk,
              nftMint,

              collectionMint: publicKey(COLLECTION_MINT),
              collectionUpdateAuthority: publicKey(COLLECTION_UPDATE_AUTH),

              // tokenPayment guard を使う場合は some(...) で包むのが安全
              mintArgs: {
                tokenPayment: some({
                  mint: publicKey(USDC_MINT),
                  destinationAta: publicKey(USDC_DEST_ATA),
                }),
              },
            })
          );

        const tx = await txBuilder.sendAndConfirm(umi);

        // TransactionSignature -> base58 string
        const [signatureStr] = base58.deserialize(tx.signature);

        setState({
          loading: false,
          error: null,
          signature: signatureStr,
        });
      } catch (e: any) {
        console.error(e);
        setState({
          loading: false,
          error: e?.message ?? "Mint に失敗しました",
          signature: null,
        });
      }
    },
    [wallet]
  );

  return { mint, ...state };
}
