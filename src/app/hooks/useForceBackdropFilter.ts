import { useEffect } from 'react';

/**
 * Force backdrop-filter calculation for all .glass-card elements
 * This prevents the 0.5s delay when elements enter the viewport
 */
export function useForceBackdropFilter() {
  useEffect(() => {
    // Wait for DOM to be ready
    const timer = setTimeout(() => {
      // Find all glass-card elements
      const glassCards = document.querySelectorAll('.glass-card');
      
      glassCards.forEach((card) => {
        const element = card as HTMLElement;
        
        // FORCE 1: Read layout to trigger reflow
        void element.offsetHeight;
        
        // FORCE 2: Force GPU layer creation by toggling transform
        element.style.transform = 'translateZ(0.01px)';
        requestAnimationFrame(() => {
          element.style.transform = 'translateZ(0)';
        });
        
        // FORCE 3: Force backdrop-filter recalculation
        const currentFilter = window.getComputedStyle(element).backdropFilter;
        element.style.backdropFilter = 'none';
        void element.offsetHeight; // Force reflow
        element.style.backdropFilter = currentFilter;
      });
    }, 50); // Small delay to ensure DOM is ready

    return () => clearTimeout(timer);
  }, []);
}
