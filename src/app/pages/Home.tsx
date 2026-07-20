import { Link } from 'react-router';
import { ArrowRight } from 'lucide-react';
import Shuffle from '../components/Shuffle';
import { motion } from 'motion/react';
import { useEffect } from 'react';
import PageMeta from '../components/PageMeta';
import { ROUTES } from '../config';
import { ROUTE_META } from '../config/seo';

interface HomeProps {
  showSplash: boolean;
}

export const HOME_BODY_CLASS = 'home-page-active';

export function getHomeAnimationDelays(showSplash: boolean) {
  return showSplash
    ? { textDelay: 2.4, shuffleDelay1: 0.2, shuffleDelay2: 2 }
    : { textDelay: 0.1, shuffleDelay1: 0, shuffleDelay2: 0.1 };
}

export default function Home({ showSplash }: HomeProps) {
  const { textDelay, shuffleDelay1, shuffleDelay2 } =
    getHomeAnimationDelays(showSplash);

  useEffect(() => {
    document.body.classList.add(HOME_BODY_CLASS);
    document.body.scrollTop = 0;

    return () => document.body.classList.remove(HOME_BODY_CLASS);
  }, []);

  return (
    <section className="relative overflow-hidden home-section">
      <PageMeta {...ROUTE_META[ROUTES.HOME]} />
      <h1 className="sr-only">Alexis Kabiche, Product & Brand Designer</h1>
      {/* Hero Content */}
      <div
        className="relative z-10 flex h-full items-center justify-center px-4 sm:px-6 md:px-8"
        style={{ transform: 'translateY(-3%)' }}
      >
        {/* Desktop: layout avec positions absolues */}
        <motion.div
          className="hidden lg:block relative w-full"
          style={{ maxWidth: '1920px', height: 'clamp(250px, 50vh, 750px)' }}
          initial={{ filter: 'blur(10px)', opacity: 0 }}
          animate={{ filter: 'blur(0px)', opacity: 1 }}
          transition={{
            duration: 1.2,
            delay: textDelay,
            ease: [0.25, 0.1, 0.25, 1],
          }}
        >
          {/* PRODUCT - Top Left */}
          <Shuffle
            text="PRODUCT"
            tag="p"
            className="absolute left-0 top-0 whitespace-nowrap"
            style={{
              fontFamily: 'Manrope, sans-serif',
              fontWeight: 800,
              fontSize: 'clamp(32px, 13.4vw, 257px)',
              letterSpacing: '-0.052em',
              lineHeight: 1.4,
              transform: 'translateX(clamp(0px, 10vw, 95px))',
              color: 'var(--home-text-primary)',
            }}
            duration={1}
            ease="expo.out"
            loop={true}
            loopDelay={5}
            initialDelay={shuffleDelay1}
            useCharacterMaskPadding
          />

          {/* brand - Top Right (Italic) */}
          <p
            className="absolute leading-[1.4] whitespace-nowrap"
            style={{
              fontFamily: "'Playfair Display', serif",
              fontStyle: 'italic',
              fontWeight: 400,
              fontSize: 'clamp(20px, 8vw, 154px)',
              letterSpacing: '-0.052em',
              left: 'clamp(200px, 69.8vw, 1342px)',
              top: 'clamp(15px, 5.6vw, 107px)',
              color: 'var(--home-text-primary)',
            }}
          >
            brand
          </p>

          {/* DESIGNER - Middle with offset */}
          <Shuffle
            text="DESIGNER"
            tag="p"
            className="absolute whitespace-nowrap"
            style={{
              fontFamily: 'Manrope, sans-serif',
              fontWeight: 800,
              fontSize: 'clamp(32px, 13.4vw, 257px)',
              letterSpacing: '-0.052em',
              left: 'clamp(50px, 26.6vw, 511px)',
              top: 'clamp(45px, 11.6vw, 223px)',
              lineHeight: 1.4,
              color: 'var(--home-text-primary)',
            }}
            duration={1}
            ease="expo.out"
            loop={true}
            loopDelay={7}
            initialDelay={shuffleDelay2}
          />
        </motion.div>

        {/* Mobile & Tablet: layout centré et empilé */}
        <motion.div
          className="lg:hidden flex flex-col items-center justify-center gap-1 text-center w-full"
          initial={{ filter: 'blur(10px)', opacity: 0 }}
          animate={{ filter: 'blur(0px)', opacity: 1 }}
          transition={{
            duration: 1.2,
            delay: textDelay,
            ease: [0.25, 0.1, 0.25, 1],
          }}
        >
          {/* PRODUCT */}
          <Shuffle
            text="PRODUCT"
            tag="p"
            className="whitespace-nowrap"
            style={{
              fontFamily: 'Manrope, sans-serif',
              fontWeight: 800,
              fontSize: 'clamp(40px, 12vw, 120px)',
              letterSpacing: '-0.052em',
              lineHeight: 1.2,
              color: 'var(--home-text-primary)',
            }}
            duration={1}
            ease="expo.out"
            loop={true}
            loopDelay={5}
            initialDelay={shuffleDelay1}
          />

          {/* and brand */}
          <p
            className="whitespace-nowrap"
            style={{
              fontFamily: "'Playfair Display', serif",
              fontStyle: 'italic',
              fontWeight: 400,
              fontSize: 'clamp(32px, 8vw, 100px)',
              letterSpacing: '-0.052em',
              lineHeight: 1.2,
              transform: 'translateY(-4px)',
              color: 'var(--home-text-primary)',
            }}
          >
            and brand
          </p>

          {/* DESIGNER */}
          <Shuffle
            text="DESIGNER"
            tag="p"
            className="whitespace-nowrap"
            style={{
              fontFamily: 'Manrope, sans-serif',
              fontWeight: 800,
              fontSize: 'clamp(40px, 12vw, 120px)',
              letterSpacing: '-0.052em',
              lineHeight: 1.2,
              color: 'var(--home-text-primary)',
            }}
            duration={1}
            ease="expo.out"
            loop={true}
            loopDelay={7}
            initialDelay={shuffleDelay2}
          />
        </motion.div>
      </div>

      {/* Bouton "Voir mes projets" */}
      <Link
        to={ROUTES.PROJETS}
        className="lg:hidden fixed left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 px-6 py-3 transition-all duration-300 group"
        style={{
          bottom: 'max(5rem, calc(env(safe-area-inset-bottom, 0px) + 2rem))',
          fontFamily: 'Manrope, sans-serif',
          fontWeight: 500,
          fontSize: '15px',
          letterSpacing: '-0.02em',
          borderRadius: '5px',
          backgroundColor: 'var(--home-button-bg)',
          borderWidth: '1px',
          borderStyle: 'solid',
          borderColor: 'var(--home-button-border)',
          color: 'var(--home-button-text)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--home-button-bg-hover)';
          e.currentTarget.style.borderColor = 'var(--home-button-border-hover)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--home-button-bg)';
          e.currentTarget.style.borderColor = 'var(--home-button-border)';
        }}
      >
        <span>Voir mes projets</span>
        <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
      </Link>
    </section>
  );
}
