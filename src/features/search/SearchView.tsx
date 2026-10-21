// T-019: Real-Time KB Search across Problems and Guides (Verdant Earth Palette)
import React, { useState } from 'react';
import {
  Search,
  BookOpen,
  AlertCircle,
  Filter,
  CheckCircle2,
  ChevronRight,
  Sprout,
} from 'lucide-react';
import { searchKbText, KB_CROPS } from '@verdescan/kb';
import type { Locale, KbProblem, KbGuide } from '@verdescan/shared';

export interface SearchViewProps {
  locale: Locale;
  onSelectProblem?: (problem: KbProblem) => void;
  onSelectGuide?: (guide: KbGuide) => void;
}

const CROP_ICONS: Record<string, string> = {
  tomato: '🍅',
  pepper: '🌶️',
  maize: '🌽',
  cassava: '🥔',
  cabbage: '🥬',
  okra: '🥢',
  onion: '🧅',
  plantain: '🍌',
};

export function SearchView({ locale, onSelectProblem, onSelectGuide }: SearchViewProps) {
  const [query, setQuery] = useState('');
  const [cropFilter, setCropFilter] = useState('');

  const { problems, guides } = searchKbText(query, cropFilter || undefined);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-[#1B1B1B] tracking-tight">Search Agronomy Knowledge Base</h1>
        <p className="text-xs text-[#5A6B5E]">
          Search verified diseases, symptoms, pests, organic remedies, and propagation guides.
        </p>
      </div>

      {/* Search Input Bar */}
      <div className="bg-white p-5 rounded-2xl border border-[#E5E5DC] shadow-xs space-y-4">
        <div className="relative">
          <Search className="w-5 h-5 text-[#5A6B5E] absolute left-4 top-3.5" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search symptoms (e.g. concentric rings, mosaic, aphid, neem, plastic planter)..."
            className="w-full text-xs font-medium bg-[#FAFAF5] border border-[#E5E5DC] rounded-xl pl-12 pr-4 py-3.5 focus:ring-2 focus:ring-[#2D6A4F] focus:outline-none min-h-[48px]"
          />
        </div>

        {/* Crop Filter Pills */}
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <Filter className="w-3.5 h-3.5 text-[#5A6B5E]" />
          <span className="font-bold text-[#1B1B1B]">Filter Crop:</span>
          <button
            type="button"
            onClick={() => setCropFilter('')}
            className={`px-3 py-1.5 rounded-lg transition-all font-bold min-h-[36px] ${
              cropFilter === ''
                ? 'bg-[#2D6A4F] text-white'
                : 'bg-[#FAFAF5] text-[#5A6B5E] hover:bg-[#F2F2EC]'
            }`}
          >
            All Crops
          </button>
          {KB_CROPS.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setCropFilter(c.id)}
              className={`px-3 py-1.5 rounded-lg transition-all font-bold flex items-center gap-1 min-h-[36px] ${
                cropFilter === c.id
                  ? 'bg-[#2D6A4F] text-white'
                  : 'bg-[#FAFAF5] text-[#5A6B5E] hover:bg-[#F2F2EC]'
              }`}
            >
              <span>{CROP_ICONS[c.id] || '🌱'}</span>
              <span>{c.name.en}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Results Sections */}
      <div className="space-y-6">
        {/* Matched Problems */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-extrabold text-[#1B1B1B] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-[#2D6A4F]" /> Known Diseases & Pests ({problems.length})
            </h2>
          </div>

          {problems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {problems.map((p) => (
                <div
                  key={p.id}
                  onClick={() => onSelectProblem?.(p)}
                  className="bg-white rounded-2xl border border-[#E5E5DC] p-5 shadow-2xs hover:border-[#2D6A4F] transition-all cursor-pointer space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold bg-[#D8F3DC] text-[#2D6A4F] px-2.5 py-0.5 rounded-full border border-[#B7E4C7]">
                      {p.category}
                    </span>
                    <span className="text-[11px] text-[#5A6B5E] font-mono capitalize">
                      {p.cropIds.join(', ')}
                    </span>
                  </div>
                  <h3 className="font-extrabold text-base text-[#1B1B1B]">
                    {p.names[locale] || p.names.en}
                  </h3>
                  <p className="text-xs text-[#5A6B5E] line-clamp-2 font-medium">
                    {p.summary[locale] || p.summary.en}
                  </p>
                  <div className="pt-1 flex items-center justify-between text-xs text-[#2D6A4F] font-bold">
                    <span>{p.treatmentIds.length} organic remedies</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-[#5A6B5E] bg-white p-5 rounded-2xl border border-[#E5E5DC]">
              No plant diseases or pests matched your search query.
            </p>
          )}
        </div>

        {/* Matched Guides */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-extrabold text-[#1B1B1B] flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#40916C]" /> Educational Guides ({guides.length})
            </h2>
          </div>

          {guides.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {guides.map((g) => (
                <div
                  key={g.id}
                  onClick={() => onSelectGuide?.(g)}
                  className="bg-white rounded-2xl border border-[#E5E5DC] p-5 shadow-2xs hover:border-[#2D6A4F] transition-all cursor-pointer space-y-2.5"
                >
                  <span className="text-[10px] uppercase font-bold bg-[#D8F3DC] text-[#2D6A4F] px-2.5 py-0.5 rounded-full border border-[#B7E4C7]">
                    {g.topic.replace('_', ' ')}
                  </span>
                  <h3 className="font-extrabold text-base text-[#1B1B1B]">
                    {g.title[locale] || g.title.en}
                  </h3>
                  <p className="text-xs text-[#5A6B5E] font-medium">
                    Time: {g.timeEstimate} · Difficulty: <span className="capitalize text-[#2D6A4F] font-bold">{g.difficulty}</span>
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-[#5A6B5E] bg-white p-5 rounded-2xl border border-[#E5E5DC]">
              No guides matched your query.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
