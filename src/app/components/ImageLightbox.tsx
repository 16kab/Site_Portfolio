import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';
import { useT } from '../i18n';

const STRINGS = {
  fr: {
    dialog: (i: number, total: number) =>
      `Visionneuse d'images, image ${i} sur ${total}`,
    close: 'Fermer la visionneuse',
    prev: 'Image précédente',
    next: 'Image suivante',
    zoomIn: 'Zoomer',
    zoomOut: 'Dézoomer',
    alt: (i: number, total: number) => `Aperçu ${i} sur ${total}`,
  },
  en: {
    dialog: (i: number, total: number) =>
      `Image viewer, image ${i} of ${total}`,
    close: 'Close viewer',
    prev: 'Previous image',
    next: 'Next image',
    zoomIn: 'Zoom in',
    zoomOut: 'Zoom out',
    alt: (i: number, total: number) => `Preview ${i} of ${total}`,
  },
};

const MAX_ZOOM = 6;
const MIN_ZOOM = 1;

interface ImageLightboxProps {
  images: string[];
  currentIndex: number;
  onClose: () => void;
}

export function ImageLightbox({
  images,
  currentIndex,
  onClose,
}: ImageLightboxProps) {
  const t = useT(STRINGS);
  const [index, setIndex] = useState(currentIndex);
  const containerRef = useRef<HTMLDivElement>(null);

  // Zoom / panoramique de l'image affichée.
  const [scale, setScale] = useState(1);
  const [tx, setTx] = useState(0);
  const [ty, setTy] = useState(0);
  const dragRef = useRef<{ x: number; y: number; ox: number; oy: number } | null>(
    null,
  );
  const movedRef = useRef(false);

  // Réinitialise le zoom à chaque changement d'image.
  // biome-ignore lint/correctness/useExhaustiveDependencies: index est le déclencheur voulu (reset au changement d'image)
  useEffect(() => {
    setScale(1);
    setTx(0);
    setTy(0);
  }, [index]);

  const zoomTo = useCallback((next: number) => {
    const ns = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Math.round(next * 100) / 100));
    setScale(ns);
    if (ns === 1) {
      setTx(0);
      setTy(0);
    }
  }, []);

  const onWheel = (e: React.WheelEvent) => {
    zoomTo(scale + (e.deltaY < 0 ? 0.4 : -0.4));
  };
  const onImgClick = () => {
    if (movedRef.current) return;
    zoomTo(scale > 1 ? 1 : 2.5);
  };
  const onPointerDown = (e: React.PointerEvent) => {
    movedRef.current = false;
    if (scale <= 1) return;
    dragRef.current = { x: e.clientX, y: e.clientY, ox: tx, oy: ty };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.x;
    const dy = e.clientY - dragRef.current.y;
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) movedRef.current = true;
    setTx(dragRef.current.ox + dx);
    setTy(dragRef.current.oy + dy);
  };
  const onPointerUp = () => {
    dragRef.current = null;
  };

  // Bloque le scroll du body tant que la lightbox est ouverte.
  // Restauration avec '' (et non 'unset') pour rendre la main à la
  // feuille de style (body est le conteneur de scroll de l'app).
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  // Focus initial sur la lightbox, restitué à l'élément déclencheur
  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    containerRef.current?.focus();
    return () => previouslyFocused?.focus();
  }, []);

  const goToPrevious = useCallback(() => {
    setIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1,
    );
  }, [images.length]);

  const goToNext = useCallback(() => {
    setIndex((prevIndex) =>
      prevIndex === images.length - 1 ? 0 : prevIndex + 1,
    );
  }, [images.length]);

  // Clavier au niveau du document : fonctionne sans dépendre du focus
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') goToPrevious();
      if (e.key === 'ArrowRight') goToNext();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose, goToPrevious, goToNext]);

  return (
    <AnimatePresence>
      <motion.div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-label={t.dialog(index + 1, images.length)}
        className="fixed inset-0 z-[300] flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        tabIndex={-1}
      >
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0 bg-black/95"
          onClick={onClose}
        />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-6 right-6 z-[310] p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          aria-label={t.close}
        >
          <X size={24} className="text-white" />
        </button>

        {/* Previous Button */}
        {images.length > 1 && (
          <button
            type="button"
            onClick={goToPrevious}
            className="absolute left-6 z-[310] p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            aria-label={t.prev}
          >
            <ChevronLeft size={24} className="text-white" />
          </button>
        )}

        {/* Next Button */}
        {images.length > 1 && (
          <button
            type="button"
            onClick={goToNext}
            className="absolute right-6 z-[310] p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            aria-label={t.next}
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
          {/* biome-ignore lint/a11y/useKeyWithClickEvents: clic = zoom souris ; l'accès clavier au zoom passe par les boutons +/- ci-dessous */}
          <img
            src={images[index]}
            alt={t.alt(index + 1, images.length)}
            onClick={onImgClick}
            onWheel={onWheel}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            draggable={false}
            className="max-w-full max-h-[90vh] object-contain rounded-lg select-none"
            style={{
              transform: `translate(${tx}px, ${ty}px) scale(${scale})`,
              cursor: scale > 1 ? 'grab' : 'zoom-in',
              transition: dragRef.current ? 'none' : 'transform 0.18s ease-out',
              touchAction: 'none',
            }}
          />
        </motion.div>

        {/* Zoom Controls */}
        <div className="absolute bottom-6 left-6 z-[310] flex items-center gap-2">
          <button
            type="button"
            onClick={() => zoomTo(scale - 0.5)}
            disabled={scale <= MIN_ZOOM}
            className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors disabled:opacity-40 disabled:cursor-default"
            aria-label={t.zoomOut}
          >
            <ZoomOut size={20} className="text-white" />
          </button>
          <button
            type="button"
            onClick={() => zoomTo(scale + 0.5)}
            disabled={scale >= MAX_ZOOM}
            className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors disabled:opacity-40 disabled:cursor-default"
            aria-label={t.zoomIn}
          >
            <ZoomIn size={20} className="text-white" />
          </button>
        </div>

        {/* Image Counter */}
        {images.length > 1 && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[310] px-4 py-2 rounded-full bg-white/10">
            <span
              className="text-white"
              style={{
                fontFamily: 'Manrope, sans-serif',
                fontSize: '14px',
                fontWeight: 500,
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
