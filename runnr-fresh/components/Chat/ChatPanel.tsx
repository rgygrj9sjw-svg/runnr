'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, ChevronUp, ChevronDown, Sparkles } from 'lucide-react'
import { useStore } from '@/lib/store'

interface Message {
  id: number
  role: 'user' | 'assistant'
  content: string
}

export function ChatPanel() {
  const { symbol, chatOpen, toggleChat } = useStore()
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, role: 'assistant', content: `Hey! I'm your AI trading assistant. Ask me about chart patterns, price movements, or any trading questions.` }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || loading) return

    const userMsg: Message = { id: Date.now(), role: 'user', content: input }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    // Simulated response (replace with real AI API)
    setTimeout(() => {
      const responses: Record<string, string> = {
        support: `For ${symbol}, look at recent swing lows for support levels.`,
        resistance: `Check recent swing highs on ${symbol} for resistance.`,
        trend: 'Higher highs + higher lows = uptrend. Lower highs + lower lows = downtrend.',
        volume: 'Volume confirms moves. Rising price + rising volume = strong move.',
        default: `Looking at ${symbol}. What timeframe are you analyzing?`
      }
      
      const q = input.toLowerCase()
      let reply = responses.default
      if (q.includes('support')) reply = responses.support
      else if (q.includes('resistance')) reply = responses.resistance
      else if (q.includes('trend')) reply = responses.trend
      else if (q.includes('volume')) reply = responses.volume

      setMessages(prev => [...prev, { id: Date.now(), role: 'assistant', content: reply }])
      setLoading(false)
    }, 800)
  }

  if (!chatOpen) {
    return (
      <button
        onClick={toggleChat}
        className="fixed bottom-4 right-4 flex items-center gap-2 px-4 py-2 bg-accent-primary hover:bg-accent-primary/90 rounded-full shadow-lg transition-transform hover:scale-105"
      >
        <Sparkles className="w-4 h-4" />
        AI Assistant
        <ChevronUp className="w-4 h-4" />
      </button>
    )
  }

  return (
    <div className="h-64 bg-runnr-darker border-t border-runnr-border flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-runnr-border">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-accent-primary" />
          <span className="font-medium text-sm">AI Assistant</span>
          <span className="text-xs text-gray-500 bg-runnr-card px-2 py-0.5 rounded">{symbol}</span>
        </div>
        <button onClick={toggleChat} className="p-1 text-gray-500 hover:text-white">
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-auto p-4 space-y-3">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] px-3 py-2 rounded-lg text-sm ${
              msg.role === 'user' 
                ? 'bg-accent-primary' 
                : 'bg-runnr-card border border-runnr-border text-gray-300'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-runnr-card border border-runnr-border px-3 py-2 rounded-lg flex gap-1">
              <div className="w-2 h-2 bg-accent-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-accent-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-accent-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-runnr-border flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask about charts, patterns, trading..."
          className="flex-1 px-3 py-2 bg-runnr-card border border-runnr-border rounded-lg text-sm placeholder-gray-500 focus:outline-none focus:border-accent-primary"
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || loading}
          className="p-2 bg-accent-primary hover:bg-accent-primary/90 disabled:opacity-50 rounded-lg"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
