// Screen 5: History View matching uploaded UI design exactly
import React from 'react';
import { ArrowLeft, MoreVertical, MessageSquare, Sprout, Gift, Bot, Sparkles } from 'lucide-react';

export interface HistoryViewProps {
  onBack: () => void;
  onStartNewChat: () => void;
}

export function HistoryView({ onBack, onStartNewChat }: HistoryViewProps) {
  const todayItems = [
    { id: '1', title: 'Wondering plant is easiest to care for?', icon: MessageSquare },
    { id: '2', title: 'What to consider for plants for home?', icon: Sprout },
    { id: '3', title: 'What plant to gift someone?', icon: Gift },
  ];

  const lastWeekItems = [
    { id: '4', title: 'Wondering plant is easiest to care for?', icon: MessageSquare },
    { id: '5', title: 'What to consider for plants for home?', icon: Sprout },
    { id: '6', title: 'Why my peace lily is sick?', icon: MessageSquare },
    { id: '7', title: 'Tomato Early Blight Diagnosis (Concentric rings)', icon: Sparkles },
  ];

  return (
    <div className="space-y-4 px-4 pb-6">
      {/* Header with Back Chevron & History Title */}
      <div className="flex items-center gap-3 pt-2">
        <button
          type="button"
          onClick={onBack}
          className="w-9 h-9 rounded-full bg-white border border-[#E6EBE4] flex items-center justify-center text-[#19201D] hover:bg-stone-50 touch-target"
          title="Back"
          aria-label="Back"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h1 className="text-xl font-extrabold text-[#19201D] tracking-tight">History</h1>
      </div>

      {/* TODAY SECTION */}
      <div className="space-y-2 pt-1">
        <h3 className="text-xs font-bold text-[#5E6D65] uppercase tracking-wider">Today</h3>
        <div className="space-y-2">
          {todayItems.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl p-3.5 border border-[#E6EBE4] shadow-2xs hover:border-[#78C441] flex items-center justify-between gap-3 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-[#F6F8F5] text-[#5E6D65] flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold text-[#19201D] truncate">
                    {item.title}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  className="text-stone-300 hover:text-stone-600 p-1"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* LAST WEEK SECTION */}
      <div className="space-y-2 pt-2">
        <h3 className="text-xs font-bold text-[#5E6D65] uppercase tracking-wider">Last week</h3>
        <div className="space-y-2">
          {lastWeekItems.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl p-3.5 border border-[#E6EBE4] shadow-2xs hover:border-[#78C441] flex items-center justify-between gap-3 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-[#F6F8F5] text-[#5E6D65] flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold text-[#19201D] truncate">
                    {item.title}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  className="text-stone-300 hover:text-stone-600 p-1"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* BOTTOM BANNER: Your helpful guide (matching mockup 5 right) */}
      <div className="bg-[#EBF5EA] rounded-3xl p-5 border border-[#D5EAD3] shadow-xs relative overflow-hidden mt-6">
        <div className="max-w-[65%] space-y-2">
          <h4 className="font-extrabold text-sm text-[#19201D]">Your helpful guide</h4>
          <p className="text-xs text-[#5E6D65] leading-relaxed">
            Ready to help to take care your plants with you.
          </p>

          <button
            type="button"
            onClick={onStartNewChat}
            className="touch-target bg-[#78C441] hover:bg-[#6BB536] text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-xs flex items-center gap-1.5 active:scale-95 transition-all mt-2 min-h-[44px]"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Start a new chat</span>
          </button>
        </div>

        {/* Cute Mascot Graphic on Right with "Hi" bubble */}
        <div className="absolute right-4 bottom-2 flex flex-col items-center">
          <div className="bg-white text-[#19201D] text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs mb-1 border border-stone-200">
            Hi!
          </div>
          <div className="w-16 h-16 rounded-2xl bg-[#78C441] text-white flex items-center justify-center shadow-md">
            <Bot className="w-8 h-8" />
          </div>
        </div>
      </div>
    </div>
  );
}
