import { motion } from 'motion/react';
import { useEffect, useState } from 'react';

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [fillProgress, setFillProgress] = useState(0);
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
    // Animation du remplissage du logo de gauche à droite (0% → 100% en 1.5s)
    const duration = 1500; // 1.5 secondes
    const startTime = Date.now();

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      setFillProgress(progress * 100);

      if (progress >= 1) {
        clearInterval(interval);
        // Attendre 300ms avant de descendre le panel
        setTimeout(() => {
          onComplete();
        }, 300);
      }
    }, 16); // ~60fps

    return () => clearInterval(interval);
  }, [onComplete]);

  // Couleurs selon le thème
  const panelBg = isDarkMode ? '#121312' : '#EAEAEA';
  const logoBase = isDarkMode ? '#1C1D1C' : '#FFFFFF';
  const logoFill = isDarkMode ? '#EAEAEA' : '#151615';

  return (
    <motion.div
      className="fixed inset-0 z-[1000] flex items-center justify-center"
      style={{
        backgroundColor: panelBg,
      }}
      initial={{ y: 0 }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ 
        duration: 0.8, 
        ease: [0.43, 0.13, 0.23, 0.96] 
      }}
    >
      <div style={{ position: 'relative', width: '300px', height: '200px' }}>
        {/* Logo de base */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '120px',
            fontWeight: 800,
            fontFamily: 'Manrope, sans-serif',
            color: logoBase,
            letterSpacing: '-0.02em',
          }}
        >
          AK
        </div>
        
        {/* Logo de remplissage avec clip */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '120px',
            fontWeight: 800,
            fontFamily: 'Manrope, sans-serif',
            color: logoFill,
            letterSpacing: '-0.02em',
            clipPath: `inset(0 ${100 - fillProgress}% 0 0)`,
          }}
        >
          AK
        </div>
      </div>
    </motion.div>
  );
}