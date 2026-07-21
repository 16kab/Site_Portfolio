import { useState } from 'react';
import { useLang } from '../i18n';

const LABELS = {
  fr: { aria: 'Switch to English' },
  en: { aria: 'Passer en français' },
} as const;

/**
 * Bascule de langue FR/EN pour l'en-tête. Affiche les deux codes, la langue
 * active en pleine opacité. Au survol, la langue inactive s'éclaircit (indice
 * « cliquer pour basculer »), lisible dans les deux thèmes.
 */
export function LanguageToggle({
  isScrolled = false,
  color,
  fontSize = '13px',
  className = '',
}: {
  isScrolled?: boolean;
  /** Force une couleur (ex. menu mobile sur fond sombre). */
  color?: string;
  fontSize?: string;
  className?: string;
}) {
  const { lang, toggleLang } = useLang();
  const [isHovered, setIsHovered] = useState(false);

  const resolvedColor =
    color ??
    (isScrolled ? 'var(--header-text-scrolled)' : 'var(--header-text-default)');

  // Opacité de la langue inactive : 0.4 au repos, remontée au survol
  const inactiveOpacity = isHovered ? 0.75 : 0.4;

  return (
    <button
      type="button"
      onClick={toggleLang}
      aria-label={LABELS[lang].aria}
      className={`p-2 rounded-md transition-colors duration-200 cursor-pointer flex items-center gap-1 ${className}`}
      style={{
        color: resolvedColor,
        fontFamily: 'Manrope, sans-serif',
        fontWeight: 600,
        fontSize,
        letterSpacing: '0.04em',
      }}
      onMouseEnter={(e) => {
        setIsHovered(true);
        e.currentTarget.style.backgroundColor = 'var(--theme-toggle-bg-hover)';
      }}
      onMouseLeave={(e) => {
        setIsHovered(false);
        e.currentTarget.style.backgroundColor = 'transparent';
      }}
      onFocus={() => setIsHovered(true)}
      onBlur={() => setIsHovered(false)}
    >
      <span
        className="transition-opacity duration-200"
        style={{ opacity: lang === 'fr' ? 1 : inactiveOpacity }}
      >
        FR
      </span>
      <span aria-hidden="true" style={{ opacity: 0.4 }}>
        /
      </span>
      <span
        className="transition-opacity duration-200"
        style={{ opacity: lang === 'en' ? 1 : inactiveOpacity }}
      >
        EN
      </span>
    </button>
  );
}

export default LanguageToggle;
