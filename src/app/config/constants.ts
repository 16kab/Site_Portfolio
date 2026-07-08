/**
 * Application-wide constants and configurations
 */

// Toast notification configuration
export const TOAST_CONFIG = {
  position: 'bottom-right' as const,
  theme: 'dark' as const,
  toastOptions: {
    style: {
      background: 'rgba(0, 0, 0, 0.9)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      color: '#fff',
    },
  },
} as const;

// EmailJS configuration
export const EMAILJS_CONFIG = {
  serviceId: 'service_5026g28',
  templateId: 'Portfolio_contact',
  publicKey: 'QJkSflwEVb-vpg9UZ',
} as const;