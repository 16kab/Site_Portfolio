import { useState, useRef, forwardRef } from 'react';
import { Link, useNavigate } from 'react-router';
import svgPaths from '../../../imports/svg-vvxa7ry2aa';
import RollingText from '../RollingText';
import { usePageTransition } from '../../context/PageTransitionContext';
import BorderGlow from './BorderGlow';

interface NewProjectCardProps {
  link: string;
  number: string;
  title: string;
  description: string;
  tags: string[];
  image?: string;
  projectId?: string;
}

const NewProjectCard = forwardRef<HTMLImageElement, NewProjectCardProps>(({
  link,
  number,
  title,
  description,
  tags,
  image,
  projectId,
}, ref) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const navigate = useNavigate();
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const { 
    setIsTransitioning, 
    setTransitionImageSrc, 
    setTransitionImageRect,
    setIsReverse 
  } = usePageTransition();
  const isInteractive = isHovered || isFocused;

  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    const shouldKeepNativeNavigation =
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      event.currentTarget.target === '_blank';

    if (shouldKeepNativeNavigation) return;

    // Only on desktop/laptop (>= 1024px) - use transition
    if (window.innerWidth >= 1024 && image && imageContainerRef.current) {
      event.preventDefault();
      
      const rect = imageContainerRef.current.getBoundingClientRect();
      
      // Round values to avoid sub-pixel rendering issues
      const roundedRect = {
        left: Math.round(rect.left),
        top: Math.round(rect.top),
        width: Math.round(rect.width),
        height: Math.round(rect.height),
        right: Math.round(rect.right),
        bottom: Math.round(rect.bottom),
        x: Math.round(rect.x),
        y: Math.round(rect.y),
      } as DOMRect;
      
      setIsReverse(false); // Forward navigation
      setTransitionImageSrc(image);
      setTransitionImageRect(roundedRect);
      setIsTransitioning(true);
      
      // Navigate after image has grown and stayed in place (just before fade out starts)
      window.setTimeout(() => {
        navigate(link);
      }, 1000);
    }
  };

  return (
    <BorderGlow className="project-card-shell">
      <Link
        to={link}
        aria-label={`Voir le projet ${title}`}
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className="project-card group relative flex w-full flex-col md:flex-row gap-6 md:gap-8 p-6 md:p-8 rounded-[12px] transition-colors duration-300 cursor-pointer"
      >
      {/* Left Content */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          {/* Number */}
          <p 
            style={{
              fontFamily: 'Manrope, sans-serif',
              fontSize: '14px',
              fontWeight: 400,
              letterSpacing: '0.037px',
              lineHeight: '20px',
              color: 'var(--portfolio-text-muted)',
              marginBottom: '4px'
            }}
          >
            ({number})
          </p>

          {/* Title */}
          <h3 
            className="mb-6"
            style={{
              fontFamily: 'Manrope, sans-serif',
              fontSize: '31px',
              fontWeight: 600,
              letterSpacing: '-1.113px',
              lineHeight: '34px',
              color: 'var(--portfolio-text-primary)'
            }}
          >
            {title}
          </h3>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-6">
            {tags.map((tag, index) => (
              <div
                key={index}
                className="rounded-[3px] px-[8px] py-[2px]"
                style={{
                  backgroundColor: 'var(--portfolio-badge-bg)',
                  border: '1px solid var(--portfolio-badge-border)'
                }}
              >
                <span 
                  style={{
                    fontFamily: 'Manrope, sans-serif',
                    fontSize: '13px',
                    fontWeight: 400,
                    letterSpacing: '0.033px',
                    lineHeight: '18px',
                    color: 'var(--portfolio-text-muted)'
                  }}
                >
                  {tag}
                </span>
              </div>
            ))}
          </div>

          {/* Description */}
          <p 
            className="mb-8"
            style={{
              fontFamily: 'Manrope, sans-serif',
              fontSize: '15px',
              fontWeight: 400,
              letterSpacing: '0.04px',
              lineHeight: '22px',
              maxWidth: '600px',
              color: 'var(--portfolio-text-description)'
            }}
          >
            {description}
          </p>
        </div>

        {/* Button - Same as "Entrer en contact" */}
        <span
          className="inline-flex items-center gap-2 px-6 py-3 transition-colors duration-300 self-start"
          style={{
            backgroundColor: isInteractive ? 'var(--portfolio-button-bg-hover)' : 'var(--portfolio-button-bg)',
            color: 'var(--portfolio-button-text)',
            fontFamily: 'Manrope, sans-serif',
            fontWeight: 500,
            fontSize: '14px',
            borderRadius: '5px'
          }}
        >
          <svg className="w-4 h-4" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16" aria-hidden="true">
            <path d={svgPaths.p2fe73000} fill="currentColor" />
          </svg>
          <RollingText 
            text="Voir le projet" 
            inView={isInteractive}
            transition={{ duration: 0.3, delay: 0.02, ease: "easeOut" }}
          />
        </span>
      </div>

      {/* Right Image */}
      {image && (
        <div className="lg:w-[543px] lg:h-[400px] h-[250px] flex-shrink-0">
          <div ref={imageContainerRef} className="w-full h-full rounded-[8px] overflow-hidden">
            <img
              ref={ref}
              src={image}
              alt={title}
              className="project-card-image w-full h-full object-cover object-center"
            />
          </div>
        </div>
      )}
      </Link>
    </BorderGlow>
  );
});

export default NewProjectCard;
