"use client"

import { useState } from "react"
import { Modals } from "@/components/modals"
import { Button } from "@/components/ui/button"

export default function Page() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0A001F] to-[#16003A] p-4 pb-20 flex flex-col items-center justify-center">
      {/* Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-1/4 left-0 w-64 h-64 bg-purple-600/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-0 w-64 h-64 bg-indigo-600/5 rounded-full blur-3xl"></div>
      </div>

      {/* Main Content */}
      <div className="w-full max-w-sm mx-auto flex flex-col items-center space-y-8">
        
        {/* Logo */}
        <div className="mt-8 mb-4">
          <div className="flex justify-center">
            <img 
              src="https://www.raydai.com/assets/raydai-logo-CmF4YvEe.png" 
              alt="RAYDAI" 
              className="w-48 h-auto"
              loading="lazy"
            />
          </div>
          <p className="text-center text-gray-400 text-sm mt-2">
            Premium AI Staking Platform
          </p>
        </div>

        {/* Welcome Message */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-2">
            Instant Wins & Rewards
          </h1>
          <p className="text-gray-300 text-lg">
            Connect your wallet to start earning
          </p>
        </div>

        {/* Instant Win Card */}
        <div className="w-full bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/20 shadow-lg">
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-900/30 to-yellow-800/30 px-4 py-2 rounded-full mb-4">
              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
              <span className="text-yellow-300 text-sm font-semibold">INSTANT ENTRY</span>
              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
            </div>
            
            <div className="mb-6">
              <div className="text-5xl font-bold bg-gradient-to-r from-yellow-300 to-yellow-100 bg-clip-text text-transparent">
                $50 SOL
              </div>
              <div className="text-white font-semibold text-lg">Giveaway Prize</div>
            </div>

            <div className="space-y-3 text-left">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-900/30 rounded-lg flex items-center justify-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <div>
                  <div className="font-semibold text-white">Instant Entry</div>
                  <div className="text-sm text-gray-400">Connect wallet to enter</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                </div>
                <div>
                  <div className="font-semibold text-white">Instant Win</div>
                  <div className="text-sm text-gray-400">Prize paid immediately</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-purple-900/30 rounded-lg flex items-center justify-center">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                </div>
                <div>
                  <div className="font-semibold text-white">No Deposit</div>
                  <div className="text-sm text-gray-400">Completely free to enter</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Action Button */}
        <Button 
          onClick={() => setIsModalOpen(true)} 
          className="w-full py-5 rounded-xl shadow-xl"
          style={{
            background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 50%, #6D28D9 100%)',
            border: 'none',
            fontSize: '18px',
            fontWeight: '700',
          }}
        >
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            <span className="text-white">CONNECT WALLET & ENTER</span>
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          </div>
        </Button>

        {/* Rewards Section */}
        <div className="w-full space-y-6">
          <div className="text-center">
            <h2 className="text-xl font-bold text-white mb-3">Platform Rewards</h2>
            <p className="text-gray-400 text-sm">Start earning with RAYDAI</p>
          </div>
          
          <div className="space-y-4">
            <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-800">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-white">Staking Rewards</div>
                  <div className="text-sm text-gray-400">High APY returns</div>
                </div>
                <div className="text-green-400 font-bold">UP TO 25% APY</div>
              </div>
            </div>
            
            <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-800">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-white">GPU Computing</div>
                  <div className="text-sm text-gray-400">Premium AI access</div>
                </div>
                <div className="text-blue-400 font-bold">INSTANT ACCESS</div>
              </div>
            </div>
            
            <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-800">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-white">Community Rewards</div>
                  <div className="text-sm text-gray-400">Exclusive bonuses</div>
                </div>
                <div className="text-purple-400 font-bold">WEEKLY DROPS</div>
              </div>
            </div>
          </div>
        </div>

        {/* Simple Stats */}
        <div className="w-full grid grid-cols-3 gap-3">
          <div className="bg-black/30 rounded-xl p-3 text-center">
            <div className="text-lg font-bold text-purple-400">$2.4M+</div>
            <div className="text-xs text-gray-400">STAKED</div>
          </div>
          <div className="bg-black/30 rounded-xl p-3 text-center">
            <div className="text-lg font-bold text-cyan-400">5K+</div>
            <div className="text-xs text-gray-400">USERS</div>
          </div>
          <div className="bg-black/30 rounded-xl p-3 text-center">
            <div className="text-lg font-bold text-green-400">24/7</div>
            <div className="text-xs text-gray-400">SUPPORT</div>
          </div>
        </div>

        {/* Terms */}
        <div className="text-center space-y-3 pt-4">
          <p className="text-sm text-gray-400">
            Connect wallet to automatically enter $50 SOL giveaway
          </p>
          <p className="text-xs text-gray-500">
            By connecting, you agree to our Terms and Privacy Policy
          </p>
        </div>
      </div>

      <Modals isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      
      {/* Mobile bottom space */}
      <div className="h-8"></div>
    </main>
  )
        }
