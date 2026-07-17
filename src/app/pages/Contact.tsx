import { ScrollRevealTitle } from '../components/ScrollRevealTitle';
import { ScrollFadeIn } from '../components/ScrollFadeIn';
import PageMeta from '../components/PageMeta';
import SuccessPopup from '../components/SuccessPopup';
import { useEmailForm } from '../hooks';
import { CONTACT_EMAIL_HREF, SITE_CONTACT } from '../config';
import { Send } from 'lucide-react';
import { useState } from 'react';
import RollingText from '../components/RollingText';

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
      prenom: (
        form.elements.namedItem('prenom') as HTMLInputElement
      ).value.trim(),
      email: (
        form.elements.namedItem('email') as HTMLInputElement
      ).value.trim(),
      objet: (
        form.elements.namedItem('objet') as HTMLInputElement
      ).value.trim(),
      message: (
        form.elements.namedItem('message') as HTMLTextAreaElement
      ).value.trim(),
    };
    const honeypot = (form.elements.namedItem('site_web') as HTMLInputElement)
      .value;

    const success = await submitForm(formData, honeypot);
    if (success) {
      form.reset();
    }
  };

  return (
    <div
      className="relative min-h-screen contact-page"
      style={{ backgroundColor: 'var(--portfolio-bg)' }}
    >
      <PageMeta
        title="Contact — Alexis Kabiche"
        description="Contactez Alexis Kabiche, Product & Brand Designer à Paris, pour un projet, une mission ou une collaboration."
        path="/contact"
      />
      {/* Contact Content */}
      <section
        style={{ paddingTop: 'var(--page-padding-top)' }}
        className="pb-16 md:pb-32"
      >
        <div className="mx-auto w-full max-w-[1920px] px-8 sm:px-12 md:px-16 lg:px-20 xl:px-24">
          {/* Header */}
          <div className="mb-16 md:mb-20 lg:mb-24">
            <ScrollRevealTitle delay={0}>
              <p
                style={{
                  fontFamily: 'Manrope, sans-serif',
                  fontWeight: 500,
                  fontSize: 'clamp(0.8125rem, 0.75rem + 0.3125vw, 0.9375rem)',
                  lineHeight: '1.6',
                  color: 'var(--portfolio-text-secondary)',
                  marginBottom: '0px',
                  letterSpacing: '0.5px',
                }}
              >
                Contact
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
                  color: 'var(--portfolio-text-primary)',
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
                  value={SITE_CONTACT.location}
                />

                <ContactInfo
                  label="Email"
                  value={SITE_CONTACT.email}
                  href={CONTACT_EMAIL_HREF}
                />

                <ContactInfo
                  label="Téléphone"
                  value={SITE_CONTACT.phoneDisplay}
                  href={SITE_CONTACT.phoneHref}
                />
              </div>
            </ScrollFadeIn>

            {/* Right side - Form */}
            <ScrollFadeIn delay={0.4}>
              <form className="space-y-6" onSubmit={handleSubmit} noValidate>
                {/* Honeypot anti-spam : invisible pour les humains, rempli par les bots */}
                <div
                  aria-hidden="true"
                  style={{
                    position: 'absolute',
                    left: '-9999px',
                    width: '1px',
                    height: '1px',
                    overflow: 'hidden',
                  }}
                >
                  <label htmlFor="site_web">Ne pas remplir ce champ</label>
                  <input
                    type="text"
                    id="site_web"
                    name="site_web"
                    tabIndex={-1}
                    autoComplete="off"
                  />
                </div>
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
                        marginBottom: '12px',
                      }}
                    >
                      Nom *
                    </label>
                    <input
                      type="text"
                      id="nom"
                      name="nom"
                      required
                      aria-invalid={!!errors.nom}
                      aria-describedby={errors.nom ? 'erreur-nom' : undefined}
                      className={`w-full px-4 py-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--portfolio-card-focus)] transition-all ${
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
                        borderColor: errors.nom
                          ? undefined
                          : 'var(--portfolio-card-border)',
                        color: 'var(--portfolio-text-primary)',
                      }}
                      placeholder="Votre nom"
                      onInput={(e) => {
                        const input = e.currentTarget;
                        input.value = handleInputChange(
                          'nom',
                          input.value,
                          true,
                        );
                      }}
                    />
                    {errors.nom && (
                      <p
                        id="erreur-nom"
                        role="alert"
                        className="text-red-500 text-sm mt-2"
                        style={{ fontFamily: 'Manrope, sans-serif' }}
                      >
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
                        marginBottom: '12px',
                      }}
                    >
                      Prénom *
                    </label>
                    <input
                      type="text"
                      id="prenom"
                      name="prenom"
                      required
                      aria-invalid={!!errors.prenom}
                      aria-describedby={
                        errors.prenom ? 'erreur-prenom' : undefined
                      }
                      className={`w-full px-4 py-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--portfolio-card-focus)] transition-all ${
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
                        borderColor: errors.prenom
                          ? undefined
                          : 'var(--portfolio-card-border)',
                        color: 'var(--portfolio-text-primary)',
                      }}
                      placeholder="Votre prénom"
                      onInput={(e) => {
                        const input = e.currentTarget;
                        input.value = handleInputChange(
                          'prenom',
                          input.value,
                          true,
                        );
                      }}
                    />
                    {errors.prenom && (
                      <p
                        id="erreur-prenom"
                        role="alert"
                        className="text-red-500 text-sm mt-2"
                        style={{ fontFamily: 'Manrope, sans-serif' }}
                      >
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
                      marginBottom: '12px',
                    }}
                  >
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? 'erreur-email' : undefined}
                    className={`w-full px-4 py-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--portfolio-card-focus)] transition-all ${
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
                      borderColor: errors.email
                        ? undefined
                        : 'var(--portfolio-card-border)',
                      color: 'var(--portfolio-text-primary)',
                    }}
                    placeholder="Votre email"
                  />
                  {errors.email && (
                    <p
                      id="erreur-email"
                      role="alert"
                      className="text-red-500 text-sm mt-2"
                      style={{ fontFamily: 'Manrope, sans-serif' }}
                    >
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
                      marginBottom: '12px',
                    }}
                  >
                    Objet *
                  </label>
                  <input
                    type="text"
                    id="objet"
                    name="objet"
                    required
                    aria-invalid={!!errors.objet}
                    aria-describedby={errors.objet ? 'erreur-objet' : undefined}
                    className={`w-full px-4 py-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--portfolio-card-focus)] transition-all ${
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
                      borderColor: errors.objet
                        ? undefined
                        : 'var(--portfolio-card-border)',
                      color: 'var(--portfolio-text-primary)',
                    }}
                    placeholder="Objet de votre message"
                  />
                  {errors.objet && (
                    <p
                      id="erreur-objet"
                      role="alert"
                      className="text-red-500 text-sm mt-2"
                      style={{ fontFamily: 'Manrope, sans-serif' }}
                    >
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
                      marginBottom: '12px',
                    }}
                  >
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={6}
                    required
                    aria-invalid={!!errors.message}
                    aria-describedby={
                      errors.message ? 'erreur-message' : undefined
                    }
                    className={`w-full px-4 py-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--portfolio-card-focus)] transition-all resize-none ${
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
                      borderColor: errors.message
                        ? undefined
                        : 'var(--portfolio-card-border)',
                      color: 'var(--portfolio-text-primary)',
                    }}
                    placeholder="Votre message..."
                  />
                  {errors.message && (
                    <p
                      id="erreur-message"
                      role="alert"
                      className="text-red-500 text-sm mt-2"
                      style={{ fontFamily: 'Manrope, sans-serif' }}
                    >
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
                      borderRadius: '5px',
                    }}
                    onMouseEnter={() => setIsSendButtonHovered(true)}
                    onMouseLeave={() => setIsSendButtonHovered(false)}
                  >
                    <Send size={18} />
                    <RollingText
                      text={isSubmitting ? 'Envoi...' : 'Envoyer'}
                      inView={isSendButtonHovered && !isSubmitting}
                      transition={{
                        duration: 0.3,
                        delay: 0.02,
                        ease: 'easeOut',
                      }}
                    />
                  </button>
                </div>

                {/* Required fields indicator */}
                <div
                  style={{
                    fontFamily: 'Manrope, sans-serif',
                    fontSize: '0.8125rem',
                    color: 'var(--portfolio-text-secondary)',
                    paddingTop: '8px',
                  }}
                >
                  <span style={{ color: 'var(--portfolio-text-primary)' }}>
                    *
                  </span>{' '}
                  Champs obligatoires
                </div>
              </form>
            </ScrollFadeIn>
          </div>
        </div>
      </section>

      {/* Success Popup */}
      <SuccessPopup isOpen={showSuccessPopup} onClose={closeSuccessPopup} />
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
          transition: 'color 0.3s ease',
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
            backgroundColor: 'var(--portfolio-text-primary)',
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
          marginBottom: '12px',
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
