// T-025: Regional Outbreak Radar & Pest Early Warning System
import React, { useState } from 'react';
import {
  ArrowLeft,
  Radar,
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
  Compass,
  MapPin,
  Radio,
  Share2,
  CheckSquare,
  Square,
  Plus,
  Info,
  Bug,
  Wind,
  Droplets,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { type OutbreakAlert } from '@verdescan/shared';
import { useTextToSpeech } from '../../lib/speech';

interface OutbreakRadarViewProps {
  onClose: () => void;
  onOpenBotanist?: () => void;
}

const DEFAULT_ALERTS: OutbreakAlert[] = [
  {
    id: 'out-1',
    pestOrDiseaseName: 'Fall Armyworm (Spodoptera frugiperda)',
    category: 'pest',
    cropTarget: 'Maize & Sweetcorn',
    riskLevel: 'critical',
    distanceKm: 6.8,
    reportedCases: 19,
    vectorConditions: 'Warm night temps (24°C) with southerly wind vectors carrying adult moths',
    preventiveChecklist: [
      'Scout whorls of maize daily for pinhole feeding and moist sawdust frass',
      'Deploy synthetic sex pheromone traps at 5 traps/hectare',
      'Apply Bacillus thuringiensis (Bt) kurstaki during early instar stage at twilight',
      'Drench whorls with botanical neem kernel water extract (5%)',
    ],
    recommendedBiocontrol:
      'Trichogramma egg parasitoids & cold-pressed neem kernel emulsion spray',
    coordinates: {
      lat: 5.6037,
      lng: -0.187,
      locationName: 'East Ridge Agro Basin',
    },
  },
  {
    id: 'out-2',
    pestOrDiseaseName: 'Tomato Late Blight (Phytophthora infestans)',
    category: 'disease',
    cropTarget: 'Tomatoes & Irish Potatoes',
    riskLevel: 'high',
    distanceKm: 14.2,
    reportedCases: 34,
    vectorConditions:
      'Continuous humidity > 85% with fog; optimal sporulation temperature 15-20°C',
    preventiveChecklist: [
      'Cease all overhead sprinkler irrigation immediately; switch to ground drip',
      'Apply preventative copper octanoate or copper hydroxide spray before rain events',
      'Strip all bottom sucker leaves touching soil to disrupt splash inoculation',
      'Increase crop spacing to ensure rapid leaf surface drying within 2 hours of dawn',
    ],
    recommendedBiocontrol:
      'Bacillus subtilis bio-fungicide + potassium bicarbonate foliar shield',
    coordinates: {
      lat: 5.64,
      lng: -0.22,
      locationName: 'Valley Bottom Farmlands',
    },
  },
  {
    id: 'out-3',
    pestOrDiseaseName: 'Silverleaf Whitefly (Bemisia tabaci)',
    category: 'pest',
    cropTarget: 'Cassava, Peppers & Tomatoes',
    riskLevel: 'moderate',
    distanceKm: 22.5,
    reportedCases: 8,
    vectorConditions: 'Dry, dusty dry season breezes promoting flight dispersal',
    preventiveChecklist: [
      'Hang yellow sticky card traps at canopy height (1 trap per 20 sq meters)',
      'Inspect undersides of young leaves for silvering and transparent scale nymphs',
      'Intercrop with fragrant aromatic basil or coriander to deter adult landing',
    ],
    recommendedBiocontrol:
      'Beauveria bassiana entomopathogenic fungus + horticultural insecticidal soap',
    coordinates: {
      lat: 5.58,
      lng: -0.15,
      locationName: 'Coastal Belt Farms',
    },
  },
];

export function OutbreakRadarView({ onClose, onOpenBotanist }: OutbreakRadarViewProps) {
  const [alerts, setAlerts] = useState<OutbreakAlert[]>(DEFAULT_ALERTS);
  const [selectedAlertId, setSelectedAlertId] = useState<string>(alerts[0].id);
  const [checkedActions, setCheckedActions] = useState<Record<string, boolean>>({});
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [newReportCrop, setNewReportCrop] = useState('');
  const [newReportPest, setNewReportPest] = useState('');
  const [reportSuccess, setReportSuccess] = useState(false);

  const { speak, stop, isSpeaking } = useTextToSpeech();

  const activeAlert = alerts.find((a) => a.id === selectedAlertId) || alerts[0];

  const toggleCheck = (idx: number) => {
    const key = `${activeAlert.id}-${idx}`;
    setCheckedActions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleReportOutbreak = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReportPest.trim() || !newReportCrop.trim()) return;

    const newAlert: OutbreakAlert = {
      id: `out-${Date.now()}`,
      pestOrDiseaseName: newReportPest.trim(),
      category: 'pest',
      cropTarget: newReportCrop.trim(),
      riskLevel: 'high',
      distanceKm: 1.2,
      reportedCases: 1,
      vectorConditions: 'Localized farmer observation flagged today',
      preventiveChecklist: [
        'Isolate symptomatic plants immediately',
        'Inspect surrounding crops within 50m radius',
        'Notify cooperative extension scout',
      ],
      recommendedBiocontrol: 'Organic biological sanitation + physical quarantine',
      coordinates: {
        lat: 5.604,
        lng: -0.188,
        locationName: 'My Local Farm Sector',
      },
    };

    setAlerts([newAlert, ...alerts]);
    setSelectedAlertId(newAlert.id);
    setNewReportPest('');
    setNewReportCrop('');
    setReportSuccess(true);
    setTimeout(() => {
      setReportSuccess(false);
      setIsReportModalOpen(false);
    }, 1500);
  };

  const getRiskBadge = (level: string) => {
    switch (level) {
      case 'critical':
        return 'bg-[#DC2626] text-white animate-pulse';
      case 'high':
        return 'bg-[#EA580C] text-white';
      case 'moderate':
        return 'bg-[#F59E0B] text-[#1A2E05]';
      default:
        return 'bg-[#78C441] text-[#122B1E]';
    }
  };

  const handleAudioAdvisory = () => {
    if (isSpeaking) {
      stop();
      return;
    }
    const text = `VerdeScan Outbreak Warning. ${activeAlert.riskLevel} risk of ${activeAlert.pestOrDiseaseName} detected ${activeAlert.distanceKm} kilometers from your location. Primary target crop: ${activeAlert.cropTarget}. Vector condition: ${activeAlert.vectorConditions}. Biocontrol recommendation: ${activeAlert.recommendedBiocontrol}.`;
    speak(text);
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Top Banner */}
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
            <span className="text-xs bg-[#DC2626] text-white px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1 shadow-xs">
              <Radio className="w-3.5 h-3.5 animate-ping" />
              Live Radar
            </span>
          </div>
        </div>
        <h1 className="text-xl font-extrabold tracking-tight">Regional Outbreak Radar</h1>
        <p className="text-xs text-white/75 mt-0.5">
          Early pest & pathogen biosurveillance alerts within your 30km farming corridor
        </p>
      </div>

      <div className="px-4 space-y-4">
        {/* Radar Graphic & Map Visualizer */}
        <div className="bg-[#101D16] text-white rounded-3xl p-5 border border-[#1A3B29] shadow-md relative overflow-hidden">
          {/* Animated Radar Rings */}
          <div className="flex items-center justify-center py-4 relative">
            <div className="w-44 h-44 rounded-full border border-green-500/20 relative flex items-center justify-center">
              <div className="w-32 h-32 rounded-full border border-green-500/30 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full border border-green-500/40 flex items-center justify-center">
                  {/* Center Farm Dot */}
                  <div className="w-3.5 h-3.5 bg-[#78C441] rounded-full shadow-lg shadow-green-400/50 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-white rounded-full" />
                  </div>
                </div>
              </div>

              {/* Radar Sweep Effect */}
              <div
                className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-green-500/10 to-transparent pointer-events-none animate-spin"
                style={{ animationDuration: '6s' }}
              />

              {/* Ping Marker 1 */}
              <div
                onClick={() => setSelectedAlertId('out-1')}
                className="absolute top-6 right-8 cursor-pointer group"
              >
                <div className="w-3.5 h-3.5 bg-red-500 rounded-full animate-ping absolute inset-0 opacity-75" />
                <div className="w-3.5 h-3.5 bg-red-500 rounded-full border-2 border-white relative shadow-sm" />
                <span className="text-[9px] bg-black/80 px-1 py-0.2 rounded text-red-300 absolute -bottom-4 -left-4 whitespace-nowrap hidden group-hover:block">
                  6.8 km
                </span>
              </div>

              {/* Ping Marker 2 */}
              <div
                onClick={() => setSelectedAlertId('out-2')}
                className="absolute bottom-7 left-10 cursor-pointer group"
              >
                <div className="w-3.5 h-3.5 bg-orange-500 rounded-full border-2 border-white relative shadow-sm" />
                <span className="text-[9px] bg-black/80 px-1 py-0.2 rounded text-orange-300 absolute -bottom-4 -left-4 whitespace-nowrap hidden group-hover:block">
                  14.2 km
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs">
            <div className="flex items-center gap-1.5 text-slate-300">
              <MapPin className="w-3.5 h-3.5 text-[#78C441]" />
              <span>Scanning 30 km farm radius</span>
            </div>
            <button
              type="button"
              onClick={() => setIsReportModalOpen(true)}
              className="text-[11px] font-bold text-[#78C441] hover:underline flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Report Local Outbreak</span>
            </button>
          </div>
        </div>

        {/* Report Modal */}
        {isReportModalOpen && (
          <div className="bg-white rounded-3xl p-5 border-2 border-[#78C441] shadow-lg space-y-3">
            <h3 className="text-sm font-extrabold text-[#19201D] flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[#EA580C]" />
              Crowdsource Outbreak Alert
            </h3>
            <p className="text-xs text-[#5E6D65]">
              Alert neighboring growers in your area of newly detected pest or disease pressures.
            </p>

            <form onSubmit={handleReportOutbreak} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  Pest or Disease Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Stem Borer or Spider Mites"
                  value={newReportPest}
                  onChange={(e) => setNewReportPest(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#78C441]"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  Crops Affected
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Okra, Peppers, Eggplant"
                  value={newReportCrop}
                  onChange={(e) => setNewReportCrop(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#78C441]"
                />
              </div>

              {reportSuccess && (
                <div className="p-2 bg-green-100 text-[#2D6A4F] text-xs font-bold rounded-lg text-center">
                  ✓ Outbreak logged & distributed to regional mesh!
                </div>
              )}

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsReportModalOpen(false)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold text-white bg-[#DC2626] hover:bg-red-700 rounded-lg shadow-xs"
                >
                  Broadcast Alert
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Alert Cards Horizontal Selector */}
        <div className="space-y-2">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Active Regional Threats ({alerts.length})
          </p>
          <div className="grid grid-cols-1 gap-2.5">
            {alerts.map((alert) => (
              <button
                key={alert.id}
                type="button"
                onClick={() => setSelectedAlertId(alert.id)}
                className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                  selectedAlertId === alert.id
                    ? 'bg-white border-[#1A3B29] shadow-sm ring-2 ring-[#78C441]/50'
                    : 'bg-white border-[#E6EBE4] hover:bg-slate-50'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${getRiskBadge(
                        alert.riskLevel
                      )}`}
                    >
                      {alert.riskLevel}
                    </span>
                    <span className="text-xs font-extrabold text-[#19201D]">
                      {alert.distanceKm} km away
                    </span>
                  </div>
                  <h4 className="text-sm font-extrabold text-[#19201D] leading-tight">
                    {alert.pestOrDiseaseName}
                  </h4>
                  <p className="text-xs text-[#5E6D65]">Target: {alert.cropTarget}</p>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs font-bold text-[#2D6A4F] bg-[#D8F3DC] px-2.5 py-1 rounded-xl">
                    {alert.reportedCases} farms
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Selected Alert Detailed Tactical Briefing */}
        {activeAlert && (
          <div className="bg-white rounded-3xl p-5 border border-[#E6EBE4] shadow-xs space-y-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase">
                  Agronomic Defense Plan
                </span>
                <h3 className="text-base font-extrabold text-[#19201D]">
                  {activeAlert.pestOrDiseaseName}
                </h3>
                <p className="text-xs text-[#5E6D65] mt-0.5">
                  Sector: {activeAlert.coordinates.locationName}
                </p>
              </div>

              {/* Audio Listen Button */}
              <button
                type="button"
                onClick={handleAudioAdvisory}
                className="flex items-center gap-1 text-xs font-bold text-[#1A3B29] bg-[#E8F5E9] hover:bg-[#C8E6C9] px-2.5 py-1 rounded-full transition-all shrink-0"
              >
                {isSpeaking ? (
                  <>
                    <VolumeX className="w-3.5 h-3.5 text-[#DC2626]" />
                    <span>Stop</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-3.5 h-3.5 text-[#2D6A4F]" />
                    <span>Listen</span>
                  </>
                )}
              </button>
            </div>

            {/* Environmental Vector Conditions */}
            <div className="bg-[#FFFBEB] p-3 rounded-2xl border border-[#FDE68A] flex items-start gap-2.5 text-xs text-[#92400E]">
              <Wind className="w-4 h-4 shrink-0 text-[#D97706] mt-0.5" />
              <div>
                <span className="font-extrabold">Spread Vector: </span>
                <span>{activeAlert.vectorConditions}</span>
              </div>
            </div>

            {/* Biocontrol Recommendation */}
            <div className="bg-[#F0FDF4] p-3 rounded-2xl border border-[#BBF7D0] flex items-start gap-2.5 text-xs text-[#166534]">
              <ShieldCheck className="w-4 h-4 shrink-0 text-[#16A34A] mt-0.5" />
              <div>
                <span className="font-extrabold">Organic Biocontrol: </span>
                <span>{activeAlert.recommendedBiocontrol}</span>
              </div>
            </div>

            {/* Interactive Preventive Action Checklist */}
            <div className="space-y-2">
              <h4 className="text-xs font-extrabold text-[#19201D] uppercase tracking-wide">
                Preventive Farm Actions Checklist
              </h4>
              <div className="space-y-2">
                {activeAlert.preventiveChecklist.map((item, idx) => {
                  const isDone = !!checkedActions[`${activeAlert.id}-${idx}`];
                  return (
                    <div
                      key={idx}
                      onClick={() => toggleCheck(idx)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-2.5 ${
                        isDone
                          ? 'bg-[#F0FDF4] border-[#86EFAC] text-[#166534]'
                          : 'bg-slate-50 border-slate-200 text-[#334155] hover:bg-slate-100'
                      }`}
                    >
                      <button type="button" className="shrink-0 mt-0.5">
                        {isDone ? (
                          <CheckSquare className="w-4 h-4 text-[#16A34A]" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-400" />
                        )}
                      </button>
                      <span className={`text-xs ${isDone ? 'line-through text-slate-500' : ''}`}>
                        {item}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* AI Botanist Consultation */}
            {onOpenBotanist && (
              <button
                type="button"
                onClick={onOpenBotanist}
                className="w-full bg-[#1A3B29] text-white font-bold text-xs py-3 px-4 rounded-2xl hover:bg-[#2D6A4F] flex items-center justify-center gap-2 active:scale-98 transition-all"
              >
                <span>Ask AI Botanist for Custom Defense Protocol</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
