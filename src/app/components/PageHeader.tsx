import { useLocation } from 'react-router';
import { motion } from 'motion/react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  level?: 'h1' | 'h2';
  className?: string;
}

export default function PageHeader({ 
  title, 
  subtitle, 
  level = 'h1',
  className = '' 
}: PageHeaderProps) {
  const location = useLocation();
  const Tag = level;

  return (
    <div className={`mb-8 sm:mb-12 ${className}`}>
      {/* Title */}
      <Tag className="text-[10vw] sm:text-[8vw] md:text-[7vw] lg:text-[5.5vw] xl:text-[4.5vw] 2xl:text-[4vw] font-bold uppercase leading-none tracking-tighter text-white mb-2 sm:mb-4">
        {title}
      </Tag>
      
      {/* Subtitle */}
      {subtitle && (
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-white/80 max-w-2xl xl:max-w-3xl 2xl:max-w-4xl"
        >
          {subtitle}
        </motion.p>
      )}
    </div>
  );
}