import { Navigate, useParams } from 'react-router';
import { useState, useRef, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import ContactFooter from '../components/ContactFooter';
import { ScrollFadeIn } from '../components/ScrollFadeIn';
import { ScrollRevealTitle } from '../components/ScrollRevealTitle';
import NewProjectCard from '../components/common/NewProjectCard';
import { projetsData, tousProjets } from '../data/projetsData';
import { ROUTES } from '../config';
import svgPaths from '../../imports/svg-jlpjaqyx1i';
import PageMeta from '../components/PageMeta';
import { ImageLightbox } from '../components/ImageLightbox';
import { scrollBodyTo } from '../utils/scrollBodyTo';

export default function ProjetDetail() {
  const { id } = useParams<{ id: string }>();
  const heroRef = useRef<HTMLDivElement>(null);
  const explanationRef = useRef<HTMLDivElement>(null);
  const galleryRef = useRef<HTMLDivElement>(null);
  // Le conteneur de scroll de l'app est <body> (cf. theme.css), pas window
  const bodyRef = useRef(document.body);
  const [activeSection, setActiveSection] = useState<'explanation' | 'gallery' | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Ref to track programmatic scrolling
  const isScrollingProgrammatically = useRef(false);
  const cancelScrollRef = useRef<(() => void) | null>(null);

  // Scroll animation for hero image zoom - MUST be called before any conditional returns
  const { scrollYProgress } = useScroll({
    container: bodyRef,
    target: heroRef,
    offset: ["start start", "end start"]
  });

  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);

  // Dynamic section detection on scroll — déclaré AVANT le return
  // conditionnel (règle des hooks : ordre d'appel stable à chaque rendu)
  useEffect(() => {
    const handleScroll = () => {
      // Skip automatic detection during programmatic scrolling
      if (isScrollingProgrammatically.current) {
        // Still update isScrolled state
        setIsScrolled((document.body.scrollTop || 0) > 100);
        return;
      }

      const scrollPosition = (document.body.scrollTop || 0) + 200; // Offset to trigger section change earlier

      // Update isScrolled state (scroll > 100px)
      setIsScrolled((document.body.scrollTop || 0) > 100);

      // Check if we're in hero section (before explanation starts)
      if (explanationRef.current) {
        const explanationTop = explanationRef.current.offsetTop;

        if (scrollPosition < explanationTop) {
          setActiveSection(null);
          return;
        }
      }

      // Check if we're in gallery section
      if (galleryRef.current) {
        const galleryTop = galleryRef.current.offsetTop;

        if (scrollPosition >= galleryTop) {
          setActiveSection('gallery');
          return;
        }
      }

      // Otherwise we're in explanation section
      if (explanationRef.current) {
        const explanationTop = explanationRef.current.offsetTop;

        if (scrollPosition >= explanationTop) {
          setActiveSection('explanation');
          return;
        }
      }
    };

    // Scroll to top on mount - instant scroll
    document.body.style.scrollBehavior = 'auto';
    document.body.scrollTop = 0;
    // Restore smooth scroll after a brief delay
    const restoreTimeout = setTimeout(() => {
      document.body.style.scrollBehavior = '';
    }, 50);

    // Listen to body scroll
    document.body.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Check initial position

    return () => {
      document.body.removeEventListener('scroll', handleScroll);
      clearTimeout(restoreTimeout);
      // Stoppe une éventuelle animation de scroll en cours
      cancelScrollRef.current?.();
    };
  }, []);

  // Find project
  const projet = projetsData.find(p => p.id === id);

  // Get other projects (excluding current one)
  const allOtherProjects = tousProjets.filter(p => p.link !== `/projets/${id}`);

  // Redirect if project not found - AFTER all hooks
  if (!projet) {
    return <Navigate to={ROUTES.PROJETS} replace />;
  }

  // Scroll to section (annulable, respecte prefers-reduced-motion)
  const scrollToSection = (section: 'explanation' | 'gallery') => {
    const ref = section === 'explanation' ? explanationRef : galleryRef;
    if (!ref.current) return;

    // Set active section immediately
    setActiveSection(section);

    // Block automatic detection during programmatic scroll
    isScrollingProgrammatically.current = true;

    const offset = 120; // Offset pour le menu sticky
    const targetPosition = ref.current.offsetTop - offset;

    cancelScrollRef.current?.();
    cancelScrollRef.current = scrollBodyTo(targetPosition, 800, () => {
      // Re-enable automatic detection after scroll completes
      setTimeout(() => {
        isScrollingProgrammatically.current = false;
      }, 100);
    });
  };

  return (
    <div
      className="relative min-h-screen projet-detail-page"
      style={{ backgroundColor: 'var(--portfolio-bg)' }}
    >
      <PageMeta
        title={`${projet.title} — Alexis Kabiche`}
        description={projet.description}
        path={`/projets/${projet.id}`}
      />
      {/* Hero Section - Full Screen */}
      <section ref={heroRef} className="relative h-screen overflow-hidden" style={{ width: '100vw' }}>
        {/* Hero Image with Zoom Effect */}
        <motion.div 
          style={{ scale }}
          className="absolute inset-0"
        >
          <img
            src={projet.image}
            alt={projet.title}
            className="w-full h-full object-cover object-center"
          />
          {/* Dark overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        </motion.div>

        {/* Content Overlay - Bottom Left */}
        <div className="absolute bottom-0 left-0 right-0">
          <div className="mx-auto w-full max-w-[1920px] px-8 sm:px-12 md:px-16 lg:px-20 xl:px-24 pb-8 sm:pb-12 md:pb-16 lg:pb-20 xl:pb-24">
            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-4">
              {projet.tags.map((tag, index) => (
                <div
                  key={index}
                  className="bg-[#232423] border border-[#232423] rounded-[3px] px-[8px] py-[2px]"
                >
                  <span 
                    className="text-[#9f9f9f]"
                    style={{
                      fontFamily: 'Manrope, sans-serif',
                      fontSize: '13px',
                      fontWeight: 400,
                      letterSpacing: '0.033px',
                      lineHeight: '18px'
                    }}
                  >
                    {tag}
                  </span>
                </div>
              ))}
            </div>

            {/* Title */}
            <h1 
              className="text-white mb-4 break-words"
              style={{
                fontFamily: 'Manrope, sans-serif',
                fontSize: 'clamp(2rem, 1rem + 5vw, 4rem)',
                fontWeight: 700,
                letterSpacing: '-1.4px',
                lineHeight: '1.1',
                maxWidth: '90%'
              }}
            >
              {projet.title}
            </h1>

            {/* Meta Info */}
            <div className="flex flex-wrap gap-3 text-white/90">
              <p 
                style={{
                  fontFamily: 'Manrope, sans-serif',
                  fontSize: '16px',
                  fontWeight: 400,
                  lineHeight: '1.5'
                }}
              >
                {projet.year}
              </p>
              {projet.natureProduit && (
                <>
                  <span style={{ color: 'rgba(255, 255, 255, 0.5)' }}>·</span>
                  <p 
                    style={{
                      fontFamily: 'Manrope, sans-serif',
                      fontSize: '16px',
                      fontWeight: 400,
                      lineHeight: '1.5'
                    }}
                  >
                    {projet.natureProduit}
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Sticky Sub Menu Switch - Bottom Right of Header on desktop, Bottom Center on mobile */}
      {projet.gallery && projet.gallery.length > 0 && (
        <motion.div 
          className="fixed z-[199] left-0 right-0 md:top-[112px] bottom-6 md:bottom-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.2, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="mx-auto w-full max-w-[1920px] px-8 sm:px-12 md:px-16 lg:px-20 xl:px-24">
            <div className="flex justify-center md:justify-end">
              <div 
                className="relative flex gap-2 rounded-lg p-2 transition-all duration-300"
                style={{
                  backgroundColor: isScrolled ? 'var(--switch-bg-scrolled)' : 'var(--switch-bg-default)',
                  border: `1px solid ${isScrolled ? 'var(--switch-border-scrolled)' : 'var(--switch-border-default)'}`
                }}
              >
                {/* Sliding Background - Only visible when a section is active */}
                {activeSection && (
                  <motion.div 
                    className="absolute rounded-md"
                    initial={false}
                    style={{
                      backgroundColor: isScrolled ? 'var(--switch-active-bg-scrolled)' : 'var(--switch-active-bg-default)',
                      zIndex: 0
                    }}
                    animate={{
                      top: '8px',
                      bottom: '8px',
                      left: activeSection === 'explanation' ? '8px' : undefined,
                      right: activeSection === 'gallery' ? '8px' : undefined,
                      width: activeSection === 'explanation' ? '136px' : '104px',
                      x: activeSection === 'explanation' ? 0 : 'calc(136px + 8px)',
                    }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
                
                {/* Explication Button */}
                <button
                  type="button"
                  onClick={() => scrollToSection('explanation')}
                  className="relative z-10 transition-colors duration-300 cursor-pointer"
                  style={{
                    display: 'flex',
                    gap: '8px',
                    alignItems: 'center',
                    paddingTop: '10px',
                    paddingBottom: '10px',
                    paddingLeft: '16px',
                    paddingRight: '16px',
                    width: '136px'
                  }}
                >
                  <svg
                    aria-hidden="true"
                    className="shrink-0 transition-all duration-300"
                    width="18" 
                    height="18" 
                    viewBox="0 0 18 18" 
                    fill="none"
                  >
                    <path 
                      d={svgPaths.p1a3bbb00}
                      stroke={activeSection === 'explanation' 
                        ? (isScrolled ? 'var(--switch-active-text-scrolled)' : 'var(--switch-active-text-default)') 
                        : (isScrolled ? 'var(--switch-text-scrolled)' : 'var(--switch-text-default)')}
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth="1.5" 
                    />
                    <path 
                      d="M10.5 1.5V6H15" 
                      stroke={activeSection === 'explanation' 
                        ? (isScrolled ? 'var(--switch-active-text-scrolled)' : 'var(--switch-active-text-default)') 
                        : (isScrolled ? 'var(--switch-text-scrolled)' : 'var(--switch-text-default)')}
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth="1.5" 
                    />
                    <path 
                      d="M12 9.75H6" 
                      stroke={activeSection === 'explanation' 
                        ? (isScrolled ? 'var(--switch-active-text-scrolled)' : 'var(--switch-active-text-default)') 
                        : (isScrolled ? 'var(--switch-text-scrolled)' : 'var(--switch-text-default)')}
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth="1.5" 
                    />
                    <path 
                      d="M12 12.75H6" 
                      stroke={activeSection === 'explanation' 
                        ? (isScrolled ? 'var(--switch-active-text-scrolled)' : 'var(--switch-active-text-default)') 
                        : (isScrolled ? 'var(--switch-text-scrolled)' : 'var(--switch-text-default)')}
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth="1.5" 
                    />
                    <path 
                      d="M7.5 6.75H6.75H6" 
                      stroke={activeSection === 'explanation' 
                        ? (isScrolled ? 'var(--switch-active-text-scrolled)' : 'var(--switch-active-text-default)') 
                        : (isScrolled ? 'var(--switch-text-scrolled)' : 'var(--switch-text-default)')}
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth="1.5" 
                    />
                  </svg>
                  <span 
                    style={{
                      fontFamily: 'Manrope, sans-serif',
                      fontWeight: 500,
                      fontSize: '15px',
                      letterSpacing: '0.04px',
                      color: activeSection === 'explanation' 
                        ? (isScrolled ? 'var(--switch-active-text-scrolled)' : 'var(--switch-active-text-default)') 
                        : (isScrolled ? 'var(--switch-text-scrolled)' : 'var(--switch-text-default)'),
                      whiteSpace: 'nowrap'
                    }}
                  >
                    Explication
                  </span>
                </button>

                {/* Galerie Button */}
                <button
                  type="button"
                  onClick={() => scrollToSection('gallery')}
                  className="relative z-10 transition-colors duration-300 cursor-pointer"
                  style={{
                    display: 'flex',
                    gap: '8px',
                    alignItems: 'center',
                    paddingTop: '10px',
                    paddingBottom: '10px',
                    paddingLeft: '16px',
                    paddingRight: '16px',
                    width: '104px'
                  }}
                >
                  <svg
                    aria-hidden="true"
                    className="shrink-0 transition-all duration-300"
                    width="18" 
                    height="18" 
                    viewBox="0 0 18 18" 
                    fill="none"
                  >
                    <path 
                      d={svgPaths.p1a8e7980}
                      stroke={activeSection === 'gallery' 
                        ? (isScrolled ? 'var(--switch-active-text-scrolled)' : 'var(--switch-active-text-default)') 
                        : (isScrolled ? 'var(--switch-text-scrolled)' : 'var(--switch-text-default)')}
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth="1.5" 
                    />
                    <path 
                      d={svgPaths.p11e0c80}
                      stroke={activeSection === 'gallery' 
                        ? (isScrolled ? 'var(--switch-active-text-scrolled)' : 'var(--switch-active-text-default)') 
                        : (isScrolled ? 'var(--switch-text-scrolled)' : 'var(--switch-text-default)')}
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth="1.5" 
                    />
                    <path 
                      d={svgPaths.p3e6b7400}
                      stroke={activeSection === 'gallery' 
                        ? (isScrolled ? 'var(--switch-active-text-scrolled)' : 'var(--switch-active-text-default)') 
                        : (isScrolled ? 'var(--switch-text-scrolled)' : 'var(--switch-text-default)')}
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth="1.5" 
                    />
                  </svg>
                  <span 
                    style={{
                      fontFamily: 'Manrope, sans-serif',
                      fontWeight: 500,
                      fontSize: '15px',
                      letterSpacing: '0.04px',
                      color: activeSection === 'gallery' 
                        ? (isScrolled ? 'var(--switch-active-text-scrolled)' : 'var(--switch-active-text-default)') 
                        : (isScrolled ? 'var(--switch-text-scrolled)' : 'var(--switch-text-default)'),
                      whiteSpace: 'nowrap'
                    }}
                  >
                    Galerie
                  </span>
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Content Section */}
      <section ref={explanationRef} className="py-20">
        <div className="mx-auto w-full max-w-[1920px] px-8 sm:px-12 md:px-16 lg:px-20 xl:px-24">
          {/* Grid Layout for sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Problématique */}
            {projet.problematique && (
              <ScrollFadeIn delay={0.1}>
                <div 
                  className="p-8"
                  style={{
                    backgroundColor: 'var(--portfolio-card-bg)',
                    borderRadius: '12px',
                    border: '1px solid var(--portfolio-card-border)',
                    height: '100%'
                  }}
                >
                  <h2 
                    className="mb-6"
                    style={{
                      fontFamily: 'Manrope, sans-serif',
                      fontWeight: 600,
                      fontSize: 'clamp(1.5rem, 1.25rem + 1.25vw, 2rem)',
                      lineHeight: '1.2',
                      letterSpacing: '-1.4px',
                      color: 'var(--portfolio-text-primary)'
                    }}
                  >
                    Problématique
                  </h2>
                  <div 
                    className="space-y-3"
                    style={{
                      fontFamily: 'Manrope, sans-serif',
                      fontSize: '15px',
                      fontWeight: 400,
                      lineHeight: '1.7',
                      color: 'var(--portfolio-text-description)'
                    }}
                  >
                    {projet.problematique.split('\n').map((line, index) => {
                      const trimmedLine = line.trim();
                      if (trimmedLine === '') return <div key={index} className="h-2" />;
                      if (trimmedLine.startsWith('•')) {
                        const content = trimmedLine.substring(1).trim();
                        return (
                          <div key={index} className="flex gap-2 items-start">
                            <span style={{ color: 'var(--portfolio-text-muted)' }} className="mt-1">•</span>
                            <span>{content}</span>
                          </div>
                        );
                      }
                      return <p key={index}>{trimmedLine}</p>;
                    })}
                  </div>
                </div>
              </ScrollFadeIn>
            )}

            {/* Mon Rôle */}
            {projet.role && (
              <ScrollFadeIn delay={0.15}>
                <div 
                  className="p-8"
                  style={{
                    backgroundColor: 'var(--portfolio-card-bg)',
                    borderRadius: '12px',
                    border: '1px solid var(--portfolio-card-border)',
                    height: '100%'
                  }}
                >
                  <h2 
                    className="mb-6"
                    style={{
                      fontFamily: 'Manrope, sans-serif',
                      fontWeight: 600,
                      fontSize: 'clamp(1.5rem, 1.25rem + 1.25vw, 2rem)',
                      lineHeight: '1.2',
                      letterSpacing: '-1.4px',
                      color: 'var(--portfolio-text-primary)'
                    }}
                  >
                    Mon rôle
                  </h2>
                  <p 
                    className="mb-6"
                    style={{
                      fontFamily: 'Manrope, sans-serif',
                      fontSize: '15px',
                      fontWeight: 400,
                      lineHeight: '1.7',
                      color: 'var(--portfolio-text-description)'
                    }}
                  >
                    {projet.role}
                  </p>
                  
                  {projet.interventions && projet.interventions.length > 0 && (
                    <div className="space-y-2">
                      {projet.interventions.map((intervention, index) => (
                        <div 
                          key={index} 
                          className="flex gap-2 items-start"
                          style={{
                            fontFamily: 'Manrope, sans-serif',
                            fontSize: '15px',
                            fontWeight: 400,
                            lineHeight: '1.7',
                            color: 'var(--portfolio-text-description)'
                          }}
                        >
                          <span style={{ color: 'var(--portfolio-text-muted)' }} className="mt-1">•</span>
                          <span>{intervention}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </ScrollFadeIn>
            )}
          </div>

          {/* Impact - Full Width */}
          {projet.impact && (
            <ScrollFadeIn delay={0.2}>
              <div 
                className="p-8 mt-8"
                style={{
                  backgroundColor: 'var(--portfolio-card-bg)',
                  borderRadius: '12px',
                  border: '1px solid var(--portfolio-card-border)'
                }}
              >
                <h2 
                  className="mb-6"
                  style={{
                    fontFamily: 'Manrope, sans-serif',
                    fontWeight: 600,
                    fontSize: 'clamp(1.5rem, 1.25rem + 1.25vw, 2rem)',
                    lineHeight: '1.2',
                    letterSpacing: '-1.4px',
                    color: 'var(--portfolio-text-primary)'
                  }}
                >
                  Impact
                </h2>
                <div 
                  className="space-y-3"
                  style={{
                    fontFamily: 'Manrope, sans-serif',
                    fontSize: '15px',
                    fontWeight: 400,
                    lineHeight: '1.7',
                    color: 'var(--portfolio-text-description)'
                  }}
                >
                  {projet.impact.split('\n').map((line, index) => {
                    const trimmedLine = line.trim();
                    if (trimmedLine === '') return <div key={index} className="h-2" />;
                    if (trimmedLine.startsWith('•')) {
                      const content = trimmedLine.substring(1).trim();
                      return (
                        <div key={index} className="flex gap-2 items-start">
                          <span style={{ color: 'var(--portfolio-text-muted)' }} className="mt-1">•</span>
                          <span>{content}</span>
                        </div>
                      );
                    }
                    return <p key={index}>{trimmedLine}</p>;
                  })}
                </div>
              </div>
            </ScrollFadeIn>
          )}

          {/* Démarches */}
          {projet.demarche && projet.demarche.length > 0 && (
            <div className="mt-16">
              <ScrollRevealTitle delay={0.25}>
                <h2 
                  className="mb-8"
                  style={{
                    fontFamily: 'Manrope, sans-serif',
                    fontWeight: 600,
                    fontSize: 'clamp(1.5rem, 1.25rem + 1.25vw, 2rem)',
                    lineHeight: '1.2',
                    letterSpacing: '-1.4px',
                    color: 'var(--portfolio-text-primary)'
                  }}
                >
                  Démarche
                </h2>
              </ScrollRevealTitle>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {projet.demarche.map((step, index) => (
                  <ScrollFadeIn key={index} delay={0.3 + index * 0.05}>
                    <div 
                      className="p-6 flex flex-col h-full"
                      style={{
                        backgroundColor: 'var(--portfolio-card-bg)',
                        borderRadius: '12px',
                        border: '1px solid var(--portfolio-card-border)'
                      }}
                    >
                      <p 
                        className="mb-2"
                        style={{
                          fontFamily: 'Manrope, sans-serif',
                          fontWeight: 500,
                          fontSize: '13px',
                          lineHeight: '1.5',
                          color: 'var(--portfolio-text-muted)',
                          letterSpacing: '0.5px'
                        }}
                      >
                        ({String(index + 1).padStart(3, '0')})
                      </p>
                      <h3 
                        className="mb-3"
                        style={{
                          fontFamily: 'Manrope, sans-serif',
                          fontWeight: 600,
                          fontSize: '18px',
                          lineHeight: '1.3',
                          letterSpacing: '-0.5px',
                          color: 'var(--portfolio-text-primary)'
                        }}
                      >
                        {step.title}
                      </h3>
                      <p 
                        className="flex-grow"
                        style={{
                          fontFamily: 'Manrope, sans-serif',
                          fontSize: '15px',
                          fontWeight: 400,
                          lineHeight: '1.7',
                          color: 'var(--portfolio-text-description)'
                        }}
                      >
                        {step.content}
                      </p>
                    </div>
                  </ScrollFadeIn>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Gallery Images */}
      {projet.gallery && projet.gallery.length > 0 && (
        <section ref={galleryRef} className="pb-20">
          <div className="mx-auto w-full max-w-[1920px] px-8 sm:px-12 md:px-16 lg:px-20 xl:px-24">
            <ScrollRevealTitle delay={0.05}>
              <h2 
                className="mb-8"
                style={{
                  fontFamily: 'Manrope, sans-serif',
                  fontWeight: 600,
                  fontSize: 'clamp(1.5rem, 1.25rem + 1.25vw, 2rem)',
                  lineHeight: '1.2',
                  letterSpacing: '-1.4px',
                  color: 'var(--portfolio-text-primary)'
                }}
              >
                Galerie
              </h2>
            </ScrollRevealTitle>
            {projet.gallery.map((image, index) => {
              return (
                <div
                  key={`${projet.id}-gallery-${index}`}
                  className="w-full overflow-hidden rounded-[12px] mb-8"
                >
                  <button
                    type="button"
                    className="block w-full cursor-zoom-in focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--portfolio-card-focus)]"
                    aria-label={`Agrandir l'image ${index + 1} du projet ${projet.title}`}
                    onClick={() => {
                      setLightboxIndex(index);
                      setLightboxOpen(true);
                    }}
                  >
                    <img
                      src={image}
                      alt={`${projet.title} — aperçu ${index + 1}`}
                      className="w-full h-auto"
                      style={{ backgroundColor: 'var(--portfolio-card-bg)', display: 'block' }}
                      loading="lazy"
                      decoding="async"
                    />
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Other Projects Section */}
      {allOtherProjects.length > 0 && (
        <section className="py-20">
          <div className="mx-auto w-full max-w-[1920px] px-8 sm:px-12 md:px-16 lg:px-20 xl:px-24">
            <ScrollFadeIn delay={0.1}>
              <h2 
                className="mb-12"
                style={{
                  fontFamily: 'Manrope, sans-serif',
                  fontWeight: 600,
                  fontSize: 'clamp(1.5rem, 1.25rem + 1.25vw, 2rem)',
                  lineHeight: '1.2',
                  letterSpacing: '-1.4px',
                  color: 'var(--portfolio-text-primary)'
                }}
              >
                Découvrir d'autres projets
              </h2>
            </ScrollFadeIn>
            
            <div className="space-y-6">
              {allOtherProjects.map((projet, index) => (
                <ScrollFadeIn key={index} delay={0.15 + index * 0.05}>
                  <NewProjectCard
                    link={projet.link}
                    number={projet.number}
                    title={projet.text}
                    description={projet.description}
                    tags={projet.tags}
                    image={projet.image}
                  />
                </ScrollFadeIn>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Contact Footer */}
      <ContactFooter />

      {/* Lightbox */}
      {lightboxOpen && projet.gallery && projet.gallery.length > 0 && (
        <ImageLightbox
          images={projet.gallery}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </div>
  );
}
