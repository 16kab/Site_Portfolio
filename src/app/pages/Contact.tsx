import { ScrollRevealTitle } from '../components/ScrollRevealTitle';
import { ScrollFadeIn } from '../components/ScrollFadeIn';
import SuccessPopup from '../components/SuccessPopup';
import { useEmailForm } from '../hooks';
import { Send } from 'lucide-react';
import { useState } from 'react';
import RollingText from '../components/RollingText';

const recommendations = [
  {
    name: "Alexandre Chen",
    position: "Directeur Technique",
    company: "WebCorp",
    text: "Excellent développeur avec une vraie passion pour le code propre et les interfaces élégantes. Sa rigueur et son professionnalisme sont remarquables."
  },
  {
    name: "Julie Moreau",
    position: "Product Manager",
    company: "StartupX",
    text: "Un collaborateur exceptionnel qui sait traduire les besoins métier en solutions techniques innovantes. Je recommande vivement ses services."
  },
  {
    name: "Marc Lefebvre",
    position: "CEO",
    company: "Digital Solutions",
    text: "Sa créativité et son expertise technique ont transformé notre vision en un produit dépassant toutes nos attentes. Un vrai talent."
  }
];

export default function Contact() {
  const [isSendButtonHovered, setIsSendButtonHovered] = useState(false);
  const {
    errors,
    isSubmitting,
    showSuccessPopup,
    handleInputChange,
    submitForm,
    closeSuccessPopup,
  } = useEmailForm();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const form = e.currentTarget;
    const formData = {
      nom: (form.elements.namedItem('nom') as HTMLInputElement).value.trim(),
      prenom: (form.elements.namedItem('prenom') as HTMLInputElement).value.trim(),
      email: (form.elements.namedItem('email') as HTMLInputElement).value.trim(),
      objet: (form.elements.namedItem('objet') as HTMLInputElement).value.trim(),
      message: (form.elements.namedItem('message') as HTMLTextAreaElement).value.trim(),
    };

    const success = await submitForm(formData);
    if (success) {
      form.reset();
    }
  };

  return (
    <div className="relative min-h-screen contact-page" style={{ backgroundColor: 'var(--portfolio-bg)' }}>
      {/* Références Section */}
      <section style={{ paddingTop: 'var(--page-padding-top)' }} className="pb-16 md:pb-20">
        <div className="mx-auto w-full max-w-[1920px] px-8 sm:px-12 md:px-16 lg:px-20 xl:px-24">
          {/* Header */}
          <div className="mb-6">
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
                Ce que disent mes collaborateurs
              </p>
            </ScrollRevealTitle>
            <ScrollRevealTitle delay={0.05}>
              <h2 
                style={{ 
                  fontFamily: 'Manrope, sans-serif',
                  fontWeight: 700,
                  fontSize: 'clamp(2rem, 1rem + 5vw, 3rem)',
                  lineHeight: '1.1',
                  letterSpacing: '-1.4px',
                  color: 'var(--portfolio-text-primary)'
                }}
              >
                Références
              </h2>
            </ScrollRevealTitle>
          </div>

          {/* Recommendations Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
            {recommendations.map((rec, index) => (
              <ScrollFadeIn key={index} delay={0.1 + index * 0.05}>
                <div
                  className="p-8 flex flex-col h-full"
                  style={{
                    backgroundColor: 'var(--portfolio-card-bg)',
                    borderRadius: '12px',
                    border: '1px solid var(--portfolio-card-border)'
                  }}
                >
                  {/* Content */}
                  <div className="flex-1 flex flex-col">
                    {/* Testimonial Text */}
                    <p 
                      className="flex-1"
                      style={{ 
                        fontFamily: 'Manrope, sans-serif',
                        fontWeight: 400,
                        fontSize: 'clamp(0.875rem, 0.8125rem + 0.3125vw, 1rem)',
                        lineHeight: '1.7',
                        color: 'var(--portfolio-text-secondary)',
                        fontStyle: 'italic'
                      }}
                    >
                      "{rec.text}"
                    </p>

                    {/* Author Info */}
                    <div 
                      className="pt-4 mt-4"
                      style={{ 
                        borderTop: '1px solid rgba(186, 186, 186, 0.15)' 
                      }}
                    >
                      <p 
                        style={{ 
                          fontFamily: 'Manrope, sans-serif',
                          fontWeight: 600,
                          fontSize: 'clamp(1.125rem, 1rem + 0.625vw, 1.375rem)',
                          lineHeight: '1.3',
                          letterSpacing: '-0.5px',
                          color: 'var(--portfolio-text-primary)'
                        }}
                      >
                        {rec.name}
                      </p>
                      <p 
                        style={{ 
                          fontFamily: 'Manrope, sans-serif',
                          fontWeight: 400,
                          fontSize: 'clamp(0.8125rem, 0.75rem + 0.3125vw, 0.9375rem)',
                          lineHeight: '1.5',
                          color: 'var(--portfolio-text-secondary)'
                        }}
                      >
                        {rec.position} - {rec.company}
                      </p>
                    </div>
                  </div>
                </div>
              </ScrollFadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Content */}
      <section className="pb-16 md:pb-32">
        <div className="mx-auto w-full max-w-[1920px] px-8 sm:px-12 md:px-16 lg:px-20 xl:px-24">
          {/* Header */}
          <div className="mb-16 md:mb-20 lg:mb-24">
            <ScrollRevealTitle delay={0.2}>
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
                Contact
              </p>
            </ScrollRevealTitle>
            <ScrollRevealTitle delay={0.25}>
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
                Travaillons ensemble
              </h1>
            </ScrollRevealTitle>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 xl:gap-24">
            {/* Left side - Info */}
            <ScrollFadeIn delay={0.3}>
              <div className="space-y-8 lg:space-y-12">
                <ContactInfo
                  label="Localisation"
                  value="Paris, France"
                />

                <ContactInfo
                  label="Email"
                  value="kabiche.alexis@gmail.com"
                  href="mailto:kabiche.alexis@gmail.com"
                />

                <ContactInfo
                  label="Téléphone"
                  value="06 20 44 74 05"
                  href="tel:+33620447405"
                />
              </div>
            </ScrollFadeIn>

            {/* Right side - Form */}
            <ScrollFadeIn delay={0.4}>
              <form className="space-y-6" onSubmit={handleSubmit} noValidate>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label 
                      htmlFor="nom" 
                      style={{
                        fontFamily: 'Manrope, sans-serif',
                        fontWeight: 500,
                        fontSize: 'clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem)',
                        letterSpacing: '0.5px',
                        color: 'var(--portfolio-text-secondary)',
                        display: 'block',
                        marginBottom: '12px'
                      }}
                    >
                      Nom *
                    </label>
                    <input
                      type="text"
                      id="nom"
                      name="nom"
                      className={`w-full px-4 py-3 focus:outline-none transition-all ${
                        errors.nom 
                          ? 'border-2 border-red-500/50' 
                          : 'border-2 hover:border-[#2A2B2A] focus:border-[#3A3B3A]'
                      }`}
                      style={{
                        fontFamily: 'Manrope, sans-serif',
                        fontWeight: 400,
                        fontSize: 'clamp(0.875rem, 0.8rem + 0.375vw, 1rem)',
                        borderRadius: '4px',
                        backgroundColor: 'var(--portfolio-card-bg)',
                        borderColor: errors.nom ? undefined : 'var(--portfolio-card-border)',
                        color: 'var(--portfolio-text-primary)'
                      }}
                      placeholder="Votre nom"
                      onInput={(e) => {
                        const input = e.currentTarget;
                        input.value = handleInputChange('nom', input.value, true);
                      }}
                    />
                    {errors.nom && (
                      <p className="text-red-500 text-sm mt-2" style={{ fontFamily: 'Manrope, sans-serif' }}>
                        Ce champ est requis
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <label 
                      htmlFor="prenom"
                      style={{
                        fontFamily: 'Manrope, sans-serif',
                        fontWeight: 500,
                        fontSize: 'clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem)',
                        letterSpacing: '0.5px',
                        color: 'var(--portfolio-text-secondary)',
                        display: 'block',
                        marginBottom: '12px'
                      }}
                    >
                      Prénom *
                    </label>
                    <input
                      type="text"
                      id="prenom"
                      name="prenom"
                      className={`w-full px-4 py-3 focus:outline-none transition-all ${
                        errors.prenom 
                          ? 'border-2 border-red-500/50' 
                          : 'border-2 hover:border-[#2A2B2A] focus:border-[#3A3B3A]'
                      }`}
                      style={{
                        fontFamily: 'Manrope, sans-serif',
                        fontWeight: 400,
                        fontSize: 'clamp(0.875rem, 0.8rem + 0.375vw, 1rem)',
                        borderRadius: '4px',
                        backgroundColor: 'var(--portfolio-card-bg)',
                        borderColor: errors.prenom ? undefined : 'var(--portfolio-card-border)',
                        color: 'var(--portfolio-text-primary)'
                      }}
                      placeholder="Votre prénom"
                      onInput={(e) => {
                        const input = e.currentTarget;
                        input.value = handleInputChange('prenom', input.value, true);
                      }}
                    />
                    {errors.prenom && (
                      <p className="text-red-500 text-sm mt-2" style={{ fontFamily: 'Manrope, sans-serif' }}>
                        Ce champ est requis
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label 
                    htmlFor="email"
                    style={{
                      fontFamily: 'Manrope, sans-serif',
                      fontWeight: 500,
                      fontSize: 'clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem)',
                      letterSpacing: '0.5px',
                      color: 'var(--portfolio-text-secondary)',
                      display: 'block',
                      marginBottom: '12px'
                    }}
                  >
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className={`w-full px-4 py-3 focus:outline-none transition-all ${
                      errors.email 
                        ? 'border-2 border-red-500/50' 
                        : 'border-2 hover:border-[#2A2B2A] focus:border-[#3A3B3A]'
                    }`}
                    style={{
                      fontFamily: 'Manrope, sans-serif',
                      fontWeight: 400,
                      fontSize: 'clamp(0.875rem, 0.8rem + 0.375vw, 1rem)',
                      borderRadius: '4px',
                      backgroundColor: 'var(--portfolio-card-bg)',
                      borderColor: errors.email ? undefined : 'var(--portfolio-card-border)',
                      color: 'var(--portfolio-text-primary)'
                    }}
                    placeholder="Votre email"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-2" style={{ fontFamily: 'Manrope, sans-serif' }}>
                      Email invalide
                    </p>
                  )}
                </div>

                <div>
                  <label 
                    htmlFor="objet"
                    style={{
                      fontFamily: 'Manrope, sans-serif',
                      fontWeight: 500,
                      fontSize: 'clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem)',
                      letterSpacing: '0.5px',
                      color: 'var(--portfolio-text-secondary)',
                      display: 'block',
                      marginBottom: '12px'
                    }}
                  >
                    Objet *
                  </label>
                  <input
                    type="text"
                    id="objet"
                    name="objet"
                    className={`w-full px-4 py-3 focus:outline-none transition-all ${
                      errors.objet 
                        ? 'border-2 border-red-500/50' 
                        : 'border-2 hover:border-[#2A2B2A] focus:border-[#3A3B3A]'
                    }`}
                    style={{
                      fontFamily: 'Manrope, sans-serif',
                      fontWeight: 400,
                      fontSize: 'clamp(0.875rem, 0.8rem + 0.375vw, 1rem)',
                      borderRadius: '4px',
                      backgroundColor: 'var(--portfolio-card-bg)',
                      borderColor: errors.objet ? undefined : 'var(--portfolio-card-border)',
                      color: 'var(--portfolio-text-primary)'
                    }}
                    placeholder="Objet de votre message"
                  />
                  {errors.objet && (
                    <p className="text-red-500 text-sm mt-2" style={{ fontFamily: 'Manrope, sans-serif' }}>
                      Ce champ est requis
                    </p>
                  )}
                </div>

                <div>
                  <label 
                    htmlFor="message"
                    style={{
                      fontFamily: 'Manrope, sans-serif',
                      fontWeight: 500,
                      fontSize: 'clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem)',
                      letterSpacing: '0.5px',
                      color: 'var(--portfolio-text-secondary)',
                      display: 'block',
                      marginBottom: '12px'
                    }}
                  >
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={6}
                    className={`w-full px-4 py-3 focus:outline-none transition-all resize-none ${
                      errors.message 
                        ? 'border-2 border-red-500/50' 
                        : 'border-2 hover:border-[#2A2B2A] focus:border-[#3A3B3A]'
                    }`}
                    style={{
                      fontFamily: 'Manrope, sans-serif',
                      fontWeight: 400,
                      fontSize: 'clamp(0.875rem, 0.8rem + 0.375vw, 1rem)',
                      borderRadius: '4px',
                      backgroundColor: 'var(--portfolio-card-bg)',
                      borderColor: errors.message ? undefined : 'var(--portfolio-card-border)',
                      color: 'var(--portfolio-text-primary)'
                    }}
                    placeholder="Votre message..."
                  />
                  {errors.message && (
                    <p className="text-red-500 text-sm mt-2" style={{ fontFamily: 'Manrope, sans-serif' }}>
                      Ce champ est requis
                    </p>
                  )}
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-3 flex items-center gap-2 transition-all duration-300 cursor-pointer hover:bg-[#f0f0f0] disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      backgroundColor: '#EAEAEA',
                      color: '#000000',
                      fontFamily: 'Manrope, sans-serif',
                      fontWeight: 500,
                      fontSize: '14px',
                      borderRadius: '5px'
                    }}
                    onMouseEnter={() => setIsSendButtonHovered(true)}
                    onMouseLeave={() => setIsSendButtonHovered(false)}
                  >
                    <Send size={18} />
                    <RollingText
                      text={isSubmitting ? 'Envoi...' : 'Envoyer'}
                      inView={isSendButtonHovered && !isSubmitting}
                      transition={{ duration: 0.3, delay: 0.02, ease: "easeOut" }}
                    />
                  </button>
                </div>

                {/* Required fields indicator */}
                <div 
                  style={{ 
                    fontFamily: 'Manrope, sans-serif',
                    fontSize: '0.8125rem',
                    color: 'var(--portfolio-text-secondary)',
                    paddingTop: '8px'
                  }}
                >
                  <span style={{ color: 'var(--portfolio-text-primary)' }}>*</span> Champs obligatoires
                </div>
              </form>
            </ScrollFadeIn>
          </div>
        </div>
      </section>

      {/* Success Popup */}
      <SuccessPopup 
        isOpen={showSuccessPopup} 
        onClose={closeSuccessPopup}
      />
    </div>
  );
}

// Sub-components
interface ContactInfoProps {
  label: string;
  value: string;
  href?: string;
}

function ContactInfo({ label, value, href }: ContactInfoProps) {
  const content = (
    <div className="group">
      <p 
        style={{
          fontFamily: 'Manrope, sans-serif',
          fontWeight: 400,
          fontSize: 'clamp(1.125rem, 1rem + 0.625vw, 1.5rem)',
          lineHeight: '1.4',
          color: 'var(--portfolio-text-primary)',
          transition: 'color 0.3s ease'
        }}
        className={href ? 'group-hover:opacity-70' : ''}
      >
        {value}
      </p>
      {href && (
        <div 
          className="h-px transition-all duration-300 mt-2"
          style={{
            width: '0%',
            transformOrigin: 'left',
            backgroundColor: 'var(--portfolio-text-primary)'
          }}
          // Using inline style for hover effect via parent group
        />
      )}
    </div>
  );

  return (
    <div>
      <h3 
        style={{
          fontFamily: 'Manrope, sans-serif',
          fontWeight: 500,
          fontSize: 'clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem)',
          letterSpacing: '0.5px',
          color: 'var(--portfolio-text-secondary)',
          marginBottom: '12px'
        }}
      >
        {label}
      </h3>
      {href ? (
        <a href={href} className="group block">
          {content}
        </a>
      ) : (
        content
      )}
    </div>
  );
}