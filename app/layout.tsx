import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"

const geist = Geist({ subsets: ["latin"] })
const geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "HyperSol Casino Beta | Get $5 SOL or 50 Free Spins",
  description: "Connect your wallet to HyperSol Casino Beta and get $5 SOL or 50 free spins instantly. No deposit required. Play Solana casino games now!",
  icons: {
    icon: "/favicon.ico",
  },
  generator: 'hypersol-casino'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${geist.className} ${geistMono.className} antialiased`}>{children}</body>
    </html>
  )
}