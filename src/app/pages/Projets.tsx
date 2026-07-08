import PageHeader from '../components/PageHeader';
import ContactFooter from '../components/ContactFooter';
import NewProjectCard from '../components/common/NewProjectCard';
import { ScrollRevealTitle } from '../components/ScrollRevealTitle';
import { ScrollFadeIn } from '../components/ScrollFadeIn';
import { tousProjets } from '../data/projetsData';
import { usePageTransition } from '../context/PageTransitionContext';
import { useEffect, useRef } from 'react';

export default function Projets() {
  const { setTransitionImageSrc, setTransitionImageRect, setIsTransitioning, setIsReverse } = usePageTransition();
  const cardRefs = useRef<{ [key: string]: HTMLImageElement | null }>({});
  
  // Handle back navigation - trigger reverse animation
  useEffect(() => {
    const handlePopState = () => {
      // Find the current project from URL
      const currentPath = window.location.pathname;
      const projectMatch = currentPath.match(/\/projets\/([^/]+)/);
      
      if (projectMatch) {
        const projectId = projectMatch[1];
        const projet = tousProjets.find(p => p.link === `/projets/${projectId}`);
        
        if (projet && projet.image && cardRefs.current[projet.link]) {
          const imageElement = cardRefs.current[projet.link];
          if (imageElement) {
            const rect = imageElement.getBoundingClientRect();
            
            // Trigger reverse transition
            setIsReverse(true);
            setTransitionImageSrc(projet.image);
            setTransitionImageRect(rect);
            setIsTransitioning(true);
          }
        }
      }
    };
    
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [setTransitionImageSrc, setTransitionImageRect, setIsTransitioning, setIsReverse]);

  return (
    <div className="relative min-h-screen projets-page" style={{ backgroundColor: 'var(--portfolio-bg)' }}>
      {/* Projets Content */}
      <section style={{ paddingTop: 'var(--page-padding-top)' }} className="pb-32">
        <div className="mx-auto w-full max-w-[1920px] px-8 sm:px-12 md:px-16 lg:px-20 xl:px-24">
          {/* Header */}
          <div className="mb-12">
            <ScrollRevealTitle delay={0}>
              <p 
                style={{ 
                  fontFamily: 'Manrope, sans-serif',
                  fontWeight: 500,
                  fontSize: 'clamp(0.8125rem, 0.75rem + 0.3125vw, 0.9375rem)',
                  lineHeight: '1.6',
                  color: 'var(--portfolio-text-secondary)',
                  marginBottom: '0px',
                  letterSpacing: '0.5px'
                }}
              >
                Mes travaux
              </p>
            </ScrollRevealTitle>
            <ScrollRevealTitle delay={0.05}>
              <h1 
                style={{ 
                  fontFamily: 'Manrope, sans-serif',
                  fontWeight: 700,
                  fontSize: 'clamp(2rem, 1rem + 5vw, 3rem)',
                  lineHeight: '1.1',
                  letterSpacing: '-1.4px',
                  color: 'var(--portfolio-text-primary)'
                }}
              >
                Projets
              </h1>
            </ScrollRevealTitle>
          </div>

          {/* Tous les projets - List simple */}
          <div className="space-y-6">
            {tousProjets.map((projet, index) => (
              <ScrollFadeIn key={index} delay={0.1 + index * 0.05}>
                <NewProjectCard
                  link={projet.link}
                  number={projet.number}
                  title={projet.text}
                  description={projet.description}
                  tags={projet.tags}
                  image={projet.image}
                  ref={(ref) => { cardRefs.current[projet.link] = ref; }}
                />
              </ScrollFadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Footer */}
      <ContactFooter />
    </div>
  );
}