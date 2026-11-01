// T-081: Unit Tests for Local Notification Scheduler
import { describe, expect, it } from 'vitest';
import {
  buildMorningReminderPayload,
  getAgronomyReminderConfig,
  saveAgronomyReminderConfig,
  type AgronomyReminderConfig,
} from '../notification-scheduler';
import { CURATED_AGRONOMY_TIPS } from '../agronomy-tips';

describe('Local Notification Scheduler', () => {
  it('formats morning reminder payload with crop and location context', () => {
    const tip = CURATED_AGRONOMY_TIPS[0];
    const payload = buildMorningReminderPayload(tip, 'Sacramento Valley Farm', ['Tomato', 'Habanero Pepper']);

    expect(payload.title).toContain('Morning Agronomy Tip');
    expect(payload.title).toContain(tip.headline);
    expect(payload.body).toContain('Sacramento Valley Farm');
    expect(payload.body).toContain('Tomato, Habanero Pepper');
    expect(payload.body).toContain(tip.actionableStep);
    expect(payload.tag).toContain('agronomy-morning-tip');
  });

  it('manages reminder configuration persistence in localStorage', () => {
    const store: Record<string, string> = {};
    const mockStorage = {
      getItem: (k: string) => store[k] || null,
      setItem: (k: string, v: string) => {
        store[k] = v;
      },
      removeItem: (k: string) => {
        delete store[k];
      },
    };

    const origWindow = (globalThis as { window?: unknown }).window;
    (globalThis as { window?: unknown }).window = { localStorage: mockStorage };

    try {
      const initial = getAgronomyReminderConfig();
      expect(initial.time).toBe('07:00');

      const updated = saveAgronomyReminderConfig({
        enabled: true,
        time: '06:30',
        lastDeliveredDate: '2026-10-31',
      });

      expect(updated.enabled).toBe(true);
      expect(updated.time).toBe('06:30');
      expect(updated.lastDeliveredDate).toBe('2026-10-31');

      const reloaded = getAgronomyReminderConfig();
      expect(reloaded.enabled).toBe(true);
      expect(reloaded.time).toBe('06:30');
      expect(reloaded.lastDeliveredDate).toBe('2026-10-31');
    } finally {
      (globalThis as { window?: unknown }).window = origWindow;
    }
  });
});
