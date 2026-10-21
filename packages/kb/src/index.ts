// T-012 / T-013 / T-021: KB Exports and retrieval helpers
export * from './content-data';
import { KB_PROBLEMS, KB_TREATMENTS, KB_GUIDES } from './content-data';
import type { KbProblem, KbTreatment, KbGuide } from '@verdescan/shared';

export function getProblemById(id: string): KbProblem | undefined {
  return KB_PROBLEMS.find((p) => p.id === id);
}

export function getTreatmentById(id: string): KbTreatment | undefined {
  return KB_TREATMENTS.find((t) => t.id === id);
}

export function getGuideById(id: string): KbGuide | undefined {
  return KB_GUIDES.find((g) => g.id === id);
}

export function searchProblemsByCrop(cropId?: string): KbProblem[] {
  if (!cropId) return KB_PROBLEMS;
  return KB_PROBLEMS.filter((p) => p.cropIds.includes(cropId));
}

export function searchKbText(query: string, cropId?: string): { problems: KbProblem[]; guides: KbGuide[] } {
  const q = query.toLowerCase().trim();
  const matchedProblems = KB_PROBLEMS.filter((p) => {
    if (cropId && !p.cropIds.includes(cropId)) return false;
    return (
      p.id.toLowerCase().includes(q) ||
      (p.names.en || '').toLowerCase().includes(q) ||
      (p.summary.en || '').toLowerCase().includes(q) ||
      p.symptoms.some((s) => s.toLowerCase().includes(q))
    );
  });

  const matchedGuides = KB_GUIDES.filter((g) => {
    return (
      (g.title.en || '').toLowerCase().includes(q) ||
      (g.body.en || '').toLowerCase().includes(q) ||
      g.topic.toLowerCase().includes(q)
    );
  });

  return { problems: matchedProblems, guides: matchedGuides };
}
