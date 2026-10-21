// T-014 / T-015: Pipeline Decision Logic & Safety Unit Tests
import { describe, expect, it } from 'vitest';
import { diagnosisPipeline } from '../diagnose/pipeline';

describe('T-015: Section 7 Decision Logic & Safety Tests', () => {
  it('drops unknown problemId not present in KB shortlist', async () => {
    const res = await diagnosisPipeline.runPipeline({
      diagnosisId: 'test-drop-unknown',
      images: [{ part: 'leaf' }],
      context: {
        cropId: 'tomato',
        symptomsText: 'Concentric brown rings',
      },
      useAiMock: true,
    });

    // Verify all candidates are strictly in KB
    for (const c of res.candidates) {
      expect(['tomato-early-blight', 'tomato-septoria-leaf-spot', 'aphids-general']).toContain(c.problemId);
    }
  });

  it('sets status to needs_info when candidate list is empty', async () => {
    // Pipeline with non-existent crop and empty match
    const res = await diagnosisPipeline.runPipeline({
      diagnosisId: 'test-empty-candidate',
      images: [{ part: 'leaf' }],
      context: {
        cropId: 'unknown-alien-crop',
      },
      useAiMock: true,
    });

    expect(res.status).toBe('needs_info');
    expect(res.followUpQuestions.length).toBeGreaterThan(0);
  });

  it('attaches KB treatments without model-invented treatment text', async () => {
    const res = await diagnosisPipeline.runPipeline({
      diagnosisId: 'test-treatments',
      images: [{ part: 'leaf' }],
      context: {
        cropId: 'tomato',
        symptomsText: 'Brown spots with concentric rings',
      },
      useAiMock: true,
    });

    expect(res.treatmentIds.length).toBeGreaterThan(0);
    expect(res.treatmentIds).toContain('remove-infected-foliage');
    // Verifies disclaimer key
    expect(res.disclaimerKey).toBe('diagnosis.firstLineGuidance');
  });

  it('includes safety.followProductLabel when chemical treatments are attached', async () => {
    const res = await diagnosisPipeline.runPipeline({
      diagnosisId: 'test-chemical-safety',
      images: [{ part: 'leaf' }],
      context: {
        cropId: 'tomato',
        symptomsText: 'Early blight target rings on foliage',
      },
      useAiMock: true,
    });

    // Early blight has copper-based-fungicide which is chemical with labelReferenceRequired: true
    expect(res.safetyNotes).toContain('safety.followProductLabel');
  });
});
