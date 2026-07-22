'use client';

import {
  type MouseEvent as ReactMouseEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Moon, Sun } from 'lucide-react';
import { flushSync } from 'react-dom';
import { motion, type HTMLMotionProps } from 'motion/react';

import { cn } from '../../lib/utils';

interface AnimatedThemeTogglerProps extends HTMLMotionProps<'button'> {
  duration?: number;
  isScrolled?: boolean;
}

export const AnimatedThemeToggler = ({
  className,
  duration = 400,
  isScrolled = false,
  ...props
}: AnimatedThemeTogglerProps) => {
  const [isDark, setIsDark] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const updateTheme = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };

    // Initialize dark mode by default if no preference is set
    const savedTheme = localStorage.getItem('theme');
    if (!savedTheme) {
      document.documentElement.classList.add('dark');
      setIsDark(true);
      localStorage.setItem('theme', 'dark');
    } else {
      updateTheme();
    }

    const observer = new MutationObserver(updateTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  const toggleTheme = useCallback(
    (event?: ReactMouseEvent<HTMLButtonElement>) => {
    // Origine du cercle : le point réellement cliqué (fiable dans tous les
    // cas), avec repli sur le centre du bouton pour l'activation clavier.
    let x: number;
    let y: number;
    if (event && (event.clientX || event.clientY)) {
      x = event.clientX;
      y = event.clientY;
    } else if (buttonRef.current) {
      const r = buttonRef.current.getBoundingClientRect();
      x = r.left + r.width / 2;
      y = r.top + r.height / 2;
    } else {
      x = window.innerWidth;
      y = 0;
    }
    const viewportWidth = window.visualViewport?.width ?? window.innerWidth;
    const viewportHeight = window.visualViewport?.height ?? window.innerHeight;
    const maxRadius = Math.hypot(
      Math.max(x, viewportWidth - x),
      Math.max(y, viewportHeight - y),
    );

    const applyTheme = () => {
      const newTheme = !isDark;
      setIsDark(newTheme);
      document.documentElement.classList.toggle('dark');
      localStorage.setItem('theme', newTheme ? 'dark' : 'light');
    };

    if (typeof document.startViewTransition !== 'function') {
      applyTheme();
      return;
    }

    const transition = document.startViewTransition(() => {
      flushSync(applyTheme);
    });

    const ready = transition?.ready;
    if (ready && typeof ready.then === 'function') {
      ready.then(() => {
        document.documentElement.animate(
          {
            clipPath: [
              `circle(0px at ${x}px ${y}px)`,
              `circle(${maxRadius}px at ${x}px ${y}px)`,
            ],
          },
          {
            duration,
            easing: 'ease-in-out',
            pseudoElement: '::view-transition-new(root)',
          },
        );
      });
    }
  }, [isDark, duration]);

  return (
    <motion.button
      type="button"
      ref={buttonRef}
      onClick={toggleTheme}
      className={cn(
        'p-2 rounded-md transition-colors duration-200 cursor-pointer',
        className,
      )}
      style={{
        color: isScrolled
          ? 'var(--theme-toggle-color-scrolled)'
          : 'var(--theme-toggle-color-default)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--theme-toggle-bg-hover)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'transparent';
      }}
      {...props}
    >
      {isDark ? <Sun size={20} /> : <Moon size={20} />}
      <span className="sr-only">
        {isDark ? 'Activer le thème clair' : 'Activer le thème sombre'}
      </span>
    </motion.button>
  );
};
