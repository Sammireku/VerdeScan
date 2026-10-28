// T-024 / T-022: Settings, Privacy, Consent, Data Export & Golden Set Evaluation (Verdant Earth Palette)
import React, { useState } from 'react';
import {
  Settings,
  Shield,
  Download,
  Trash2,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Globe,
  Database,
  Lock,
} from 'lucide-react';
import { runGoldenEvaluation, type GoldenRunResult } from '@verdescan/eval';
import { PHASE_1_GATES } from '@verdescan/shared';
import { db } from '../../lib/db';
import type { Locale } from '@verdescan/shared';

export interface SettingsViewProps {
  locale: Locale;
  setLocale: (loc: Locale) => void;
  onClose?: () => void;
}

export function SettingsView({ locale, setLocale, onClose }: SettingsViewProps) {
  const [trainingConsent, setTrainingConsent] = useState(false);
  const [evalResult, setEvalResult] = useState<GoldenRunResult | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportComplete, setExportComplete] = useState(false);

  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleRunEvaluation = () => {
    const outcome = runGoldenEvaluation();
    setEvalResult(outcome);
  };

  const handleExportData = async () => {
    setIsExporting(true);
    setExportComplete(false);
    setStatusMessage(null);

    try {
      const history = await db.history.toArray();
      const bookmarks = await db.bookmarks.toArray();
      const queueItems = await db.queue.toArray();
      const exportArchive = {
        app: 'VerdeScan',
        version: '1.0.0',
        exportedAt: new Date().toISOString(),
        user: {
          uid: 'current-user',
          locale,
          trainingConsent,
          complianceBaseline: 'GDPR & Ghana Data Protection Act 2012 (Act 843)',
        },
        diagnoses: history,
        bookmarks,
        queue: queueItems,
      };

      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportArchive, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `verdescan_export_${Date.now()}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      setIsExporting(false);
      setExportComplete(true);
      setStatusMessage('Plant health archive successfully exported.');
    } catch {
      setIsExporting(false);
      setStatusMessage('Could not export data.');
    }
  };

  const handleConfirmClearData = async () => {
    try {
      await db.history.clear();
      await db.queue.clear();
      await db.bookmarks.clear();
      setShowClearConfirm(false);
      setStatusMessage('Local cache and records successfully purged.');
    } catch {
      setShowClearConfirm(false);
      setStatusMessage('Failed to clear local cache.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white border border-[#E6EBE4] flex items-center justify-center text-[#19201D] hover:bg-stone-50 touch-target shrink-0"
            title="Back"
          >
            ✕
          </button>
        )}
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#1B1B1B] tracking-tight">App Settings & Privacy</h1>
          <p className="text-xs text-[#5A6B5E]">
            Manage interface language, privacy consent, export your records, or run golden evaluation benchmarks.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Language & Regional Preferences */}
        <div className="bg-white rounded-2xl border border-[#E5E5DC] p-6 shadow-xs space-y-4">
          <div className="flex items-center space-x-2 border-b border-[#E5E5DC] pb-3">
            <Globe className="w-5 h-5 text-[#2D6A4F]" />
            <h2 className="font-extrabold text-sm text-[#1B1B1B]">Language & Regional Voice (i18n)</h2>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-[#5A6B5E]">Preferred Field Language:</label>
            <select
              value={locale}
              onChange={(e) => setLocale(e.target.value as Locale)}
              className="w-full text-xs font-bold bg-[#FAFAF5] border border-[#E5E5DC] rounded-xl p-3"
            >
              <option value="en">🇬🇧 English (International)</option>
              <option value="nl">🇳🇱 Nederlands (Dutch)</option>
              <option value="tw">🇬🇭 Twi (Ghana Pilot)</option>
              <option value="fr">🇫🇷 Français (West Africa)</option>
              <option value="ha">🇳🇬 Hausa (Northern Region)</option>
              <option value="sw">🇹🇿 Kiswahili (East Africa)</option>
              <option value="es">🇪🇸 Español</option>
            </select>
            <p className="text-[11px] text-[#5A6B5E] font-medium leading-relaxed">
              All crop disease symptoms, confirm steps, and treatment instructions adapt immediately to this language with voice read-aloud support.
            </p>
          </div>
        </div>

        {/* Privacy & EXIF Consent */}
        <div className="bg-white rounded-2xl border border-[#E5E5DC] p-6 shadow-xs space-y-4">
          <div className="flex items-center space-x-2 border-b border-[#E5E5DC] pb-3">
            <Shield className="w-5 h-5 text-[#2D6A4F]" />
            <h2 className="font-extrabold text-sm text-[#1B1B1B]">Privacy & Model Improvement (Section 5)</h2>
          </div>

          <div className="space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <span className="text-xs font-bold text-[#1B1B1B]">Opt-In Research Training:</span>
                <p className="text-[11px] text-[#5A6B5E] leading-relaxed font-medium">
                  Allow your anonymous, EXIF-stripped crop photos to assist CSIR researchers in fine-tuning detection models. Default is off.
                </p>
              </div>
              <input
                type="checkbox"
                checked={trainingConsent}
                onChange={(e) => setTrainingConsent(e.target.checked)}
                className="w-5 h-5 text-[#2D6A4F] rounded-lg focus:ring-[#2D6A4F] cursor-pointer mt-1"
              />
            </div>

            <div className="p-3 bg-[#FAFAF5] rounded-xl border border-[#E5E5DC] text-[11px] text-[#1B1B1B] space-y-1 font-medium">
              <div className="flex items-center gap-1 font-bold text-[#2D6A4F]">
                <Lock className="w-3.5 h-3.5" /> Canvas EXIF Stripper Active
              </div>
              <p className="text-[#5A6B5E]">
                Photos are re-encoded through an HTML canvas element on your device before upload, permanently deleting GPS coordinates and phone identifiers.
              </p>
            </div>
          </div>
        </div>

        {/* Data Export & Account Purge */}
        <div className="bg-white rounded-2xl border border-[#E5E5DC] p-6 shadow-xs space-y-4">
          <div className="flex items-center space-x-2 border-b border-[#E5E5DC] pb-3">
            <Database className="w-5 h-5 text-[#2D6A4F]" />
            <h2 className="font-extrabold text-sm text-[#1B1B1B]">Data Rights (exportMyData & deleteAccount)</h2>
          </div>

          <div className="space-y-3">
            <p className="text-xs text-[#5A6B5E] font-medium leading-relaxed">
              Compliant with Ghana Data Protection Act 2012 (Act 843) and GDPR. Download an unencrypted JSON archive of all your farm diagnoses or purge local data.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleExportData}
                disabled={isExporting}
                className="bg-[#2D6A4F] hover:bg-[#1B4332] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-xs flex items-center gap-1.5 min-h-[44px]"
              >
                <Download className="w-4 h-4" />
                {isExporting ? 'Exporting...' : 'Export Data (.JSON)'}
              </button>

              {!showClearConfirm ? (
                <button
                  type="button"
                  onClick={() => setShowClearConfirm(true)}
                  className="bg-stone-100 hover:bg-[#BC4749]/10 text-[#BC4749] text-xs font-bold px-4 py-2.5 rounded-xl transition-colors flex items-center gap-1.5 border border-stone-200 min-h-[44px]"
                >
                  <Trash2 className="w-4 h-4" /> Clear Local Data
                </button>
              ) : (
                <div className="flex items-center gap-2 p-2 bg-[#FEE2E2] rounded-xl border border-[#FCA5A5]">
                  <span className="text-[11px] font-bold text-[#BC4749]">Purge all records?</span>
                  <button
                    type="button"
                    onClick={handleConfirmClearData}
                    className="bg-[#BC4749] text-white text-[11px] font-bold px-3 py-1.5 rounded-lg shadow-xs"
                  >
                    Yes, Purge
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowClearConfirm(false)}
                    className="text-stone-600 hover:text-stone-900 text-[11px] font-bold px-2 py-1.5"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

            {statusMessage && (
              <p className="text-xs text-[#2D6A4F] flex items-center gap-1 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#2D6A4F]" /> {statusMessage}
              </p>
            )}
          </div>
        </div>

        {/* Golden-Set Evaluation Runner (Section 11) */}
        <div className="bg-white rounded-2xl border border-[#E5E5DC] p-6 shadow-xs space-y-4">
          <div className="flex items-center space-x-2 border-b border-[#E5E5DC] pb-3">
            <Activity className="w-5 h-5 text-[#2D6A4F]" />
            <h2 className="font-extrabold text-sm text-[#1B1B1B]">Golden-Set Benchmark (pnpm eval)</h2>
          </div>

          <div className="space-y-3">
            <p className="text-xs text-[#5A6B5E] font-medium leading-relaxed">
              Run the full golden set of expert-labelled African cases and verify that Top-1 and Top-3 accuracy meet Phase 1 release gates.
            </p>

            <button
              type="button"
              onClick={handleRunEvaluation}
              className="bg-[#2D6A4F] hover:bg-[#1B4332] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-xs flex items-center gap-1.5 min-h-[44px]"
            >
              <Activity className="w-4 h-4" /> Run Golden Evaluation Now
            </button>

            {evalResult && (
              <div className="p-4 bg-[#D8F3DC]/70 rounded-2xl border border-[#B7E4C7] space-y-2 text-xs">
                <div className="flex items-center justify-between font-bold text-[#2D6A4F]">
                  <span>Evaluation Gate Status:</span>
                  <span className="bg-[#2D6A4F] text-white px-2.5 py-0.5 rounded-full font-mono text-[10px]">
                    {evalResult.gatesPassed ? 'ALL GATES PASSED ✅' : 'GATES FAILED ❌'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-[#1B1B1B] font-medium">
                  <div>Top-1 Accuracy: <strong className="text-[#2D6A4F]">{(evalResult.metrics.top1Accuracy * 100).toFixed(1)}%</strong> (Gate: ≥ 75%)</div>
                  <div>Top-3 Accuracy: <strong className="text-[#2D6A4F]">{(evalResult.metrics.top3Accuracy * 100).toFixed(1)}%</strong> (Gate: ≥ 90%)</div>
                  <div>Wrong-Confident: <strong className="text-[#2D6A4F]">{(evalResult.metrics.wrongConfidentRate * 100).toFixed(1)}%</strong> (Gate: ≤ 5%)</div>
                  <div>Negative Pass: <strong className="text-[#2D6A4F]">{(evalResult.metrics.negativeCasePassRate * 100).toFixed(1)}%</strong> (Gate: ≥ 98%)</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
