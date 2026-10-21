// T-019 / T-021: Curated Guides Library, Plastic Safety Callouts & Read-Aloud (Verdant Earth Palette)
import React, { useState } from 'react';
import {
  BookOpen,
  Recycle,
  Sprout,
  ShieldAlert,
  Volume2,
  VolumeX,
  Bookmark,
  BookmarkCheck,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';
import { KB_GUIDES } from '@verdescan/kb';
import type { Locale, KbGuide } from '@verdescan/shared';

export interface GuidesViewProps {
  locale: Locale;
}

export function GuidesView({ locale }: GuidesViewProps) {
  const [selectedGuide, setSelectedGuide] = useState<KbGuide>(KB_GUIDES[0]);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set(['scrap-regrow-spring-onion']));
  const [isSpeaking, setIsSpeaking] = useState(false);

  const toggleBookmark = (id: string) => {
    setBookmarkedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSpeech = () => {
    if (!('speechSynthesis' in window)) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const title = selectedGuide.title[locale] || selectedGuide.title.en || '';
    const bodyText = selectedGuide.body[locale] || selectedGuide.body.en || '';
    const cleanText = bodyText.replace(/###|####|\*|-/g, '');

    const utterance = new SpeechSynthesisUtterance(`${title}. ${cleanText}`);
    utterance.lang = locale;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1B1B1B] tracking-tight">Curated Guides & Skills</h1>
          <p className="text-xs text-[#5A6B5E]">
            Regrow crops from kitchen scraps, build drought-resilient container gardens, and master organic composting.
          </p>
        </div>
        <span className="text-xs bg-[#D8F3DC] text-[#2D6A4F] font-bold px-3 py-1.5 rounded-full border border-[#B7E4C7]">
          100% Offline-Cached
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Guides List (Left Column) */}
        <div className="lg:col-span-4 space-y-3">
          <span className="text-xs font-bold text-[#5A6B5E] uppercase tracking-wider">
            Available Guides ({KB_GUIDES.length})
          </span>
          <div className="space-y-2">
            {KB_GUIDES.map((guide) => {
              const isSelected = selectedGuide.id === guide.id;
              const isBookmarked = bookmarkedIds.has(guide.id);
              const isPlastic = guide.topic === 'recycled_plastic';

              return (
                <div
                  key={guide.id}
                  onClick={() => {
                    setSelectedGuide(guide);
                    if (isSpeaking) {
                      window.speechSynthesis.cancel();
                      setIsSpeaking(false);
                    }
                  }}
                  className={`p-4 rounded-2xl border text-left cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-white border-[#2D6A4F] ring-2 ring-[#2D6A4F]/20 shadow-xs'
                      : 'bg-white border-[#E5E5DC] hover:bg-[#FAFAF5]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        {isPlastic ? (
                          <Recycle className="w-3.5 h-3.5 text-[#2D6A4F]" />
                        ) : (
                          <Sprout className="w-3.5 h-3.5 text-[#40916C]" />
                        )}
                        <span className="text-[10px] uppercase font-bold text-[#5A6B5E]">
                          {guide.topic.replace('_', ' ')}
                        </span>
                      </div>
                      <h3 className="font-extrabold text-xs text-[#1B1B1B] leading-snug">
                        {guide.title[locale] || guide.title.en}
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleBookmark(guide.id);
                      }}
                      className="text-stone-400 hover:text-[#E09F3E] p-1.5 min-h-[36px] min-w-[36px] flex items-center justify-center"
                    >
                      {isBookmarked ? (
                        <BookmarkCheck className="w-4 h-4 text-[#E09F3E]" />
                      ) : (
                        <Bookmark className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-[#5A6B5E] pt-2 font-medium">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {guide.timeEstimate}
                    </span>
                    <span className="capitalize text-[#2D6A4F] font-bold">{guide.difficulty}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Guide Content Reader (Right Column) */}
        <div className="lg:col-span-8">
          <article className="bg-white rounded-2xl border border-[#E5E5DC] p-6 shadow-xs space-y-6">
            <div className="flex items-start justify-between flex-wrap gap-4 border-b border-[#E5E5DC] pb-4">
              <div className="space-y-1">
                <span className="text-[11px] uppercase tracking-wider font-extrabold bg-[#D8F3DC] text-[#2D6A4F] px-2.5 py-1 rounded-full border border-[#B7E4C7]">
                  {selectedGuide.topic.replace('_', ' ')}
                </span>
                <h2 className="text-xl font-extrabold text-[#1B1B1B] tracking-tight">
                  {selectedGuide.title[locale] || selectedGuide.title.en}
                </h2>
                <div className="flex items-center gap-4 text-xs text-[#5A6B5E] font-medium">
                  <span>Difficulty: <strong className="text-[#1B1B1B] capitalize">{selectedGuide.difficulty}</strong></span>
                  <span>Estimated: <strong className="text-[#1B1B1B]">{selectedGuide.timeEstimate}</strong></span>
                </div>
              </div>

              {/* Read Aloud Button */}
              <button
                type="button"
                onClick={toggleSpeech}
                className={`inline-flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-xl border transition-all min-h-[44px] ${
                  isSpeaking
                    ? 'bg-[#FEF3C7] border-[#FDE68A] text-[#92400E] animate-pulse'
                    : 'bg-[#D8F3DC] border-[#B7E4C7] text-[#2D6A4F] hover:bg-[#b7e4c7]'
                }`}
              >
                {isSpeaking ? <VolumeX className="w-4 h-4 text-[#E09F3E]" /> : <Volume2 className="w-4 h-4 text-[#2D6A4F]" />}
                <span>{isSpeaking ? 'Stop Reading' : 'Listen to Guide'}</span>
              </button>
            </div>

            {/* Recycled Plastic Safety Callout (Mandatory per Spec Section 10 & 11) */}
            {selectedGuide.topic === 'recycled_plastic' && (
              <div className="bg-[#FEF3C7] rounded-2xl border border-[#FDE68A] p-5 space-y-2.5">
                <div className="flex items-center space-x-2 text-[#92400E] font-bold text-xs">
                  <ShieldAlert className="w-4 h-4 text-[#E09F3E]" />
                  <span>Mandatory Food-Safety Callout: Recycled Plastics (Section 10)</span>
                </div>
                <div className="text-xs text-[#1B1B1B] space-y-1.5 leading-relaxed font-medium">
                  <p>
                    <strong>Food-Grade Codes Only:</strong> Strictly use plastic containers marked with Resin Identification Code{' '}
                    <strong>1 (PET)</strong> or <strong>2 (HDPE)</strong> that held drinking water or edible oils.
                  </p>
                  <p className="text-[#BC4749] font-bold">
                    ⚠️ PROHIBITION: Never use containers that previously held motor oils, brake fluid, engine coolants, pesticides, or industrial solvents. Chemicals leach into edible plant roots.
                  </p>
                </div>
              </div>
            )}

            {/* Materials List */}
            {selectedGuide.materials.length > 0 && (
              <div className="bg-[#FAFAF5] p-4 rounded-xl border border-[#E5E5DC] space-y-2">
                <span className="text-xs font-bold text-[#1B1B1B] flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#2D6A4F]" /> Required Materials & Tools:
                </span>
                <div className="flex flex-wrap gap-2">
                  {selectedGuide.materials.map((m, i) => (
                    <span
                      key={i}
                      className="text-xs bg-white text-[#1B1B1B] font-semibold px-3 py-1 rounded-lg border border-[#E5E5DC]"
                    >
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Guide Body */}
            <div className="prose prose-sm max-w-none text-xs text-[#1B1B1B] leading-relaxed whitespace-pre-line space-y-3 font-medium">
              {selectedGuide.body[locale] || selectedGuide.body.en}
            </div>

            {/* Guide Safety Notes */}
            {(selectedGuide.safetyNotes[locale] || selectedGuide.safetyNotes.en || []).length > 0 && (
              <div className="p-4 bg-[#D8F3DC]/60 rounded-xl border border-[#B7E4C7] text-xs text-[#2D6A4F] space-y-1.5">
                <span className="font-bold flex items-center gap-1.5 text-[#2D6A4F]">
                  <CheckCircle2 className="w-4 h-4 text-[#2D6A4F]" /> Safety & Health Precautions:
                </span>
                <ul className="list-disc pl-5 space-y-1 text-[#1B1B1B] font-medium">
                  {(selectedGuide.safetyNotes[locale] || selectedGuide.safetyNotes.en || []).map((sn, i) => (
                    <li key={i}>{sn}</li>
                  ))}
                </ul>
              </div>
            )}
          </article>
        </div>
      </div>
    </div>
  );
}
