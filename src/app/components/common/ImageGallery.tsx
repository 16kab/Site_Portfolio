import AnimatedSection from './AnimatedSection';
import { motion } from 'motion/react';

interface ImageGalleryProps {
  images: string[];
  onImageClick: (index: number) => void;
  className?: string;
}

/**
 * Reusable image gallery component with simple animations
 */
export default function ImageGallery({ images, onImageClick, className = '' }: ImageGalleryProps) {
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 ${className}`}>
      {images.map((image, index) => (
        <AnimatedSection
          key={index}
          delay={index * 0.1}
        >
          <div
            className="relative aspect-video overflow-hidden cursor-pointer bg-white/5 border border-white/10"
            style={{
              clipPath: 'polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)',
            }}
            onClick={() => onImageClick(index)}
          >
            {/* Image */}
            <img
              src={image}
              alt={`Gallery image ${index + 1}`}
              className="w-full h-full object-cover"
            />

            {/* Corner accents */}
            <div className="absolute top-0 left-0 w-4 h-[2px] bg-white/60 shadow-[0_0_8px_rgba(255,255,255,0.6)]" />
            <div className="absolute top-0 left-0 w-[2px] h-4 bg-white/60 shadow-[0_0_8px_rgba(255,255,255,0.6)]" />
            <div className="absolute bottom-0 right-0 w-4 h-[2px] bg-white/60 shadow-[0_0_8px_rgba(255,255,255,0.6)]" />
            <div className="absolute bottom-0 right-0 w-[2px] h-4 bg-white/60 shadow-[0_0_8px_rgba(255,255,255,0.6)]" />
          </div>
        </AnimatedSection>
      ))}
    </div>
  );
}
