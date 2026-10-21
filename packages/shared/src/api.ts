// T-001 / T-003: API schemas and contracts
import { z } from 'zod';
import {
  CandidateSchema,
  DiagnosisContextSchema,
  FollowUpQuestionSchema,
  LocaleSchema,
  PlantPartSchema,
} from './models';

export { DiagnosisContextSchema } from './models';

export const CreateDiagnosisReq = z.object({
  clientRequestId: z.string().uuid(),
  imageParts: z.array(PlantPartSchema).min(1).max(4),
  context: DiagnosisContextSchema,
  locale: LocaleSchema,
});
export type CreateDiagnosisReq = z.infer<typeof CreateDiagnosisReq>;

export const CreateDiagnosisRes = z.object({
  diagnosisId: z.string(),
  uploadPaths: z.array(z.string()).min(1).max(4), // storage paths the client MUST upload to
  remainingThisMonth: z.number().int().nullable(), // null for unlimited plans
});
export type CreateDiagnosisRes = z.infer<typeof CreateDiagnosisRes>;

export const SubmitDiagnosisReq = z.object({
  diagnosisId: z.string(),
});
export type SubmitDiagnosisReq = z.infer<typeof SubmitDiagnosisReq>;

export const CandidateOut = CandidateSchema;
export type CandidateOut = z.infer<typeof CandidateOut>;

export const SubmitDiagnosisRes = z.object({
  diagnosisId: z.string(),
  status: z.enum(['complete', 'needs_info', 'failed', 'flagged']),
  candidates: z.array(CandidateOut).max(4),
  followUpQuestions: z.array(FollowUpQuestionSchema),
  treatmentIds: z.array(z.string()),
  safetyNotes: z.array(z.string()),
  disclaimerKey: z.literal('diagnosis.firstLineGuidance'),
});
export type SubmitDiagnosisRes = z.infer<typeof SubmitDiagnosisRes>;

export const AnswerFollowUpReq = z.object({
  diagnosisId: z.string(),
  answers: z.record(z.string(), z.string()).refine((a) => Object.keys(a).length > 0, {
    message: 'At least one follow-up answer must be provided',
  }),
});
export type AnswerFollowUpReq = z.infer<typeof AnswerFollowUpReq>;

export const FlagDiagnosisReq = z.object({
  diagnosisId: z.string(),
  reason: z.string().max(300).optional(),
});
export type FlagDiagnosisReq = z.infer<typeof FlagDiagnosisReq>;

export const SearchGuidesReq = z.object({
  query: z.string().min(2).max(200),
  locale: LocaleSchema,
  cropId: z.string().optional(),
  limit: z.number().int().min(1).max(20).default(10),
});
export type SearchGuidesReq = z.infer<typeof SearchGuidesReq>;

export const SetUserRoleReq = z.object({
  targetUid: z.string(),
  role: z.enum(['grower', 'extension', 'reviewer', 'admin']),
});
export type SetUserRoleReq = z.infer<typeof SetUserRoleReq>;

export const PublishKbVersionReq = z.object({
  version: z.string(),
});
export type PublishKbVersionReq = z.infer<typeof PublishKbVersionReq>;
