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
