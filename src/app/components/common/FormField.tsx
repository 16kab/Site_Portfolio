import { motion } from 'motion/react';

interface FormFieldProps {
  label: string;
  name: string;
  type?: 'text' | 'email' | 'textarea';
  value?: string;
  error?: boolean;
  required?: boolean;
  placeholder?: string;
  rows?: number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onInput?: (e: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

/**
 * Reusable form field component with consistent styling and error states
 * Supports text, email, and textarea inputs
 */
export default function FormField({
  label,
  name,
  type = 'text',
  value,
  error = false,
  required = false,
  placeholder,
  rows = 4,
  onChange,
  onInput,
}: FormFieldProps) {
  const baseClasses = `w-full px-4 py-3 bg-white/5 border rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 transition-all duration-300`;
  const normalClasses = `${baseClasses} border-white/20 focus:border-cyan-400 focus:ring-cyan-400/20`;
  const errorClasses = `${baseClasses} border-red-500 focus:border-red-500 focus:ring-red-500/20 animate-shake`;

  const fieldClasses = error ? errorClasses : normalClasses;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <label htmlFor={name} className="block text-sm font-medium text-white/80 mb-2">
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>
      
      {type === 'textarea' ? (
        <textarea
          id={name}
          name={name}
          value={value}
          rows={rows}
          placeholder={placeholder}
          className={fieldClasses}
          onChange={onChange}
          onInput={onInput}
          required={required}
        />
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          placeholder={placeholder}
          className={fieldClasses}
          onChange={onChange}
          onInput={onInput}
          required={required}
        />
      )}

      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 text-sm text-red-400"
        >
          {type === 'email' ? 'Email invalide' : 'Ce champ est requis'}
        </motion.p>
      )}
    </motion.div>
  );
}
