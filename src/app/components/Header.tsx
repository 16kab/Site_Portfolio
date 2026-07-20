import { Link } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, MessageCircle } from 'lucide-react';
import { RollingText } from './RollingText';
import { useState, useEffect, useRef } from 'react';
import Magnet from './Magnet';
import { AnimatedThemeToggler } from './AnimatedThemeToggler';
import { LanguageToggle } from './LanguageToggle';
import { ROUTES } from '../config';
import { useT } from '../i18n';

const STRINGS = {
  fr: {
    projets: 'Projets',
    apropos: 'À propos',
    contactCta: 'Entrer en contact',
    contact: 'Contact',
    openMenu: 'Ouvrir le menu',
    closeMenu: 'Fermer le menu',
  },
  en: {
    projets: 'Work',
    apropos: 'About',
    contactCta: 'Get in touch',
    contact: 'Contact',
    openMenu: 'Open menu',
    closeMenu: 'Close menu',
  },
};

// Lien react-router animable par motion (couleurs du bouton contact)
const MotionLink = motion.create(Link);

export type HeaderMenuItem = 'projets' | 'apropos' | 'contact' | 'theme';

export const getMenuItemOpacity = (
  hoveredItem: HeaderMenuItem | null,
  item: HeaderMenuItem,
) => (hoveredItem && hoveredItem !== item ? 0.4 : 1);

export default function Header({ showSplash }: { showSplash?: boolean }) {
  const t = useT(STRINGS);
  const [isScrolled, setIsScrolled] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<HeaderMenuItem | null>(null);
  const [isButtonHovered, setIsButtonHovered] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lockedScrollTopRef = useRef<number | null>(null);

  const handleMouseEnter = (item: HeaderMenuItem) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setHoveredItem(item);
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredItem(null);
    }, 150); // 150ms delay before resetting opacity
  };

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      // The BODY element is scrolling, not window!
      const scrollY = document.body.scrollTop || 0;
      const shouldBeScrolled = scrollY > 50;
      setIsScrolled(shouldBeScrolled);
    };

    // Initial check
    handleScroll();

    // Listen to scroll on the body element (not window!)
    document.body.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      document.body.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Fermer le menu mobile avec Escape
  useEffect(() => {
    if (!isMobileMenuOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isMobileMenuOpen]);

  // Lock scroll when mobile menu is open.
  // Attention : le conteneur de scroll de l'app est <body> (html est fixed,
  // cf. theme.css) — window.scrollY vaut toujours 0 ici.
  useEffect(() => {
    if (isMobileMenuOpen) {
      lockedScrollTopRef.current = document.body.scrollTop;
      document.body.style.overflowY = 'hidden';
    } else {
      document.body.style.overflowY = '';
      if (lockedScrollTopRef.current !== null) {
        document.body.scrollTop = lockedScrollTopRef.current;
        lockedScrollTopRef.current = null;
      }
    }

    return () => {
      document.body.style.overflowY = '';
    };
  }, [isMobileMenuOpen]);

  const handleLinkClick = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <motion.header
        className="fixed left-1/2 -translate-x-1/2 z-[200] px-8 sm:px-12 md:px-16 lg:px-20 xl:px-24 w-full max-w-[1920px]"
        style={{
          top: 0,
          paddingTop: 'max(2rem, calc(env(safe-area-inset-top, 0px) + 1rem))',
        }}
        initial={{ filter: 'blur(10px)', opacity: 0 }}
        animate={{
          filter: showSplash ? 'blur(10px)' : 'blur(0px)',
          opacity: showSplash ? 0 : 1,
        }}
        transition={{
          duration: 0.8,
          delay: showSplash ? 3.2 : 0.5,
          ease: [0.25, 0.1, 0.25, 1],
        }}
      >
        <motion.div
          className="h-[70px] rounded-[8px] relative"
          animate={{
            backgroundColor: isMobileMenuOpen
              ? 'rgba(0,0,0,0)'
              : isScrolled
                ? 'var(--header-bg-scrolled)'
                : 'var(--header-bg-default)',
            borderColor: isMobileMenuOpen
              ? 'rgba(0,0,0,0)'
              : isScrolled
                ? 'var(--header-border-scrolled)'
                : 'var(--header-border-default)',
          }}
          transition={{ duration: 0.2 }}
          style={{
            border: '1px solid',
          }}
        >
          {/* Logo - Left */}
          <Link
            to={ROUTES.HOME}
            className="absolute left-[22.58px] top-1/2 -translate-y-1/2 cursor-pointer"
            onClick={handleLinkClick}
          >
            <Magnet padding={100} disabled={false} magnetStrength={50}>
              <motion.p
                className="font-['Manrope',sans-serif] font-semibold text-[16px] tracking-[2px] whitespace-nowrap leading-[21.6px] transition-opacity duration-300"
                animate={{
                  color: isMobileMenuOpen
                    ? '#EAEAEA'
                    : isScrolled
                      ? 'var(--header-logo-scrolled)'
                      : 'var(--header-logo-default)',
                }}
                style={{
                  opacity: hoveredItem ? 0.4 : 1,
                }}
              >
                ALEXIS KABICHE
              </motion.p>
            </Magnet>
          </Link>

          {/* Right side container - Desktop only */}
          <nav
            aria-label="Navigation principale"
            className="hidden lg:flex absolute right-[22.58px] top-1/2 -translate-y-1/2 items-center gap-10"
          >
            {/* Navigation Menu Group */}
            <div className="flex gap-[27px] items-center">
              <Link
                to={ROUTES.PROJETS}
                data-menu-item="projets"
                className="cursor-pointer transition-opacity duration-300"
                style={{ opacity: getMenuItemOpacity(hoveredItem, 'projets') }}
                onMouseEnter={() => handleMouseEnter('projets')}
                onMouseLeave={handleMouseLeave}
                onFocus={() => handleMouseEnter('projets')}
                onBlur={handleMouseLeave}
              >
                <motion.p
                  className="font-['Manrope',sans-serif] font-medium text-[15.9px] whitespace-nowrap leading-[21.6px] tracking-[0.04px] transition-opacity duration-300"
                  animate={{
                    color: isScrolled
                      ? 'var(--header-text-scrolled)'
                      : 'var(--header-text-default)',
                  }}
                >
                  {t.projets}
                </motion.p>
              </Link>

              <motion.p
                aria-hidden="true"
                className="font-['Arial',sans-serif] text-[16px] leading-[21.6px] transition-opacity duration-300"
                animate={{
                  color: isScrolled
                    ? 'var(--header-text-scrolled)'
                    : 'var(--header-text-default)',
                }}
                style={{
                  opacity: 0.4,
                }}
              >
                |
              </motion.p>

              <Link
                to={ROUTES.APROPOS}
                data-menu-item="apropos"
                className="cursor-pointer transition-opacity duration-300"
                style={{ opacity: getMenuItemOpacity(hoveredItem, 'apropos') }}
                onMouseEnter={() => handleMouseEnter('apropos')}
                onMouseLeave={handleMouseLeave}
                onFocus={() => handleMouseEnter('apropos')}
                onBlur={handleMouseLeave}
              >
                <motion.p
                  className="font-['Manrope',sans-serif] font-medium text-[16px] whitespace-nowrap leading-[21.6px] tracking-[0.04px] transition-opacity duration-300"
                  animate={{
                    color: isScrolled
                      ? 'var(--header-text-scrolled)'
                      : 'var(--header-text-default)',
                  }}
                >
                  {t.apropos}
                </motion.p>
              </Link>
            </div>

            {/* Contact Button + Theme Toggler Group */}
            <div className="flex items-center gap-4">
              <motion.div
                data-menu-item="contact"
                className="transition-opacity duration-300"
                style={{ opacity: getMenuItemOpacity(hoveredItem, 'contact') }}
                onMouseEnter={() => handleMouseEnter('contact')}
                onMouseLeave={handleMouseLeave}
                onFocus={() => handleMouseEnter('contact')}
                onBlur={handleMouseLeave}
              >
                <MotionLink
                  to={ROUTES.CONTACT}
                  onClick={handleLinkClick}
                  className="flex px-6 py-3 rounded-[5px] items-center gap-2 cursor-pointer transition-all duration-300"
                  animate={{
                    backgroundColor: isScrolled
                      ? 'var(--header-button-bg-scrolled)'
                      : 'var(--header-button-bg-default)',
                    color: isScrolled
                      ? 'var(--header-button-text-scrolled)'
                      : 'var(--header-button-text-default)',
                  }}
                  onMouseEnter={() => setIsButtonHovered(true)}
                  onMouseLeave={() => setIsButtonHovered(false)}
                  onFocus={() => setIsButtonHovered(true)}
                  onBlur={() => setIsButtonHovered(false)}
                >
                  <MessageCircle size={18} />
                  <motion.div
                    className="font-['Manrope',sans-serif] font-medium text-[14px] whitespace-nowrap"
                    animate={{
                      color: isScrolled
                        ? 'var(--header-button-text-scrolled)'
                        : 'var(--header-button-text-default)',
                    }}
                  >
                    <RollingText
                      text={t.contactCta}
                      inView={isButtonHovered}
                      transition={{
                        duration: 0.3,
                        delay: 0.02,
                        ease: 'easeOut',
                      }}
                    />
                  </motion.div>
                </MotionLink>
              </motion.div>

              <LanguageToggle isScrolled={isScrolled} />

              <motion.div
                data-menu-item="theme"
                className="transition-opacity duration-300"
                style={{ opacity: getMenuItemOpacity(hoveredItem, 'theme') }}
                onMouseEnter={() => handleMouseEnter('theme')}
                onMouseLeave={handleMouseLeave}
                onFocus={() => handleMouseEnter('theme')}
                onBlur={handleMouseLeave}
              >
                <AnimatedThemeToggler isScrolled={isScrolled} />
              </motion.div>
            </div>
          </nav>

          {/* Right side container - Mobile/Tablet only */}
          <div className="lg:hidden absolute right-14 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <LanguageToggle isScrolled={isScrolled} />
            {/* Theme Toggler - Mobile */}
            <AnimatedThemeToggler isScrolled={isScrolled} />
          </div>

          {/* Burger Menu - Mobile/Tablet only */}
          <motion.button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden absolute right-6 top-1/2 -translate-y-1/2 p-2 cursor-pointer z-10"
            aria-label={isMobileMenuOpen ? t.closeMenu : t.openMenu}
            aria-expanded={isMobileMenuOpen}
            aria-controls="menu-mobile"
            animate={{
              color: isMobileMenuOpen
                ? '#EAEAEA'
                : isScrolled
                  ? 'var(--header-text-scrolled)'
                  : 'var(--header-text-default)',
            }}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </motion.button>

          {/* Theme Toggler - Removed from here */}
        </motion.div>
      </motion.header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Background Overlay - 75% black */}
            <motion.div
              className="fixed z-[190] bg-black"
              style={{
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                width: '100vw',
                height: '100vh',
                margin: 0,
                padding: 0,
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.95 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Menu Content */}
            <motion.nav
              id="menu-mobile"
              aria-label="Navigation principale"
              className="fixed z-[195] flex flex-col items-start justify-center gap-8 px-8 sm:px-12 pointer-events-none"
              style={{
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                width: '100vw',
                height: '100vh',
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Link
                to={ROUTES.PROJETS}
                className="pointer-events-auto cursor-pointer"
                onClick={handleLinkClick}
              >
                <motion.span
                  className="block font-bold text-white text-5xl sm:text-6xl md:text-7xl tracking-wider"
                  style={{ fontFamily: 'Manrope, sans-serif' }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  {t.projets}
                </motion.span>
              </Link>

              <Link
                to={ROUTES.APROPOS}
                className="pointer-events-auto cursor-pointer"
                onClick={handleLinkClick}
              >
                <motion.span
                  className="block font-bold text-white text-5xl sm:text-6xl md:text-7xl tracking-wider"
                  style={{ fontFamily: 'Manrope, sans-serif' }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  {t.apropos}
                </motion.span>
              </Link>

              <Link
                to={ROUTES.CONTACT}
                className="pointer-events-auto cursor-pointer"
                onClick={handleLinkClick}
              >
                <motion.span
                  className="block font-bold text-white text-5xl sm:text-6xl md:text-7xl tracking-wider"
                  style={{ fontFamily: 'Manrope, sans-serif' }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                >
                  {t.contact}
                </motion.span>
              </Link>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
