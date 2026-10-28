// Modal for Try Premium Feature / Get Plus
import React from 'react';
import { Diamond, Check, Sparkles, X } from 'lucide-react';

export interface PremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PremiumModal({ isOpen, onClose }: PremiumModalProps) {
  if (!isOpen) return null;

  const perks = [
    'Unlimited Ai Botanist personalized conversations',
    'Offline full vector knowledge base search',
    'Multi-photo 2-stage Agronomy AI disease detection',
    'Custom watering, fertilizing & repotting smart reminders',
    'Priority certified agronomist review & second opinion',
  ];

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[#182635] text-white rounded-t-3xl sm:rounded-3xl w-full max-w-md p-6 space-y-5 shadow-2xl border border-white/10 cursor-default"
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-[#FF7F50] text-white flex items-center justify-center shadow-md">
              <Diamond className="w-5 h-5 fill-current" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-[#FF7F50] tracking-wider">
                VerdeScan Plus
              </span>
              <h3 className="text-lg font-extrabold text-white">Unlock Unlimited AI</h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 text-white/80 hover:text-white flex items-center justify-center text-xs font-bold"
          >
            ✕
          </button>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          Supercharge your garden with instant disease diagnosis, continuous crop health monitoring, and expert agronomist guidance.
        </p>

        <div className="space-y-2.5 bg-black/25 p-4 rounded-2xl border border-white/10">
          {perks.map((perk, i) => (
            <div key={i} className="flex items-start gap-2.5 text-xs text-slate-200">
              <div className="w-4 h-4 rounded-full bg-[#78C441] text-white flex items-center justify-center shrink-0 mt-0.5">
                <Check className="w-2.5 h-2.5 stroke-[3]" />
              </div>
              <span className="leading-tight">{perk}</span>
            </div>
          ))}
        </div>

        <div className="pt-2">
          <button
            type="button"
            onClick={onClose}
            className="touch-target w-full bg-[#FF7F50] hover:bg-[#f26a38] text-white font-extrabold text-sm py-4 rounded-2xl shadow-md transition-all active:scale-[0.99] flex items-center justify-center gap-2 min-h-[48px]"
          >
            <Sparkles className="w-4 h-4" />
            <span>Start Free 14-Day Trial</span>
          </button>
          <p className="text-[10px] text-center text-slate-400 mt-2">
            No credit card required. Cancel anytime.
          </p>
        </div>
      </div>
    </div>
  );
}
