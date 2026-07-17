import React, { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';
import { SplitText as GSAPSplitText } from 'gsap/SplitText';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(GSAPSplitText, useGSAP);

export const getCharacterMaskPadding = (width: number, enabled = false) =>
  enabled ? Math.min(12, Math.max(4, width * 0.04)) : 0;

interface ShuffleProps {
  text: string;
  className?: string;
  style?: React.CSSProperties;
  shuffleDirection?: 'up' | 'down' | 'left' | 'right';
  duration?: number;
  ease?: string;
  tag?: keyof JSX.IntrinsicElements;
  shuffleTimes?: number;
  stagger?: number;
  loop?: boolean;
  loopDelay?: number;
  initialDelay?: number;
  useCharacterMaskPadding?: boolean;
}

const Shuffle: React.FC<ShuffleProps> = ({
  text,
  className = '',
  style = {},
  shuffleDirection = 'up',
  duration = 1,
  ease = 'expo.out',
  tag = 'p',
  shuffleTimes = 1,
  stagger = 0.05,
  loop = false,
  loopDelay = 3,
  initialDelay = 0.2,
  useCharacterMaskPadding = false
}) => {
  const ref = useRef<HTMLElement>(null);
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [resizeKey, setResizeKey] = useState(0);

  // Attendre que les fonts soient chargées
  useEffect(() => {
    if ('fonts' in document) {
      document.fonts.ready.then(() => setFontsLoaded(true));
    } else {
      setFontsLoaded(true);
    }
  }, []);

  // Écouter le resize pour recalculer les animations
  useEffect(() => {
    let resizeTimeout: NodeJS.Timeout;
    
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        setResizeKey(prev => prev + 1);
      }, 150);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimeout);
    };
  }, []);

  useGSAP(
    () => {
      if (!ref.current || !fontsLoaded || !text) return;

      const el = ref.current;
      
      // Split text en caractères
      const split = new GSAPSplitText(el, {
        type: 'chars',
        charsClass: 'shuffle-char'
      });

      const chars = (split.chars || []) as HTMLElement[];
      if (!chars.length) return;

      // Créer un ordre aléatoire pour les animations
      const randomOrder = chars.map((_, index) => index);
      for (let i = randomOrder.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [randomOrder[i], randomOrder[j]] = [randomOrder[j], randomOrder[i]];
      }

      // Créer les wrappers pour chaque caractère
      chars.forEach((char) => {
        const parent = char.parentElement;
        if (!parent) return;

        const rect = char.getBoundingClientRect();
        const w = rect.width;
        const h = rect.height;
        if (!w && !h) return;

        const spacingMultiplier = 1.15; // Espacement entre les lettres dupliquées
        const maskPadding = getCharacterMaskPadding(w, useCharacterMaskPadding);

        // Wrapper principal
        const wrapper = document.createElement('span');
        wrapper.style.display = 'inline-block';
        wrapper.style.overflow = 'hidden';
        wrapper.style.verticalAlign = 'top';
        if (maskPadding > 0) {
          wrapper.style.boxSizing = 'content-box';
          wrapper.style.marginLeft = `-${maskPadding}px`;
          wrapper.style.marginRight = `-${maskPadding}px`;
          wrapper.style.padding = `0 ${maskPadding}px`;
        } else {
          wrapper.style.margin = '0';
          wrapper.style.padding = '0';
        }
        wrapper.style.width = (w + 4) + 'px'; // Ajouter 4px pour éviter que les lettres soient coupées
        wrapper.style.height = h + 'px';

        // Container interne qui va bouger
        const inner = document.createElement('span');
        inner.style.display = 'inline-block';

        parent.insertBefore(wrapper, char);
        wrapper.appendChild(inner);

        // Pour direction 'right' : on met d'abord le P2 (à gauche hors champ), puis le P1 (visible)
        // Pour les autres directions : garder la logique originale
        
        if (shuffleDirection === 'right') {
          // D'abord le P2 (qui sera hors champ à gauche)
          const duplicate = char.cloneNode(true) as HTMLElement;
          duplicate.style.display = 'inline-block';
          duplicate.style.width = w + 'px';
          duplicate.style.textAlign = 'center';
          duplicate.style.marginRight = (w * (spacingMultiplier - 1)) + 'px'; // Espacement
          inner.appendChild(duplicate);

          // Ensuite le P1 (qui sera visible)
          char.style.display = 'inline-block';
          char.style.width = w + 'px';
          char.style.textAlign = 'center';
          inner.appendChild(char);

          // Position initiale : P2 hors champ à gauche, P1 visible
          // On décale de -w (largeur d'une lettre) - espacement
          const offset = w * spacingMultiplier;
          gsap.set(inner, { x: -offset });
          inner.setAttribute('data-start', String(-offset));
          inner.setAttribute('data-end', '0'); // Position finale : P2 visible, P1 hors champ à droite
        } else if (shuffleDirection === 'left') {
          // Original : P1 visible, puis P2
          const originalChar = char.cloneNode(true) as HTMLElement;
          originalChar.style.display = 'inline-block';
          originalChar.style.width = w + 'px';
          originalChar.style.textAlign = 'center';
          inner.appendChild(originalChar);

          for (let i = 0; i < shuffleTimes; i++) {
            const duplicate = char.cloneNode(true) as HTMLElement;
            duplicate.style.display = 'inline-block';
            duplicate.style.width = w + 'px';
            duplicate.style.textAlign = 'center';
            duplicate.style.marginLeft = (w * (spacingMultiplier - 1)) + 'px';
            inner.appendChild(duplicate);
          }

          char.style.display = 'inline-block';
          char.style.width = w + 'px';
          char.style.textAlign = 'center';
          char.style.marginLeft = (w * (spacingMultiplier - 1)) + 'px';
          inner.appendChild(char);

          const steps = shuffleTimes + 1;
          gsap.set(inner, { x: 0 });
          inner.setAttribute('data-end', String(-steps * w * spacingMultiplier));
        } else {
          // Directions verticales (up/down)
          const originalChar = char.cloneNode(true) as HTMLElement;
          originalChar.style.display = 'block';
          originalChar.style.width = w + 'px';
          originalChar.style.textAlign = 'center';
          inner.appendChild(originalChar);

          for (let i = 0; i < shuffleTimes; i++) {
            const duplicate = char.cloneNode(true) as HTMLElement;
            duplicate.style.display = 'block';
            duplicate.style.width = w + 'px';
            duplicate.style.textAlign = 'center';
            inner.appendChild(duplicate);
          }

          char.style.display = 'block';
          char.style.width = w + 'px';
          char.style.textAlign = 'center';
          inner.appendChild(char);

          const steps = shuffleTimes + 1;
          if (shuffleDirection === 'up') {
            gsap.set(inner, { y: 0 });
            inner.setAttribute('data-end', String(-steps * h));
          } else { // down
            gsap.set(inner, { y: -steps * h });
            inner.setAttribute('data-end', '0');
          }
        }
      });

      // Animation avec ordre aléatoire et délai de 3 secondes entre chaque lettre
      const timeline = gsap.timeline({ 
        delay: initialDelay,
        repeat: loop ? -1 : 0,
        repeatDelay: loop ? loopDelay : 0,
        onRepeat: () => {
          // Regénérer l'ordre aléatoire à chaque boucle
          const newRandomOrder = chars.map((_, index) => index);
          for (let i = newRandomOrder.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newRandomOrder[i], newRandomOrder[j]] = [newRandomOrder[j], newRandomOrder[i]];
          }
          
          // Réinitialiser les positions selon la direction
          wrappers.forEach((inner) => {
            const startValue = inner.getAttribute('data-start');
            if (startValue) {
              // Pour 'right', on a stocké la position de départ
              if (shuffleDirection === 'right') {
                gsap.set(inner, { x: parseFloat(startValue) });
              }
            } else {
              // Pour les autres directions, utiliser la logique existante
              if (shuffleDirection === 'up' || shuffleDirection === 'left') {
                if (shuffleDirection === 'up') {
                  gsap.set(inner, { y: 0 });
                } else {
                  gsap.set(inner, { x: 0 });
                }
              } else if (shuffleDirection === 'down') {
                const steps = shuffleTimes + 1;
                const h = parseFloat(inner.querySelector('*')?.getBoundingClientRect().height.toString() || '0');
                gsap.set(inner, { y: -steps * h });
              }
            }
          });
        }
      });
      const wrappers = el.querySelectorAll('span > span');

      randomOrder.forEach((charIndex, animationIndex) => {
        const inner = wrappers[charIndex];
        if (!inner) return;
        
        const endValue = parseFloat(inner.getAttribute('data-end') || '0');
        const delay = animationIndex * 5; // 5 secondes entre chaque lettre

        if (shuffleDirection === 'up' || shuffleDirection === 'down') {
          timeline.to(inner, {
            y: endValue,
            duration,
            ease
          }, delay);
        } else {
          timeline.to(inner, {
            x: endValue,
            duration,
            ease
          }, delay);
        }
      });

      return () => {
        timeline.kill();
        split.revert();
      };
    },
    { dependencies: [text, fontsLoaded, shuffleDirection, duration, ease, shuffleTimes, stagger, loop, loopDelay, resizeKey, useCharacterMaskPadding], scope: ref }
  );

  const Tag = tag;
  return React.createElement(Tag, { 
    ref, 
    className: `shuffle-text ${className}`, 
    style 
  }, text);
};

export default Shuffle;
