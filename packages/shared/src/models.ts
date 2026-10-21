// T-001 / T-003: Shared models and canonical data schemas
import { z } from 'zod';

export const LocaleSchema = z.enum(['en', 'tw', 'fr', 'ha', 'sw', 'es']);
export type Locale = z.infer<typeof LocaleSchema>;

export const ProblemCategorySchema = z.enum(['disease', 'pest', 'deficiency', 'stress']);
export type ProblemCategory = z.infer<typeof ProblemCategorySchema>;

export const PlantPartSchema = z.enum(['leaf', 'stem', 'fruit', 'flower', 'root', 'whole']);
export type PlantPart = z.infer<typeof PlantPartSchema>;

export const ExtendedPlantPartSchema = z.enum(['leaf', 'stem', 'fruit', 'flower', 'root', 'whole', 'unknown']);
export type ExtendedPlantPart = z.infer<typeof ExtendedPlantPartSchema>;

export const DiagnosisStatusSchema = z.enum([
  'pending_upload',
  'processing',
  'needs_info',
  'complete',
  'failed',
  'flagged',
]);
export type DiagnosisStatus = z.infer<typeof DiagnosisStatusSchema>;

export const TimestampSchema = z.union([
  z.string(),
  z.number(),
  z.object({
    seconds: z.number(),
    nanoseconds: z.number().optional(),
    toDate: z.function().optional(),
  }),
]);
export type Timestamp = z.infer<typeof TimestampSchema>;

export const UserRoleSchema = z.enum(['grower', 'extension', 'reviewer', 'admin']);
export type UserRole = z.infer<typeof UserRoleSchema>;

export const UserPlanSchema = z.enum(['free', 'plus', 'org']);
export type UserPlan = z.infer<typeof UserPlanSchema>;

export const UserProfileSchema = z.object({
  uid: z.string(),
  displayName: z.string().optional(),
  locale: LocaleSchema,
  country: z.string().length(2).optional(), // ISO 3166-1 alpha-2
  regionGeohash: z.string().max(4).optional(), // precision 4 max (about 20 km); never exact location
  crops: z.array(z.string()), // kb_crops ids
  role: UserRoleSchema,
  plan: UserPlanSchema,
  trainingConsent: z.boolean(), // opt-in use of photos for model improvement
  createdAt: TimestampSchema,
});
export type UserProfile = z.infer<typeof UserProfileSchema>;

export const PlantLocationSchema = z.enum(['bed', 'container', 'field', 'indoor', 'greenhouse']);
export type PlantLocation = z.infer<typeof PlantLocationSchema>;

export const SunExposureSchema = z.enum(['full', 'partial', 'shade']);
export type SunExposure = z.infer<typeof SunExposureSchema>;

export const PlantSchema = z.object({
  id: z.string(),
  cropId: z.string(), // kb_crops id
  nickname: z.string().optional(),
  plantedOn: TimestampSchema.optional(),
  location: PlantLocationSchema,
  sunExposure: SunExposureSchema.optional(),
  createdAt: TimestampSchema,
});
export type Plant = z.infer<typeof PlantSchema>;

export const DiagnosisImageSchema = z.object({
  storagePath: z.string(), // users/{uid}/diagnoses/{id}/{n}.jpg
  part: PlantPartSchema,
  widthPx: z.number(),
  heightPx: z.number(),
});
export type DiagnosisImage = z.infer<typeof DiagnosisImageSchema>;

export const DiagnosisContextSchema = z.object({
  cropId: z.string().optional(), // may be unknown; plant ID can fill it
  plantId: z.string().optional(),
  symptomsText: z.string().max(500).optional(),
  daysSinceSymptoms: z.number().int().min(0).max(365).optional(),
  recentWeather: z.enum(['dry', 'wet', 'hot', 'cold', 'mixed']).optional(),
  wateringFrequency: z.enum(['daily', 'weekly', 'rare']).optional(),
  recentFertilizer: z.boolean().optional(),
  followUpAnswers: z.record(z.string(), z.string()).optional(), // questionId -> answer
});
export type DiagnosisContext = z.infer<typeof DiagnosisContextSchema>;

export const CandidateSchema = z.object({
  problemId: z.string(), // kb_problems id; MUST exist in KB
  category: ProblemCategorySchema,
  confidence: z.number().min(0).max(1), // 0..1
  evidence: z.array(z.string()), // visible signs that support this candidate
  rulesOut: z.array(z.string()), // signs that would argue against it
});
export type Candidate = z.infer<typeof CandidateSchema>;

export const FollowUpQuestionSchema = z.object({
  id: z.string(),
  text: z.string().max(140),
  options: z.array(z.string().max(40)).max(5).optional(),
});
export type FollowUpQuestion = z.infer<typeof FollowUpQuestionSchema>;

export const UserFeedbackOutcomeSchema = z.enum(['resolved', 'improving', 'no_change', 'worse']);
export type UserFeedbackOutcome = z.infer<typeof UserFeedbackOutcomeSchema>;

export const DiagnosisSchema = z.object({
  id: z.string(),
  uid: z.string(),
  status: DiagnosisStatusSchema,
  images: z.array(DiagnosisImageSchema),
  context: DiagnosisContextSchema,
  candidates: z.array(CandidateSchema).max(4), // sorted by confidence desc; max 4
  topProblemId: z.string().optional(),
  followUpQuestions: z.array(FollowUpQuestionSchema),
  treatmentIds: z.array(z.string()), // kb_treatments ids
  safetyNotes: z.array(z.string()),
  modelId: z.string(), // value used from Remote Config
  kbVersion: z.string(),
  promptVersion: z.string(),
  latencyMs: z.number().optional(),
  userFeedback: z
    .object({
      helpful: z.boolean(),
      confirmedProblemId: z.string().optional(),
      outcome: UserFeedbackOutcomeSchema.optional(),
      at: TimestampSchema,
    })
    .optional(),
  createdAt: TimestampSchema,
  updatedAt: TimestampSchema,
});
export type Diagnosis = z.infer<typeof DiagnosisSchema>;

export const LocalizedStringSchema = z.record(LocaleSchema, z.string());
export type LocalizedString = z.infer<typeof LocalizedStringSchema>;

export const LocalizedStringListSchema = z.record(LocaleSchema, z.array(z.string()));
export type LocalizedStringList = z.infer<typeof LocalizedStringListSchema>;

export const KbProblemSchema = z.object({
  id: z.string(), // slug, e.g. tomato-early-blight
  category: ProblemCategorySchema,
  cropIds: z.array(z.string()), // crops it affects
  names: LocalizedStringSchema,
  summary: LocalizedStringSchema,
  symptoms: z.array(z.string()).min(3), // plain-language visible signs
  lookAlikes: z.array(z.string()), // problem ids easily confused with this one
  confirmSteps: z.array(z.string()).min(1), // how a grower can verify at home
  treatmentIds: z.array(z.string()).min(1),
  preventionIds: z.array(z.string()),
  referenceImages: z.array(z.string()), // storage paths, licence-cleared
  reviewedBy: z.string().optional(), // expert id
  reviewedAt: TimestampSchema.optional(),
  version: z.number(),
});
export type KbProblem = z.infer<typeof KbProblemSchema>;

export const TreatmentKindSchema = z.enum(['cultural', 'biological', 'organic_input', 'chemical']);
export type TreatmentKind = z.infer<typeof TreatmentKindSchema>;

export const CostTierSchema = z.enum(['free', 'low', 'medium', 'high']);
export type CostTier = z.infer<typeof CostTierSchema>;

export const KbTreatmentSchema = z.object({
  id: z.string(),
  kind: TreatmentKindSchema,
  title: LocalizedStringSchema,
  steps: LocalizedStringListSchema,
  materials: z.array(z.string()),
  costTier: CostTierSchema,
  safety: LocalizedStringListSchema,
  labelReferenceRequired: z.boolean(), // true for chemical kind
  reviewedBy: z.string(),
  version: z.number(),
});
export type KbTreatment = z.infer<typeof KbTreatmentSchema>;

export const GuideTopicSchema = z.enum([
  'propagation',
  'seed',
  'scrap_regrow',
  'compost',
  'water',
  'recycled_plastic',
  'season_extension',
  'companion',
  'soil',
]);
export type GuideTopic = z.infer<typeof GuideTopicSchema>;

export const GuideDifficultySchema = z.enum(['easy', 'medium', 'hard']);
export type GuideDifficulty = z.infer<typeof GuideDifficultySchema>;

export const KbGuideSchema = z.object({
  id: z.string(),
  topic: GuideTopicSchema,
  title: LocalizedStringSchema,
  body: LocalizedStringSchema, // markdown
  materials: z.array(z.string()),
  difficulty: GuideDifficultySchema,
  timeEstimate: z.string(),
  safetyNotes: LocalizedStringListSchema, // e.g. which plastic types are safe for food crops
  version: z.number(),
});
export type KbGuide = z.infer<typeof KbGuideSchema>;

export const KbChunkSchema = z.object({
  id: z.string(),
  sourceType: z.enum(['problem', 'treatment', 'guide']),
  sourceId: z.string(),
  locale: LocaleSchema,
  text: z.string(),
  embedding: z.array(z.number()), // stored as Firestore vector
  cropIds: z.array(z.string()),
});
export type KbChunk = z.infer<typeof KbChunkSchema>;

// Observation schema (Stage 1 Vision output)
export const ObservationSchema = z.object({
  imageQuality: z.object({
    usable: z.boolean(),
    issues: z.array(z.enum(['blurry', 'dark', 'overexposed', 'no_plant', 'too_far', 'other'])),
  }),
  plantPart: ExtendedPlantPartSchema,
  cropGuess: z.object({
    cropId: z.string().nullable(),
    confidence: z.number().min(0).max(1),
  }),
  symptoms: z
    .array(
      z.object({
        descriptor: z.string().max(120), // e.g. brown concentric rings on lower leaves
        location: z.string().max(60),
        extent: z.enum(['isolated', 'scattered', 'widespread']),
      }),
    )
    .max(8),
  organismsVisible: z
    .array(
      z.object({
        kind: z.enum(['insect', 'egg', 'larva', 'mite', 'web', 'fungal_growth', 'other']),
        description: z.string().max(100),
      }),
    )
    .max(5),
});
export type Observation = z.infer<typeof ObservationSchema>;

// Model reasoning output schema (Stage 2 Vision + Text output)
export const ModelOutputSchema = z.object({
  candidates: z
    .array(
      z.object({
        problemId: z.string(),
        category: ProblemCategorySchema,
        confidence: z.number().min(0).max(1),
        evidence: z.array(z.string().max(160)).min(1).max(4),
        rulesOut: z.array(z.string().max(160)).max(3),
      }),
    )
    .max(4),
  followUpQuestions: z
    .array(
      z.object({
        id: z.string(),
        text: z.string().max(140),
        options: z.array(z.string().max(40)).max(5).optional(),
      }),
    )
    .max(3),
});
export type ModelOutput = z.infer<typeof ModelOutputSchema>;
