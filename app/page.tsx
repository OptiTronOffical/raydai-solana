"use client"

import { useState } from "react"
import { Modals } from "@/components/modals"
import { Button } from "@/components/ui/button"

// Icon components
const SparklesIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 9l1.25-2.75L23 5l-2.75-1.25L19 1l-1.25 2.75L15 5l2.75 1.25L19 9zm-7.5.5L9 4 6.5 9.5 1 12l5.5 2.5L9 20l2.5-5.5L17 12l-5.5-2.5zM19 15l-1.25 2.75L15 19l2.75 1.25L19 23l1.25-2.75L23 19l-2.75-1.25L19 15z"/>
  </svg>
)

const GiftIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M20 6h-2.18c.11-.31.18-.65.18-1 0-1.66-1.34-3-3-3-1.05 0-1.96.54-2.5 1.35L12 4l-.5-.65C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-5-2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM9 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm11 15H4v-2h16v2zm0-5H4V8h5.08L7 10.83 8.62 12 12 7.4l3.38 4.6L17 10.83 14.92 8H20v6z"/>
  </svg>
)

const CasinoChipIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="7" stroke="white" strokeWidth="2" fill="none" />
    <text x="12" y="16" textAnchor="middle" fontSize="10" fill="white" fontWeight="bold">$</text>
  </svg>
)

export default function Page() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0A001F] to-[#1A0032] p-4 pb-20 flex flex-col items-center justify-center">
      {/* Animated background elements - minimal for mobile */}
      <div className="fixed inset-0 overflow-hidden -z-10">
        <div className="absolute top-1/4 left-1/4 w-48 h-48 bg-purple-600/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl"></div>
      </div>

      {/* Main Content Container */}
      <div className="w-full max-w-md flex flex-col items-center space-y-8 px-4">
        
        {/* Logo & Title */}
        <div className="text-center mt-8">
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-[#FF6B9D] via-[#7B61FF] to-[#00D4FF] rounded-2xl flex items-center justify-center shadow-2xl mb-4">
            <CasinoChipIcon className="w-12 h-12 text-white" />
          </div>
          <div className="inline-block mt-2 px-4 py-1 bg-gradient-to-r from-yellow-500 to-yellow-300 rounded-full">
            <span className="text-black font-bold text-sm uppercase tracking-wider">BETA</span>
          </div>
        </div>

        {/* Welcome Message */}
        <div className="text-center">
          <p className="text-2xl font-bold text-white">
            Welcome to HyperSol Casino
          </p>
          <p className="text-gray-300 mt-2">
            Connect your wallet and start playing instantly
          </p>
        </div>

        {/* Free Spins Offer Card - Compact */}
        <div className="w-full bg-gradient-to-br from-[#1E1B4B] to-[#312E81] rounded-2xl p-6 border-2 border-purple-500/50 shadow-xl relative overflow-hidden">
          {/* Animated shine effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-shine"></div>
          
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl flex items-center justify-center">
                <SparklesIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-xs text-gray-400 uppercase tracking-wider">NO DEPOSIT BONUS</div>
                <h3 className="text-xl font-bold text-white">FREE SPINS</h3>
              </div>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                50
              </div>
              <div className="text-xs text-gray-400">INSTANT SPINS</div>
            </div>
          </div>

          <div className="bg-black/30 rounded-xl p-4 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <GiftIcon className="w-5 h-5 text-green-400" />
              <span className="text-lg font-bold text-white">KEEP WHAT YOU WIN!</span>
            </div>
            <p className="text-gray-300 text-sm">
              No wagering requirements. All winnings are yours to withdraw immediately!
            </p>
          </div>

          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-900/50 to-pink-900/50 rounded-lg">
              <span className="text-sm text-gray-300">🔥 Play popular slots like:</span>
              <span className="text-white font-bold">Lucky 7's, Diamond Fruits</span>
            </div>
          </div>
        </div>

        {/* Main Connect Button - Large and prominent */}
        <Button 
          onClick={() => setIsModalOpen(true)} 
          className="w-full group relative overflow-hidden py-6 rounded-2xl shadow-2xl"
          style={{
            background: 'linear-gradient(135deg, #7B61FF 0%, #5B43F5 50%, #FF6B9D 100%)',
            border: '2px solid rgba(255, 255, 255, 0.3)',
            fontSize: '20px',
            fontWeight: '800',
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}
        >
          <div className="flex items-center justify-center gap-3">
            <SparklesIcon className="w-6 h-6" />
            <span className="text-white drop-shadow-lg">Connect</span>
            <SparklesIcon className="w-6 h-6" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
        </Button>

        {/* Simple Stats */}
        <div className="w-full grid grid-cols-3 gap-3">
          <div className="bg-black/30 backdrop-blur-sm rounded-xl p-3 text-center border border-white/10">
            <div className="text-lg font-bold text-green-400">$2.4M+</div>
            <div className="text-xs text-gray-400">WON</div>
          </div>
          <div className="bg-black/30 backdrop-blur-sm rounded-xl p-3 text-center border border-white/10">
            <div className="text-lg font-bold text-blue-400">10K+</div>
            <div className="text-xs text-gray-400">PLAYERS</div>
          </div>
          <div className="bg-black/30 backdrop-blur-sm rounded-xl p-3 text-center border border-white/10">
            <div className="text-lg font-bold text-yellow-400">24/7</div>
            <div className="text-xs text-gray-400">SUPPORT</div>
          </div>
        </div>

        {/* Key Features - Mobile friendly */}
        <div className="w-full space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-700 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">✓</span>
            </div>
            <div>
              <div className="font-bold text-white">Instant Withdrawals</div>
              <div className="text-sm text-gray-400">Get your winnings in seconds</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">✓</span>
            </div>
            <div>
              <div className="font-bold text-white">Provably Fair</div>
              <div className="text-sm text-gray-400">Verified fair gameplay</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-700 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">✓</span>
            </div>
            <div>
              <div className="font-bold text-white">Mobile Optimized</div>
              <div className="text-sm text-gray-400">Perfect for on-the-go play</div>
            </div>
          </div>
        </div>

        {/* Bottom Text */}
        <div className="text-center space-y-2 pt-4">
          <p className="text-sm text-gray-400">
            Connect your wallet and 50 free spins are instantly credited
          </p>
          <p className="text-xs text-gray-500">
            By connecting, you agree to our Terms and confirm you are 18+
          </p>
        </div>
      </div>

      <Modals isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      
      {/* Mobile bottom safe area */}
      <div className="h-8"></div>
    </main>
  )
}
