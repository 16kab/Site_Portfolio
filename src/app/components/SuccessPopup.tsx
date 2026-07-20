import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle } from 'lucide-react';
import { useEffect, useRef } from 'react';

interface SuccessPopupProps {
  isOpen: boolean;
  onClose: () => void;
  message?: string;
  description?: string;
}

export default function SuccessPopup({
  isOpen,
  onClose,
  message = 'Message envoyé avec succès',
  description = 'Je vous répondrai dans les plus brefs délais.',
}: SuccessPopupProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Fermer avec Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Focus initial sur le bouton Fermer, restitué à la fermeture
  useEffect(() => {
    if (!isOpen) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    closeButtonRef.current?.focus();

    return () => previouslyFocused?.focus();
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[10000] flex items-center justify-center px-4"
            onClick={onClose}
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          </motion.div>

          {/* Popup */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="success-popup-title"
            initial={{ opacity: 0, filter: 'blur(10px)' }}
            animate={{ opacity: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, filter: 'blur(10px)' }}
            transition={{
              duration: 0.4,
              ease: 'easeOut',
            }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[10001] w-[calc(100%-2rem)] max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="relative p-8 sm:p-10"
              style={{
                backgroundColor: '#151615',
                borderRadius: '12px',
                border: '1px solid #1C1D1C',
              }}
            >
              {/* Close button */}
              <button
                type="button"
                ref={closeButtonRef}
                onClick={onClose}
                className="absolute top-4 right-4 p-2 text-[#BABABA] hover:text-[#F1F1F1] transition-colors cursor-pointer"
                aria-label="Fermer"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Success Icon */}
              <div className="flex justify-center mb-6">
                <CheckCircle
                  className="w-16 h-16"
                  style={{ color: '#EAEAEA' }}
                />
              </div>

              {/* Message */}
              <h3
                id="success-popup-title"
                className="text-center mb-3"
                style={{
                  fontFamily: 'Manrope, sans-serif',
                  fontWeight: 600,
                  fontSize: 'clamp(1.25rem, 1.125rem + 0.625vw, 1.5rem)',
                  lineHeight: '1.3',
                  letterSpacing: '-0.5px',
                  color: '#F1F1F1',
                }}
              >
                {message}
              </h3>

              {/* Description */}
              <p
                className="text-center mb-8"
                style={{
                  fontFamily: 'Manrope, sans-serif',
                  fontSize: '15px',
                  fontWeight: 400,
                  lineHeight: '1.7',
                  color: '#BABABA',
                }}
              >
                {description}
              </p>

              {/* Close button */}
              <button
                type="button"
                onClick={onClose}
                className="w-full cursor-pointer px-6 py-3 transition-all duration-300 hover:bg-[#f0f0f0]"
                style={{
                  backgroundColor: '#EAEAEA',
                  color: '#000000',
                  fontFamily: 'Manrope, sans-serif',
                  fontWeight: 500,
                  fontSize: '14px',
                  borderRadius: '5px',
                }}
              >
                Fermer
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
