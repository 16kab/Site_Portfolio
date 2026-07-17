/**
 * Application-wide constants and configurations
 */

// Configuration du Toaster, alignée sur le thème actif. Le rendu sombre
// reste identique à l'existant ; une variante claire est ajoutée.
export function getToastConfig(isDark: boolean) {
  return {
    position: 'bottom-right' as const,
    theme: isDark ? ('dark' as const) : ('light' as const),
    toastOptions: {
      style: isDark
        ? {
            background: 'rgba(0, 0, 0, 0.9)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: '#fff',
          }
        : {
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(0, 0, 0, 0.1)',
            color: '#111',
          },
    },
  };
}

// EmailJS configuration
export const EMAILJS_CONFIG = {
  serviceId: 'service_5026g28',
  templateId: 'Portfolio_contact',
  publicKey: 'QJkSflwEVb-vpg9UZ',
} as const;

// Coordonnées de contact (source unique, réutilisée par les pages Contact,
// le footer et l'envoi EmailJS).
export const SITE_CONTACT = {
  email: 'kabiche.alexis@gmail.com',
  phoneDisplay: '06 20 44 74 05',
  phoneHref: 'tel:+33620447405',
  location: 'Paris, France',
} as const;

export const CONTACT_EMAIL_HREF = `mailto:${SITE_CONTACT.email}` as const;
