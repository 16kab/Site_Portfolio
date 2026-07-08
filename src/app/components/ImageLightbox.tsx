import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface ImageLightboxProps {
  images: string[];
  currentIndex: number;
  onClose: () => void;
}

export function ImageLightbox({ images, currentIndex, onClose }: ImageLightboxProps) {
  const [index, setIndex] = useState(currentIndex);

  // Block scroll when lightbox is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const goToPrevious = () => {
    setIndex((prevIndex) => (prevIndex === 0 ? images.length - 1 : prevIndex - 1));
  };

  const goToNext = () => {
    setIndex((prevIndex) => (prevIndex === images.length - 1 ? 0 : prevIndex + 1));
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
    if (e.key === 'ArrowLeft') goToPrevious();
    if (e.key === 'ArrowRight') goToNext();
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[300] flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onKeyDown={handleKeyDown}
        tabIndex={0}
      >
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0 bg-black/95"
          onClick={onClose}
        />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 z-[310] p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          aria-label="Close lightbox"
        >
          <X size={24} className="text-white" />
        </button>

        {/* Previous Button */}
        {images.length > 1 && (
          <button
            onClick={goToPrevious}
            className="absolute left-6 z-[310] p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            aria-label="Previous image"
          >
            <ChevronLeft size={24} className="text-white" />
          </button>
        )}

        {/* Next Button */}
        {images.length > 1 && (
          <button
            onClick={goToNext}
            className="absolute right-6 z-[310] p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            aria-label="Next image"
          >
            <ChevronRight size={24} className="text-white" />
          </button>
        )}

        {/* Image */}
        <motion.div
          className="relative z-[305] max-w-[90vw] max-h-[90vh] flex items-center justify-center"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <img
            src={images[index]}
            alt={`Image ${index + 1}`}
            className="max-w-full max-h-[90vh] object-contain rounded-lg"
          />
        </motion.div>

        {/* Image Counter */}
        {images.length > 1 && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[310] px-4 py-2 rounded-full bg-white/10">
            <span 
              className="text-white"
              style={{
                fontFamily: 'Manrope, sans-serif',
                fontSize: '14px',
                fontWeight: 500
              }}
            >
              {index + 1} / {images.length}
            </span>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}