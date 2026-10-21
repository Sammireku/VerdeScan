// T-001 / T-003: Shared constants and Remote Config defaults (Sections 3 & 11)
export interface EvalGates {
  minTop1Accuracy: number;
  minTop3Accuracy: number;
  maxWrongConfidentRate: number;
  minNegativeCasePassRate: number;
  maxCalibrationError: number;
}

export const PHASE_1_GATES: EvalGates = {
  minTop1Accuracy: 0.75,
  minTop3Accuracy: 0.90,
  maxWrongConfidentRate: 0.05,
  minNegativeCasePassRate: 0.98,
  maxCalibrationError: 0.10,
};

export const REMOTE_CONFIG_DEFAULTS = {
  ai_model_diagnosis: 'gemini-1.5-flash',
  ai_model_fallback: 'gemini-1.5-flash-8b',
  ai_max_output_tokens: 1024,
  ai_temperature: 0.2,
  diag_free_monthly_limit: 20,
  diag_image_max_px: 1024,
  diag_min_confidence_answer: 0.55,
  diag_pipeline_mode: 'two_stage' as const,
  feature_outbreak_map: false,
  kb_version: 'v1.0.0',
};
