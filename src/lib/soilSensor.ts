// T-026: Soil Moisture Sensor Telemetry Parser & Proactive Notification Engine
import { type SoilSensorReading, type SoilMoistureAlert, type MoistureStatus } from '@verdescan/shared';
import { triggerHaptic } from './haptics';

const STORAGE_KEY = 'verdescan_soil_sensors';
const ALERTS_KEY = 'verdescan_moisture_alerts';

export const INITIAL_SENSOR_READINGS: SoilSensorReading[] = [
  {
    sensorId: 'SOIL-T01',
    cropId: 'tomato',
    cropName: 'Roma Plum Tomato',
    plotName: 'Plot A (Raised Bed)',
    vwcPercentage: 19.4, // Below 28% target -> Critical Low!
    minOptimalThreshold: 28,
    criticalThreshold: 22,
    soilTempC: 25.2,
    electricalConductivity: 1.3,
    batteryLevel: 94,
    lastUpdated: 'Just now',
    status: 'critical',
  },
  {
    sensorId: 'SOIL-P02',
    cropId: 'pepper',
    cropName: 'Habanero Hot Pepper',
    plotName: 'Plot B (Sun Terraces)',
    vwcPercentage: 36.8,
    minOptimalThreshold: 25,
    criticalThreshold: 18,
    soilTempC: 26.8,
    electricalConductivity: 1.1,
    batteryLevel: 88,
    lastUpdated: '12m ago',
    status: 'optimal',
  },
  {
    sensorId: 'SOIL-C03',
    cropId: 'sweetcorn',
    cropName: 'Sweetcorn F1',
    plotName: 'Plot C (Basin Rows)',
    vwcPercentage: 26.0, // Below 30% target -> Low Warning
    minOptimalThreshold: 30,
    criticalThreshold: 24,
    soilTempC: 24.5,
    electricalConductivity: 1.4,
    batteryLevel: 79,
    lastUpdated: '25m ago',
    status: 'low',
  },
  {
    sensorId: 'SOIL-M04',
    cropId: 'monstera',
    cropName: 'Monstera Deliciosa',
    plotName: 'Indoor Nursery Bench',
    vwcPercentage: 42.1,
    minOptimalThreshold: 35,
    criticalThreshold: 20,
    soilTempC: 22.0,
    electricalConductivity: 0.9,
    batteryLevel: 98,
    lastUpdated: '1h ago',
    status: 'optimal',
  },
];

// Helper to determine status based on thresholds
export function computeMoistureStatus(
  vwc: number,
  minOptimal: number,
  critical: number
): MoistureStatus {
  if (vwc <= critical) return 'critical';
  if (vwc < minOptimal) return 'low';
  return 'optimal';
}

// Parse Raw IoT Sensor Data (JSON or Key-Value or CSV strings)
export function parseRawSensorTelemetry(rawInput: string): SoilSensorReading | null {
  try {
    const trimmed = rawInput.trim();
    // 1. Try JSON
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      const data = JSON.parse(trimmed);
      const vwc = Number(data.vwc ?? data.moisture ?? data.vwcPercentage ?? 30);
      const minOptimal = Number(data.minOptimalThreshold ?? data.target ?? 28);
      const critical = Number(data.criticalThreshold ?? 20);

      return {
        sensorId: String(data.sensorId || data.id || `IOT-${Date.now().toString().slice(-4)}`),
        cropId: String(data.cropId || 'custom'),
        cropName: String(data.cropName || data.crop || 'Field Crop'),
        plotName: String(data.plotName || data.plot || 'Main Plot'),
        vwcPercentage: Math.max(0, Math.min(100, vwc)),
        minOptimalThreshold: minOptimal,
        criticalThreshold: critical,
        soilTempC: data.soilTempC ? Number(data.soilTempC) : 24,
        electricalConductivity: data.electricalConductivity ? Number(data.electricalConductivity) : 1.2,
        batteryLevel: data.batteryLevel ? Number(data.batteryLevel) : 90,
        lastUpdated: 'Just now',
        status: computeMoistureStatus(vwc, minOptimal, critical),
      };
    }

    // 2. Try CSV e.g. "SOIL-01,Tomato,Plot A,18.5,28,20"
    const parts = trimmed.split(',').map((p) => p.trim());
    if (parts.length >= 4) {
      const vwc = Number(parts[3]) || 25;
      const minOptimal = Number(parts[4]) || 28;
      const critical = Number(parts[5]) || 20;

      return {
        sensorId: parts[0] || `IOT-${Date.now().toString().slice(-4)}`,
        cropId: parts[1].toLowerCase(),
        cropName: parts[1],
        plotName: parts[2] || 'Plot',
        vwcPercentage: Math.max(0, Math.min(100, vwc)),
        minOptimalThreshold: minOptimal,
        criticalThreshold: critical,
        soilTempC: 24,
        batteryLevel: 90,
        lastUpdated: 'Just now',
        status: computeMoistureStatus(vwc, minOptimal, critical),
      };
    }
  } catch {
    return null;
  }
  return null;
}

// Request System Notification Permission
export async function requestPushNotificationPermission(): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const res = await Notification.requestPermission();
    return res === 'granted';
  }

  return false;
}

// Trigger Proactive Push Notification
export function fireProactiveMoisturePush(reading: SoilSensorReading) {
  if (typeof window === 'undefined') return;

  const title =
    reading.status === 'critical'
      ? `🚨 Critically Dry: ${reading.cropName}`
      : `⚠️ Low Moisture Alert: ${reading.cropName}`;

  const body = `${reading.plotName} is at ${reading.vwcPercentage}% VWC (Minimum required: ${reading.minOptimalThreshold}%). Tap to review drip irrigation recommendation.`;

  // 1. Tactile haptic buzz
  triggerHaptic(reading.status === 'critical' ? 'alert' : 'warning');

  // 2. Browser Push Notification
  if ('Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification(title, {
        body,
        icon: '/assets/aistudio/Gemini_Generated_Image_92mm3692mm3692mm_599f5aac.jpeg',
        tag: `soil-${reading.sensorId}`,
      });
    } catch {
      // Fallback in environments blocking Notification constructor
    }
  }
}

// Storage helpers
export function loadSavedSensorReadings(): SoilSensorReading[] {
  if (typeof window === 'undefined') return INITIAL_SENSOR_READINGS;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {
    // Fallback
  }
  return INITIAL_SENSOR_READINGS;
}

export function saveSensorReadings(readings: SoilSensorReading[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(readings));
  } catch {
    // Ignore
  }
}
