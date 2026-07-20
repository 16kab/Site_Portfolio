import { BrowserRouter, Routes, Route, useLocation } from 'react-router';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { lazy, Suspense, useEffect, useState } from 'react';
import { AnimatePresence } from 'motion/react';
import Header from './components/Header';
import Home from './pages/Home';
import ThemedToaster from './components/ThemedToaster';
import Grainient from './components/Grainient';
import { ScrollToTop } from './components/ScrollToTop';
import { PageTransitionProvider } from './context/PageTransitionContext';
import { PageTransitionOverlay } from './components/PageTransitionOverlay';
import SplashScreen from './components/SplashScreen';
import ErrorBoundary from './components/ErrorBoundary';
import { ROUTES } from './config';
import { useIsDarkMode } from './hooks';
import { LanguageProvider, useT } from './i18n';

function SkipLink() {
  const t = useT({
    fr: { skip: 'Aller au contenu' },
    en: { skip: 'Skip to content' },
  });
  return (
    <a href="#contenu" className="skip-link">
      {t.skip}
    </a>
  );
}

// Code-splitting : chaque page secondaire est chargée à la demande
const Projets = lazy(() => import('./pages/Projets'));
const ProjetDetail = lazy(() => import('./pages/ProjetDetail'));
const APropos = lazy(() => import('./pages/APropos'));
const Contact = lazy(() => import('./pages/Contact'));
const MentionsLegales = lazy(() => import('./pages/MentionsLegales'));
const NotFound = lazy(() => import('./pages/NotFound'));

export const getSafariChromeColor = (isDarkMode: boolean) =>
  isDarkMode ? '#111111' : '#F2F2F2';

export const syncSafariChromeColor = (
  isDarkMode: boolean,
  targetDocument: Document = document,
) => {
  targetDocument
    .querySelector<HTMLMetaElement>('meta[name="theme-color"]')
    ?.setAttribute('content', getSafariChromeColor(isDarkMode));
};

export function AppContent({ showSplash }: { showSplash: boolean }) {
  const location = useLocation();

  return (
    <>
      {/* Scroll to top on route change */}
      <ScrollToTop />

      <Suspense fallback={null}>
        <Routes location={location}>
          <Route
            path={ROUTES.HOME}
            element={<Home showSplash={showSplash} />}
          />
          <Route path={ROUTES.CONTACT} element={<Contact />} />
          <Route path={ROUTES.MENTIONS} element={<MentionsLegales />} />
          <Route path={ROUTES.APROPOS} element={<APropos />} />
          <Route path={ROUTES.PROJETS} element={<Projets />} />
          <Route
            path={ROUTES.PROJET_DETAIL_PATTERN}
            element={<ProjetDetail />}
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </>
  );
}

export default function App() {
  const [showSplash, setShowSplash] = useState(() => {
    // Montrer le splash uniquement si on est sur la homepage
    // Le splash ne se montrera pas lors des navigations SPA car le composant ne se remonte pas
    const isHomePage = window.location.pathname === '/';
    return isHomePage;
  });

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <LanguageProvider>
          <PageTransitionProvider>
            {/* Splash Screen */}
            <AnimatePresence>
              {showSplash && (
                <SplashScreen onComplete={() => setShowSplash(false)} />
              )}
            </AnimatePresence>

            <div className="min-h-screen app-container">
              {/* Lien d'évitement pour la navigation clavier */}
              <SkipLink />

              {/* Toast Notifications */}
              <ThemedToaster />
              <Analytics />
              <SpeedInsights />

              {/* Global Header */}
              <Header showSplash={showSplash} />

              {/* Background wrapper */}
              <BackgroundWrapper />

              {/* App Content */}
              <main id="contenu">
                <AppContent showSplash={showSplash} />
              </main>

              {/* Page Transition Overlay */}
              <PageTransitionOverlay />
            </div>
          </PageTransitionProvider>
        </LanguageProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

// Background wrapper that shows Grainient only on home page
function BackgroundWrapper() {
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const isProjetsPage =
    location.pathname === '/projets' ||
    location.pathname.startsWith('/projets/');

  // Suit le thème pour recolorer le fond et le chrome Safari
  const isDarkMode = useIsDarkMode();

  useEffect(() => {
    syncSafariChromeColor(isDarkMode);
  }, [isDarkMode]);

  // Don't render any background on Projets pages (they have their own background color)
  if (isProjetsPage) {
    return null;
  }

  // Render Grainient background on home page
  if (isHomePage) {
    // Define colors based on theme
    const colors = isDarkMode
      ? {
          color1: '#000000', // Foncé
          color2: '#545454', // Gris clair
          color3: '#bababa', // Clair
        }
      : {
          color1: '#FFFFFF', // Clair (inversé)
          color2: '#6B6B6B', // Gris moyen-foncé (inversé)
          color3: '#2A2A2A', // Foncé (inversé)
        };

    return (
      <div className="grainient-wrapper">
        <Grainient
          color1={colors.color1}
          color2={colors.color2}
          color3={colors.color3}
          timeSpeed={0.25}
          colorBalance={0.13}
          warpStrength={2.5}
          warpFrequency={1.3}
          warpSpeed={0.8}
          warpAmplitude={20}
          blendAngle={-180}
          blendSoftness={0.28}
          rotationAmount={290}
          noiseScale={0.5}
          grainAmount={0.05}
          grainScale={0.2}
          grainAnimated={false}
          contrast={1.5}
          gamma={1}
          saturation={0.85}
          centerX={0}
          centerY={0}
          zoom={0.35}
        />
      </div>
    );
  }

  return null;
}
