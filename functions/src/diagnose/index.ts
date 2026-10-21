// T-002 / T-003 / T-014: Diagnose orchestrator pipeline module
import {
  CreateDiagnosisReq,
  CreateDiagnosisRes,
  SubmitDiagnosisReq,
  SubmitDiagnosisRes,
  ObservationSchema,
  ModelOutputSchema,
  ERROR_CODES,
  REMOTE_CONFIG_DEFAULTS,
  type AppErrorCode,
  type Diagnosis,
  type ModelOutput,
  type Observation,
} from '@verdescan/shared';

export interface DiagnosisPipelineConfig {
  primaryModel: string;
  fallbackModel: string;
  temperature: number;
  maxOutputTokens: number;
  minConfidenceAnswer: number;
  pipelineMode: 'two_stage' | 'single';
}

export const defaultPipelineConfig: DiagnosisPipelineConfig = {
  primaryModel: REMOTE_CONFIG_DEFAULTS.ai_model_diagnosis,
  fallbackModel: REMOTE_CONFIG_DEFAULTS.ai_model_fallback,
  temperature: REMOTE_CONFIG_DEFAULTS.ai_temperature,
  maxOutputTokens: REMOTE_CONFIG_DEFAULTS.ai_max_output_tokens,
  minConfidenceAnswer: REMOTE_CONFIG_DEFAULTS.diag_min_confidence_answer,
  pipelineMode: REMOTE_CONFIG_DEFAULTS.diag_pipeline_mode,
};

export {
  CreateDiagnosisReq,
  CreateDiagnosisRes,
  SubmitDiagnosisReq,
  SubmitDiagnosisRes,
  ObservationSchema,
  ModelOutputSchema,
  ERROR_CODES,
  type AppErrorCode,
  type Diagnosis,
  type ModelOutput,
  type Observation,
};

export { diagnosisPipeline } from './pipeline';
