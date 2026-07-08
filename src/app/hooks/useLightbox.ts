import { useState, useEffect } from 'react';

interface UseLightboxReturn {
  selectedImageIndex: number | null;
  openLightbox: (index: number) => void;
  closeLightbox: () => void;
  goToPrevious: () => void;
  goToNext: () => void;
  canGoPrevious: boolean;
  canGoNext: boolean;
}

/**
 * Custom hook for managing image lightbox functionality
 * Handles keyboard navigation, body scroll lock, and navigation state
 */
export function useLightbox(totalImages: number, onNavigate?: () => void): UseLightboxReturn {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

  const openLightbox = (index: number) => {
    setSelectedImageIndex(index);
    document.body.style.overflow = 'hidden';
    onNavigate?.();
  };

  const closeLightbox = () => {
    setSelectedImageIndex(null);
    document.body.style.overflow = '';
  };

  const goToPrevious = () => {
    if (selectedImageIndex !== null && selectedImageIndex > 0) {
      setSelectedImageIndex(selectedImageIndex - 1);
    }
  };

  const goToNext = () => {
    if (selectedImageIndex !== null && selectedImageIndex < totalImages - 1) {
      setSelectedImageIndex(selectedImageIndex + 1);
    }
  };

  const canGoPrevious = selectedImageIndex !== null && selectedImageIndex > 0;
  const canGoNext = selectedImageIndex !== null && selectedImageIndex < totalImages - 1;

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedImageIndex === null) return;

      if (e.key === 'Escape') {
        closeLightbox();
      } else if (e.key === 'ArrowLeft') {
        goToPrevious();
      } else if (e.key === 'ArrowRight') {
        goToNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedImageIndex, totalImages]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  return {
    selectedImageIndex,
    openLightbox,
    closeLightbox,
    goToPrevious,
    goToNext,
    canGoPrevious,
    canGoNext,
  };
}
