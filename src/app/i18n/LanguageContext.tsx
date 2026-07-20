import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { DEFAULT_LANG, isLang, type Lang, LANG_STORAGE_KEY } from './types';

interface LanguageContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  toggleLang: () => void;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

function readInitialLang(): Lang {
  if (typeof window === 'undefined') return DEFAULT_LANG;
  const stored = window.localStorage.getItem(LANG_STORAGE_KEY);
  return isLang(stored) ? stored : DEFAULT_LANG;
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(readInitialLang);

  // Reflète la langue sur <html lang> (SEO + lecteurs d'écran)
  useEffect(() => {
    document.documentElement.setAttribute('lang', lang);
  }, [lang]);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    try {
      window.localStorage.setItem(LANG_STORAGE_KEY, next);
    } catch {
      /* stockage indisponible : la langue reste en mémoire pour la session */
    }
  }, []);

  const toggleLang = useCallback(() => {
    setLangState((current) => {
      const next: Lang = current === 'fr' ? 'en' : 'fr';
      try {
        window.localStorage.setItem(LANG_STORAGE_KEY, next);
      } catch {
        /* idem */
      }
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({ lang, setLang, toggleLang }),
    [lang, setLang, toggleLang],
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLang doit être utilisé dans un LanguageProvider');
  }
  return ctx;
}

/**
 * Sélectionne le jeu de chaînes de la langue courante.
 * Usage : `const t = useT({ fr: {...}, en: {...} });`
 */
export function useT<T>(strings: Record<Lang, T>): T {
  const { lang } = useLang();
  return strings[lang];
}
