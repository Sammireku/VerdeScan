import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Activity,
  Plus,
  CheckCircle2,
  Calendar,
  Sparkles,
  TrendingUp,
  Image as ImageIcon,
  Clock,
  Layers,
  ChevronRight,
  ShieldCheck,
  Camera,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { type CropRecoveryLog, type TreatmentEvent } from '@verdescan/shared';
import { useTextToSpeech } from '../../lib/speech';
import { triggerHaptic } from '../../lib/haptics';

interface CropRecoveryTrackerProps {
  onClose: () => void;
  onOpenScan?: () => void;
}

// Real authentic plant leaf images for Before (diseased) & After (recovered healthy)
const DEFAULT_RECOVERY_LOGS: CropRecoveryLog[] = [
  {
    id: 'rec-1',
    plantId: 'plt-roma-101',
    cropName: 'Roma Tomato (Plot B)',
    diagnosisTitle: 'Early Blight (Alternaria solani)',
    initialSeverity: 'moderate',
    initialDate: '2026-10-18',
    recoveryScore: 82,
    // Real leaf comparison: Alternaria blight leaf spots vs Lush recovered tomato foliage
    beforePhotoUrl: '/assets/plants/tomato_leaf_blight.jpg',
    afterPhotoUrl: '/assets/plants/tomato_leaf_healthy.jpg',
    resolved: false,
    lastUpdated: '2026-10-27',
    treatmentTimeline: [
      {
        id: 'tt-1',
        date: '2026-10-18',
        action: 'Sanitation & Lower Canopy Pruning',
        notes: 'Pruned all infected bottom foliage within 25cm of soil line; burned residues.',
        symptomsResolved: ['Target lesions on base foliage removed'],
      },
      {
        id: 'tt-2',
        date: '2026-10-20',
        action: 'Organic Copper / Neem Foliar Application',
        notes: 'Sprayed cold-pressed neem oil (0.5%) + potassium bicarbonate at sunset.',
        symptomsResolved: ['Arrested fungal sporulation on middle tier'],
      },
      {
        id: 'tt-3',
        date: '2026-10-25',
        action: 'Straw Mulch & Drip Re-alignment',
        notes: 'Laid 8cm organic straw mulch to prevent soil rain splash onto foliage.',
        symptomsResolved: ['Zero newly infected leaflets', 'Vigorous new apical shoots'],
      },
    ],
  },
  {
    id: 'rec-2',
    plantId: 'plt-chili-204',
    cropName: 'Habanero Pepper #3',
    diagnosisTitle: 'Green Peach Aphid Infestation',
    initialSeverity: 'severe',
    initialDate: '2026-10-21',
    recoveryScore: 94,
    // Real leaf comparison: Curled chlorotic aphid-damaged leaf vs Glossy pristine pepper leaf
    beforePhotoUrl: '/assets/plants/pepper_leaf_blight.jpg',
    afterPhotoUrl: '/assets/plants/pepper_leaf_healthy.jpg',
    resolved: true,
    lastUpdated: '2026-10-28',
    treatmentTimeline: [
      {
        id: 'tt-4',
        date: '2026-10-21',
        action: 'High-Pressure Water Blast + Castile Soap',
        notes: 'Knocked 90% of nymphs off leaf undersides with pressurized spray.',
        symptomsResolved: ['Underside colonies dismantled'],
      },
      {
        id: 'tt-5',
        date: '2026-10-24',
        action: 'Beneficial Lacewing Larvae Release',
        notes: 'Introduced 50 green lacewing larvae in surrounding companion marigolds.',
        symptomsResolved: ['Honeydew secretion ceased', 'Curled leaves unfurling'],
      },
    ],
  },
];

export function CropRecoveryTracker({ onClose, onOpenScan }: CropRecoveryTrackerProps) {
  const [logs, setLogs] = useState<CropRecoveryLog[]>(() => {
    try {
      const saved = localStorage.getItem('verdescan_recovery_logs');
      if (saved) {
        const parsed: CropRecoveryLog[] = JSON.parse(saved);
        // Refresh with authentic distinct before & after local plant photos
        return parsed.map((item) => {
          const match = DEFAULT_RECOVERY_LOGS.find((d) => d.id === item.id);
          if (
            match &&
            (!item.beforePhotoUrl.startsWith('/assets/plants') ||
              item.beforePhotoUrl.includes('photo-1592878904946') ||
              item.beforePhotoUrl === item.afterPhotoUrl)
          ) {
            return {
              ...item,
              beforePhotoUrl: match.beforePhotoUrl,
              afterPhotoUrl: match.afterPhotoUrl,
            };
          }
          return item;
        });
      }
    } catch {
      // Fallback
    }
    return DEFAULT_RECOVERY_LOGS;
  });

  const [selectedLogId, setSelectedLogId] = useState<string>(logs[0]?.id || '');
  const [sliderPos, setSliderPos] = useState<number>(50);
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [newEventAction, setNewEventAction] = useState('');
  const [newEventNotes, setNewEventNotes] = useState('');
  const [newScore, setNewScore] = useState<number>(85);

  const sliderRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(450);

  useEffect(() => {
    const el = sliderRef.current;
    if (!el) return;
    const updateSize = () => {
      if (sliderRef.current) setContainerWidth(sliderRef.current.offsetWidth);
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const { speak, stop, isSpeaking } = useTextToSpeech();

  const activeLog = logs.find((l) => l.id === selectedLogId) || logs[0];

  useEffect(() => {
    localStorage.setItem('verdescan_recovery_logs', JSON.stringify(logs));
  }, [logs]);

  const handleAddTreatment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventAction.trim() || !activeLog) return;

    const newEvent: TreatmentEvent = {
      id: `tt-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      action: newEventAction.trim(),
      notes: newEventNotes.trim() || undefined,
      symptomsResolved: ['Field observation logged'],
    };

    const updatedLogs = logs.map((item) => {
      if (item.id === activeLog.id) {
        return {
          ...item,
          recoveryScore: Math.min(100, Math.max(0, newScore)),
          resolved: newScore >= 90,
          lastUpdated: new Date().toISOString().split('T')[0],
          treatmentTimeline: [newEvent, ...item.treatmentTimeline],
        };
      }
      return item;
    });

    setLogs(updatedLogs);
    setNewEventAction('');
    setNewEventNotes('');
    setIsAddEventOpen(false);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-[#2D6A4F] bg-[#D8F3DC] border-[#B7E4C7]';
    if (score >= 50) return 'text-[#B45309] bg-[#FEF3C7] border-[#FDE68A]';
    return 'text-[#DC2626] bg-[#FEE2E2] border-[#FECACA]';
  };

  const handleReadAloud = () => {
    if (isSpeaking) {
      stop();
      return;
    }
    if (!activeLog) return;
    const text = `Recovery Report for ${activeLog.cropName}. Current recovery score is ${activeLog.recoveryScore} percent. Condition: ${activeLog.diagnosisTitle}. Latest treatment: ${activeLog.treatmentTimeline[0]?.action || 'None'}. Notes: ${activeLog.treatmentTimeline[0]?.notes || 'Stable progress'}.`;
    speak(text);
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Top Header */}
      <div className="bg-[#1A3B29] text-white rounded-b-3xl px-5 pt-4 pb-5 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-[#78C441] text-[#122B1E] px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
              <Activity className="w-3.5 h-3.5" />
              Longitudinal Tracker
            </span>
          </div>
        </div>
        <h1 className="text-xl font-extrabold tracking-tight">Crop Health & Recovery</h1>
        <p className="text-xs text-white/75 mt-0.5">
          Track biological recovery scores, treatment milestones & before/after progression
        </p>
      </div>

      <div className="px-4 space-y-4">
        {/* Plant Selector Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {logs.map((log) => (
            <button
              key={log.id}
              type="button"
              onClick={() => setSelectedLogId(log.id)}
              className={`px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all border ${
                selectedLogId === log.id
                  ? 'bg-[#1A3B29] text-white border-[#1A3B29] shadow-sm'
                  : 'bg-white text-[#4A5568] border-[#E2E8F0] hover:bg-slate-50'
              }`}
            >
              {log.cropName} ({log.recoveryScore}%)
            </button>
          ))}
        </div>

        {activeLog && (
          <div className="space-y-4">
            {/* Primary Status Card */}
            <div className="bg-white rounded-3xl p-5 border border-[#E6EBE4] shadow-xs space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-[10px] font-bold tracking-wide uppercase text-[#5E6D65]">
                    Crop Case File
                  </span>
                  <h2 className="text-lg font-extrabold text-[#19201D] leading-tight">
                    {activeLog.cropName}
                  </h2>
                  <p className="text-xs text-[#DC2626] font-semibold flex items-center gap-1 mt-0.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#78C441]" />
                    {activeLog.diagnosisTitle}
                  </p>
                </div>

                <div
                  className={`px-3 py-2 rounded-2xl border text-center shrink-0 ${getScoreColor(
                    activeLog.recoveryScore
                  )}`}
                >
                  <p className="text-[10px] font-bold uppercase">Recovery Score</p>
                  <p className="text-2xl font-black">{activeLog.recoveryScore}%</p>
                </div>
              </div>

              {/* Recovery Progress Bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold text-[#5E6D65]">
                  <span>Symptom Halt</span>
                  <span>Tissue Regeneration</span>
                  <span>100% Healed</span>
                </div>
                <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden relative">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#F59E0B] via-[#78C441] to-[#2D6A4F] transition-all duration-500"
                    style={{ width: `${activeLog.recoveryScore}%` }}
                  />
                </div>
                <p className="text-[11px] text-[#5E6D65] italic text-right">
                  Last monitored: {activeLog.lastUpdated}
                </p>
              </div>

              {/* Audio Readout Button */}
              <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                <span className="text-xs text-slate-500 font-medium">Audio Summary</span>
                <button
                  type="button"
                  onClick={handleReadAloud}
                  className="flex items-center gap-1.5 text-xs font-bold text-[#1A3B29] bg-[#E8F5E9] hover:bg-[#C8E6C9] px-3 py-1.5 rounded-full transition-all"
                >
                  {isSpeaking ? (
                    <>
                      <VolumeX className="w-3.5 h-3.5 text-[#DC2626]" />
                      <span>Stop Listening</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-3.5 h-3.5 text-[#2D6A4F]" />
                      <span>Listen to Agronomist Note</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Interactive Before & After Visual Slider */}
            <div className="bg-white rounded-3xl p-5 border border-[#E6EBE4] shadow-xs space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-extrabold text-[#19201D] flex items-center gap-1.5">
                    <span>Before & After Leaf Comparison</span>
                    <span className="text-[10px] bg-[#D8F3DC] text-[#2D6A4F] font-bold px-2 py-0.5 rounded-full">
                      Actual Plant Foliage
                    </span>
                  </h3>
                  <p className="text-xs text-[#5E6D65]">
                    Slide to compare authentic diseased leaf (Day 0) vs recovered healthy leaf
                  </p>
                </div>

                {/* Quick Leaf Selector Chips */}
                <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl self-start sm:self-auto">
                  {logs.map((log) => {
                    const isTomato = log.cropName.toLowerCase().includes('tomato');
                    const isPepper = log.cropName.toLowerCase().includes('pepper');
                    return (
                      <button
                        key={log.id}
                        type="button"
                        onClick={() => {
                          triggerHaptic('tap');
                          setSelectedLogId(log.id);
                        }}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                          selectedLogId === log.id
                            ? 'bg-[#1A3B29] text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {isTomato ? '🍅 Tomato Leaf' : isPepper ? '🌶️ Pepper Leaf' : log.cropName}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div
                ref={sliderRef}
                className="relative h-64 sm:h-72 rounded-2xl overflow-hidden select-none border border-slate-200 bg-slate-950"
              >
                {/* "After" Image (Background: Actual Recovered Healthy Leaf) */}
                <img
                  src={activeLog.afterPhotoUrl || activeLog.beforePhotoUrl}
                  alt={`${activeLog.cropName} Recovered Leaf`}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute top-3 right-3 bg-black/75 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-lg backdrop-blur-xs z-10 flex items-center gap-1.5 shadow-md">
                  <span className="w-2 h-2 rounded-full bg-[#78C441]" />
                  <span>AFTER: RECOVERED HEALTHY LEAF</span>
                </div>

                {/* "Before" Image (Clipped Overlay: Actual Diseased Leaf) */}
                <div
                  className="absolute inset-y-0 left-0 overflow-hidden"
                  style={{ width: `${sliderPos}%` }}
                >
                  <img
                    src={activeLog.beforePhotoUrl}
                    alt={`${activeLog.cropName} Diseased Leaf`}
                    className="absolute inset-y-0 left-0 h-full object-cover max-w-none"
                    style={{ width: `${containerWidth}px` }}
                  />
                  <div className="absolute top-3 left-3 bg-[#DC2626]/90 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-lg backdrop-blur-xs z-10 flex items-center gap-1.5 shadow-md">
                    <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                    <span>BEFORE: DISEASED LEAF (DAY 0)</span>
                  </div>
                </div>

                {/* Vertical Divider Line */}
                <div
                  className="absolute top-0 bottom-0 w-1 bg-white shadow-2xl pointer-events-none z-20"
                  style={{ left: `${sliderPos}%` }}
                >
                  <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 bg-white text-[#1A3B29] rounded-full shadow-lg flex items-center justify-center text-xs font-black border-2 border-[#78C441]">
                    ↔
                  </div>
                </div>

                {/* Range Input Overlay */}
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={sliderPos}
                  onChange={(e) => setSliderPos(Number(e.target.value))}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30"
                  aria-label="Comparison slider"
                />
              </div>

              <div className="flex justify-between text-xs text-[#5E6D65] pt-1">
                <span className="font-bold text-[#DC2626]">← Slide left for Day 10 healed leaf</span>
                <span className="font-bold text-[#2D6A4F]">Slide right for Day 0 lesion leaf →</span>
              </div>
            </div>

            {/* Treatment Milestones Timeline */}
            <div className="bg-white rounded-3xl p-5 border border-[#E6EBE4] shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-extrabold text-[#19201D]">
                    Treatment Log & Milestones
                  </h3>
                  <p className="text-xs text-[#5E6D65]">Chronological biological interventions</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddEventOpen(!isAddEventOpen)}
                  className="text-xs font-bold bg-[#1A3B29] text-white hover:bg-[#2D6A4F] px-3 py-1.5 rounded-full flex items-center gap-1 shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Log Treatment</span>
                </button>
              </div>

              {/* Add Event Form Modal/Drawer */}
              {isAddEventOpen && (
                <form
                  onSubmit={handleAddTreatment}
                  className="bg-[#F8FAF9] p-4 rounded-2xl border border-[#D1E0D7] space-y-3"
                >
                  <h4 className="text-xs font-extrabold text-[#19201D]">Log New Biological Action</h4>
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">
                      Action Performed
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Applied cold-pressed neem oil (5ml/L) foliar spray"
                      value={newEventAction}
                      onChange={(e) => setNewEventAction(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#78C441]"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">
                      Agronomist Observations / Notes
                    </label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Foliage drying well, no scorch, aphids reduced by 80%"
                      value={newEventNotes}
                      onChange={(e) => setNewEventNotes(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#78C441]"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] font-bold text-slate-600 mb-1">
                      <span>Updated Recovery Score</span>
                      <span className="text-[#2D6A4F]">{newScore}%</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      value={newScore}
                      onChange={(e) => setNewScore(Number(e.target.value))}
                      className="w-full accent-[#78C441]"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsAddEventOpen(false)}
                      className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 text-xs font-bold text-white bg-[#78C441] hover:bg-[#6BB536] rounded-lg shadow-xs"
                    >
                      Save Milestone
                    </button>
                  </div>
                </form>
              )}

              {/* Timeline Items */}
              <div className="space-y-3 pt-2">
                {activeLog.treatmentTimeline.map((item, idx) => (
                  <div key={item.id} className="relative pl-6 pb-2 border-l-2 border-[#78C441]/40 last:border-transparent">
                    <div className="absolute -left-[9px] top-0.5 w-4 h-4 rounded-full bg-[#78C441] text-white flex items-center justify-center text-[9px] font-bold">
                      ✓
                    </div>

                    <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold text-[#19201D]">{item.action}</span>
                        <span className="text-[10px] text-slate-500 font-semibold">{item.date}</span>
                      </div>
                      {item.notes && (
                        <p className="text-xs text-[#5E6D65] mt-1 leading-relaxed">{item.notes}</p>
                      )}
                      {item.symptomsResolved?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {item.symptomsResolved.map((sym, sIdx) => (
                            <span
                              key={sIdx}
                              className="text-[10px] bg-[#D8F3DC] text-[#2D6A4F] font-semibold px-2 py-0.5 rounded-md"
                            >
                              ✓ {sym}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Follow-up Scan CTA */}
            {onOpenScan && (
              <button
                type="button"
                onClick={onOpenScan}
                className="w-full bg-[#1A3B29] text-white font-extrabold text-sm py-3.5 px-4 rounded-2xl shadow-sm hover:bg-[#2D6A4F] flex items-center justify-center gap-2 active:scale-98 transition-all"
              >
                <Camera className="w-4 h-4 text-[#78C441]" />
                <span>Capture Follow-Up Progress Photo</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
