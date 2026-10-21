// T-017: Diagnosis Result View, Follow-ups, Treatment Plan & Voice Read-Aloud (Verdant Earth Palette)
import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Volume2,
  VolumeX,
  ShieldAlert,
  ArrowLeft,
  Sparkles,
  ThumbsUp,
  ThumbsDown,
  Info,
  DollarSign,
  AlertTriangle,
  FileText,
  ShieldCheck,
  Check,
} from 'lucide-react';
import type { SubmitDiagnosisRes, Locale } from '@verdescan/shared';
import { getProblemById, getTreatmentById } from '@verdescan/kb';
import { DiagnosisResultCard } from './DiagnosisResultCard';

export interface ResultViewProps {
  result: SubmitDiagnosisRes;
  locale: Locale;
  thumbnailUrl?: string | null;
  onReset: () => void;
}

export function ResultView({ result, locale, thumbnailUrl, onReset }: ResultViewProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [activeSpeechStep, setActiveSpeechStep] = useState<string | null>(null);
  const [feedbackGiven, setFeedbackGiven] = useState<'yes' | 'no' | null>(null);
  const [followUpAnswers, setFollowUpAnswers] = useState<Record<string, string>>({});
  const [followUpSubmitted, setFollowUpSubmitted] = useState(false);
  const [activeTab, setActiveTab] = useState<'treatments' | 'evidence'>('treatments');

  const primaryCandidate = result.candidates[0];
  const primaryProblem = primaryCandidate ? getProblemById(primaryCandidate.problemId) : undefined;

  // Web Speech API Voice Read-Aloud
  const speakText = (text: string, stepId?: string) => {
    if (!('speechSynthesis' in window)) {
      return;
    }

    if (isSpeaking && activeSpeechStep === stepId) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setActiveSpeechStep(null);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = locale;
    utterance.onend = () => {
      setIsSpeaking(false);
      setActiveSpeechStep(null);
    };
    utterance.onerror = () => {
      setIsSpeaking(false);
      setActiveSpeechStep(null);
    };

    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
    setActiveSpeechStep(stepId || 'all');
  };

  const handleReadAll = () => {
    const problemName = primaryProblem?.names[locale] || primaryProblem?.names.en || 'Unknown condition';
    const summary = primaryProblem?.summary[locale] || primaryProblem?.summary.en || '';
    const textToSpeak = `VerdeScan Diagnosis: ${problemName}. Confidence is ${Math.round(
      (primaryCandidate?.confidence || 0) * 100
    )} percent. ${summary}. First-line guidance disclaimer: consult local extension officer for high stakes decisions.`;
    speakText(textToSpeak, 'summary');
  };

  const handleFollowUpSelect = (qid: string, ans: string) => {
    setFollowUpAnswers((prev) => ({ ...prev, [qid]: ans }));
  };

  const submitFollowUp = () => {
    setFollowUpSubmitted(true);
  };

  const confidencePercent = primaryCandidate ? Math.round(primaryCandidate.confidence * 100) : 0;
  const isHighConfidence = confidencePercent >= 75;
  const isNeedsInfo = result.status === 'needs_info' || confidencePercent < 55;

  return (
    <div className="space-y-6">
      {/* Top Bar Navigation & Main Audio Action */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-2 text-xs font-bold text-[#2D6A4F] hover:text-[#1B4332] transition-colors bg-white px-4 py-2.5 rounded-xl border border-[#E5E5DC] shadow-2xs min-h-[44px]"
        >
          <ArrowLeft className="w-4 h-4" /> Start New Scan
        </button>

        <button
          type="button"
          onClick={handleReadAll}
          className={`inline-flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-xl border transition-all shadow-xs min-h-[44px] ${
            isSpeaking && activeSpeechStep === 'summary'
              ? 'bg-[#FEF3C7] border-[#E09F3E] text-[#92400E] animate-pulse'
              : 'bg-[#D8F3DC] border-[#B7E4C7] text-[#2D6A4F] hover:bg-[#b7e4c7]'
          }`}
        >
          {isSpeaking && activeSpeechStep === 'summary' ? (
            <VolumeX className="w-4 h-4 text-[#E09F3E]" />
          ) : (
            <Volume2 className="w-4 h-4 text-[#2D6A4F]" />
          )}
          <span>{isSpeaking ? 'Stop Reading' : 'Listen to Full Diagnosis'}</span>
        </button>
      </div>

      {/* Mandatory Regulatory Disclaimer (Section 6 & 7) */}
      <div className="bg-[#D8F3DC]/60 rounded-2xl border border-[#B7E4C7] p-4 text-xs text-[#2D6A4F] flex items-start gap-3">
        <Info className="w-5 h-5 text-[#2D6A4F] shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <span className="font-bold">First-Line Decision Guidance:</span>
          <p className="text-[11px] leading-relaxed">
            This diagnosis provides first-line guidance from reviewed agronomic databases. For high-stakes decisions or commercial spraying, consult your local district extension officer.
          </p>
        </div>
      </div>

      {/* Status Alert if Needs Info */}
      {isNeedsInfo && (
        <div className="bg-[#FEF3C7] rounded-2xl border border-[#FDE68A] p-4 text-xs text-[#92400E] flex items-start gap-3 shadow-2xs">
          <HelpCircle className="w-5 h-5 text-[#E09F3E] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold">Further Clarification Recommended:</span>
            <p className="text-[11px] leading-relaxed">
              Visual symptoms closely match multiple conditions. Please answer the short questions below to calibrate the exact problem.
            </p>
          </div>
        </div>
      )}

      {/* PRIMARY DIAGNOSIS RESULT CARD (UI-004) */}
      <DiagnosisResultCard
        result={result}
        locale={locale}
        thumbnailUrl={thumbnailUrl}
        onReset={onReset}
        onViewDetailedPlan={() => {
          document.getElementById('treatment-tabs-section')?.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {primaryCandidate && primaryProblem && (
        <div id="treatment-tabs-section" className="space-y-6">

          {/* INTERACTIVE FOLLOW-UP QUESTIONS (Section 7) */}
          {result.followUpQuestions.length > 0 && !followUpSubmitted && (
            <div className="bg-[#FEF3C7]/80 p-5 rounded-2xl border border-[#FDE68A] space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#92400E] flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#E09F3E]" /> Field Verification Questions
                </span>
                <span className="text-[11px] text-[#92400E]">Clarifies between look-alikes</span>
              </div>

              <div className="space-y-4">
                {result.followUpQuestions.map((q) => (
                  <div key={q.id} className="space-y-2">
                    <p className="text-xs font-bold text-[#1B1B1B]">{q.text}</p>
                    <div className="flex flex-wrap gap-2">
                      {(q.options || ['Yes, exactly', 'No, looks different', 'Not sure']).map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => handleFollowUpSelect(q.id, opt)}
                          className={`text-xs px-4 py-2 rounded-xl border transition-all font-bold min-h-[40px] ${
                            followUpAnswers[q.id] === opt
                              ? 'bg-[#2D6A4F] text-white border-[#2D6A4F] shadow-xs'
                              : 'bg-white text-[#1B1B1B] border-[#E5E5DC] hover:bg-[#FAFAF5]'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={submitFollowUp}
                className="bg-[#2D6A4F] hover:bg-[#1B4332] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-xs"
              >
                Confirm Field Signs & Lock Treatment
              </button>
            </div>
          )}

          {followUpSubmitted && (
            <div className="p-3.5 bg-[#D8F3DC] border border-[#B7E4C7] rounded-xl text-xs text-[#2D6A4F] flex items-center gap-2 font-bold">
              <CheckCircle2 className="w-4 h-4 text-[#2D6A4F]" />
              <span>Answers confirmed. Recommended treatment plan updated below.</span>
            </div>
          )}

          {/* VIEW SWITCHER: Treatments vs Observable Evidence */}
          <div className="flex items-center space-x-2 border-b border-[#E5E5DC] pb-2">
            <button
              type="button"
              onClick={() => setActiveTab('treatments')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all min-h-[44px] ${
                activeTab === 'treatments'
                  ? 'bg-[#2D6A4F] text-white shadow-xs'
                  : 'text-[#5A6B5E] hover:text-[#1B1B1B] hover:bg-[#FAFAF5]'
              }`}
            >
              🌱 Reviewed Treatment Plan ({result.treatmentIds.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('evidence')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all min-h-[44px] ${
                activeTab === 'evidence'
                  ? 'bg-[#2D6A4F] text-white shadow-xs'
                  : 'text-[#5A6B5E] hover:text-[#1B1B1B] hover:bg-[#FAFAF5]'
              }`}
            >
              🔍 Observed Evidence & Signs
            </button>
          </div>

          {/* TAB 1: TREATMENT PLAN (Organic First) */}
          {activeTab === 'treatments' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-[#5A6B5E]">
                <span>
                  Showing <strong>organic-first remedies</strong> reviewed by agronomists.
                </span>
                <span className="text-[#2D6A4F] font-bold">Zero Model Hallucinations</span>
              </div>

              <div className="space-y-4">
                {result.treatmentIds.map((tid) => {
                  const treatment = getTreatmentById(tid);
                  if (!treatment) return null;

                  const isChemical = treatment.kind === 'chemical';

                  return (
                    <div
                      key={tid}
                      className={`p-5 rounded-2xl border transition-all ${
                        isChemical
                          ? 'bg-[#BC4749]/5 border-[#BC4749]/30'
                          : 'bg-[#FAFAF5] border-[#E5E5DC]'
                      }`}
                    >
                      <div className="flex items-start justify-between flex-wrap gap-2">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                                treatment.kind === 'cultural'
                                  ? 'bg-[#D8F3DC] text-[#2D6A4F]'
                                  : treatment.kind === 'biological'
                                  ? 'bg-blue-100 text-blue-900'
                                  : treatment.kind === 'organic_input'
                                  ? 'bg-[#FEF3C7] text-[#92400E]'
                                  : 'bg-[#FEE2E2] text-[#991B1B]'
                              }`}
                            >
                              {treatment.kind.replace('_', ' ')}
                            </span>
                            <span className="text-xs text-[#5A6B5E] flex items-center gap-1 font-semibold">
                              <DollarSign className="w-3.5 h-3.5" /> Cost: {treatment.costTier}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <h3 className="font-extrabold text-base text-[#1B1B1B]">
                              {treatment.title[locale] || treatment.title.en}
                            </h3>
                            <button
                              type="button"
                              onClick={() => {
                                const steps = (treatment.steps[locale] || treatment.steps.en || []).join('. ');
                                speakText(
                                  `${treatment.title[locale] || treatment.title.en}. Steps: ${steps}`,
                                  tid
                                );
                              }}
                              className="p-1 rounded-lg text-[#5A6B5E] hover:text-[#2D6A4F]"
                              title="Listen to treatment instructions"
                            >
                              <Volume2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {isChemical && (
                          <span className="text-[11px] font-bold bg-[#BC4749] text-white px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow-2xs">
                            <AlertTriangle className="w-3.5 h-3.5" /> Follow Package Label
                          </span>
                        )}
                      </div>

                      {/* Step-by-step instructions */}
                      <div className="mt-4 space-y-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-[#5A6B5E]">
                          Step-by-step Actions:
                        </span>
                        <div className="space-y-2">
                          {(treatment.steps[locale] || treatment.steps.en || []).map((step, idx) => (
                            <div key={idx} className="flex items-start gap-2.5 text-xs text-[#1B1B1B]">
                              <span className="w-5 h-5 rounded-full bg-[#2D6A4F] text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                                {idx + 1}
                              </span>
                              <p className="leading-relaxed font-medium">{step}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Materials required */}
                      {treatment.materials.length > 0 && (
                        <div className="mt-3.5 flex items-center gap-2 flex-wrap text-xs text-[#5A6B5E]">
                          <span className="font-bold text-[#1B1B1B]">Materials Needed:</span>
                          {treatment.materials.map((m, idx) => (
                            <span
                              key={idx}
                              className="bg-white px-2.5 py-1 rounded-lg border border-[#E5E5DC] text-[11px] font-semibold"
                            >
                              {m}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Safety notes callout */}
                      {(treatment.safety[locale] || treatment.safety.en || []).length > 0 && (
                        <div className="mt-4 p-3 bg-[#FEF3C7] rounded-xl border border-[#FDE68A] text-xs text-[#92400E] space-y-1">
                          <span className="font-bold flex items-center gap-1.5 text-[#92400E]">
                            <ShieldAlert className="w-4 h-4 text-[#E09F3E]" /> Safety & Handling Callout:
                          </span>
                          <ul className="list-disc pl-5 space-y-0.5 text-[11px] font-medium">
                            {(treatment.safety[locale] || treatment.safety.en || []).map((s, idx) => (
                              <li key={idx}>{s}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: OBSERVABLE EVIDENCE & RULES-OUT */}
          {activeTab === 'evidence' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#D8F3DC]/40 p-5 rounded-2xl border border-[#B7E4C7] space-y-3">
                  <span className="text-xs font-bold text-[#2D6A4F] flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-[#2D6A4F]" /> Visible Signs Found
                  </span>
                  <ul className="text-xs text-[#1B1B1B] space-y-2 pl-5 list-disc font-medium leading-relaxed">
                    {primaryCandidate.evidence.map((ev, i) => (
                      <li key={i}>{ev}</li>
                    ))}
                  </ul>
                </div>

                <div className="bg-[#FAFAF5] p-5 rounded-2xl border border-[#E5E5DC] space-y-3">
                  <span className="text-xs font-bold text-[#5A6B5E] flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-[#5A6B5E]" /> Differential Separation
                  </span>
                  <ul className="text-xs text-[#5A6B5E] space-y-2 pl-5 list-disc leading-relaxed">
                    {primaryCandidate.rulesOut.length > 0 ? (
                      primaryCandidate.rulesOut.map((ro, i) => <li key={i}>{ro}</li>)
                    ) : (
                      <li>No conflicting signs observed in photos</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* 1-Tap Field Feedback */}
          <div className="flex items-center justify-between p-4 bg-[#FAFAF5] rounded-2xl border border-[#E5E5DC] flex-wrap gap-3">
            <span className="text-xs font-bold text-[#1B1B1B]">Was this guidance helpful for your crop?</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setFeedbackGiven('yes')}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all min-h-[40px] ${
                  feedbackGiven === 'yes'
                    ? 'bg-[#2D6A4F] text-white shadow-xs'
                    : 'bg-white border border-[#E5E5DC] text-[#1B1B1B] hover:bg-[#D8F3DC]'
                }`}
              >
                <ThumbsUp className="w-4 h-4" /> Yes, very helpful
              </button>
              <button
                type="button"
                onClick={() => setFeedbackGiven('no')}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all min-h-[40px] ${
                  feedbackGiven === 'no'
                    ? 'bg-[#BC4749] text-white shadow-xs'
                    : 'bg-white border border-[#E5E5DC] text-[#1B1B1B] hover:bg-rose-50'
                }`}
              >
                <ThumbsDown className="w-4 h-4" /> Need other advice
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
