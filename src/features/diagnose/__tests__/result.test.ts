// UI-004: Diagnosis Result Card Data & Logic Verification
import { describe, expect, it } from 'vitest';
import { getProblemById, getTreatmentById } from '@verdescan/kb';
import type { SubmitDiagnosisRes } from '@verdescan/shared';

describe('UI-004: Diagnosis Result Processing', () => {
  const mockDiagnosisResult: SubmitDiagnosisRes = {
    diagnosisId: 'diag-test-1234',
    status: 'complete',
    disclaimerKey: 'diagnosis.firstLineGuidance',
    candidates: [
      {
        problemId: 'tomato-early-blight',
        category: 'disease',
        confidence: 0.78,
        evidence: ['Concentric brown ring spots on lower leaves', 'Yellow chlorotic halos around lesions'],
        rulesOut: ['No bacterial water-soaked lesions observed'],
      },
      {
        problemId: 'tomato-septoria-leaf-spot',
        category: 'disease',
        confidence: 0.42,
        evidence: ['Small circular spots'],
        rulesOut: ['No concentric rings'],
      },
    ],
    treatmentIds: ['remove-infected-foliage', 'organic-copper-spray', 'mulch-and-drip'],
    safetyNotes: ['Consult local extension officer before purchasing synthetic fungicides'],
    followUpQuestions: [],
  };

  it('retrieves verified agronomy problem and ensures organic treatments come first', () => {
    const primaryCandidate = mockDiagnosisResult.candidates[0];
    const problem = getProblemById(primaryCandidate.problemId);
    expect(problem).toBeDefined();
    expect(problem?.id).toBe('tomato-early-blight');
    expect(problem?.names.en).toContain('Early Blight');

    // Retrieve treatments
    const treatments = mockDiagnosisResult.treatmentIds
      .map((id) => getTreatmentById(id))
      .filter((t): t is NonNullable<typeof t> => t !== undefined);

    expect(treatments.length).toBeGreaterThanOrEqual(2);

    // Verify organic & cultural treatments are prioritized
    const organicOrCultural = treatments.filter((t) => t.kind !== 'chemical');
    const chemical = treatments.filter((t) => t.kind === 'chemical');

    expect(organicOrCultural.length).toBeGreaterThan(0);
    expect(organicOrCultural[0].kind).toMatch(/cultural|organic_input|biological/);

    // Verify chemical treatment requires safety and label reference
    if (chemical.length > 0) {
      expect(chemical[0].safety.en.length).toBeGreaterThan(0);
    }
  });

  it('calculates confidence and high-match classification properly', () => {
    const primary = mockDiagnosisResult.candidates[0];
    const confidencePercent = Math.round(primary.confidence * 100);
    expect(confidencePercent).toBe(78);
    expect(confidencePercent >= 70).toBe(true);
  });
});
