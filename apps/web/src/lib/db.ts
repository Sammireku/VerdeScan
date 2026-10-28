// T-001 / T-010: IndexedDB stores via Dexie (Section 8)
import Dexie, { type Table } from 'dexie';
import type {
  Diagnosis,
  DiagnosisContext,
  Locale,
  PlantPart,
} from '@verdescan/shared';

export interface QueuedDiagnosis {
  id: string; // equals clientRequestId (uuid)
  state: 'queued' | 'creating' | 'uploading' | 'submitting' | 'done' | 'error';
  images: { part: PlantPart; blob: Blob; widthPx: number; heightPx: number }[];
  context: DiagnosisContext;
  locale: Locale;
  diagnosisId?: string; // set after createDiagnosis succeeds
  attempts: number;
  lastError?: string;
  createdAt: number; // epoch ms
}

export interface CachedDiagnosis extends Diagnosis {
  cachedAt: number;
}

export interface Bookmark {
  id: string;
  kind: 'guide' | 'problem';
  createdAt: number;
}

export class LocalDB extends Dexie {
  queue!: Table<QueuedDiagnosis, string>;
  history!: Table<CachedDiagnosis, string>;
  bookmarks!: Table<Bookmark, string>;
  meta!: Table<{ key: string; value: unknown }, string>;
  plants!: Table<Plant, string>;

  constructor() {
    super('verdescan');
    this.version(1).stores({
      queue: 'id, state, createdAt',
      history: 'id, createdAt, topProblemId',
      bookmarks: 'id, kind, createdAt',
      meta: 'key',
    });
    this.version(2).stores({
      plants: 'id, cropId, createdAt',
    });
  }
}

export const db = new LocalDB();
