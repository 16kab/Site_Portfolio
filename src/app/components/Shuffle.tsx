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
  duration?: number;
  ease?: string;
  tag?: keyof JSX.IntrinsicElements;
  loop?: boolean;
  loopDelay?: number;
  initialDelay?: number;
  useCharacterMaskPadding?: boolean;
}

const Shuffle: React.FC<ShuffleProps> = ({
  text,
  className = '',
  style = {},
  duration = 1,
  ease = 'expo.out',
  tag = 'p',
  loop = false,
  loopDelay = 3,
  initialDelay = 0.2,
  useCharacterMaskPadding = false,
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
    let resizeTimeout: ReturnType<typeof setTimeout>;

    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        setResizeKey((prev) => prev + 1);
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

      // Mouvement réduit : le texte reste statique, pas de shuffle
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      const el = ref.current;

      // Split text en caractères
      const split = new GSAPSplitText(el, {
        type: 'chars',
        charsClass: 'shuffle-char',
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
        wrapper.style.width = w + 4 + 'px'; // Ajouter 4px pour éviter que les lettres soient coupées
        wrapper.style.height = h + 'px';

        // Container interne qui va bouger
        const inner = document.createElement('span');
        inner.style.display = 'inline-block';

        parent.insertBefore(wrapper, char);
        wrapper.appendChild(inner);

        // Direction 'right' : on met d'abord le P2 (à gauche hors champ),
        // puis le P1 (visible).
        // D'abord le P2 (qui sera hors champ à gauche)
        const duplicate = char.cloneNode(true) as HTMLElement;
        duplicate.style.display = 'inline-block';
        duplicate.style.width = w + 'px';
        duplicate.style.textAlign = 'center';
        duplicate.style.marginRight = w * (spacingMultiplier - 1) + 'px'; // Espacement
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
            [newRandomOrder[i], newRandomOrder[j]] = [
              newRandomOrder[j],
              newRandomOrder[i],
            ];
          }

          // Réinitialiser les positions au départ stocké
          wrappers.forEach((inner) => {
            const startValue = inner.getAttribute('data-start');
            if (startValue) {
              gsap.set(inner, { x: parseFloat(startValue) });
            }
          });
        },
      });
      const wrappers = el.querySelectorAll('span > span');

      randomOrder.forEach((charIndex, animationIndex) => {
        const inner = wrappers[charIndex];
        if (!inner) return;

        const endValue = parseFloat(inner.getAttribute('data-end') || '0');
        const delay = animationIndex * 5; // 5 secondes entre chaque lettre

        timeline.to(
          inner,
          {
            x: endValue,
            duration,
            ease,
          },
          delay,
        );
      });

      return () => {
        timeline.kill();
        split.revert();
      };
    },
    {
      dependencies: [
        text,
        fontsLoaded,
        duration,
        ease,
        loop,
        loopDelay,
        resizeKey,
        useCharacterMaskPadding,
      ],
      scope: ref,
    },
  );

  const Tag = tag;
  return React.createElement(
    Tag,
    {
      ref,
      className: `shuffle-text ${className}`,
      style,
      // GSAP SplitText pose automatiquement un aria-label sur ce conteneur ;
      // role="img" rend cet attribut valide (interdit sur un <p> nu) tout en
      // exposant le mot aux lecteurs d'écran. Aucun impact visuel.
      role: 'img',
    },
    text,
  );
};

export default Shuffle;
