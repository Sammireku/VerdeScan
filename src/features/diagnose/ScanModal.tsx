// Full screen / sheet modal for Scan & Plant Health Diagnosis
import React, { useState } from 'react';
import { X, ArrowLeft, RotateCcw } from 'lucide-react';
import { CameraWizard } from './CameraWizard';
import { ResultView } from './ResultView';
import type { Locale, SubmitDiagnosisRes } from '@verdescan/shared';

export interface ScanModalProps {
  isOpen: boolean;
  onClose: () => void;
  locale: Locale;
  isOnline: boolean;
  initialMode?: 'identify' | 'diagnose';
}

export function ScanModal({
  isOpen,
  onClose,
  locale,
  isOnline,
  initialMode = 'diagnose',
}: ScanModalProps) {
  const [currentResult, setCurrentResult] = useState<SubmitDiagnosisRes | null>(null);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDiagnosisComplete = (res: SubmitDiagnosisRes, thumb?: string) => {
    setCurrentResult(res);
    setThumbnailUrl(thumb || null);
  };

  const handleReset = () => {
    setCurrentResult(null);
    setThumbnailUrl(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
      <div className="bg-[#F6F8F5] w-full max-w-lg h-[92vh] sm:h-[88vh] rounded-t-3xl sm:rounded-3xl flex flex-col shadow-2xl overflow-hidden border border-[#E6EBE4]">
        {/* Modal Top Bar */}
        <div className="bg-white border-b border-[#E6EBE4] px-4 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            {currentResult ? (
              <button
                type="button"
                onClick={handleReset}
                className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-600 hover:text-black touch-target"
                title="Back to camera"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            ) : null}
            <div>
              <h3 className="font-extrabold text-sm text-[#19201D] leading-tight">
                {currentResult
                  ? 'Diagnosis Assessment'
                  : initialMode === 'identify'
                  ? 'Identify Plant Species'
                  : 'Scan Crop Problem & Health'}
              </h3>
              <p className="text-[10px] text-[#5E6D65]">
                {currentResult ? 'Reviewed Agronomy Guidance' : 'EXIF Stripped • Daylight Photography'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {currentResult && (
              <button
                type="button"
                onClick={handleReset}
                className="text-xs font-bold text-[#78C441] bg-[#D8F3DC]/70 hover:bg-[#D8F3DC] px-2.5 py-1 rounded-xl flex items-center gap-1 touch-target"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>New Scan</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 hover:text-black flex items-center justify-center text-xs font-bold touch-target"
              title="Close"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {currentResult ? (
            <ResultView
              result={currentResult}
              locale={locale}
              thumbnailUrl={thumbnailUrl}
              onReset={handleReset}
            />
          ) : (
            <CameraWizard
              locale={locale}
              isOnline={isOnline}
              onDiagnosisComplete={handleDiagnosisComplete}
              onClose={onClose}
            />
          )}
        </div>
      </div>
    </div>
  );
}
