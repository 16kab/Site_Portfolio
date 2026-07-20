import { useLang } from '../i18n';

const LABELS = {
  fr: { aria: 'Switch to English', other: 'EN' },
  en: { aria: 'Passer en français', other: 'FR' },
} as const;

/**
 * Bascule de langue FR/EN pour l'en-tête. Affiche les deux codes, la langue
 * active en pleine opacité. Couleurs alignées sur le thème de l'en-tête.
 */
export function LanguageToggle({
  isScrolled = false,
}: {
  isScrolled?: boolean;
}) {
  const { lang, toggleLang } = useLang();

  const color = isScrolled
    ? 'var(--header-text-scrolled)'
    : 'var(--header-text-default)';

  return (
    <button
      type="button"
      onClick={toggleLang}
      aria-label={LABELS[lang].aria}
      className="p-2 rounded-md transition-colors duration-200 cursor-pointer flex items-center gap-1"
      style={{
        color,
        fontFamily: 'Manrope, sans-serif',
        fontWeight: 600,
        fontSize: '13px',
        letterSpacing: '0.04em',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--theme-toggle-bg-hover)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'transparent';
      }}
    >
      <span style={{ opacity: lang === 'fr' ? 1 : 0.4 }}>FR</span>
      <span aria-hidden="true" style={{ opacity: 0.4 }}>
        /
      </span>
      <span style={{ opacity: lang === 'en' ? 1 : 0.4 }}>EN</span>
    </button>
  );
}

export default LanguageToggle;
