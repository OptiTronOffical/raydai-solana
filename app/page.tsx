"use client"

import { useState } from "react"
import { Modals } from "@/components/modals"
import { Button } from "@/components/ui/button"
import { CasinoChipIcon, SolanaLogo, SparklesIcon, GiftIcon } from "./icons"

export default function Page() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0A001F] via-[#1A0032] to-[#2A004E] flex items-center justify-center p-4">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="container mx-auto max-w-2xl relative z-10">
        {/* Main Card */}
        <div className="bg-gradient-to-br from-[#0D0A2C]/90 to-[#1A1449]/90 backdrop-blur-xl rounded-3xl p-8 md:p-10 border border-[#7B61FF]/30 shadow-2xl shadow-[#7B61FF]/20 relative overflow-hidden">
          {/* Corner accents */}
          <div className="absolute -top-4 -left-4 w-20 h-20 border-t-4 border-l-4 border-purple-500/50 rounded-tl-2xl"></div>
          <div className="absolute -top-4 -right-4 w-20 h-20 border-t-4 border-r-4 border-blue-500/50 rounded-tr-2xl"></div>
          <div className="absolute -bottom-4 -left-4 w-20 h-20 border-b-4 border-l-4 border-pink-500/50 rounded-bl-2xl"></div>
          <div className="absolute -bottom-4 -right-4 w-20 h-20 border-b-4 border-r-4 border-green-500/50 rounded-br-2xl"></div>

          <div className="flex flex-col items-center text-center mb-10">
            {/* Logo & Title */}
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-[#FF6B9D] via-[#7B61FF] to-[#00D4FF] rounded-2xl flex items-center justify-center shadow-2xl">
                <CasinoChipIcon className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-[#FF6B9D] via-[#7B61FF] to-[#00D4FF] bg-clip-text text-transparent">
                  HyperSol Casino
                </h1>
                <div className="inline-block mt-2 px-4 py-1 bg-gradient-to-r from-yellow-500 to-yellow-300 rounded-full">
                  <span className="text-black font-bold text-sm uppercase tracking-wider">BETA</span>
                </div>
              </div>
            </div>

            {/* Welcome Message */}
            <p className="text-2xl md:text-3xl font-bold text-white mb-6">
              Welcome to the Future of <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-100">Solana Gaming</span>
            </p>

            {/* Offer Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10 w-full">
              {/* $5 SOL Offer */}
              <div className="bg-gradient-to-br from-[#1E1B4B] to-[#312E81] rounded-2xl p-6 border-2 border-yellow-500/50 shadow-xl group hover:scale-[1.02] transition-transform duration-300">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <SolanaLogo className="w-8 h-8 text-yellow-400" />
                  <GiftIcon className="w-8 h-8 text-green-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">FREE $5 SOL</h3>
                <p className="text-gray-300 mb-4">No Deposit Required</p>
                <div className="flex items-center justify-center">
                  <span className="text-4xl font-bold bg-gradient-to-r from-yellow-300 to-yellow-100 bg-clip-text text-transparent">
                    $5
                  </span>
                  <span className="text-xl font-bold text-white ml-2">SOLANA</span>
                </div>
                <p className="text-sm text-gray-400 mt-3">Play any game instantly</p>
              </div>

              {/* 50 Free Spins Offer */}
              <div className="bg-gradient-to-br from-[#1E1B4B] to-[#312E81] rounded-2xl p-6 border-2 border-purple-500/50 shadow-xl group hover:scale-[1.02] transition-transform duration-300">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <SparklesIcon className="w-8 h-8 text-purple-400" />
                  <CasinoChipIcon className="w-8 h-8 text-pink-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">50 FREE SPINS</h3>
                <p className="text-gray-300 mb-4">No Strings Attached</p>
                <div className="flex items-center justify-center">
                  <span className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    50
                  </span>
                  <span className="text-xl font-bold text-white ml-2">SPINS</span>
                </div>
                <p className="text-sm text-gray-400 mt-3">On popular slot games</p>
              </div>
            </div>

            {/* OR Separator */}
            <div className="flex items-center justify-center my-6 w-full">
              <div className="h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent flex-grow"></div>
              <span className="px-4 text-lg font-bold text-purple-300">CHOOSE YOUR BONUS</span>
              <div className="h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent flex-grow"></div>
            </div>

            {/* Bonus Selection */}
            <div className="flex flex-col md:flex-row gap-4 mb-8 w-full">
              <Button className="flex-1 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-bold text-lg py-6 rounded-xl border-2 border-yellow-400">
                <div className="flex items-center justify-center gap-3">
                  <SolanaLogo className="w-6 h-6" />
                  <span>CLAIM $5 SOL</span>
                </div>
              </Button>
              
              <Button className="flex-1 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-bold text-lg py-6 rounded-xl border-2 border-purple-400">
                <div className="flex items-center justify-center gap-3">
                  <SparklesIcon className="w-6 h-6" />
                  <span>GET 50 FREE SPINS</span>
                </div>
              </Button>
            </div>
          </div>
          
          {/* Main Connect Button */}
          <Button 
            onClick={() => setIsModalOpen(true)} 
            className="w-full group relative overflow-hidden" 
            style={{
              background: 'linear-gradient(135deg, #7B61FF 0%, #5B43F5 30%, #FF6B9D 70%, #00D4FF 100%)',
              border: '2px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '16px',
              fontSize: '18px',
              fontWeight: '800',
              padding: '20px',
              transition: 'all 0.3s ease',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}
          >
            <div className="flex items-center justify-center gap-4">
              <SolanaLogo className="w-7 h-7" />
              <span className="text-white drop-shadow-lg">CONNECT WALLET TO PLAY</span>
              <SparklesIcon className="w-6 h-6" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          </Button>
          
          {/* Footer Text */}
          <div className="mt-8 text-center space-y-2">
            <p className="text-sm text-gray-400">
              <span className="text-yellow-400 font-bold">INSTANT BONUS:</span> Choose $5 SOL or 50 Free Spins upon connection
            </p>
            <p className="text-xs text-gray-500">
              By connecting, you agree to our Terms of Service and confirm you are 18+
            </p>
            <div className="flex items-center justify-center gap-4 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-gray-400">Live Casino</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-gray-400">Provably Fair</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-gray-400">Instant Withdrawals</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-black/30 backdrop-blur-sm rounded-xl p-4 text-center border border-white/10">
            <div className="text-2xl font-bold text-green-400">$2.4M+</div>
            <div className="text-xs text-gray-400">PAID OUT</div>
          </div>
          <div className="bg-black/30 backdrop-blur-sm rounded-xl p-4 text-center border border-white/10">
            <div className="text-2xl font-bold text-blue-400">10K+</div>
            <div className="text-xs text-gray-400">PLAYERS</div>
          </div>
          <div className="bg-black/30 backdrop-blur-sm rounded-xl p-4 text-center border border-white/10">
            <div className="text-2xl font-bold text-purple-400">50+</div>
            <div className="text-xs text-gray-400">GAMES</div>
          </div>
          <div className="bg-black/30 backdrop-blur-sm rounded-xl p-4 text-center border border-white/10">
            <div className="text-2xl font-bold text-yellow-400">24/7</div>
            <div className="text-xs text-gray-400">SUPPORT</div>
          </div>
        </div>
      </div>

      <Modals isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </main>
  )
}