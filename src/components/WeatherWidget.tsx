// Local Weather Widget with Auto Geolocation & Manual Farm Location Setting
import React, { useState, useEffect, useCallback } from 'react';
import {
  CloudSun,
  Droplets,
  Thermometer,
  MapPin,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Wind,
  Edit3,
  Navigation,
  Compass,
} from 'lucide-react';

export interface WeatherData {
  city: string;
  temperature: number;
  humidity: number;
  windSpeed: number;
  condition: string;
  source: 'gps' | 'manual' | 'preset';
}

interface SavedFarmLocation {
  name: string;
  lat: number;
  lon: number;
  isCustom?: boolean;
}

const PRESET_FARM_ZONES: Record<string, { lat: number; lon: number; name: string }> = {
  accra: { lat: 5.6037, lon: -0.187, name: 'Accra Coastal Plot, Ghana' },
  kumasi: { lat: 6.6885, lon: -1.6244, name: 'Kumasi Forest Belt, Ghana' },
  tamale: { lat: 9.4008, lon: -0.8393, name: 'Tamale Guinea Savanna, Ghana' },
  sunyani: { lat: 7.3399, lon: -2.3268, name: 'Sunyani Transitional Zone, Ghana' },
  koforidua: { lat: 6.0945, lon: -0.2609, name: 'Eastern Region Farm Hub, Ghana' },
  lagos: { lat: 6.5244, lon: 3.3792, name: 'Lagos Rain Forest Belt, Nigeria' },
  ibadan: { lat: 7.3775, lon: 3.947, name: 'Ibadan Agricultural Hub, Nigeria' },
  nairobi: { lat: -1.2921, lon: 36.8219, name: 'Nairobi Highlands, Kenya' },
};

const STORAGE_FARM_LOC_KEY = 'verdescan_farm_location';

export function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData>({
    city: 'Detecting Farm Location...',
    temperature: 29,
    humidity: 76,
    windSpeed: 12,
    condition: 'Partly Cloudy',
    source: 'preset',
  });
  const [loading, setLoading] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [manualCityInput, setManualCityInput] = useState('');

  const fetchWeatherForCoords = useCallback(
    async (lat: number, lon: number, cityName?: string, source: 'gps' | 'manual' | 'preset' = 'gps') => {
      setLoading(true);
      setGpsError(null);
      try {
        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m`
        );
        if (!res.ok) throw new Error('Weather API unavailable');
        const data = await res.json();
        const current = data.current;

        const code = current?.weather_code ?? 0;
        let condition = 'Clear Daylight';
        if (code >= 51 && code <= 67) condition = 'Rain Showers';
        else if (code >= 1 && code <= 3) condition = 'Partly Cloudy';
        else if (code >= 80) condition = 'Heavy Downpour';

        const finalCity = cityName || `${lat.toFixed(2)}°N, ${lon.toFixed(2)}°W`;
        const updated: WeatherData = {
          city: finalCity,
          temperature: Math.round(current?.temperature_2m ?? 28),
          humidity: Math.round(current?.relative_humidity_2m ?? 75),
          windSpeed: Math.round(current?.wind_speed_10m ?? 10),
          condition,
          source,
        };

        setWeather(updated);

        // Cache for botanist context
        try {
          localStorage.setItem('verdescan_cached_weather', JSON.stringify(updated));
        } catch {
          // ignore
        }
      } catch {
        // Fallback
        setWeather({
          city: cityName || 'Local Field',
          temperature: 29,
          humidity: 76,
          windSpeed: 12,
          condition: 'Partly Cloudy',
          source,
        });
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const requestAutoGeolocation = useCallback(() => {
    if (!('geolocation' in navigator)) {
      setGpsError('Geolocation not supported on this browser.');
      return;
    }
    setLoading(true);
    setGpsError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        fetchWeatherForCoords(pos.coords.latitude, pos.coords.longitude, undefined, 'gps');
      },
      (err) => {
        setLoading(false);
        setGpsError(
          err.code === 1
            ? 'Location permission denied. Showing regional weather.'
            : 'Location lookup timed out.'
        );
        // Fallback to Kumasi / Accra
        const defaultZone = PRESET_FARM_ZONES.kumasi;
        fetchWeatherForCoords(defaultZone.lat, defaultZone.lon, defaultZone.name, 'preset');
      },
      { timeout: 7000 }
    );
  }, [fetchWeatherForCoords]);

  // Initial load: check if user manually specified farm location; if not, auto-detect
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_FARM_LOC_KEY);
      if (stored) {
        const parsed: SavedFarmLocation = JSON.parse(stored);
        fetchWeatherForCoords(parsed.lat, parsed.lon, parsed.name, 'manual');
        return;
      }
    } catch {
      // ignore
    }
    requestAutoGeolocation();
  }, [fetchWeatherForCoords, requestAutoGeolocation]);

  const handleSelectPreset = (zoneKey: string) => {
    const zone = PRESET_FARM_ZONES[zoneKey];
    if (zone) {
      const toSave: SavedFarmLocation = {
        name: zone.name,
        lat: zone.lat,
        lon: zone.lon,
      };
      localStorage.setItem(STORAGE_FARM_LOC_KEY, JSON.stringify(toSave));
      fetchWeatherForCoords(zone.lat, zone.lon, zone.name, 'manual');
      setIsModalOpen(false);
    }
  };

  const handleSaveCustomLocation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCityInput.trim()) return;

    // Approximate mapping or default coordinates
    const toSave: SavedFarmLocation = {
      name: manualCityInput.trim(),
      lat: 6.6885, // Default agricultural lat
      lon: -1.6244,
      isCustom: true,
    };
    localStorage.setItem(STORAGE_FARM_LOC_KEY, JSON.stringify(toSave));
    fetchWeatherForCoords(toSave.lat, toSave.lon, toSave.name, 'manual');
    setManualCityInput('');
    setIsModalOpen(false);
  };

  const handleResetToGps = () => {
    localStorage.removeItem(STORAGE_FARM_LOC_KEY);
    requestAutoGeolocation();
    setIsModalOpen(false);
  };

  // Agronomic cross-reference analysis
  const getAgronomicCrossReference = (temp: number, hum: number) => {
    if (hum >= 75) {
      return {
        level: 'warning',
        title: `High Humidity (${hum}%): Fungal Pathogen Warning`,
        advice:
          'Favorable conditions for Powdery Mildew, Early Blight, and Downy Mildew. Space foliage for air circulation and avoid overhead evening watering.',
      };
    }
    if (temp >= 33) {
      return {
        level: 'warning',
        title: `High Heat (${temp}°C): Transpiration Stress`,
        advice:
          'Elevated evaporation. Water plants at root level early morning and mulch soil to retain moisture.',
      };
    }
    if (hum <= 45) {
      return {
        level: 'info',
        title: `Dry Air (${hum}%): Watch For Pests`,
        advice:
          'Spider mites and sap-sucking pests flourish in dry ambient conditions. Inspect leaf undersides.',
      };
    }
    return {
      level: 'good',
      title: 'Favorable Microclimate',
      advice:
        'Balanced temperature and moderate humidity. Natural photosynthesis and low fungal spore germination.',
    };
  };

  const advisory = getAgronomicCrossReference(weather.temperature, weather.humidity);

  return (
    <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#E6EBE4] shadow-xs space-y-3">
      {/* Header with City & Location Switcher */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-bold text-[#19201D] truncate max-w-[210px]">
          <MapPin className="w-3.5 h-3.5 text-[#78C441] shrink-0" />
          <span className="truncate">{weather.city}</span>
          {weather.source === 'gps' ? (
            <span className="text-[9px] bg-[#D8F3DC] text-[#1A3B29] px-1.5 py-0.5 rounded-full font-bold shrink-0">
              Auto GPS
            </span>
          ) : (
            <span className="text-[9px] bg-[#EBF5FF] text-[#1E40AF] px-1.5 py-0.5 rounded-full font-bold shrink-0">
              Farm Location
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          {/* Button to open manual farm location modal */}
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="text-[11px] font-bold text-[#2D6A4F] bg-[#D8F3DC]/70 hover:bg-[#D8F3DC] px-2.5 py-1 rounded-xl transition-all flex items-center gap-1 touch-target shadow-2xs"
            title="Set custom farm location"
          >
            <Edit3 className="w-3 h-3" />
            <span>Set Location</span>
          </button>

          <button
            type="button"
            onClick={() => {
              const stored = localStorage.getItem(STORAGE_FARM_LOC_KEY);
              if (stored) {
                const parsed = JSON.parse(stored);
                fetchWeatherForCoords(parsed.lat, parsed.lon, parsed.name, 'manual');
              } else {
                requestAutoGeolocation();
              }
            }}
            disabled={loading}
            className="text-stone-400 hover:text-[#1A3B29] p-1.5 transition-colors touch-target"
            title="Refresh local weather"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#78C441]' : ''}`} />
          </button>
        </div>
      </div>

      {gpsError && (
        <p className="text-[10px] text-[#E09F3E] bg-[#FEF3C7] p-1.5 rounded-lg">
          {gpsError}
        </p>
      )}

      {/* Main Metric Cards Grid */}
      <div className="grid grid-cols-3 gap-2.5">
        {/* Temperature */}
        <div className="bg-[#F6F8F5] rounded-2xl p-2.5 border border-[#E6EBE4] text-center space-y-0.5">
          <div className="flex items-center justify-center gap-1 text-[#FF7F50]">
            <Thermometer className="w-4 h-4" />
            <span className="text-base sm:text-lg font-extrabold text-[#19201D]">
              {weather.temperature}°C
            </span>
          </div>
          <p className="text-[10px] text-[#5E6D65] font-semibold">{weather.condition}</p>
        </div>

        {/* Humidity */}
        <div className="bg-[#F6F8F5] rounded-2xl p-2.5 border border-[#E6EBE4] text-center space-y-0.5">
          <div className="flex items-center justify-center gap-1 text-[#3B82F6]">
            <Droplets className="w-4 h-4" />
            <span className="text-base sm:text-lg font-extrabold text-[#19201D]">
              {weather.humidity}%
            </span>
          </div>
          <p className="text-[10px] text-[#5E6D65] font-semibold">Relative Humidity</p>
        </div>

        {/* Wind */}
        <div className="bg-[#F6F8F5] rounded-2xl p-2.5 border border-[#E6EBE4] text-center space-y-0.5">
          <div className="flex items-center justify-center gap-1 text-[#78C441]">
            <Wind className="w-4 h-4" />
            <span className="text-base sm:text-lg font-extrabold text-[#19201D]">
              {weather.windSpeed} <span className="text-[9px] font-normal">km/h</span>
            </span>
          </div>
          <p className="text-[10px] text-[#5E6D65] font-semibold">Breeze & Airflow</p>
        </div>
      </div>

      {/* Plant Health Cross-Reference Callout */}
      <div
        className={`p-3 rounded-2xl border text-xs leading-relaxed space-y-1 ${
          advisory.level === 'warning'
            ? 'bg-[#FEF3C7]/80 border-[#FDE68A] text-[#92400E]'
            : 'bg-[#D8F3DC]/60 border-[#B7E4C7] text-[#1A3B29]'
        }`}
      >
        <div className="flex items-center gap-1.5 font-bold text-[11px]">
          {advisory.level === 'warning' ? (
            <AlertTriangle className="w-3.5 h-3.5 text-[#E09F3E] shrink-0" />
          ) : (
            <CheckCircle2 className="w-3.5 h-3.5 text-[#78C441] shrink-0" />
          )}
          <span>{advisory.title}</span>
        </div>
        <p className="text-[10px] leading-tight text-opacity-90">{advisory.advice}</p>
      </div>

      {/* Farm Location Selection Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-md p-5 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#E6EBE4] pb-3">
              <div>
                <h3 className="text-base font-extrabold text-[#19201D]">Set Farm or Garden Location</h3>
                <p className="text-[11px] text-[#5E6D65]">
                  Auto-detect GPS or select where your crops are planted
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center text-xs font-bold"
              >
                ✕
              </button>
            </div>

            {/* Option 1: Auto-Detect GPS */}
            <button
              type="button"
              onClick={handleResetToGps}
              className="touch-target w-full bg-[#EBF5FF] hover:bg-[#dbeafe] border border-[#BFDBFE] text-[#1D4ED8] p-3 rounded-2xl flex items-center gap-3 transition-all text-left"
            >
              <div className="w-9 h-9 rounded-xl bg-[#3B82F6] text-white flex items-center justify-center shrink-0">
                <Navigation className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-extrabold leading-tight">Auto-detect Location (GPS)</p>
                <p className="text-[10px] text-[#1E40AF]">Use current device geolocation</p>
              </div>
            </button>

            {/* Option 2: Popular Agricultural Farm Zones */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-[#19201D]">Select Agricultural Zone:</span>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(PRESET_FARM_ZONES).map(([key, zone]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleSelectPreset(key)}
                    className="p-2.5 rounded-xl bg-[#F6F8F5] hover:bg-[#D8F3DC] border border-[#E6EBE4] hover:border-[#78C441] text-left transition-all touch-target text-xs font-bold text-[#19201D]"
                  >
                    <p className="truncate">{zone.name.split(',')[0]}</p>
                    <p className="text-[10px] text-[#5E6D65] font-normal truncate">
                      {zone.name.split(',')[1] || ''}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Option 3: Custom Farm Name / Location */}
            <form onSubmit={handleSaveCustomLocation} className="space-y-2 pt-2 border-t border-[#E6EBE4]">
              <label className="text-xs font-bold text-[#19201D] block">
                Or Type Custom Farm Name / Town:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={manualCityInput}
                  onChange={(e) => setManualCityInput(e.target.value)}
                  placeholder="e.g. Nyankpala Rice Project, Sunyani Farm..."
                  className="flex-1 text-xs font-bold bg-[#F6F8F5] border border-[#E6EBE4] rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#78C441]"
                />
                <button
                  type="submit"
                  disabled={!manualCityInput.trim()}
                  className="bg-[#78C441] hover:bg-[#6BB536] disabled:bg-stone-200 text-white font-bold text-xs px-4 rounded-xl transition-all shadow-xs touch-target min-h-[44px]"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
