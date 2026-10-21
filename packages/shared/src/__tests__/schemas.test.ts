// T-001: Schema validation unit tests
import { describe, expect, it } from 'vitest';
import {
  CreateDiagnosisReq,
  DiagnosisContextSchema,
  ModelOutputSchema,
  ObservationSchema,
  UserProfileSchema,
} from '../index';

describe('Shared Schemas Validation (T-001 / T-003)', () => {
  it('validates a correct CreateDiagnosisReq', () => {
    const validPayload = {
      clientRequestId: '123e4567-e89b-12d3-a456-426614174000',
      imageParts: ['leaf', 'stem'],
      context: {
        cropId: 'tomato',
        symptomsText: 'Yellowing lower leaves with black spots',
        daysSinceSymptoms: 3,
        recentWeather: 'wet',
      },
      locale: 'en',
    };
    const parsed = CreateDiagnosisReq.safeParse(validPayload);
    expect(parsed.success).toBe(true);
  });

  it('rejects invalid clientRequestId (non-uuid) in CreateDiagnosisReq', () => {
    const invalidPayload = {
      clientRequestId: 'invalid-id-not-uuid',
      imageParts: ['leaf'],
      context: {},
      locale: 'en',
    };
    const parsed = CreateDiagnosisReq.safeParse(invalidPayload);
    expect(parsed.success).toBe(false);
  });

  it('rejects more than 4 images in CreateDiagnosisReq', () => {
    const invalidPayload = {
      clientRequestId: '123e4567-e89b-12d3-a456-426614174000',
      imageParts: ['leaf', 'stem', 'fruit', 'root', 'flower'],
      context: {},
      locale: 'en',
    };
    const parsed = CreateDiagnosisReq.safeParse(invalidPayload);
    expect(parsed.success).toBe(false);
  });

  it('validates DiagnosisContextSchema constraints', () => {
    const validContext = {
      cropId: 'pepper',
      symptomsText: 'Spots on leaves',
      daysSinceSymptoms: 5,
      recentWeather: 'hot',
      wateringFrequency: 'daily',
      recentFertilizer: true,
    };
    expect(DiagnosisContextSchema.safeParse(validContext).success).toBe(true);

    const contextWithTooLongSymptoms = {
      symptomsText: 'x'.repeat(501),
    };
    expect(DiagnosisContextSchema.safeParse(contextWithTooLongSymptoms).success).toBe(false);
  });

  it('validates Stage 1 ObservationSchema', () => {
    const validObservation = {
      imageQuality: { usable: true, issues: [] },
      plantPart: 'leaf',
      cropGuess: { cropId: 'tomato', confidence: 0.92 },
      symptoms: [
        {
          descriptor: 'Brown concentric rings on lower leaves',
          location: 'lower leaves',
          extent: 'scattered',
        },
      ],
      organismsVisible: [],
    };
    expect(ObservationSchema.safeParse(validObservation).success).toBe(true);
  });

  it('validates Stage 2 ModelOutputSchema', () => {
    const validModelOutput = {
      candidates: [
        {
          problemId: 'tomato-early-blight',
          category: 'disease',
          confidence: 0.88,
          evidence: ['Concentric dark spots on leaves', 'Surrounding yellow halo'],
          rulesOut: ['No white fuzzy mold typical of late blight'],
        },
      ],
      followUpQuestions: [],
    };
    expect(ModelOutputSchema.safeParse(validModelOutput).success).toBe(true);
  });

  it('validates UserProfileSchema', () => {
    const validProfile = {
      uid: 'user-abc',
      locale: 'en',
      crops: ['tomato', 'pepper'],
      role: 'grower',
      plan: 'free',
      trainingConsent: false,
      createdAt: new Date().toISOString(),
    };
    expect(UserProfileSchema.safeParse(validProfile).success).toBe(true);
  });
});
