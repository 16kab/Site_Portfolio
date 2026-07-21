import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
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

  // Position de défilement à restaurer après un changement de langue.
  const pendingScrollRef = useRef<number | null>(null);
  const didMountRef = useRef(false);

  // Reflète la langue sur <html lang> (SEO + lecteurs d'écran)
  useEffect(() => {
    document.documentElement.setAttribute('lang', lang);
  }, [lang]);

  // Préserve la position de défilement au changement de langue. Le contenu
  // routé est remonté (`key={lang}` dans App) et plusieurs effets remettent
  // `body.scrollTop = 0` (ScrollToTop, page Détail…). Ce provider étant au-
  // dessus du sous-arbre remonté, son effet s'exécute APRÈS ceux des enfants
  // (descendants d'abord), dans le même commit : la restauration gagne, sans
  // saut visible. Le tout premier rendu (chargement) n'est pas concerné.
  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true;
      return;
    }
    const y = pendingScrollRef.current;
    if (y == null) return;
    pendingScrollRef.current = null;
    // Après deux frames : le sous-arbre remonté a fini sa mise en page (la
    // galerie fixe le pin, les images chargent) et les resets scrollTop=0
    // synchrones des enfants sont passés — la restauration tient.
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        document.body.scrollTop = y;
      }),
    );
  }, [lang]);

  const setLang = useCallback((next: Lang) => {
    pendingScrollRef.current = document.body.scrollTop;
    setLangState(next);
    try {
      window.localStorage.setItem(LANG_STORAGE_KEY, next);
    } catch {
      /* stockage indisponible : la langue reste en mémoire pour la session */
    }
  }, []);

  const toggleLang = useCallback(() => {
    pendingScrollRef.current = document.body.scrollTop;
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

// Contexte par défaut hors provider (tests, rendu isolé) : langue par défaut,
// bascule sans effet. Évite de devoir envelopper chaque test.
const FALLBACK: LanguageContextValue = {
  lang: DEFAULT_LANG,
  setLang: () => {},
  toggleLang: () => {},
};

export function useLang(): LanguageContextValue {
  return useContext(LanguageContext) ?? FALLBACK;
}

/**
 * Sélectionne le jeu de chaînes de la langue courante.
 * Usage : `const t = useT({ fr: {...}, en: {...} });`
 */
export function useT<T>(strings: Record<Lang, T>): T {
  const { lang } = useLang();
  return strings[lang];
}
