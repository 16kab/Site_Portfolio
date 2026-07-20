import { Component, type ErrorInfo, type ReactNode } from 'react';
import { isLang, LANG_STORAGE_KEY } from '../i18n/types';

const STRINGS = {
  fr: {
    title: 'Une erreur est survenue',
    body: "Quelque chose s'est mal passé lors de l'affichage de cette page. Vous pouvez recharger ou revenir à l'accueil.",
    home: "Revenir à l'accueil",
  },
  en: {
    title: 'Something went wrong',
    body: 'Something went wrong while displaying this page. You can reload or go back to the home page.',
    home: 'Back to home',
  },
};

// L'ErrorBoundary est au-dessus du LanguageProvider et c'est un composant de
// classe : la langue est lue directement dans le stockage local (secours).
function errorStrings() {
  try {
    const stored = window.localStorage.getItem(LANG_STORAGE_KEY);
    return isLang(stored) ? STRINGS[stored] : STRINGS.fr;
  } catch {
    return STRINGS.fr;
  }
}

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

/**
 * Filet de sécurité global : évite la page blanche en cas d'erreur
 * de rendu non interceptée.
 */
export default class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Erreur non interceptée :', error, info);
  }

  render() {
    if (this.state.hasError) {
      const t = errorStrings();
      return (
        <div
          role="alert"
          className="min-h-screen flex flex-col items-center justify-center gap-6 px-6 text-center"
          style={{
            backgroundColor: 'var(--portfolio-bg)',
            color: 'var(--portfolio-text-primary)',
            fontFamily: 'Manrope, sans-serif',
          }}
        >
          <h1
            style={{
              fontSize: 'clamp(1.5rem, 1rem + 2vw, 2.5rem)',
              fontWeight: 700,
            }}
          >
            {t.title}
          </h1>
          <p
            style={{
              color: 'var(--portfolio-text-secondary)',
              maxWidth: '32rem',
            }}
          >
            {t.body}
          </p>
          <a
            href="/"
            className="px-6 py-3 rounded-[5px]"
            style={{
              backgroundColor: 'var(--portfolio-button-bg)',
              color: 'var(--portfolio-button-text)',
              fontWeight: 500,
              fontSize: '14px',
            }}
          >
            {t.home}
          </a>
        </div>
      );
    }

    return this.props.children;
  }
}
