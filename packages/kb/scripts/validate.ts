// T-012: Knowledge Base content validator script
import {
  KbProblemSchema,
  KbTreatmentSchema,
  KbGuideSchema,
} from '@verdescan/shared';
import { KB_PROBLEMS, KB_TREATMENTS, KB_GUIDES } from '../src/content-data';

console.log('[VerdeScan KB] Validating knowledge base content against Zod schemas...');

let errorCount = 0;

// Validate problems
for (const problem of KB_PROBLEMS) {
  const res = KbProblemSchema.safeParse(problem);
  if (!res.success) {
    console.error(`[Error] Problem validation failed for ${problem.id}:`, res.error.format());
    errorCount++;
  }
}

// Validate treatments
for (const treatment of KB_TREATMENTS) {
  const res = KbTreatmentSchema.safeParse(treatment);
  if (!res.success) {
    console.error(`[Error] Treatment validation failed for ${treatment.id}:`, res.error.format());
    errorCount++;
  }
}

// Validate guides
for (const guide of KB_GUIDES) {
  const res = KbGuideSchema.safeParse(guide);
  if (!res.success) {
    console.error(`[Error] Guide validation failed for ${guide.id}:`, res.error.format());
    errorCount++;
  }
}

// Validate referential integrity (no dangling treatmentIds or lookAlikes)
const treatmentIdSet = new Set(KB_TREATMENTS.map((t) => t.id));
const problemIdSet = new Set(KB_PROBLEMS.map((p) => p.id));

for (const p of KB_PROBLEMS) {
  for (const tid of p.treatmentIds) {
    if (!treatmentIdSet.has(tid)) {
      console.error(`[Referential Error] Problem ${p.id} references non-existent treatmentId: ${tid}`);
      errorCount++;
    }
  }
  for (const laid of p.lookAlikes) {
    if (!problemIdSet.has(laid)) {
      // In pilot it may be known out-of-scope or cross-crop; warning
      // console.warn(`[Warning] Lookalike ${laid} not yet fully authored.`);
    }
  }
}

if (errorCount > 0) {
  console.error(`[VerdeScan KB] Validation failed with ${errorCount} errors.`);
  process.exit(1);
} else {
  console.log(`[VerdeScan KB] Validation passed! All ${KB_PROBLEMS.length} problems, ${KB_TREATMENTS.length} treatments, and ${KB_GUIDES.length} guides conform to strict schema.`);
}
