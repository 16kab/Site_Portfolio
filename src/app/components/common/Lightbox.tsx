import { AnimatePresence, motion } from 'motion/react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect } from 'react';
import { createPortal } from 'react-dom';

interface LightboxProps {
  images: string[];
  selectedIndex: number | null;
  onClose: () => void;
  onPrevious: () => void;
  onNext: () => void;
  canGoPrevious: boolean;
  canGoNext: boolean;
}

/**
 * Reusable lightbox component for displaying images in fullscreen
 * Supports keyboard navigation and click-outside-to-close
 */
export default function Lightbox({
  images,
  selectedIndex,
  onClose,
  onPrevious,
  onNext,
  canGoPrevious,
  canGoNext,
}: LightboxProps) {
  // Block scroll when lightbox is open
  useEffect(() => {
    if (selectedIndex !== null) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [selectedIndex]);

  // Handle close with cursor wake-up
  const handleClose = () => {
    // Force mouseleave on all cursor-target elements before closing
    const cursorTargets = document.querySelectorAll('.cursor-target');
    cursorTargets.forEach(target => {
      const leaveEvent = new MouseEvent('mouseleave', {
        view: window,
        bubbles: true,
        cancelable: true,
      });
      target.dispatchEvent(leaveEvent);
    });

    onClose();
    
    // Force multiple cursor updates to ensure it wakes up
    setTimeout(() => {
      const x = (window as any).lastMouseX || window.innerWidth / 2;
      const y = (window as any).lastMouseY || window.innerHeight / 2;
      
      // Dispatch multiple events to force cursor update
      ['mouseout', 'mouseleave', 'mousemove'].forEach(eventType => {
        const event = new MouseEvent(eventType, {
          view: window,
          bubbles: true,
          cancelable: true,
          clientX: x,
          clientY: y
        });
        document.dispatchEvent(event);
      });
      
      // Force a tiny movement
      setTimeout(() => {
        const moveEvent = new MouseEvent('mousemove', {
          view: window,
          bubbles: true,
          cancelable: true,
          clientX: x + 1,
          clientY: y + 1
        });
        document.dispatchEvent(moveEvent);
      }, 10);
    }, 100);
  };

  // Track mouse position globally
  useEffect(() => {
    const trackMouse = (e: MouseEvent) => {
      (window as any).lastMouseX = e.clientX;
      (window as any).lastMouseY = e.clientY;
    };
    
    window.addEventListener('mousemove', trackMouse);
    return () => window.removeEventListener('mousemove', trackMouse);
  }, []);
  
  if (selectedIndex === null) return null;

  // Render in portal to bypass z-index stacking contexts
  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[10000] bg-black/95 flex items-center justify-center"
        onClick={handleClose}
      >
        {/* Close button */}
        <button
          onClick={(e) => {
            handleClose();
          }}
          className="absolute top-4 right-4 sm:top-6 sm:right-6 z-10 p-2 sm:p-3 bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/40 transition-all duration-300 text-white cursor-target"
          style={{
            clipPath: 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)',
          }}
        >
          <X className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        {/* Navigation buttons */}
        {canGoPrevious && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPrevious();
            }}
            className="absolute left-4 sm:left-6 z-10 p-2 sm:p-3 bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/40 transition-all duration-300 text-white cursor-target"
            style={{
              clipPath: 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)',
            }}
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        )}

        {canGoNext && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onNext();
            }}
            className="absolute right-4 sm:right-6 z-10 p-2 sm:p-3 bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/40 transition-all duration-300 text-white cursor-target"
            style={{
              clipPath: 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)',
            }}
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        )}

        {/* Image */}
        <motion.div
          key={selectedIndex}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.3 }}
          className="max-w-[90vw] max-h-[90vh] relative"
          onClick={(e) => e.stopPropagation()}
        >
          <img
            src={images[selectedIndex]}
            alt={`Image ${selectedIndex + 1}`}
            className="max-w-full max-h-[90vh] object-contain"
          />

          {/* Image counter */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-2 bg-black/60 backdrop-blur-sm border border-white/20 text-white text-sm">
            {selectedIndex + 1} / {images.length}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}