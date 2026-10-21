// UI-002: Type-safe i18n hook matching next-intl conventions with zero hardcoded strings
import React, { createContext, useContext, useState, useMemo } from 'react';
import type { Locale } from '@verdescan/shared';
import enMessages from '../messages/en.json';

export type Messages = typeof enMessages;

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  messages: Record<string, unknown>;
}

const I18nContext = createContext<I18nContextType>({
  locale: 'en',
  setLocale: () => {},
  messages: enMessages as unknown as Record<string, unknown>,
});

export function I18nProvider({
  children,
  initialLocale = 'en',
}: {
  children: React.ReactNode;
  initialLocale?: Locale;
}) {
  const [locale, setLocale] = useState<Locale>(initialLocale);

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      messages: enMessages as unknown as Record<string, unknown>,
    }),
    [locale]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

/**
 * Hook matching next-intl API:
 * const t = useTranslations('diagnose.result');
 * t('likelyProblem') // "Likely Problem"
 * Or:
 * const t = useTranslations();
 * t('diagnose.result.likelyProblem')
 */
export function useTranslations(namespace?: string) {
  const { messages } = useContext(I18nContext);

  return function t(key: string, values?: Record<string, string | number>): string {
    const fullPath = namespace ? `${namespace}.${key}` : key;
    const parts = fullPath.split('.');

    let current: unknown = messages;
    for (const part of parts) {
      if (current && typeof current === 'object' && part in (current as Record<string, unknown>)) {
        current = (current as Record<string, unknown>)[part];
      } else {
        // Fallback to key name if not found
        current = undefined;
        break;
      }
    }

    if (typeof current !== 'string') {
      return fullPath;
    }

    let result = current;
    if (values) {
      Object.entries(values).forEach(([k, v]) => {
        result = (result as string).replace(new RegExp(`{${k}}`, 'g'), String(v));
      });
    }

    return result as string;
  };
}

export function useLocale() {
  const { locale, setLocale } = useContext(I18nContext);
  return { locale, setLocale };
}
