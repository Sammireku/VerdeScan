// T-001 / T-022: Evaluation Metrics definitions (Section 11)
export interface EvalMetrics {
  top1Accuracy: number;
  top3Accuracy: number;
  perCategoryRecall: {
    disease: number;
    pest: number;
    deficiency: number;
    stress: number;
  };
  abstainRate: number;
  wrongConfidentRate: number;
  negativeCasePassRate: number;
  calibrationError: number;
  p50LatencyMs: number;
  p95LatencyMs: number;
  costPerDiagnosisUsd: number;
}
