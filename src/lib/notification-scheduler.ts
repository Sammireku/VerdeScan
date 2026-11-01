// T-081: Local Notification Scheduler for Daily Morning Agronomy Tips
// Sends morning reminders based on user location, weather, and garden crops
import { getGardenPlants } from './garden';
import { selectCuratedFallbackTip, getCachedDailyTip, type AgronomyTip } from './agronomy-tips';
import { triggerHaptic } from './haptics';

export interface AgronomyReminderConfig {
  enabled: boolean;
  time: string; // 24-hr format "HH:MM", default "07:00"
  lastDeliveredDate?: string; // "YYYY-MM-DD"
  permissionState: NotificationPermission | 'unsupported';
}

const STORAGE_ENABLED_KEY = 'verdescan_agronomy_reminder_enabled';
const STORAGE_TIME_KEY = 'verdescan_agronomy_reminder_time';
const STORAGE_LAST_DATE_KEY = 'verdescan_agronomy_reminder_last_date';

const DEFAULT_REMINDER_TIME = '07:00';

/**
 * Check if the browser environment supports Notifications
 */
export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

/**
 * Get the current notification permission status safely
 */
export function getNotificationPermissionStatus(): NotificationPermission | 'unsupported' {
  if (!isNotificationSupported()) return 'unsupported';
  return Notification.permission;
}

/**
 * Request system notification permissions with user-gesture alignment
 */
export async function requestReminderNotificationPermission(): Promise<boolean> {
  if (!isNotificationSupported()) return false;

  try {
    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
  } catch (err) {
    console.warn('[NotificationScheduler] Permission request error:', err);
  }

  return false;
}

/**
 * Load the user's current agronomy reminder configuration
 */
export function getAgronomyReminderConfig(): AgronomyReminderConfig {
  if (typeof window === 'undefined' || !window.localStorage) {
    return {
      enabled: false,
      time: DEFAULT_REMINDER_TIME,
      permissionState: 'unsupported',
    };
  }

  const permissionState = getNotificationPermissionStatus();
  const rawEnabled = window.localStorage.getItem(STORAGE_ENABLED_KEY);
  const time = window.localStorage.getItem(STORAGE_TIME_KEY) || DEFAULT_REMINDER_TIME;
  const lastDeliveredDate = window.localStorage.getItem(STORAGE_LAST_DATE_KEY) || undefined;

  // By default, enable if permission is already granted, otherwise match saved preference (defaults to false)
  const enabled = rawEnabled !== null ? rawEnabled === 'true' : permissionState === 'granted';

  return {
    enabled,
    time,
    lastDeliveredDate,
    permissionState,
  };
}

/**
 * Save user's agronomy reminder configuration
 */
export function saveAgronomyReminderConfig(
  updates: Partial<Pick<AgronomyReminderConfig, 'enabled' | 'time' | 'lastDeliveredDate'>>
): AgronomyReminderConfig {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      if (updates.enabled !== undefined) {
        window.localStorage.setItem(STORAGE_ENABLED_KEY, String(updates.enabled));
      }
      if (updates.time !== undefined) {
        window.localStorage.setItem(STORAGE_TIME_KEY, updates.time);
      }
      if (updates.lastDeliveredDate !== undefined) {
        window.localStorage.setItem(STORAGE_LAST_DATE_KEY, updates.lastDeliveredDate);
      }
    } catch {
      // Storage quota or restriction
    }
  }

  return getAgronomyReminderConfig();
}

/**
 * Formats notification content tailored to the user's crops, location, and tip
 */
export function buildMorningReminderPayload(tip: AgronomyTip, location: string, cropNames: string[]) {
  const cropHighlight = cropNames.length > 0 ? ` (${cropNames.slice(0, 2).join(', ')})` : '';
  const title = `🌅 Morning Agronomy Tip: ${tip.headline}`;
  const body = `${location}${cropHighlight} • ${tip.actionableStep} Tap to open extension guide.`;

  return {
    title,
    body,
    tag: `agronomy-morning-tip-${new Date().toISOString().split('T')[0]}`,
    icon: '/assets/aistudio/Gemini_Generated_Image_92mm3692mm3692mm_599f5aac.jpeg',
    badge: '/assets/aistudio/Gemini_Generated_Image_92mm3692mm3692mm_599f5aac.jpeg',
    data: {
      url: '/?tab=home',
      tipId: tip.id,
    },
  };
}

/**
 * Sends a native browser or service worker notification
 */
export async function dispatchNativeNotification(payload: {
  title: string;
  body: string;
  tag?: string;
  icon?: string;
  badge?: string;
  data?: Record<string, unknown>;
}): Promise<boolean> {
  if (typeof window === 'undefined') return false;

  triggerHaptic('success');

  // Try Service Worker registration first if available
  if ('serviceWorker' in navigator) {
    try {
      const reg = await navigator.serviceWorker.getRegistration();
      if (reg && reg.showNotification) {
        await reg.showNotification(payload.title, {
          body: payload.body,
          tag: payload.tag,
          icon: payload.icon,
          badge: payload.badge,
          data: payload.data,
        });
        return true;
      }
    } catch (err) {
      console.warn('[NotificationScheduler] ServiceWorker notification failed, using Notification constructor:', err);
    }
  }

  // Fallback to standard web Notification constructor
  if ('Notification' in window && Notification.permission === 'granted') {
    try {
      const notif = new Notification(payload.title, {
        body: payload.body,
        tag: payload.tag,
        icon: payload.icon,
        data: payload.data,
      });

      notif.onclick = () => {
        window.focus();
        notif.close();
      };
      return true;
    } catch (err) {
      console.warn('[NotificationScheduler] Native Notification failed:', err);
    }
  }

  return false;
}

/**
 * Evaluates whether it's time to trigger today's scheduled morning reminder
 */
export async function checkAndTriggerScheduledReminder(): Promise<boolean> {
  const config = getAgronomyReminderConfig();
  if (!config.enabled || config.permissionState !== 'granted') {
    return false;
  }

  const now = new Date();
  const todayDateStr = now.toISOString().split('T')[0];

  // Already sent today?
  if (config.lastDeliveredDate === todayDateStr) {
    return false;
  }

  // Parse scheduled time (e.g. "07:00")
  const [targetHour, targetMin] = config.time.split(':').map((v) => parseInt(v, 10) || 0);
  const currentHour = now.getHours();
  const currentMin = now.getMinutes();

  const isAtOrPastScheduledTime =
    currentHour > targetHour || (currentHour === targetHour && currentMin >= targetMin);

  if (!isAtOrPastScheduledTime) {
    return false;
  }

  // Gather user context: crops, location, weather
  let location = 'Local Farm & Garden';
  let cropNames: string[] = [];
  let temp: number | undefined;
  let condition: string | undefined;

  try {
    const plants = await getGardenPlants();
    cropNames = plants.map((p) => p.name || p.cropId).filter(Boolean);
    const farmLoc = localStorage.getItem('verdescan_farm_location');
    if (farmLoc) location = farmLoc;

    const cachedWeather = localStorage.getItem('verdescan_cached_weather');
    if (cachedWeather) {
      const parsed = JSON.parse(cachedWeather);
      temp = parsed.temp;
      condition = parsed.condition;
    }
  } catch {
    // Graceful fallback
  }

  // Select today's tip (either cached or contextual curated tip)
  const tip =
    getCachedDailyTip() ||
    selectCuratedFallbackTip({
      location,
      temperature: temp,
      condition,
      cropNames,
    });

  const payload = buildMorningReminderPayload(tip, location, cropNames);
  const delivered = await dispatchNativeNotification(payload);

  if (delivered) {
    saveAgronomyReminderConfig({ lastDeliveredDate: todayDateStr });
    console.info(`[NotificationScheduler] Delivered morning agronomy reminder for ${todayDateStr}`);
    return true;
  }

  return false;
}

/**
 * Immediate Test Notification Action for growers to preview
 */
export async function triggerTestReminderNotification(): Promise<{ success: boolean; message: string }> {
  if (!isNotificationSupported()) {
    return {
      success: false,
      message: 'Browser notifications are not supported on this device or iframe.',
    };
  }

  let permission = Notification.permission;
  if (permission !== 'granted') {
    const granted = await requestReminderNotificationPermission();
    if (!granted) {
      return {
        success: false,
        message: 'Notification permission was denied. Please allow notifications in browser settings.',
      };
    }
    permission = 'granted';
  }

  // Gather user context
  let location = 'Local Farm & Garden';
  let cropNames: string[] = [];
  try {
    const plants = await getGardenPlants();
    cropNames = plants.map((p) => p.name || p.cropId).filter(Boolean);
    const farmLoc = localStorage.getItem('verdescan_farm_location');
    if (farmLoc) location = farmLoc;
  } catch {
    // Fallback
  }

  const tip =
    getCachedDailyTip() ||
    selectCuratedFallbackTip({
      location,
      cropNames,
    });

  const payload = buildMorningReminderPayload(tip, location, cropNames);
  const delivered = await dispatchNativeNotification(payload);

  if (delivered) {
    return {
      success: true,
      message: 'Morning reminder sent! Check your device notifications.',
    };
  }

  return {
    success: false,
    message: 'Could not display system notification in current window context.',
  };
}

/**
 * Runs the active scheduler loop in the app
 * Checks on startup and every 60 seconds
 */
export function startReminderScheduler(): () => void {
  if (typeof window === 'undefined') return () => {};

  // Check immediately upon startup
  checkAndTriggerScheduledReminder().catch(() => {});

  // Run periodic 60-second heartbeat check
  const intervalId = window.setInterval(() => {
    checkAndTriggerScheduledReminder().catch(() => {});
  }, 60 * 1000);

  return () => {
    window.clearInterval(intervalId);
  };
}
