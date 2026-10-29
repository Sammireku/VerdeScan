// Camera Capture Wizard matching Screen_Shot_2026-10-26_at_7.36.14_PM_8a89c157.png
// Displays identified plant & disease in the floating frosted container,
// with the '+' button opening a dropdown field for users to enter additional information/notes.
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  Camera,
  Upload,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  ArrowRight,
  SunMedium,
  Loader2,
  Volume2,
  VolumeX,
  ShieldCheck,
  Plus,
  X,
  ArrowLeft,
  FileText,
  MessageSquare,
  Check,
  Sparkles,
  RefreshCw,
  Mic,
  MicOff,
} from 'lucide-react';
import { processImageFile, type DiagnosisCaptureImage } from '../../lib/image';
import { queueRunner } from '../../lib/queue';
import { useTranslations } from '../../lib/i18n';
import { useVoiceDictation } from '../../lib/speech';
import type { PlantPart, Locale, SubmitDiagnosisRes } from '@verdescan/shared';
import {
  getAvailableInspectionCrops,
  saveCustomCrop,
  subscribeGarden,
  type AvailableCrop,
} from '../../lib/garden';
import { triggerHaptic } from '../../lib/haptics';

export interface CameraWizardProps {
  locale: Locale;
  isOnline: boolean;
  onDiagnosisComplete: (result: SubmitDiagnosisRes, thumbnail?: string) => void;
  onNavigateTab?: (tab: 'garden' | 'guides') => void;
  onClose?: () => void;
}

export function CameraWizard({
  locale,
  isOnline,
  onDiagnosisComplete,
  onNavigateTab,
  onClose,
}: CameraWizardProps) {
  const tHome = useTranslations('home');
  const tCamera = useTranslations('diagnose.camera');

  const [images, setImages] = useState<DiagnosisCaptureImage[]>([]);
  const [isCapturingLive, setIsCapturingLive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Crops available for inspection
  const [availableCrops, setAvailableCrops] = useState<AvailableCrop[]>([]);
  const [selectedCrop, setSelectedCrop] = useState<string>('monstera');
  const [showAddCustomCrop, setShowAddCustomCrop] = useState(false);
  const [newCropInput, setNewCropInput] = useState('');

  // Dropdown for '+' button to enter additional picture information & what they see
  const [showObservationsDropdown, setShowObservationsDropdown] = useState(false);

  // Agronomic context & Quick Notes
  const [quickNotes, setQuickNotes] = useState('');
  const [symptomsText, setSymptomsText] = useState('');
  const [daysSince, setDaysSince] = useState<number>(3);
  const [weather, setWeather] = useState<'dry' | 'wet' | 'hot' | 'cold' | 'mixed'>('wet');
  const [watering, setWatering] = useState<'daily' | 'weekly' | 'rare'>('daily');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [queuedNotification, setQueuedNotification] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isReadingAloud, setIsReadingAloud] = useState(false);

  // Hands-free Voice Dictation for Field Notes
  const {
    isListening: isNotesDictating,
    startListening: startNotesDictation,
    stopListening: stopNotesDictation,
    isSupported: isDictationSupported,
  } = useVoiceDictation((txt) => {
    setQuickNotes((prev) => {
      const combined = prev ? `${prev} ${txt}` : txt;
      return combined.slice(0, 300);
    });
  });

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Load and subscribe to crops from garden / custom store
  const refreshCrops = useCallback(async () => {
    const list = await getAvailableInspectionCrops();
    const hasMonstera = list.some((c) => c.id === 'monstera');
    if (!hasMonstera) {
      list.unshift({
        id: 'monstera',
        name: 'Monstera',
        icon: '🪴',
        isCustom: true,
      });
    }
    setAvailableCrops(list);
    setSelectedCrop('monstera');
  }, []);

  useEffect(() => {
    refreshCrops();
    const unsubscribe = subscribeGarden(() => {
      refreshCrops();
    });
    return unsubscribe;
  }, [refreshCrops]);

  // Audio instructions helper
  const playVoiceInstructions = () => {
    if (!('speechSynthesis' in window)) return;
    if (isReadingAloud) {
      window.speechSynthesis.cancel();
      setIsReadingAloud(false);
      return;
    }

    const text =
      locale === 'nl'
        ? `VerdeScan Plantgezondheid Gids. Plaats het blad binnen het richtkruis. Tik op de plus knop om notities of symptomen toe te voegen.`
        : `VerdeScan Plant Health Guide. Align the plant leaf inside the viewfinder reticle. Tap the plus button to enter notes and what you see.`;
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
      setCameraError('Camera access unavailable. You can upload photos using the button below.');
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
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  // Capture frame from live video
  const captureFrame = async () => {
    if (!videoRef.current) return;
    if (images.length >= 4) {
      triggerHaptic('warning');
      setActionError('Maximum of 4 photos reached.');
      return;
    }

    triggerHaptic('shutter');
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
      triggerHaptic('tap');
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
    triggerHaptic('tap');
    setImages((prev) => {
      const item = prev.find((img) => img.id === id);
      if (item) URL.revokeObjectURL(item.previewUrl);
      return prev.filter((img) => img.id !== id);
    });
  };

  const updatePart = (id: string, part: PlantPart) => {
    setImages((prev) => prev.map((img) => (img.id === id ? { ...img, part } : img)));
  };

  const handleAddCustomCrop = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCropInput.trim()) return;
    const created = saveCustomCrop(newCropInput.trim());
    setSelectedCrop(created.id);
    setNewCropInput('');
    setShowAddCustomCrop(false);
  };

  // Submit diagnosis request
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (images.length === 0) {
      setActionError('Please take or upload at least one plant photo.');
      return;
    }

    setIsSubmitting(true);
    setQueuedNotification(null);
    setActionError(null);

    const clientRequestId = crypto.randomUUID();
    const combinedSymptoms = [
      symptomsText.trim(),
      quickNotes.trim() ? `Field Observations: "${quickNotes.trim()}"` : '',
    ]
      .filter(Boolean)
      .join(' | ');

    const context = {
      cropId: selectedCrop,
      symptomsText: combinedSymptoms || 'Visual foliar diagnosis inspection',
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
        triggerHaptic('success');
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
        triggerHaptic('success');
        onDiagnosisComplete(res, images[0]?.previewUrl);
      }
    } catch (err: unknown) {
      setIsSubmitting(false);
      setActionError(err instanceof Error ? err.message : 'Diagnosis submission failed. Try again.');
    }
  };

  const selectedCropObj = availableCrops.find((c) => c.id === selectedCrop);

  // Dynamic Identified Plant and Disease status based on user input, notes, and photos
  const identifiedStatus = useMemo(() => {
    const notesLower = (quickNotes + ' ' + symptomsText).toLowerCase();
    const plantName = selectedCropObj?.name || 'Monstera';
    const isIndoor = selectedCrop === 'monstera' || selectedCrop.includes('plant') || selectedCrop.includes('lily');

    let disease = 'Healthy Canopy';
    let severity: 'healthy' | 'warning' | 'flagged' = 'healthy';

    if (notesLower.includes('pest') || notesLower.includes('bug') || notesLower.includes('insect') || notesLower.includes('base')) {
      disease = 'Pest Activity / Aphids';
      severity = 'warning';
    } else if (notesLower.includes('spot') || notesLower.includes('ring') || notesLower.includes('brown')) {
      disease = 'Early Blight / Leaf Spot';
      severity = 'warning';
    } else if (notesLower.includes('powder') || notesLower.includes('white') || notesLower.includes('mildew')) {
      disease = 'Powdery Mildew';
      severity = 'warning';
    } else if (notesLower.includes('yellow') || notesLower.includes('fertiliz')) {
      disease = 'Nutrient Chlorosis / Wilting';
      severity = 'warning';
    } else if (notesLower.includes('curl') || notesLower.includes('mosaic')) {
      disease = 'Viral Mosaic Distortion';
      severity = 'flagged';
    } else if (images.length > 0) {
      disease = 'Foliar Inspection Active';
      severity = 'healthy';
    }

    return {
      plant: plantName,
      location: isIndoor ? 'Indoors' : 'Field Crop',
      disease,
      severity,
    };
  }, [selectedCrop, selectedCropObj, quickNotes, symptomsText, images.length]);

  return (
    <div className="space-y-4">
      {/* 1. CAMERA VIEWFINDER MATCHING Screen_Shot_2026-10-26_at_7.36.14_PM_8a89c157.png */}
      <div className="relative aspect-9/16 sm:aspect-3/4 w-full bg-[#0E1A11] rounded-3xl overflow-hidden shadow-2xl border-2 border-white/20 select-none">
        {/* Live Camera Viewfinder Screen (Replaced static photo with camera screen) */}
        <video
          ref={videoRef}
          playsInline
          autoPlay
          muted
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            isCapturingLive ? 'opacity-100' : 'opacity-0 absolute inset-0 pointer-events-none'
          }`}
        />

        {!isCapturingLive && (
          <div className="relative w-full h-full flex flex-col items-center justify-center bg-[#0d1f14] text-white p-6 space-y-4">
            {/* Live camera aperture / sensor scanner */}
            <div className="relative w-28 h-28 rounded-full border-2 border-dashed border-[#78C441] flex items-center justify-center animate-spin-slow">
              <div className="w-20 h-20 rounded-full border border-white/20 flex items-center justify-center bg-black/40">
                <Camera className="w-8 h-8 text-[#78C441] animate-pulse" />
              </div>
            </div>
            <div className="text-center space-y-1.5 max-w-xs z-10">
              <h3 className="text-sm font-extrabold text-white">Camera Viewfinder Active</h3>
              <p className="text-[11px] text-[#A3D995]">
                {cameraError || 'Initializing live lens stream for plant identification & diagnosis...'}
              </p>
            </div>
            <button
              type="button"
              onClick={startCamera}
              className="touch-target bg-[#78C441] hover:bg-[#6BB536] text-white text-xs font-bold px-4 py-2 rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-1.5 min-h-[40px]"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry / Start Camera</span>
            </button>
          </div>
        )}

        {/* Top-Left Circular Back Button (<) matching attached image */}
        <div className="absolute top-4 left-4 z-30">
          <button
            type="button"
            onClick={onClose || stopCamera}
            className="w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md text-white flex items-center justify-center transition-all shadow-md active:scale-95 touch-target"
            title="Back"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        </div>

        {/* Top-Right Voice Instructions & EXIF Badge */}
        <div className="absolute top-4 right-4 z-30 flex items-center gap-2">
          <div className="bg-black/40 backdrop-blur-md text-[#D8F3DC] text-[10px] font-bold px-2.5 py-1 rounded-full border border-white/10 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[#78C441]" />
            <span>EXIF Clean</span>
          </div>

          <button
            type="button"
            onClick={playVoiceInstructions}
            className={`w-9 h-9 rounded-full backdrop-blur-md flex items-center justify-center text-white transition-all ${
              isReadingAloud ? 'bg-[#E09F3E] animate-pulse' : 'bg-black/40 hover:bg-black/60'
            }`}
            title="Read instructions"
          >
            {isReadingAloud ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>

        {/* CENTER FRAMING GUIDE RETICLE (Matching Screen_Shot_2026-10-26_at_7.36.14_PM_8a89c157.png) */}
        <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-6 z-20">
          {/* Main White Rectangular Frame with Corner Brackets */}
          <div className="relative w-64 h-72 sm:w-72 sm:h-80 border-2 border-white rounded-3xl flex flex-col justify-end overflow-hidden shadow-[0_0_15px_rgba(255,255,255,0.3)]">
            {/* White Corner Highlights */}
            <div className="w-6 h-6 border-t-4 border-l-4 border-white absolute top-0 left-0 rounded-tl-xl"></div>
            <div className="w-6 h-6 border-t-4 border-r-4 border-white absolute top-0 right-0 rounded-tr-xl"></div>
            <div className="w-6 h-6 border-b-4 border-l-4 border-white absolute bottom-0 left-0 rounded-bl-xl"></div>
            <div className="w-6 h-6 border-b-4 border-r-4 border-white absolute bottom-0 right-0 rounded-br-xl"></div>

            {/* Lower Half Frosted Scan Zone with Dashed Top Border (exact match!) */}
            <div className="w-full h-1/2 bg-white/15 backdrop-blur-xs border-t-2 border-dashed border-white/80 relative flex items-center justify-center">
              {/* Subtle animated scan beam */}
              <div className="absolute inset-x-0 h-0.5 bg-[#78C441] shadow-[0_0_8px_#78C441] animate-pulse"></div>
              <span className="text-[11px] font-bold text-white drop-shadow-md bg-black/30 px-3 py-1 rounded-full">
                Align leaf here
              </span>
            </div>
          </div>
        </div>

        {/* DROPDOWN FIELD OPENED BY '+' BUTTON: Additional Picture Information & What They See */}
        {showObservationsDropdown && (
          <div className="absolute bottom-28 inset-x-4 z-40 bg-black/85 backdrop-blur-xl border border-white/30 rounded-3xl p-4 text-white shadow-2xl space-y-3 animate-in fade-in slide-in-from-bottom-3 max-h-[60%] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/15 pb-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-[#4DB6AC] text-white flex items-center justify-center shadow-xs">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-white leading-tight">
                    Picture Notes & Observations
                  </h4>
                  <p className="text-[10px] text-white/70">
                    Tell the AI what you see on the leaves, stems, or base
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                {isDictationSupported && (
                  <button
                    type="button"
                    onClick={isNotesDictating ? stopNotesDictation : startNotesDictation}
                    className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                      isNotesDictating
                        ? 'bg-red-500 text-white animate-pulse'
                        : 'bg-white/20 hover:bg-white/30 text-white'
                    }`}
                    title={isNotesDictating ? 'Stop Recording' : 'Voice Dictate'}
                  >
                    {isNotesDictating ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setShowObservationsDropdown(false)}
                  className="w-7 h-7 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center text-xs font-bold"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Free-text input */}
            <div className="space-y-1">
              <textarea
                value={quickNotes}
                onChange={(e) => setQuickNotes(e.target.value)}
                rows={3}
                placeholder="Describe what you see: e.g. Saw small insects near the base, applied fertilizer yesterday, brown spots with yellow halos..."
                className="w-full text-xs font-medium bg-white/10 text-white placeholder-white/50 border border-white/20 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#4DB6AC]"
                autoFocus
              />
              <div className="flex justify-between items-center text-[10px] text-white/60">
                <span>Notes are attached to this photo diagnosis</span>
                <span>{quickNotes.length}/300</span>
              </div>
            </div>

            {/* Quick click-to-add tags */}
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-white/75">Quick observation tags:</span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  'Pests near base',
                  'Fertilized yesterday',
                  'Brown spots with yellow halos',
                  'White powdery dust',
                  'Curled leaf edges',
                  'Midday wilting',
                  'Watered 2 days ago',
                ].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => {
                      setQuickNotes((prev) => (prev ? `${prev}, ${tag}` : tag));
                    }}
                    className="text-[10px] font-semibold text-white bg-white/15 hover:bg-white/25 px-2.5 py-1 rounded-full border border-white/10 transition-colors"
                  >
                    + {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Done button */}
            <div className="pt-1 flex gap-2">
              <button
                type="button"
                onClick={() => setShowObservationsDropdown(false)}
                className="touch-target flex-1 bg-[#4DB6AC] hover:bg-[#399d94] text-white font-extrabold text-xs py-2.5 rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 min-h-[40px]"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Save Notes</span>
              </button>
            </div>
          </div>
        )}

        {/* BOTTOM FLOATING FROSTED CARD: IDENTIFIED PLANT & DISEASE + CYAN '+' BUTTON */}
        <div className="absolute bottom-20 left-4 right-4 z-30">
          <div className="relative bg-white/20 hover:bg-white/25 backdrop-blur-md border border-white/30 rounded-2xl p-2.5 flex items-center justify-between text-white shadow-lg transition-all">
            <div
              className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
              onClick={() => setShowAddCustomCrop((prev) => !prev)}
              title="Tap to switch plant or view inspection details"
            >
              {/* Plant / Photo Thumbnail */}
              <div className="w-12 h-12 rounded-xl overflow-hidden bg-white/40 border border-white/40 shrink-0 relative">
                <img
                  src={
                    images[0]?.previewUrl ||
                    'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=120&q=80'
                  }
                  alt={identifiedStatus.plant}
                  className="w-full h-full object-cover"
                />
                {images.length > 0 && (
                  <span className="absolute bottom-0 right-0 bg-black/75 text-[9px] font-mono px-1 rounded-tl text-[#86EFAC]">
                    {images.length}P
                  </span>
                )}
              </div>

              {/* Plant & Identified Disease Meta */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-white/80 font-medium capitalize">
                    {identifiedStatus.location}
                  </span>
                  <span className="text-white/40">•</span>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full truncate ${
                      identifiedStatus.severity === 'warning' || identifiedStatus.severity === 'flagged'
                        ? 'bg-[#E09F3E]/90 text-white'
                        : 'bg-[#78C441]/80 text-white'
                    }`}
                  >
                    {identifiedStatus.disease}
                  </span>
                </div>

                <h4 className="font-extrabold text-sm text-white tracking-wide truncate">
                  {identifiedStatus.plant}
                </h4>

                {quickNotes && (
                  <p className="text-[10px] text-white/90 truncate italic flex items-center gap-1">
                    <MessageSquare className="w-3 h-3 text-[#4DB6AC] shrink-0" />
                    <span>&ldquo;{quickNotes}&rdquo;</span>
                  </p>
                )}
              </div>
            </div>

            {/* Cyan / Teal Floating '+' Action Button (drops open additional information field) */}
            <button
              type="button"
              onClick={() => setShowObservationsDropdown((prev) => !prev)}
              className={`w-10 h-10 rounded-full transition-all flex items-center justify-center shadow-lg active:scale-95 touch-target shrink-0 ml-2 relative ${
                showObservationsDropdown
                  ? 'bg-white text-[#1A3B29] rotate-45'
                  : quickNotes
                  ? 'bg-[#4DB6AC] text-white ring-2 ring-white/50'
                  : 'bg-[#4DB6AC] hover:bg-[#399d94] text-white'
              }`}
              title="Add notes, symptoms, or what you see in the pictures"
              aria-label="Add notes or symptoms"
            >
              <Plus className="w-5 h-5 stroke-[2.5]" />
              {quickNotes && !showObservationsDropdown && (
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#78C441] border-2 border-white flex items-center justify-center text-[8px] font-bold">
                  ✓
                </span>
              )}
            </button>
          </div>
        </div>

        {/* CAMERA SHUTTER & UPLOAD TRIGGER BUTTONS */}
        <div className="absolute bottom-4 inset-x-0 z-30 flex items-center justify-center gap-8 px-6">
          {/* Upload Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-12 h-12 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md text-white flex items-center justify-center border border-white/20 active:scale-95 transition-all shadow-md touch-target"
            title="Upload from gallery"
            aria-label="Upload from gallery"
          >
            <Upload className="w-5 h-5" />
          </button>

          {/* Big Circular Shutter Button */}
          <button
            type="button"
            onClick={isCapturingLive ? captureFrame : startCamera}
            disabled={images.length >= 4}
            className="w-18 h-18 rounded-full bg-white/30 backdrop-blur-xs p-1.5 flex items-center justify-center border-4 border-white shadow-2xl active:scale-90 transition-all touch-target"
            title="Take Photo"
            aria-label="Take Photo"
          >
            <div className="w-full h-full rounded-full bg-white hover:bg-[#78C441] transition-colors flex items-center justify-center text-[#1A3B29]">
              <Camera className="w-7 h-7" />
            </div>
          </button>

          {/* Photo Counter Pill */}
          <div className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-md text-white flex flex-col items-center justify-center border border-white/20 shadow-md">
            <span className="text-xs font-extrabold text-[#86EFAC]">{images.length}/4</span>
            <span className="text-[8px] uppercase tracking-tighter text-white/70">Photos</span>
          </div>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/webp,image/png"
        multiple
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* QUICK INLINE CROP SELECTOR OR ADD CUSTOM CROP */}
      {showAddCustomCrop && (
        <div className="bg-white rounded-2xl p-4 border border-[#E6EBE4] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-extrabold text-[#19201D]">Select or Add Inspected Plant</h4>
            <button
              type="button"
              onClick={() => setShowAddCustomCrop(false)}
              className="text-stone-400 hover:text-stone-700 text-xs font-bold"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleAddCustomCrop} className="flex gap-2">
            <input
              type="text"
              value={newCropInput}
              onChange={(e) => setNewCropInput(e.target.value)}
              placeholder="e.g. Fiddle Leaf Fig, Cassava, Maize..."
              className="flex-1 text-xs font-bold bg-[#F6F8F5] border border-[#E6EBE4] rounded-xl px-3 py-2 min-h-[40px] focus:outline-none focus:ring-2 focus:ring-[#78C441]"
            />
            <button
              type="submit"
              disabled={!newCropInput.trim()}
              className="bg-[#78C441] hover:bg-[#6BB536] disabled:bg-stone-200 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-colors"
            >
              Add
            </button>
          </form>

          <div className="flex flex-wrap gap-1.5 pt-1">
            {availableCrops.slice(0, 8).map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  setSelectedCrop(c.id);
                  setShowAddCustomCrop(false);
                }}
                className={`text-xs font-bold px-3 py-1.5 rounded-full transition-all flex items-center gap-1 ${
                  selectedCrop === c.id
                    ? 'bg-[#182635] text-white shadow-xs'
                    : 'bg-[#F6F8F5] text-[#5E6D65] border border-[#E6EBE4]'
                }`}
              >
                <span>{c.icon}</span>
                <span>{c.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 2. ATTACHED PHOTOS TRAY (Up to 4 photos) */}
      {images.length > 0 && (
        <div className="bg-white rounded-2xl p-4 border border-[#E6EBE4] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#19201D]">
              Attached Photos ({images.length} of 4):
            </span>
            <span className="text-[11px] text-[#5E6D65]">Select plant part for each photo</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {images.map((img, index) => (
              <div
                key={img.id}
                className="bg-[#F6F8F5] rounded-xl border border-[#E6EBE4] p-2 space-y-2 relative"
              >
                <div className="relative aspect-square rounded-lg overflow-hidden bg-stone-100">
                  <img
                    src={img.previewUrl}
                    alt={`Photo ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(img.id)}
                    className="absolute top-1 right-1 bg-black/80 hover:bg-[#BC4749] text-white w-7 h-7 rounded-lg flex items-center justify-center transition-colors shadow-sm"
                    title="Remove"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <span className="absolute bottom-1 left-1 bg-black/75 text-white text-[9px] font-mono px-1 py-0.5 rounded">
                    {img.width}x{img.height}
                  </span>
                </div>

                {/* Part Selector */}
                <select
                  value={img.part}
                  onChange={(e) => updatePart(img.id, e.target.value as PlantPart)}
                  className="w-full text-[11px] font-bold bg-white border border-[#E6EBE4] rounded-lg px-2 py-1.5 focus:ring-1 focus:ring-[#78C441] focus:outline-none"
                >
                  <option value="leaf">🍃 Leaf</option>
                  <option value="stem">🎋 Stem</option>
                  <option value="fruit">🍅 Fruit</option>
                  <option value="flower">🌸 Flower</option>
                  <option value="root">🥔 Root</option>
                  <option value="whole">🌿 Whole Plant</option>
                </select>

                {/* Quality warning if any */}
                {img.quality.warnings.length > 0 && (
                  <div className="text-[10px] text-[#E09F3E] bg-[#FEF3C7] p-1 rounded font-semibold flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 shrink-0" />
                    <span className="truncate">{img.quality.warnings[0]}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. FREE-TEXT OBSERVATIONS FIELD (Synced with the '+' button dropdown) */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#E6EBE4] shadow-xs space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-extrabold text-[#19201D] flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-[#4DB6AC]" />
            <span>Additional Information & Picture Notes</span>
          </label>
          <div className="flex items-center gap-2">
            {isDictationSupported && (
              <button
                type="button"
                onClick={isNotesDictating ? stopNotesDictation : startNotesDictation}
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 transition-all ${
                  isNotesDictating
                    ? 'bg-red-500 text-white animate-pulse'
                    : 'bg-[#E8F5E9] text-[#2D6A4F] hover:bg-[#C8E6C9]'
                }`}
              >
                {isNotesDictating ? <MicOff className="w-3 h-3" /> : <Mic className="w-3 h-3" />}
                <span>{isNotesDictating ? 'Listening...' : 'Voice Dictate'}</span>
              </button>
            )}
            <span className="text-[10px] text-[#5E6D65] font-mono">{quickNotes.length}/300</span>
          </div>
        </div>
        <p className="text-[11px] text-[#5E6D65]">
          Describe what you see on the pictures (e.g. &lsquo;applied fertilizer yesterday&rsquo;, &lsquo;saw pests near the base&rsquo;, leaf color or spots).
        </p>
        <textarea
          value={quickNotes}
          onChange={(e) => setQuickNotes(e.target.value.slice(0, 300))}
          rows={2}
          placeholder="e.g. Applied fertilizer yesterday, saw pests near the base, yellow spots with brown rings..."
          className="w-full text-xs font-medium bg-[#F6F8F5] border border-[#E6EBE4] rounded-xl p-3 focus:ring-2 focus:ring-[#4DB6AC] focus:outline-none"
        />

        {/* Quick Tag Pills */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {[
            'Fertilized yesterday',
            'Pests near base',
            'Yellow spots with rings',
            'Watered 2 days ago',
            'Curled leaf edges',
          ].map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => {
                setQuickNotes((prev) => (prev ? `${prev}, ${tag}` : tag));
              }}
              className="text-[10px] font-semibold text-[#5E6D65] bg-[#F6F8F5] hover:bg-[#EBF0E9] border border-[#E6EBE4] px-2.5 py-1 rounded-full transition-colors"
            >
              + {tag}
            </button>
          ))}
        </div>
      </div>

      {/* 4. SUBMIT DIAGNOSIS BUTTON */}
      <div className="pt-1">
        {actionError && (
          <div className="p-3 bg-[#FEE2E2] border border-[#FCA5A5] rounded-xl text-xs text-[#BC4749] flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{actionError}</span>
          </div>
        )}
        {queuedNotification && (
          <div className="p-3 bg-[#FEF3C7] border border-[#FDE68A] rounded-xl text-xs text-[#92400E] flex items-center gap-2 mb-3">
            <CheckCircle2 className="w-4 h-4 text-[#78C441] shrink-0" />
            <span>{queuedNotification}</span>
          </div>
        )}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting || images.length === 0}
          className={`touch-target w-full py-4 rounded-2xl text-sm font-extrabold text-white transition-all shadow-md flex items-center justify-center gap-2 min-h-[52px] ${
            isSubmitting || images.length === 0
              ? 'bg-stone-300 text-stone-500 cursor-not-allowed'
              : 'bg-[#78C441] hover:bg-[#6BB536] active:scale-[0.98]'
          }`}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Analyzing with Agronomy AI...</span>
            </>
          ) : (
            <>
              <span>Diagnose Plant Health Now ({images.length}/4)</span>
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
