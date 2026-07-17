import { BrowserRouter, Routes, Route, useLocation } from 'react-router';
import { Toaster } from 'sonner';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { useEffect, useState } from 'react';
import { AnimatePresence } from 'motion/react';
import Header from './components/Header';
import Home from './pages/Home';
import Contact from './pages/Contact';
import APropos from './pages/APropos';
import Projets from './pages/Projets';
import ProjetDetail from './pages/ProjetDetail';
import { TOAST_CONFIG } from './config';
import Grainient from './components/Grainient';
import { ScrollToTop } from './components/ScrollToTop';
import { PageTransitionProvider } from './context/PageTransitionContext';
import { PageTransitionOverlay } from './components/PageTransitionOverlay';
import SplashScreen from './components/SplashScreen';

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
      
      <Routes location={location}>
        <Route path="/" element={<Home showSplash={showSplash} />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/apropos" element={<APropos />} />
        <Route path="/projets" element={<Projets />} />
        <Route path="/projets/:id" element={<ProjetDetail />} />
      </Routes>
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
    <BrowserRouter>
      <PageTransitionProvider>
        {/* Splash Screen */}
        <AnimatePresence>
          {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}
        </AnimatePresence>

        <div className="min-h-screen app-container">
          {/* Toast Notifications */}
          <Toaster {...TOAST_CONFIG} />
          <Analytics />
          <SpeedInsights />

          {/* Global Header */}
          <Header showSplash={showSplash} />
          
          {/* Background wrapper */}
          <BackgroundWrapper />
          
          {/* App Content */}
          <AppContent showSplash={showSplash} />

          {/* Page Transition Overlay */}
          <PageTransitionOverlay />
        </div>
      </PageTransitionProvider>
    </BrowserRouter>
  );
}

// Background wrapper that shows Grainient only on home page
function BackgroundWrapper() {
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const isProjetsPage = location.pathname === '/projets' || location.pathname.startsWith('/projets/');
  
  // Track dark mode state with reactive updates
  const [isDarkMode, setIsDarkMode] = useState(() => 
    document.documentElement.classList.contains('dark')
  );
  
  // Listen for theme changes
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    });
    
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });
    
    return () => observer.disconnect();
  }, []);

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
          color1: '#000000',  // Foncé
          color2: '#545454',  // Gris clair
          color3: '#bababa'   // Clair
        }
      : {
          color1: '#FFFFFF',  // Clair (inversé)
          color2: '#6B6B6B',  // Gris moyen-foncé (inversé)
          color3: '#2A2A2A'   // Foncé (inversé)
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
