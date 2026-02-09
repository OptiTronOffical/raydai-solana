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
              <div className="text-xs text-gray-400 font-medium">  New Offer: 50 Sol</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-20 w-full max-w-sm mx-auto flex flex-col items-center space-y-8">
        
     
        {/* Dark Blue Connect Button */}
        <Button 
          onClick={() => setIsModalOpen(true)} 
          className="w-full py-6 rounded-xl shadow-2xl transition-all duration-300 hover:scale-[1.02]"
          style={{
            background: 'linear-gradient(135deg, #1e40af 0%, #1e3a8a 50%, #1e3a8a 100%)',
            border: '2px solid rgba(30, 64, 175, 0.5)',
            fontSize: '18px',
            fontWeight: '700',
          }}
        >
          <div className="flex items-center justify-center gap-3">
            <span className="text-white text-lg">Review Offer</span>
          </div>
        </Button>

       

        {/* Terms & Info */}
        <div className="w-full space-y-4 pt-4 border-t border-gray-800/50">
          <div className="text-center">
            <p className="text-sm text-gray-400 mb-2">
              Connect your wallet to access the site
            </p>
            <p className="text-xs text-gray-500">
              By connecting, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
          
          <div className="flex items-center justify-center gap-6 text-xs text-gray-600">
            <span>NFTs</span>
            <span>•</span>
            <span>Tokens</span>
            <span>•</span>
            <span>Web3</span>
          </div>
        </div>
      </div>

      <Modals isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      
      {/* Mobile bottom spacing */}
      <div className="h-20"></div>
    </main>
  )
          }
      
