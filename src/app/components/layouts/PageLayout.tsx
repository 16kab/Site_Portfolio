import { ReactNode } from 'react';

interface PageLayoutProps {
  children: ReactNode;
  className?: string;
}

/**
 * Reusable page layout component that provides consistent structure
 * across all pages
 * Note: Header is now global in App.tsx, not rendered here
 */
export default function PageLayout({
  children,
  className = '',
}: PageLayoutProps) {
  return (
    <div className={`relative ${className}`} style={{ minHeight: '100vh', paddingBottom: '1px' }}>
      <div className="relative">
        {children}
      </div>
    </div>
  );
}