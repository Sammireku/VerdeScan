// T-003: Comprehensive API Contracts & Error Codes Unit Tests (Section 6)
import { describe, expect, it } from 'vitest';
import {
  CreateDiagnosisReq,
  CreateDiagnosisRes,
  SubmitDiagnosisReq,
  SubmitDiagnosisRes,
  AnswerFollowUpReq,
  SearchGuidesReq,
  ERROR_CODES,
  ERROR_DEFINITIONS,
  type AppErrorCode,
} from '../index';

describe('T-003: API Contracts & Error Codes Tests (Section 6)', () => {
  it('validates CreateDiagnosisReq valid and invalid edge cases', () => {
    // Valid
    const valid = {
      clientRequestId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
      imageParts: ['leaf', 'fruit'],
      context: {
        cropId: 'pepper',
        symptomsText: 'Anthracnose lesions on pepper fruit',
        wateringFrequency: 'weekly',
        recentWeather: 'wet',
      },
      locale: 'en',
    };
    expect(CreateDiagnosisReq.safeParse(valid).success).toBe(true);

    // Invalid: empty image parts
    expect(CreateDiagnosisReq.safeParse({ ...valid, imageParts: [] }).success).toBe(false);

    // Invalid: unknown locale
    expect(CreateDiagnosisReq.safeParse({ ...valid, locale: 'de' }).success).toBe(false);
  });

  it('validates CreateDiagnosisRes contract', () => {
    const valid = {
      diagnosisId: 'diag-456',
      uploadPaths: [
        'users/user-1/diagnoses/diag-456/1.jpg',
        'users/user-1/diagnoses/diag-456/2.jpg',
      ],
      remainingThisMonth: 19,
    };
    expect(CreateDiagnosisRes.safeParse(valid).success).toBe(true);

    const validUnlimited = {
      ...valid,
      remainingThisMonth: null, // unlimited plan
    };
    expect(CreateDiagnosisRes.safeParse(validUnlimited).success).toBe(true);
  });

  it('validates SubmitDiagnosisReq and SubmitDiagnosisRes', () => {
    const req = { diagnosisId: 'diag-456' };
    expect(SubmitDiagnosisReq.safeParse(req).success).toBe(true);

    const validRes = {
      diagnosisId: 'diag-456',
      status: 'complete',
      candidates: [
        {
          problemId: 'tomato-early-blight',
          category: 'disease',
          confidence: 0.88,
          evidence: ['Target-like spots with concentric rings'],
          rulesOut: ['No sign of late blight water-soaked spots'],
        },
      ],
      followUpQuestions: [],
      treatmentIds: ['remove-infected-leaves', 'neem-oil-spray'],
      safetyNotes: ['safety.followProductLabel'],
      disclaimerKey: 'diagnosis.firstLineGuidance',
    };
    expect(SubmitDiagnosisRes.safeParse(validRes).success).toBe(true);

    // Reject invalid disclaimer key
    const invalidDisclaimer = {
      ...validRes,
      disclaimerKey: 'wrong.key',
    };
    expect(SubmitDiagnosisRes.safeParse(invalidDisclaimer).success).toBe(false);
  });

  it('validates AnswerFollowUpReq requires at least one answer', () => {
    const valid = {
      diagnosisId: 'diag-456',
      answers: {
        'q-spots-underside': 'yes',
      },
    };
    expect(AnswerFollowUpReq.safeParse(valid).success).toBe(true);

    const emptyAnswers = {
      diagnosisId: 'diag-456',
      answers: {},
    };
    expect(AnswerFollowUpReq.safeParse(emptyAnswers).success).toBe(false);
  });

  it('validates SearchGuidesReq limits and constraints', () => {
    const valid = {
      query: 'compost methods',
      locale: 'en',
      limit: 10,
    };
    expect(SearchGuidesReq.safeParse(valid).success).toBe(true);

    // Query too short (< 2 chars)
    expect(SearchGuidesReq.safeParse({ ...valid, query: 'a' }).success).toBe(false);

    // Limit exceeds max (20)
    expect(SearchGuidesReq.safeParse({ ...valid, limit: 25 }).success).toBe(false);
  });

  it('verifies all 10 error codes exist and match specification definitions', () => {
    const expectedCodes: AppErrorCode[] = [
      'AUTH_REQUIRED',
      'LIMIT_REACHED',
      'INVALID_INPUT',
      'IMAGES_MISSING',
      'IMAGE_INVALID',
      'IMAGE_HAS_GPS',
      'IMAGE_LOW_QUALITY',
      'MODEL_UNAVAILABLE',
      'KB_EMPTY',
      'INTERNAL',
    ];

    expectedCodes.forEach((code) => {
      expect(ERROR_CODES[code]).toBe(code);
      const def = ERROR_DEFINITIONS[code];
      expect(def).toBeDefined();
      expect(def.detailsCode).toBe(code);
      expect(def.firebaseCode).toBeDefined();
      expect(def.when).toBeDefined();
      expect(def.clientBehaviour).toBeDefined();
    });
  });
});
