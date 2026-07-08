import { motion } from 'motion/react';

interface ButtonProps {
  variant?: 'primary' | 'secondary';
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  disabled?: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export default function Button({ 
  variant = 'primary', 
  children, 
  onClick,
  type = 'button',
  className = '',
  disabled = false,
  onMouseEnter,
  onMouseLeave
}: ButtonProps) {
  const baseClasses = "cursor-target group relative overflow-hidden border border-[#EAEAEA] px-5 sm:px-6 md:px-7 lg:px-8 py-3.5 sm:py-2.5 md:py-3 text-[11px] sm:text-xs md:text-sm uppercase tracking-wider font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variantClasses = {
    primary: "bg-[#EAEAEA] text-black hover:bg-transparent hover:text-[#EAEAEA]",
    secondary: "bg-transparent text-[#EAEAEA] hover:bg-[#EAEAEA] hover:text-black"
  };

  return (
    <button
      type={type}
      onClick={(e) => {
        if (!disabled) {
          onClick?.();
        }
      }}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <span className="relative z-10">{children}</span>
      {variant === 'secondary' && (
        <div className="absolute inset-0 -translate-x-full bg-[#EAEAEA] transition-transform group-hover:translate-x-0" />
      )}
    </button>
  );
}