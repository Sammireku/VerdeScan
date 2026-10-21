// T-010: Offline Queue Runner using Dexie IndexedDB (Section 8)
import { db, type QueuedDiagnosis, type CachedDiagnosis } from './db';
import { diagnosisPipeline } from '@verdescan/functions';
import type { SubmitDiagnosisRes } from '@verdescan/shared';

export type QueueStateListener = (queue: QueuedDiagnosis[]) => void;

export class OfflineQueueRunner {
  private isProcessing = false;
  private listeners: Set<QueueStateListener> = new Set();
  private maxItems = 20;

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.processQueue());
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          this.processQueue();
        }
      });
    }
  }

  subscribe(listener: QueueStateListener): () => void {
    this.listeners.add(listener);
    this.notify();
    return () => this.listeners.delete(listener);
  }

  private async notify() {
    const items = await db.queue.toArray();
    this.listeners.forEach((l) => l(items));
  }

  // Enqueue a new diagnosis request
  async enqueue(item: Omit<QueuedDiagnosis, 'attempts' | 'createdAt' | 'state'>): Promise<string> {
    const count = await db.queue.count();
    if (count >= this.maxItems) {
      throw new Error(`Queue storage limit reached (${this.maxItems} items max). Please connect to sync pending items.`);
    }

    const queuedItem: QueuedDiagnosis = {
      ...item,
      state: 'queued',
      attempts: 0,
      createdAt: Date.now(),
    };

    await db.queue.put(queuedItem);
    await this.notify();

    // Trigger process in background if online
    if (typeof navigator !== 'undefined' && navigator.onLine) {
      setTimeout(() => this.processQueue(), 50);
    }

    return queuedItem.id;
  }

  // Process queue sequentially
  async processQueue(): Promise<void> {
    if (this.isProcessing) return;
    if (typeof navigator !== 'undefined' && !navigator.onLine) return;

    this.isProcessing = true;

    try {
      const pendingItems = await db.queue
        .where('state')
        .notEqual('done')
        .and((item) => item.state !== 'error' || item.attempts < 5)
        .sortBy('createdAt');

      for (const item of pendingItems) {
        await this.processItem(item);
      }
    } finally {
      this.isProcessing = false;
      await this.notify();
    }
  }

  private async processItem(item: QueuedDiagnosis): Promise<void> {
    try {
      // 1. Creating phase: reserve diagnosisId
      if (item.state === 'queued' || item.state === 'creating') {
        await db.queue.update(item.id, { state: 'creating' });
        await this.notify();

        // Assign diagnosisId if not yet set
        if (!item.diagnosisId) {
          item.diagnosisId = `diag-${item.id.slice(0, 8)}`;
          await db.queue.update(item.id, { diagnosisId: item.diagnosisId });
        }
      }

      // 2. Uploading phase
      await db.queue.update(item.id, { state: 'uploading' });
      await this.notify();

      // Convert images to base64 for pipeline
      const imagesPayload = await Promise.all(
        item.images.map(async (img) => {
          const base64 = await this.blobToBase64(img.blob);
          return {
            part: img.part,
            base64,
            mimeType: 'image/jpeg',
          };
        })
      );

      // 3. Submitting phase: run pipeline orchestrator
      await db.queue.update(item.id, { state: 'submitting' });
      await this.notify();

      const result: SubmitDiagnosisRes = await diagnosisPipeline.runPipeline({
        diagnosisId: item.diagnosisId || item.id,
        images: imagesPayload,
        context: item.context,
        locale: item.locale,
        useAiMock: false, // attempts real Gemini API if key exists, otherwise gracefully mocks
      });

      // 4. Save to local History store
      const historyEntry: CachedDiagnosis = {
        id: result.diagnosisId,
        uid: 'current-user',
        status: result.status,
        images: item.images.map((img, i) => ({
          storagePath: `users/current-user/diagnoses/${result.diagnosisId}/${i + 1}.jpg`,
          part: img.part,
          widthPx: img.widthPx,
          heightPx: img.heightPx,
        })),
        context: item.context,
        candidates: result.candidates.map((c) => ({
          problemId: c.problemId,
          category: c.category,
          confidence: c.confidence,
          evidence: c.evidence,
          rulesOut: c.rulesOut,
        })),
        topProblemId: result.candidates[0]?.problemId,
        followUpQuestions: result.followUpQuestions,
        treatmentIds: result.treatmentIds,
        safetyNotes: result.safetyNotes,
        modelId: 'gemini-1.5-flash',
        kbVersion: 'v1.0.0',
        promptVersion: 'diag-v1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        cachedAt: Date.now(),
      };

      await db.history.put(historyEntry);

      // Mark done and delete from queue after success
      await db.queue.update(item.id, { state: 'done' });
      await db.queue.delete(item.id);
    } catch (err: unknown) {
      const attempts = (item.attempts || 0) + 1;
      const lastError = err instanceof Error ? err.message : 'Upload failed';

      await db.queue.update(item.id, {
        attempts,
        lastError,
        state: attempts >= 5 ? 'error' : 'queued',
      });
    }
  }

  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const str = reader.result as string;
        resolve(str.split(',')[1] || '');
      };
      reader.readAsDataURL(blob);
    });
  }

  async retryItem(id: string): Promise<void> {
    await db.queue.update(id, { state: 'queued', attempts: 0, lastError: undefined });
    await this.notify();
    this.processQueue();
  }

  async removeItem(id: string): Promise<void> {
    await db.queue.delete(id);
    await this.notify();
  }
}

export const queueRunner = new OfflineQueueRunner();
