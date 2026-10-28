// T-026: Soil Moisture Sensor Telemetry Parser & Proactive Notification Component
import React, { useState, useEffect } from 'react';
import {
  Droplets,
  AlertTriangle,
  Bell,
  BellRing,
  Plus,
  RefreshCw,
  Cpu,
  CheckCircle2,
  Sliders,
  ChevronDown,
  ChevronUp,
  X,
  Send,
} from 'lucide-react';
import { type SoilSensorReading } from '@verdescan/shared';
import {
  INITIAL_SENSOR_READINGS,
  loadSavedSensorReadings,
  saveSensorReadings,
  parseRawSensorTelemetry,
  requestPushNotificationPermission,
  fireProactiveMoisturePush,
} from '../../lib/soilSensor';
import { triggerHaptic } from '../../lib/haptics';

interface SoilMoistureMonitorProps {
  onOpenWateringGuide?: () => void;
  isSunlightMode?: boolean;
}

export function SoilMoistureMonitor({
  onOpenWateringGuide,
  isSunlightMode = false,
}: SoilMoistureMonitorProps) {
  const [readings, setReadings] = useState<SoilSensorReading[]>(loadSavedSensorReadings);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [isTelemetryModalOpen, setIsTelemetryModalOpen] = useState(false);
  const [rawPayload, setRawPayload] = useState('');
  const [parseError, setParseError] = useState<string | null>(null);
  const [parseSuccess, setParseSuccess] = useState<string | null>(null);
  const [activeAlertDismissed, setActiveAlertDismissed] = useState(false);

  // Check notification permission
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPushEnabled(Notification.permission === 'granted');
    }
  }, []);

  // Save changes
  useEffect(() => {
    saveSensorReadings(readings);
  }, [readings]);

  // Find any plant whose moisture falls below min threshold
  const criticalCrops = readings.filter(
    (r) => r.vwcPercentage < r.minOptimalThreshold
  );

  // Trigger proactive push if a new critical reading arrives
  const handleEnablePush = async () => {
    triggerHaptic('tap');
    const granted = await requestPushNotificationPermission();
    setPushEnabled(granted);
    if (granted && criticalCrops.length > 0) {
      fireProactiveMoisturePush(criticalCrops[0]);
    }
  };

  // Simulate Irrigation event for a specific sensor (+16% VWC)
  const handleIrrigate = (sensorId: string) => {
    triggerHaptic('success');
    setReadings((prev) =>
      prev.map((r) => {
        if (r.sensorId === sensorId) {
          const newVwc = Math.min(65, Number((r.vwcPercentage + 16).toFixed(1)));
          return {
            ...r,
            vwcPercentage: newVwc,
            lastUpdated: 'Just now (Irrigated)',
            status: newVwc >= r.minOptimalThreshold ? 'optimal' : 'adequate',
          };
        }
        return r;
      })
    );
  };

  // Parse raw IoT telemetry payload (e.g. from LoRaWAN, BLE, or sensor clipboard)
  const handleParseTelemetry = (e: React.FormEvent) => {
    e.preventDefault();
    setParseError(null);
    setParseSuccess(null);

    const parsed = parseRawSensorTelemetry(rawPayload);
    if (!parsed) {
      setParseError('Invalid sensor format. Provide JSON {"sensorId":"S1","cropName":"Tomato","vwc":18.5} or CSV "S1,Tomato,Plot A,18.5,28,20"');
      triggerHaptic('warning');
      return;
    }

    triggerHaptic('success');
    setReadings((prev) => {
      const existingIdx = prev.findIndex((r) => r.sensorId === parsed.sensorId);
      if (existingIdx >= 0) {
        const copy = [...prev];
        copy[existingIdx] = parsed;
        return copy;
      }
      return [parsed, ...prev];
    });

    if (parsed.vwcPercentage < parsed.minOptimalThreshold) {
      fireProactiveMoisturePush(parsed);
    }

    setParseSuccess(`✓ Sensor "${parsed.sensorId}" parsed: ${parsed.vwcPercentage}% VWC for ${parsed.cropName}`);
    setRawPayload('');
    setTimeout(() => {
      setIsTelemetryModalOpen(false);
      setParseSuccess(null);
    }, 1400);
  };

  const getStatusBadge = (status: string, vwc: number) => {
    switch (status) {
      case 'critical':
        return 'bg-[#DC2626] text-white';
      case 'low':
        return 'bg-[#EA580C] text-white';
      default:
        return 'bg-[#D8F3DC] text-[#2D6A4F]';
    }
  };

  return (
    <div className="space-y-3">
      {/* Proactive Low Moisture Push Notification Alert Banner */}
      {criticalCrops.length > 0 && !activeAlertDismissed && (
        <div
          className={`p-4 rounded-3xl border transition-all shadow-xs flex items-start justify-between gap-3 ${
            isSunlightMode
              ? 'bg-amber-100 border-2 border-amber-900 text-black'
              : 'bg-[#FFF8E7] border-[#FDE68A] text-[#78350F]'
          }`}
        >
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-2xl bg-[#EA580C] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
              <AlertTriangle className="w-5 h-5 text-white" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase bg-red-600 text-white px-2 py-0.5 rounded-full">
                  Moisture Deficit Alert
                </span>
                <span className="text-xs font-bold">
                  {criticalCrops[0].cropName}
                </span>
              </div>
              <p className="text-xs leading-snug">
                <strong>{criticalCrops[0].plotName}</strong> soil moisture is down to{' '}
                <span className="font-extrabold text-red-600">
                  {criticalCrops[0].vwcPercentage}% VWC
                </span>{' '}
                (Minimum safe threshold: {criticalCrops[0].minOptimalThreshold}%).
              </p>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleIrrigate(criticalCrops[0].sensorId)}
                  className="bg-[#1A3B29] hover:bg-[#2D6A4F] text-white text-[11px] font-bold px-3 py-1.5 rounded-xl shadow-2xs flex items-center gap-1 active:scale-95 transition-all"
                >
                  <Droplets className="w-3.5 h-3.5 text-[#78C441]" />
                  <span>Irrigate Plot (+16% VWC)</span>
                </button>

                {!pushEnabled && (
                  <button
                    type="button"
                    onClick={handleEnablePush}
                    className="text-[11px] font-bold text-[#1A3B29] bg-white/80 hover:bg-white px-2.5 py-1.5 rounded-xl border border-amber-300 flex items-center gap-1"
                  >
                    <BellRing className="w-3.5 h-3.5 text-[#EA580C]" />
                    <span>Enable Push Notifications</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setActiveAlertDismissed(true)}
            className="text-amber-800/60 hover:text-amber-900 p-1 rounded-full text-xs"
            title="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Soil Telemetry Card */}
      <div
        className={`bg-white rounded-3xl p-4 sm:p-5 border shadow-xs space-y-3.5 ${
          isSunlightMode ? 'border-2 border-stone-800' : 'border-[#E6EBE4]'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-[#E8F5E9] text-[#2D6A4F] flex items-center justify-center font-bold shrink-0">
              <Droplets className="w-5 h-5 text-[#2D6A4F]" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-[#19201D] leading-tight flex items-center gap-1.5">
                <span>Soil Moisture Telemetry</span>
                <span className="text-[10px] bg-[#D8F3DC] text-[#2D6A4F] font-bold px-1.5 py-0.2 rounded-md">
                  Live IoT
                </span>
              </h3>
              <p className="text-[11px] text-[#5E6D65]">
                Capacitive VWC probes & proactive irrigation triggers
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setIsTelemetryModalOpen(true)}
              className="text-xs font-bold text-[#1A3B29] bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 rounded-xl flex items-center gap-1 transition-all"
              title="Parse raw IoT sensor data"
            >
              <Cpu className="w-3.5 h-3.5 text-[#78C441]" />
              <span className="hidden sm:inline">Parse Sensor</span>
            </button>
          </div>
        </div>

        {/* Sensor Probes Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {readings.map((sensor) => {
            const isDeficit = sensor.vwcPercentage < sensor.minOptimalThreshold;
            return (
              <div
                key={sensor.sensorId}
                className={`p-3 rounded-2xl border transition-all flex flex-col justify-between gap-2 ${
                  isDeficit
                    ? 'bg-[#FFF8E7] border-amber-300'
                    : 'bg-[#F9FAF8] border-slate-200'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <span className="text-[9px] font-mono text-slate-400 block uppercase">
                      {sensor.sensorId} • {sensor.plotName}
                    </span>
                    <h4 className="text-xs font-extrabold text-[#19201D] truncate leading-tight">
                      {sensor.cropName}
                    </h4>
                  </div>
                  <span
                    className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full shrink-0 ${getStatusBadge(
                      sensor.status,
                      sensor.vwcPercentage
                    )}`}
                  >
                    {sensor.status === 'critical'
                      ? 'Critical'
                      : sensor.status === 'low'
                      ? 'Low'
                      : 'Optimal'}
                  </span>
                </div>

                {/* VWC Moisture Progress Gauge */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-bold">
                    <span className="text-slate-600">
                      Moisture: <strong className="text-xs">{sensor.vwcPercentage}%</strong> VWC
                    </span>
                    <span className="text-slate-400">
                      Min Target: {sensor.minOptimalThreshold}%
                    </span>
                  </div>

                  <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden relative">
                    {/* Threshold marker tick */}
                    <div
                      className="absolute top-0 bottom-0 w-0.5 bg-black/60 z-10"
                      style={{ left: `${sensor.minOptimalThreshold}%` }}
                      title={`Target Threshold: ${sensor.minOptimalThreshold}%`}
                    />
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        sensor.vwcPercentage < sensor.criticalThreshold
                          ? 'bg-[#DC2626]'
                          : sensor.vwcPercentage < sensor.minOptimalThreshold
                          ? 'bg-[#EA580C]'
                          : 'bg-[#78C441]'
                      }`}
                      style={{ width: `${Math.min(100, sensor.vwcPercentage)}%` }}
                    />
                  </div>
                </div>

                {/* Micro meta and Quick Irrigate action */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-[10px] text-slate-500">
                  <span>
                    {sensor.soilTempC}°C • Bat: {sensor.batteryLevel}%
                  </span>

                  <button
                    type="button"
                    onClick={() => handleIrrigate(sensor.sensorId)}
                    className="text-[10px] font-bold text-[#1A3B29] hover:text-[#2D6A4F] bg-white hover:bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200 flex items-center gap-1 shadow-2xs"
                  >
                    <Droplets className="w-3 h-3 text-[#78C441]" />
                    <span>Irrigate</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Raw IoT Sensor Telemetry Parser Modal */}
      {isTelemetryModalOpen && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsTelemetryModalOpen(false);
            }
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs cursor-pointer animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white w-full max-w-md rounded-3xl p-5 border border-slate-200 shadow-2xl space-y-4 cursor-default"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#E8F5E9] text-[#2D6A4F] flex items-center justify-center font-bold">
                  <Cpu className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-extrabold text-[#19201D]">
                  Parse Raw IoT Sensor Telemetry
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsTelemetryModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-[#5E6D65]">
              Paste JSON or CSV telemetry from your capacitive soil probe, LoRaWAN gateway, or Bluetooth logger:
            </p>

            <form onSubmit={handleParseTelemetry} className="space-y-3">
              <textarea
                rows={4}
                required
                value={rawPayload}
                onChange={(e) => setRawPayload(e.target.value)}
                placeholder='e.g. {"sensorId": "SOIL-X9", "cropName": "Roma Tomato", "plotName": "Bed 2", "vwc": 17.8, "minOptimalThreshold": 28}'
                className="w-full text-xs font-mono p-3 rounded-2xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#78C441]"
              />

              {parseError && (
                <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded-xl border border-red-200 font-medium">
                  {parseError}
                </p>
              )}

              {parseSuccess && (
                <p className="text-xs text-green-700 bg-green-50 p-2.5 rounded-xl border border-green-200 font-bold">
                  {parseSuccess}
                </p>
              )}

              {/* Sample Quick-Fill Chips */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">
                  Quick Sample Payloads:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() =>
                      setRawPayload(
                        '{"sensorId":"SOIL-T01","cropName":"Roma Plum Tomato","plotName":"Plot A","vwc":17.2,"minOptimalThreshold":28,"criticalThreshold":20}'
                      )
                    }
                    className="text-[10px] font-mono bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded-md text-slate-700"
                  >
                    Dry Tomato (17.2%)
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setRawPayload(
                        '{"sensorId":"SOIL-P02","cropName":"Habanero Hot Pepper","plotName":"Plot B","vwc":34.0,"minOptimalThreshold":25,"criticalThreshold":18}'
                      )
                    }
                    className="text-[10px] font-mono bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded-md text-slate-700"
                  >
                    Optimal Pepper (34%)
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setRawPayload(
                        'SOIL-N08,Spinach,Tunnel 1,14.5,25,18'
                      )
                    }
                    className="text-[10px] font-mono bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded-md text-slate-700"
                  >
                    CSV Format
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsTelemetryModalOpen(false)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold text-white bg-[#1A3B29] hover:bg-[#2D6A4F] rounded-xl shadow-xs flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5 text-[#78C441]" />
                  <span>Parse & Ingest Telemetry</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
