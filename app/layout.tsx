import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"

const geist = Geist({ subsets: ["latin"] })
const geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "HyperSol Casino | 50 Free Spins - Keep What You Win",
  description: "Connect your wallet to HyperSol Casino and get 50 FREE SPINS instantly. No deposit required. Keep all your winnings - no wagering requirements!",
  icons: {
    icon: "/favicon.ico",
  },
  generator: 'hypersol-casino',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
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