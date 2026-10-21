// T-009 / T-017: Camera Capture Wizard with "Image 2" Prominent AI Scan & Verdant Earth Palette
import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Camera,
  Upload,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  Sparkles,
  Info,
  Layers,
  ArrowRight,
  SunMedium,
  Loader2,
  Volume2,
  VolumeX,
  ShieldCheck,
  HelpCircle,
  BookOpen,
  Clock,
} from 'lucide-react';
import { processImageFile, type DiagnosisCaptureImage } from '../../lib/image';
import { queueRunner } from '../../lib/queue';
import { KB_CROPS } from '@verdescan/kb';
import { useTranslations } from '../../lib/i18n';
import type { PlantPart, Locale, SubmitDiagnosisRes } from '@verdescan/shared';

export interface CameraWizardProps {
  locale: Locale;
  isOnline: boolean;
  onDiagnosisComplete: (result: SubmitDiagnosisRes, thumbnail?: string) => void;
  onNavigateTab?: (tab: 'garden' | 'guides') => void;
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

export function CameraWizard({
  locale,
  isOnline,
  onDiagnosisComplete,
  onNavigateTab,
}: CameraWizardProps) {
  const tHome = useTranslations('home');
  const tCamera = useTranslations('diagnose.camera');
  const tCommon = useTranslations('common');

  const [images, setImages] = useState<DiagnosisCaptureImage[]>([]);
  const [isCapturingLive, setIsCapturingLive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [selectedCrop, setSelectedCrop] = useState<string>('tomato');
  const [symptomsText, setSymptomsText] = useState('');
  const [daysSince, setDaysSince] = useState<number>(3);
  const [weather, setWeather] = useState<'dry' | 'wet' | 'hot' | 'cold' | 'mixed'>('wet');
  const [watering, setWatering] = useState<'daily' | 'weekly' | 'rare'>('daily');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [queuedNotification, setQueuedNotification] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isReadingAloud, setIsReadingAloud] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Audio instructions helper for low-literacy users
  const playVoiceInstructions = () => {
    if (!('speechSynthesis' in window)) return;
    if (isReadingAloud) {
      window.speechSynthesis.cancel();
      setIsReadingAloud(false);
      return;
    }

    const text = `VerdeScan Plant Health Guide. Select your crop, then tap the green button to take clear photos of the leaf and the whole plant in daylight. Your location is kept private.`;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = locale;
    utterance.onend = () => setIsReadingAloud(false);
    utterance.onerror = () => setIsReadingAloud(false);
    window.speechSynthesis.speak(utterance);
    setIsReadingAloud(true);
  };

  // Start live camera
  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setIsCapturingLive(true);
    } catch {
      setCameraError('Camera access unavailable. Please tap "Choose Photo" to upload an image.');
      setIsCapturingLive(false);
    }
  };

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCapturingLive(false);
  }, []);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  // Capture frame from live video
  const captureFrame = async () => {
    if (!videoRef.current) return;
    if (images.length >= 4) {
      setActionError('Maximum of 4 photos reached.');
      return;
    }

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(async (blob) => {
      if (!blob) return;
      await handleBlobInput(blob, images.length === 0 ? 'leaf' : 'whole');
    }, 'image/jpeg', 0.85);
  };

  // Process any File or Blob through EXIF stripper and quality analyzer
  const handleBlobInput = async (blob: Blob | File, defaultPart: PlantPart = 'leaf') => {
    if (images.length >= 4) return;
    try {
      const processed = await processImageFile(blob);
      const previewUrl = URL.createObjectURL(processed.blob);

      const newImage: DiagnosisCaptureImage = {
        id: `img-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        blob: processed.blob,
        previewUrl,
        base64: processed.base64,
        part: defaultPart,
        width: processed.width,
        height: processed.height,
        quality: processed.quality,
      };

      setImages((prev) => [...prev, newImage]);
      setActionError(null);
    } catch {
      setActionError('Could not process photo. Please choose another image.');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const remainingSlots = 4 - images.length;
    const toProcess = Array.from(files).slice(0, remainingSlots);

    toProcess.forEach((file, idx) => {
      handleBlobInput(file, idx === 0 && images.length === 0 ? 'leaf' : 'whole');
    });
    e.target.value = '';
  };

  const removeImage = (id: string) => {
    setImages((prev) => {
      const item = prev.find((img) => img.id === id);
      if (item) URL.revokeObjectURL(item.previewUrl);
      return prev.filter((img) => img.id !== id);
    });
  };

  const updatePart = (id: string, part: PlantPart) => {
    setImages((prev) => prev.map((img) => (img.id === id ? { ...img, part } : img)));
  };

  // Submit diagnosis request
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (images.length === 0) {
      setActionError('Please take or upload at least one plant photo.');
      return;
    }

    setIsSubmitting(true);
    setQueuedNotification(null);
    setActionError(null);

    const clientRequestId = crypto.randomUUID();
    const context = {
      cropId: selectedCrop,
      symptomsText: symptomsText.trim(),
      daysSinceSymptoms: daysSince,
      recentWeather: weather,
      wateringFrequency: watering,
    };

    try {
      if (!isOnline) {
        // Enqueue offline in Dexie table
        await queueRunner.enqueue({
          id: clientRequestId,
          images: images.map((img) => ({
            part: img.part,
            blob: img.blob,
            widthPx: img.width,
            heightPx: img.height,
          })),
          context,
          locale: 'en',
        });
        setQueuedNotification('Diagnosis saved offline in Dexie queue. It will automatically process when signal returns!');
        setIsSubmitting(false);
      } else {
        // Execute pipeline
        const pipelinePayload = images.map((img) => ({
          part: img.part,
          base64: img.base64,
          mimeType: 'image/jpeg',
        }));

        const { diagnosisPipeline } = await import('../../../functions/src/diagnose/pipeline');
        const res = await diagnosisPipeline.runPipeline({
          diagnosisId: `diag-${clientRequestId.slice(0, 8)}`,
          images: pipelinePayload,
          context,
          locale: 'en',
          useAiMock: false,
        });

        setIsSubmitting(false);
        onDiagnosisComplete(res, images[0]?.previewUrl);
      }
    } catch (err: unknown) {
      setIsSubmitting(false);
      setActionError(err instanceof Error ? err.message : 'Diagnosis submission failed. Try again.');
    }
  };

  const sampleScenarios = [
    {
      title: 'Tomato Early Blight',
      crop: 'tomato',
      symptoms: 'Brown concentric spots on lower leaves with yellow halos',
      desc: 'Target-board leaf spot',
    },
    {
      title: 'Cassava Mosaic Disease',
      crop: 'cassava',
      symptoms: 'Yellow-green mosaic mottling with curled deformed leaves',
      desc: 'Severe viral distortion',
    },
    {
      title: 'Maize Armyworm',
      crop: 'maize',
      symptoms: 'Ragged chewed leaf holes with sawdust frass inside whorls',
      desc: 'Caterpillar whorl damage',
    },
    {
      title: 'Pepper Aphids',
      crop: 'pepper',
      symptoms: 'Dense soft bugs under leaves with sticky honeydew and black sooty mold',
      desc: 'Sap-sucking vector colonies',
    },
  ];

  const loadSample = (s: typeof sampleScenarios[0]) => {
    setSelectedCrop(s.crop);
    setSymptomsText(s.symptoms);
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = s.crop === 'maize' ? '#ca8a04' : '#2D6A4F';
      ctx.fillRect(0, 0, 640, 480);
      ctx.fillStyle = '#D8F3DC';
      ctx.beginPath();
      ctx.arc(320, 240, 110, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#1B1B1B';
      ctx.font = 'bold 24px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${s.title}`, 320, 235);
      ctx.font = '16px sans-serif';
      ctx.fillText('Field Symptom Sample', 320, 265);
      canvas.toBlob((blob) => {
        if (blob) handleBlobInput(blob, 'leaf');
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* HERO SECTION: Image 2 Modified for VerdeScan Smallholder Field Context */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#2D6A4F] via-[#40916C] to-[#E09F3E] text-white p-6 sm:p-8 shadow-md">
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 bg-black/20 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-semibold text-[#D8F3DC]">
            <Sparkles className="w-3.5 h-3.5 text-[#E09F3E]" />
            <span>{tHome('scanCardTitle')}</span>
          </div>

          {/* Hero Section: "What is affecting your crops today?" */}
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight">
            {tHome('heroTitle')}
          </h1>

          <p className="text-sm text-[#D8F3DC] max-w-xl leading-relaxed">
            {tHome('heroSub')}
          </p>

          {/* AI Scan Card Action: Large, 44px+ height, Primary Green */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={startCamera}
              className="touch-target bg-white hover:bg-[#FAFAF5] text-[#2D6A4F] font-bold text-sm px-6 py-3.5 rounded-2xl shadow-md transition-all active:scale-95 flex items-center gap-2.5"
            >
              <Camera className="w-5 h-5 text-[#2D6A4F]" />
              <span>{tHome('startScan')}</span>
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="touch-target bg-black/25 hover:bg-black/35 text-white font-bold text-sm px-4 py-3 rounded-2xl backdrop-blur-xs transition-all flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              <span>{tHome('uploadPhoto')}</span>
            </button>

            <button
              type="button"
              onClick={playVoiceInstructions}
              className={`touch-target p-3 rounded-2xl backdrop-blur-xs transition-all flex items-center justify-center ${
                isReadingAloud ? 'bg-[#E09F3E] text-white animate-pulse' : 'bg-black/20 text-white hover:bg-black/30'
              }`}
              title="Listen to instructions"
              aria-label="Listen to instructions"
            >
              {isReadingAloud ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
      </section>

      {/* QUICK ACTIONS: Agricultural shortcuts (Guides, My Garden, History) */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          type="button"
          onClick={() => onNavigateTab?.('guides')}
          className="touch-target bg-white hover:bg-[#FAFAF5] p-3.5 rounded-2xl border border-[#E5E5DC] flex items-center gap-3 text-start shadow-2xs transition-all"
        >
          <div className="w-10 h-10 rounded-xl bg-[#D8F3DC] text-[#2D6A4F] flex items-center justify-center shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-[#1B1B1B] leading-tight">📖 {tHome('guidesAction')}</p>
            <p className="text-[11px] text-[#5A6B5E]">Remedies & Builds</p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => onNavigateTab?.('garden')}
          className="touch-target bg-white hover:bg-[#FAFAF5] p-3.5 rounded-2xl border border-[#E5E5DC] flex items-center gap-3 text-start shadow-2xs transition-all"
        >
          <div className="w-10 h-10 rounded-xl bg-[#D8F3DC] text-[#2D6A4F] flex items-center justify-center shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-[#1B1B1B] leading-tight">🌱 {tHome('gardenAction')}</p>
            <p className="text-[11px] text-[#5A6B5E]">Crop Plots & Notes</p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => onNavigateTab?.('garden')}
          className="touch-target bg-white hover:bg-[#FAFAF5] p-3.5 rounded-2xl border border-[#E5E5DC] flex items-center gap-3 text-start shadow-2xs transition-all"
        >
          <div className="w-10 h-10 rounded-xl bg-[#FEF3C7] text-[#92400E] flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5 text-[#E09F3E]" />
          </div>
          <div>
            <p className="text-xs font-bold text-[#1B1B1B] leading-tight">📊 {tHome('historyAction')}</p>
            <p className="text-[11px] text-[#5A6B5E]">Offline Diagnostics</p>
          </div>
        </button>
      </section>

      {/* QUICK CROP SELECTOR CHIPS: High contrast for outdoor sunlight */}
      <section className="bg-white rounded-2xl border border-[#E5E5DC] p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-[#5A6B5E] flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-[#2D6A4F]" /> Select Crop Being Inspected
          </label>
          <span className="text-xs text-[#5A6B5E] font-medium">8 Priority West African Crops</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2">
          {KB_CROPS.map((c) => {
            const isSelected = selectedCrop === c.id;
            const icon = CROP_ICONS[c.id] || '🌱';
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelectedCrop(c.id)}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all min-h-[56px] ${
                  isSelected
                    ? 'bg-[#D8F3DC] border-[#2D6A4F] text-[#2D6A4F] shadow-xs ring-2 ring-[#2D6A4F]/20'
                    : 'bg-[#FAFAF5] border-[#E5E5DC] text-[#1B1B1B] hover:bg-[#F2F2EC]'
                }`}
              >
                <span className="text-2xl mb-1">{icon}</span>
                <span className="text-xs font-bold leading-tight">{c.name.en}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* MAIN CAPTURE & CONTEXT WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Live Viewfinder or Upload Tray */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-2xl border border-[#E5E5DC] p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Camera className="w-5 h-5 text-[#2D6A4F]" />
                <h2 className="font-bold text-sm text-[#1B1B1B]">Field Photos ({images.length} / 4)</h2>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-[#5A6B5E] font-medium">
                <ShieldCheck className="w-4 h-4 text-[#2D6A4F]" />
                <span>EXIF GPS Removed</span>
              </div>
            </div>

            {/* Live Camera Viewfinder or Placeholder Container */}
            <div className="relative aspect-4/3 w-full bg-[#1A1A1A] rounded-2xl overflow-hidden flex items-center justify-center border border-[#E5E5DC]">
              {isCapturingLive ? (
                <>
                  <video
                    ref={videoRef}
                    playsInline
                    autoPlay
                    muted
                    className="w-full h-full object-cover"
                  />
                  {/* Visual Framing Guides for Farmers */}
                  <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-between p-5 z-10">
                    <span className="bg-black/75 backdrop-blur-md text-[#D8F3DC] text-xs px-3.5 py-1.5 rounded-full font-bold shadow-md border border-[#52B788]/40">
                      {images.length === 0 ? tCamera('leafFocus') : tCamera('wholePlant')}
                    </span>

                    {/* Framing target box with corner accents */}
                    <div className="relative w-56 h-56 border-2 border-dashed border-[#52B788] rounded-2xl shadow-xl flex items-center justify-center">
                      <div className="w-4 h-4 border-t-2 border-l-2 border-white absolute top-0 left-0"></div>
                      <div className="w-4 h-4 border-t-2 border-r-2 border-white absolute top-0 right-0"></div>
                      <div className="w-4 h-4 border-b-2 border-l-2 border-white absolute bottom-0 left-0"></div>
                      <div className="w-4 h-4 border-b-2 border-r-2 border-white absolute bottom-0 right-0"></div>
                    </div>

                    <div className="flex items-center gap-2 bg-black/75 backdrop-blur-md text-[#D8F3DC] text-xs px-3.5 py-1.5 rounded-full font-semibold shadow-md border border-white/10">
                      <SunMedium className="w-4 h-4 text-[#E09F3E]" /> {tCamera('daylight')}
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center p-6 space-y-4">
                  <div className="w-20 h-20 rounded-full bg-[#252525] border-2 border-[#52B788]/30 flex items-center justify-center mx-auto text-[#52B788] shadow-inner">
                    <Camera className="w-10 h-10" />
                  </div>
                  <div>
                    <p className="text-base font-bold text-white">Camera Viewfinder Ready</p>
                    <p className="text-xs text-[#A3B18A] max-w-xs mx-auto mt-1">
                      Tap below to take a live photo or select an existing photo from your phone gallery.
                    </p>
                  </div>
                  <div className="flex items-center justify-center gap-3 pt-1">
                    <button
                      type="button"
                      onClick={startCamera}
                      className="bg-[#2D6A4F] hover:bg-[#1B4332] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-xs flex items-center gap-2 min-h-[48px]"
                    >
                      <Camera className="w-4 h-4" /> Start Camera
                    </button>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-[#252525] hover:bg-[#383838] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 min-h-[48px]"
                    >
                      <Upload className="w-4 h-4" /> Choose File
                    </button>
                  </div>
                  {cameraError && (
                    <p className="text-xs text-[#E09F3E] mt-2 flex items-center justify-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" /> {cameraError}
                    </p>
                  )}
                </div>
              )}

              {/* Shutter Button when camera is live */}
              {isCapturingLive && (
                <div className="absolute bottom-5 left-0 right-0 flex items-center justify-center gap-6 z-10">
                  <button
                    type="button"
                    onClick={captureFrame}
                    className="w-18 h-18 rounded-full bg-white border-4 border-[#2D6A4F] shadow-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
                    title="Capture Field Photo"
                  >
                    <div className="w-14 h-14 rounded-full bg-[#2D6A4F]"></div>
                  </button>
                  <button
                    type="button"
                    onClick={stopCamera}
                    className="bg-black/70 text-white text-xs font-bold px-3 py-2 rounded-xl hover:bg-black/90 min-h-[44px]"
                  >
                    Done
                  </button>
                </div>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/webp,image/png"
              multiple
              onChange={handleFileUpload}
              className="hidden"
            />

            {/* Captured Photos Tray with Part Selector & Quality Indicators */}
            {images.length > 0 && (
              <div className="space-y-3 pt-2">
                <span className="text-xs font-bold text-[#1B1B1B]">Attached Photos & Plant Parts:</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {images.map((img, index) => (
                    <div
                      key={img.id}
                      className="bg-[#FAFAF5] rounded-xl border border-[#E5E5DC] p-2 space-y-2 relative group"
                    >
                      <div className="relative aspect-square rounded-lg overflow-hidden bg-stone-100">
                        <img
                          src={img.previewUrl}
                          alt={`Scan ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(img.id)}
                          className="absolute top-1 right-1 bg-black/80 hover:bg-[#BC4749] text-white w-8 h-8 rounded-lg flex items-center justify-center transition-colors shadow-sm"
                          title="Delete photo"
                          aria-label="Delete photo"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <span className="absolute bottom-1 left-1 bg-black/75 text-white text-[10px] font-mono px-1.5 py-0.5 rounded">
                          {img.width}x{img.height}
                        </span>
                      </div>

                      {/* Part Selector */}
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-[#5A6B5E]">Part:</label>
                        <select
                          value={img.part}
                          onChange={(e) => updatePart(img.id, e.target.value as PlantPart)}
                          className="w-full text-xs font-bold bg-white border border-[#E5E5DC] rounded-xl px-2 py-2 min-h-[44px] focus:ring-2 focus:ring-[#2D6A4F] focus:outline-none"
                        >
                          <option value="leaf">🍃 Leaf</option>
                          <option value="stem">🎋 Stem</option>
                          <option value="fruit">🍅 Fruit</option>
                          <option value="flower">🌸 Flower</option>
                          <option value="root">🥔 Root</option>
                          <option value="whole">🌿 Whole Plant</option>
                        </select>
                      </div>

                      {/* Quality Feedback Indicator (Non-blocking amber banner) */}
                      {img.quality.warnings.length > 0 ? (
                        <button
                          type="button"
                          onClick={() => {
                            removeImage(img.id);
                            startCamera();
                          }}
                          className="w-full text-left text-[10px] text-[#92400E] bg-[#FEF3C7] hover:bg-[#FDE68A] border border-[#FDE68A] rounded-lg p-1.5 flex items-start gap-1 font-bold transition-colors cursor-pointer"
                          title="Tap to remove and retake this photo"
                        >
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-[#E09F3E]" />
                          <span className="leading-tight">{img.quality.warnings[0]}</span>
                        </button>
                      ) : (
                        <div className="text-[10px] text-[#2D6A4F] bg-[#D8F3DC] border border-[#B7E4C7] rounded-lg p-1.5 flex items-center gap-1 font-bold">
                          <CheckCircle2 className="w-3 h-3 text-[#2D6A4F] shrink-0" />
                          <span>{tCamera('sharpPhoto')}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Quick Benchmark Presets for Field Demos */}
          <div className="bg-white rounded-2xl border border-[#E5E5DC] p-4 shadow-xs space-y-2">
            <span className="text-xs font-bold text-[#5A6B5E] flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#2D6A4F]" /> Or Test with Real Field Case Studies:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {sampleScenarios.map((s) => (
                <button
                  key={s.title}
                  type="button"
                  onClick={() => loadSample(s)}
                  className="p-2.5 text-left rounded-xl bg-[#FAFAF5] border border-[#E5E5DC] hover:border-[#2D6A4F] transition-all"
                >
                  <p className="text-xs font-bold text-[#2D6A4F] truncate">{s.title}</p>
                  <p className="text-[10px] text-[#5A6B5E] truncate">{s.desc}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Agronomic Context Form */}
        <div className="lg:col-span-5 space-y-4">
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl border border-[#E5E5DC] p-5 shadow-xs space-y-4"
          >
            <div className="flex items-center space-x-2 border-b border-[#E5E5DC] pb-3">
              <Info className="w-5 h-5 text-[#2D6A4F]" />
              <h2 className="font-bold text-sm text-[#1B1B1B]">Field Conditions & Symptoms</h2>
            </div>

            {/* Symptoms Observation Field */}
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-[#1B1B1B]">Describe What You See</label>
                <span className="text-[10px] text-[#5A6B5E] font-mono">
                  {symptomsText.length}/500
                </span>
              </div>
              <textarea
                value={symptomsText}
                onChange={(e) => setSymptomsText(e.target.value.slice(0, 500))}
                rows={3}
                placeholder="e.g. Dark spots with rings, yellow leaves, small crawling insects under leaves..."
                className="w-full text-xs font-medium bg-[#FAFAF5] border border-[#E5E5DC] rounded-xl p-3 focus:ring-2 focus:ring-[#2D6A4F] focus:outline-none"
              />
            </div>

            {/* Quick Context Grid */}
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#5A6B5E]">Days of Signs</label>
                <input
                  type="number"
                  min={1}
                  max={60}
                  value={daysSince}
                  onChange={(e) => setDaysSince(Number(e.target.value))}
                  className="w-full text-xs font-bold bg-[#FAFAF5] border border-[#E5E5DC] rounded-xl px-2.5 py-2"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#5A6B5E]">Weather</label>
                <select
                  value={weather}
                  onChange={(e) => setWeather(e.target.value as typeof weather)}
                  className="w-full text-xs font-bold bg-[#FAFAF5] border border-[#E5E5DC] rounded-xl px-2 py-2"
                >
                  <option value="wet">🌧️ Wet / Rain</option>
                  <option value="dry">☀️ Dry</option>
                  <option value="hot">🔥 Hot</option>
                  <option value="cold">❄️ Cool</option>
                  <option value="mixed">⛅ Mixed</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#5A6B5E]">Watering</label>
                <select
                  value={watering}
                  onChange={(e) => setWatering(e.target.value as typeof watering)}
                  className="w-full text-xs font-bold bg-[#FAFAF5] border border-[#E5E5DC] rounded-xl px-2 py-2"
                >
                  <option value="daily">💧 Daily</option>
                  <option value="weekly">💧 Weekly</option>
                  <option value="rare">🌧️ Rain Only</option>
                </select>
              </div>
            </div>

            {/* User Action Error Alert Banner */}
            {actionError && (
              <div className="p-3 bg-[#FEE2E2] border border-[#FCA5A5] rounded-xl text-xs text-[#BC4749] flex items-center justify-between gap-2">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-[#BC4749] shrink-0 mt-0.5" />
                  <span className="font-semibold">{actionError}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setActionError(null)}
                  className="text-stone-400 hover:text-stone-700 text-xs font-bold px-1"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Offline Notification if Queued */}
            {queuedNotification && (
              <div className="p-3 bg-[#FEF3C7] border border-[#FDE68A] rounded-xl text-xs text-[#92400E] flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-[#E09F3E] shrink-0 mt-0.5" />
                <span>{queuedNotification}</span>
              </div>
            )}

            {/* Big Tactile Submit Action Button */}
            <button
              type="submit"
              disabled={isSubmitting || images.length === 0}
              className={`w-full py-4 rounded-2xl text-sm font-extrabold text-white transition-all shadow-md flex items-center justify-center gap-2 min-h-[52px] ${
                isSubmitting || images.length === 0
                  ? 'bg-stone-300 text-stone-500 cursor-not-allowed'
                  : 'bg-[#2D6A4F] hover:bg-[#1B4332] active:scale-[0.98]'
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Analyzing with 2-Stage Agronomy AI...</span>
                </>
              ) : (
                <>
                  <span>
                    {isOnline ? 'Diagnose Plant Health Now' : 'Queue Scan (Offline Mode)'}
                  </span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
