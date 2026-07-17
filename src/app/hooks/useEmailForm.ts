import { useState } from 'react';
import emailjs from '@emailjs/browser';
import { toast } from 'sonner';
import { EMAILJS_CONFIG } from '../config';

export interface FormData {
  nom: string;
  prenom: string;
  email: string;
  objet: string;
  message: string;
}

export interface FormErrors {
  [key: string]: boolean;
}

/**
 * Custom hook for handling email form submission with EmailJS
 * Manages form state, validation, and submission logic
 */
export function useEmailForm() {
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  /**
   * Validate email format
   */
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  /**
   * Remove numbers from text input (for names)
   */
  const sanitizeTextInput = (value: string): string => {
    return value.replace(/[0-9]/g, '');
  };

  /**
   * Handle input change and remove errors
   */
  const handleInputChange = (
    name: string,
    value: string,
    isTextField: boolean = false,
  ) => {
    // Remove numbers from names if needed
    const sanitizedValue = isTextField ? sanitizeTextInput(value) : value;

    // Remove error when user starts typing
    if (errors[name] && value.trim()) {
      setErrors((prev) => ({ ...prev, [name]: false }));
    }

    return sanitizedValue;
  };

  /**
   * Validate form data
   */
  const validateForm = (formData: FormData): FormErrors => {
    const newErrors: FormErrors = {};

    if (!formData.nom.trim()) newErrors.nom = true;
    if (!formData.prenom.trim()) newErrors.prenom = true;
    if (!formData.email.trim()) newErrors.email = true;
    if (!formData.objet.trim()) newErrors.objet = true;
    if (!formData.message.trim()) newErrors.message = true;

    // Validate email format
    if (formData.email && !isValidEmail(formData.email)) {
      newErrors.email = true;
    }

    return newErrors;
  };

  /**
   * Submit form to EmailJS
   *
   * @param honeypot Valeur du champ piège invisible : un humain le laisse
   * vide, un bot le remplit. Rempli ⇒ on simule un succès sans rien envoyer.
   */
  const submitForm = async (
    formData: FormData,
    honeypot?: string,
  ): Promise<boolean> => {
    // Anti-spam : soumission de bot, on ne fait rien
    if (honeypot && honeypot.trim() !== '') {
      setShowSuccessPopup(true);
      return true;
    }

    // Validate form
    const validationErrors = validateForm(formData);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return false;
    }

    setIsSubmitting(true);

    try {
      const templateParams = {
        from_name: `${formData.prenom} ${formData.nom}`,
        from_email: formData.email,
        subject: formData.objet,
        message: formData.message,
        to_email: 'kabiche.alexis@gmail.com',
      };

      await emailjs.send(
        EMAILJS_CONFIG.serviceId,
        EMAILJS_CONFIG.templateId,
        templateParams,
        EMAILJS_CONFIG.publicKey,
      );

      // Success
      setErrors({});
      setShowSuccessPopup(true);
      return true;
    } catch (error) {
      console.error('Email send error:', error);
      toast.error(
        "L'envoi a échoué. Réessayez ou écrivez-moi directement à kabiche.alexis@gmail.com.",
      );
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Close success popup
   */
  const closeSuccessPopup = () => {
    setShowSuccessPopup(false);
  };

  return {
    errors,
    isSubmitting,
    showSuccessPopup,
    handleInputChange,
    submitForm,
    closeSuccessPopup,
  };
}
