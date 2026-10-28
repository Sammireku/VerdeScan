// Real-Time Weather Alert Banner for Frost, Extreme Heat, Heavy Rain & Fungal Outbreaks
import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  Snowflake,
  Flame,
  CloudRain,
  Wind,
  X,
  ChevronRight,
  ShieldAlert,
  Bot,
  Heart,
} from 'lucide-react';
import type { WeatherData } from './WeatherWidget';

export interface WeatherAlertBannerProps {
  onOpenBotanist?: () => void;
  onOpenPlantCare?: () => void;
}

interface ActiveAlert {
  id: string;
  type: 'frost' | 'heat' | 'rain' | 'fungus' | 'drought';
  title: string;
  description: string;
  severity: 'critical' | 'warning' | 'advisory';
  icon: typeof AlertTriangle;
  actionLabel: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
  accentColor: string;
}

export function WeatherAlertBanner({ onOpenBotanist, onOpenPlantCare }: WeatherAlertBannerProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const checkWeather = () => {
      try {
        const stored = localStorage.getItem('verdescan_cached_weather');
        if (stored) {
          setWeather(JSON.parse(stored));
        }
      } catch {
        // ignore
      }
    };

    checkWeather();
    const interval = setInterval(checkWeather, 4000);
    return () => clearInterval(interval);
  }, []);

  if (!weather || isDismissed) return null;

  const temp = weather.temperature;
  const humidity = weather.humidity;
  const condition = weather.condition.toLowerCase();
  const city = weather.city.split(',')[0];

  // Evaluate extreme agro-climatic conditions
  let alert: ActiveAlert | null = null;

  // 1. Frost & Cold Shock Risk (< 13°C)
  if (temp <= 13) {
    alert = {
      id: 'frost-alert',
      type: 'frost',
      title: `Frost & Cold Shock Warning (${temp}°C in ${city})`,
      description:
        'Cold snap alert! Chilling injury risk for sensitive nightshades (Tomatoes, Peppers). Move potted crops indoors or cover beds with frost cloth or dry mulch to prevent cellular collapse.',
      severity: 'critical',
      icon: Snowflake,
      actionLabel: 'Cold Protection Advice',
      bgColor: 'bg-[#EFF6FF]',
      borderColor: 'border-[#60A5FA]',
      textColor: 'text-[#1E40AF]',
      accentColor: 'text-[#2563EB]',
    };
  }
  // 2. Extreme Heat Stress (>= 32°C)
  else if (temp >= 32) {
    alert = {
      id: 'heat-alert',
      type: 'heat',
      title: `Severe Heat Stress Warning (${temp}°C in ${city})`,
      description:
        'Extreme thermal threshold! High transpiration causes rapid blossom drop and foliar scorch. Irrigate deeply before 8:00 AM at ground level and top-dress soil with 2 inches of mulch.',
      severity: 'critical',
      icon: Flame,
      actionLabel: 'Heat Protection Protocol',
      bgColor: 'bg-[#FFFBEB]',
      borderColor: 'border-[#F59E0B]',
      textColor: 'text-[#92400E]',
      accentColor: 'text-[#D97706]',
    };
  }
  // 3. Heavy Rain / Torrential Downpour
  else if (condition.includes('rain') || condition.includes('downpour') || condition.includes('shower')) {
    alert = {
      id: 'rain-alert',
      type: 'rain',
      title: `Torrential Rain & Runoff Alert (${city})`,
      description:
        'Wet canopy and soil saturation alert! Heavy rain splashes fungal spores (Early Blight) from soil onto leaves. Unblock drainage canals and avoid foliar spraying until dry.',
      severity: 'warning',
      icon: CloudRain,
      actionLabel: 'Fungal Splash Sanitation',
      bgColor: 'bg-[#F0FDF4]',
      borderColor: 'border-[#4ADE80]',
      textColor: 'text-[#166534]',
      accentColor: 'text-[#15803D]',
    };
  }
  // 4. Extreme High Humidity (> 78% with warm temp >= 25°C -> High Fungal Pressure)
  else if (humidity >= 78 && temp >= 25) {
    alert = {
      id: 'fungus-alert',
      type: 'fungus',
      title: `Extreme Fungal Outbreak Risk (${humidity}% Humidity in ${city})`,
      description:
        'High atmospheric humidity accelerates Powdery Mildew and Blight spore germination. Prune lower crowded leaves to improve airflow and avoid evening overhead irrigation.',
      severity: 'warning',
      icon: AlertTriangle,
      actionLabel: 'Organic Spray Guide',
      bgColor: 'bg-[#FFF1F2]',
      borderColor: 'border-[#FB7185]',
      textColor: 'text-[#9F1239]',
      accentColor: 'text-[#E11D48]',
    };
  }
  // 5. Arid Drought (<= 40% humidity)
  else if (humidity <= 40) {
    alert = {
      id: 'drought-alert',
      type: 'drought',
      title: `Arid Dry Air & Spider Mite Warning (${humidity}% Humidity)`,
      description:
        'Dry ambient microclimate accelerates sap-sucking pest explosions. Inspect leaf undersides for webbing and maintain steady root hydration.',
      severity: 'advisory',
      icon: Wind,
      actionLabel: 'Pest Defense Tips',
      bgColor: 'bg-[#FFFBEB]',
      borderColor: 'border-[#FCD34D]',
      textColor: 'text-[#78350F]',
      accentColor: 'text-[#B45309]',
    };
  }

  if (!alert) return null;

  const IconComponent = alert.icon;

  return (
    <div
      className={`mx-4 mt-2 p-3.5 sm:p-4 rounded-3xl border ${alert.borderColor} ${alert.bgColor} shadow-sm space-y-2.5 transition-all animate-in fade-in slide-in-from-top-2 relative overflow-hidden`}
    >
      {/* Decorative pulse element */}
      <div className="absolute right-0 top-0 w-24 h-24 opacity-10 pointer-events-none">
        <IconComponent className="w-full h-full" />
      </div>

      {/* Header with Icon, Severity Badge & Dismiss Button */}
      <div className="flex items-start justify-between gap-2 relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-white/80 backdrop-blur-xs flex items-center justify-center shrink-0 shadow-2xs">
            <IconComponent className={`w-4 h-4 ${alert.accentColor}`} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span
                className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded-md ${
                  alert.severity === 'critical'
                    ? 'bg-red-500 text-white'
                    : 'bg-amber-500 text-white'
                }`}
              >
                {alert.severity} Condition
              </span>
              <span className="text-[10px] text-stone-500 font-bold">• Real-time Agro Alert</span>
            </div>
            <h3 className={`text-xs sm:text-sm font-extrabold leading-tight mt-0.5 ${alert.textColor}`}>
              {alert.title}
            </h3>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsDismissed(true)}
          className="text-stone-400 hover:text-stone-700 p-1 rounded-full touch-target"
          title="Dismiss alert"
          aria-label="Dismiss alert"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Advisory Message */}
      <p className={`text-xs leading-relaxed relative z-10 ${alert.textColor} opacity-95`}>
        {alert.description}
      </p>

      {/* Action Buttons: Consult AI Botanist & View Resource */}
      <div className="flex items-center gap-2 pt-1 relative z-10">
        <button
          type="button"
          onClick={onOpenBotanist}
          className="touch-target bg-[#182635] hover:bg-[#25394B] text-white text-[11px] font-bold px-3 py-1.5 rounded-xl flex items-center gap-1 shadow-2xs transition-all active:scale-95"
        >
          <Bot className="w-3.5 h-3.5 text-[#78C441]" />
          <span>Ask AI Botanist</span>
        </button>

        <button
          type="button"
          onClick={onOpenPlantCare}
          className={`touch-target bg-white/90 hover:bg-white text-[11px] font-bold px-3 py-1.5 rounded-xl border border-black/10 flex items-center gap-1 transition-all active:scale-95 ${alert.textColor}`}
        >
          <Heart className="w-3.5 h-3.5 text-[#BC4749]" />
          <span>{alert.actionLabel}</span>
          <ChevronRight className="w-3 h-3 opacity-60" />
        </button>
      </div>
    </div>
  );
}
