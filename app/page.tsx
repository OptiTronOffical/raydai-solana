"use client"

import { useState } from "react"
import { Modals } from "@/components/modals"
import { Button } from "@/components/ui/button"

// Inline Phantom logo SVG component
const PhantomLogo = ({ className }: { className?: string }) => {
  return (
    <svg 
      className={className} 
      viewBox="0 0 128 128" 
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M112.143 0H15.857C7.099 0 0 7.099 0 15.857v96.286C0 120.901 7.099 128 15.857 128h96.286C120.901 128 128 120.901 128 112.143V15.857C128 7.099 120.901 0 112.143 0z"/>
      <path d="M82.234 55.689c0-11.722 9.417-21.139 21.139-21.139V24H24v10.55h10.628c11.722 0 21.139 9.417 21.139 21.139v31.792c0 11.722-9.417 21.139-21.139 21.139H24V104h79.373V93.45h-10.628c-11.722 0-21.139-9.417-21.139-21.139V55.689z" fill="#fff"/>
    </svg>
  )
}

export default function Page() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-950 flex items-center justify-center p-6">
      <div className="container mx-auto max-w-md">
        <div className="bg-gray-900/80 backdrop-blur-lg rounded-2xl p-8 border border-purple-500/30 shadow-2xl shadow-purple-500/10">
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-purple-500/30">
              <PhantomLogo className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-purple-500 to-purple-600 bg-clip-text text-transparent mb-2">
              Welcome to SolPump.fun
            </h1>
            <p className="text-gray-300 mb-6">
              Connect your wallet to start using solpump.fun and explore the Solana ecosystem
            </p>
          </div>
          
          <Button 
            onClick={() => setIsModalOpen(true)} 
            className="w-full group relative overflow-hidden" 
            size="lg"
            style={{
              background: 'linear-gradient(135deg, #7B61FF 0%, #5B43F5 50%, #3A27E8 100%)',
              border: '1px solid rgba(123, 97, 255, 0.3)',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '600',
              padding: '16px',
              transition: 'all 0.3s ease'
            }}
          >
            <div className="flex items-center justify-center gap-3">
              <PhantomLogo className="w-5 h-5" />
              <span>Connect Phantom Wallet</span>
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          </Button>
          
          <p className="text-sm text-gray-400 text-center mt-6">
            By connecting, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>

      <Modals isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </main>
  )
              }
