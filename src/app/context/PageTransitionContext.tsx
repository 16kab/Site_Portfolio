import { createContext, useContext, useState, ReactNode } from 'react';

interface PageTransitionContextType {
  isTransitioning: boolean;
  setIsTransitioning: (value: boolean) => void;
  transitionImageSrc: string | null;
  setTransitionImageSrc: (src: string | null) => void;
  transitionImageRect: DOMRect | null;
  setTransitionImageRect: (rect: DOMRect | null) => void;
  isReverse: boolean;
  setIsReverse: (value: boolean) => void;
}

const PageTransitionContext = createContext<PageTransitionContextType | undefined>(undefined);

export function PageTransitionProvider({ children }: { children: ReactNode }) {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionImageSrc, setTransitionImageSrc] = useState<string | null>(null);
  const [transitionImageRect, setTransitionImageRect] = useState<DOMRect | null>(null);
  const [isReverse, setIsReverse] = useState(false);

  return (
    <PageTransitionContext.Provider
      value={{
        isTransitioning,
        setIsTransitioning,
        transitionImageSrc,
        setTransitionImageSrc,
        transitionImageRect,
        setTransitionImageRect,
        isReverse,
        setIsReverse,
      }}
    >
      {children}
    </PageTransitionContext.Provider>
  );
}

export function usePageTransition() {
  const context = useContext(PageTransitionContext);
  if (context === undefined) {
    throw new Error('usePageTransition must be used within a PageTransitionProvider');
  }
  return context;
}