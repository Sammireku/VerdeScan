// UI: Bottom Navigation Bar with 5 tabs and elevated Center Scan button matching uploaded design
import React from 'react';
import { Home, Activity, Scan, Bot, Sprout } from 'lucide-react';

export type NavTab = 'home' | 'diagnose' | 'ai_expert' | 'plants';

export interface BottomNavProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  onOpenScan: () => void;
  queuedCount?: number;
}

export function BottomNav({
  activeTab,
  setActiveTab,
  onOpenScan,
  queuedCount = 0,
}: BottomNavProps) {
  return (
    <nav
      aria-label="Bottom Navigation"
      className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E8EDE6] px-4 py-2 pb-safe shadow-lg"
    >
      <div className="flex items-center justify-between max-w-md mx-auto relative">
        {/* 1. Home */}
        <button
          type="button"
          onClick={() => setActiveTab('home')}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-all touch-target ${
            activeTab === 'home' ? 'text-[#1A3B29]' : 'text-[#8C9B90] hover:text-[#5E6D65]'
          }`}
        >
          <Home className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] font-semibold tracking-tight">Home</span>
          {activeTab === 'home' && (
            <span className="w-1.5 h-1.5 rounded-full bg-[#78C441] mt-0.5"></span>
          )}
        </button>

        {/* 2. Diagnose */}
        <button
          type="button"
          onClick={() => setActiveTab('diagnose')}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-all touch-target relative ${
            activeTab === 'diagnose' ? 'text-[#1A3B29]' : 'text-[#8C9B90] hover:text-[#5E6D65]'
          }`}
        >
          <Activity className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] font-semibold tracking-tight">Diagnose</span>
          {activeTab === 'diagnose' && (
            <span className="w-1.5 h-1.5 rounded-full bg-[#78C441] mt-0.5"></span>
          )}
          {queuedCount > 0 && (
            <span className="absolute top-0 right-3 w-4 h-4 rounded-full bg-[#E09F3E] text-white text-[9px] font-bold flex items-center justify-center">
              {queuedCount}
            </span>
          )}
        </button>

        {/* 3. Center Elevated Scan Button */}
        <div className="flex-1 flex justify-center -mt-6">
          <button
            type="button"
            onClick={onOpenScan}
            className="w-14 h-14 rounded-full bg-[#1A3B29] hover:bg-[#122B1E] text-[#78C441] shadow-xl flex items-center justify-center border-4 border-white active:scale-95 transition-all touch-target"
            title="Scan Plant"
            aria-label="Scan Plant"
          >
            <Scan className="w-7 h-7 stroke-[2.2]" />
          </button>
        </div>

        {/* 4. AI Expert / Ai Botanist */}
        <button
          type="button"
          onClick={() => setActiveTab('ai_expert')}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-all touch-target ${
            activeTab === 'ai_expert' ? 'text-[#1A3B29]' : 'text-[#8C9B90] hover:text-[#5E6D65]'
          }`}
        >
          <Bot className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] font-semibold tracking-tight">Ai expert</span>
          {activeTab === 'ai_expert' && (
            <span className="w-1.5 h-1.5 rounded-full bg-[#78C441] mt-0.5"></span>
          )}
        </button>

        {/* 5. My Plants */}
        <button
          type="button"
          onClick={() => setActiveTab('plants')}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-all touch-target ${
            activeTab === 'plants' ? 'text-[#1A3B29]' : 'text-[#8C9B90] hover:text-[#5E6D65]'
          }`}
        >
          <Sprout className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] font-semibold tracking-tight">My plants</span>
          {activeTab === 'plants' && (
            <span className="w-1.5 h-1.5 rounded-full bg-[#78C441] mt-0.5"></span>
          )}
        </button>
      </div>
    </nav>
  );
}
