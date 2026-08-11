import './ProjetTile.css';
import { useEffect, useState, useRef, forwardRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import svgPaths from '../../../imports/svg-vvxa7ry2aa';
import RollingText from '../RollingText';
import { usePageTransition } from '../../context/PageTransitionContext';
import {
  getProjectTransitionTiming,
  prefersReducedProjectMotion,
  roundTransitionRect,
} from '../../utils/projectTransition';
import { preloadProjetDetail } from '../../pages/preloadProjetDetail';
import { useT } from '../../i18n';
import BorderGlow from './BorderGlow';

const STRINGS = {
  fr: {
    cta: 'Voir le projet',
    aria: (title: string) => `Voir le projet ${title}`,
    cat: { mobile: 'Mobile', web: 'Web', branding: 'Branding' },
  },
  en: {
    cta: 'View project',
    aria: (title: string) => `View project ${title}`,
    cat: { mobile: 'Mobile', web: 'Web', branding: 'Branding' },
  },
};

interface ProjetTileProps {
  link: string;
  title: string;
  category: 'mobile' | 'web' | 'branding';
  image?: string;
  tileSize?: 'l' | 'm' | 's';
  /** true pour les tuiles au-dessus de la ligne de flottaison (chargement immédiat) */
  priority?: boolean;
}

const ProjetTile = forwardRef<HTMLImageElement, ProjetTileProps>(
  ({ link, title, category, image, tileSize = 'm', priority = false }, ref) => {
    const t = useT(STRINGS);
    const [isHovered, setIsHovered] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const imageContainerRef = useRef<HTMLDivElement>(null);
    const navigationTimerRef = useRef<number | null>(null);
    const isNavigationPendingRef = useRef(false);
    const { captureSnapshot, beginForward, isTransitioning } =
      usePageTransition();
    const isInteractive = isHovered || isFocused;

    useEffect(
      () => () => {
        if (navigationTimerRef.current !== null) {
          window.clearTimeout(navigationTimerRef.current);
          navigationTimerRef.current = null;
        }
        isNavigationPendingRef.current = false;
      },
      [],
    );

    const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
      const shouldKeepNativeNavigation =
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey ||
        event.currentTarget.target === '_blank';

      if (shouldKeepNativeNavigation) return;

      if (
        navigationTimerRef.current !== null ||
        isNavigationPendingRef.current ||
        isTransitioning
      ) {
        event.preventDefault();
        return;
      }

      if (image && imageContainerRef.current) {
        const nextSnapshot = {
          imageSrc: image,
          imageRect: roundTransitionRect(
            imageContainerRef.current.getBoundingClientRect(),
          ),
          projectLink: link,
          originPath: location.pathname,
          scrollTop: document.body.scrollTop,
        };

        if (prefersReducedProjectMotion()) {
          captureSnapshot(nextSnapshot);
          return;
        }

        event.preventDefault();

        const timing = getProjectTransitionTiming(window.innerWidth, 'forward');
        isNavigationPendingRef.current = true;
        beginForward(nextSnapshot);

        navigationTimerRef.current = window.setTimeout(() => {
          navigationTimerRef.current = null;
          isNavigationPendingRef.current = false;
          navigate(link);
        }, timing.navigateDelay);
      }
    };

    return (
      <BorderGlow className="project-tile-shell">
        <Link
          to={link}
          aria-label={t.aria(title)}
          onClick={handleClick}
          onMouseEnter={() => {
            setIsHovered(true);
            preloadProjetDetail();
          }}
          onMouseLeave={() => setIsHovered(false)}
          onFocus={() => {
            setIsFocused(true);
            preloadProjetDetail();
          }}
          onBlur={() => setIsFocused(false)}
          className={`project-tile tile-${tileSize} group`}
        >
          <div ref={imageContainerRef} className="tile-media">
            {image && (
              <img
                ref={ref}
                src={image}
                alt={title}
                loading={priority ? undefined : 'lazy'}
                fetchPriority={priority ? 'high' : undefined}
                decoding="async"
                className="tile-image"
              />
            )}
            <div className="tile-scrim" aria-hidden="true" />
            <div className="tile-meta">
              <span className="tile-cat">{t.cat[category]}</span>
              <h3 className="tile-title">{title}</h3>
            </div>
            <span
              className="tile-cta"
              style={{
                backgroundColor: isInteractive
                  ? 'var(--portfolio-button-bg-hover)'
                  : 'var(--portfolio-button-bg)',
                color: 'var(--portfolio-button-text)',
              }}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 16 16" aria-hidden="true">
                <path d={svgPaths.p2fe73000} fill="currentColor" />
              </svg>
              <RollingText
                text={t.cta}
                inView={isInteractive}
                transition={{ duration: 0.3, delay: 0.02, ease: 'easeOut' }}
              />
            </span>
          </div>
        </Link>
      </BorderGlow>
    );
  },
);

export default ProjetTile;
