'use client'

import { BarChart3, ScanLine, BookOpen, Settings, Zap } from 'lucide-react'
import { TickerSearch } from '../Chart/TickerSearch'
import { useStore } from '@/lib/store'

const tabs = [
  { id: 'chart' as const, label: 'Chart', icon: BarChart3 },
  { id: 'scanner' as const, label: 'Scanner', icon: ScanLine },
  { id: 'journal' as const, label: 'Journal', icon: BookOpen },
]

export function TopNav() {
  const { symbol, activeTab, setSymbol, setActiveTab } = useStore()

  return (
    <header className="h-14 bg-runnr-darker border-b border-runnr-border flex items-center justify-between px-4">
      {/* Logo & Tabs */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-accent-primary rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5" />
          </div>
          <span className="font-bold text-lg">Runnr</span>
        </div>

        <nav className="flex items-center gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-accent-primary/10 text-accent-primary'
                    : 'text-gray-400 hover:text-white hover:bg-runnr-hover'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Search & Settings */}
      <div className="flex items-center gap-4">
        <div className="w-64">
          <TickerSearch value={symbol} onChange={setSymbol} />
        </div>
        <button className="p-2 text-gray-400 hover:text-white hover:bg-runnr-hover rounded-lg">
          <Settings className="w-5 h-5" />
        </button>
      </div>
    </header>
  )
}
