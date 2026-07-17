import { createContext, type ReactNode, useCallback, useContext, useState } from 'react';
import type {
  ProjectTransitionDirection,
  ProjectTransitionRect,
  ProjectTransitionSnapshot,
} from '../utils/projectTransition';

interface PageTransitionContextType {
  isTransitioning: boolean;
  direction: ProjectTransitionDirection | null;
  snapshot: ProjectTransitionSnapshot | null;
  beginForward: (snapshot: ProjectTransitionSnapshot) => void;
  beginReverse: (targetRect: ProjectTransitionRect) => void;
  completeTransition: () => void;
  clearTransition: () => void;

  // Transitional compatibility for consumers that have not migrated to snapshots yet.
  setIsTransitioning: (value: boolean) => void;
  transitionImageSrc: string | null;
  setTransitionImageSrc: (src: string | null) => void;
  transitionImageRect: DOMRect | null;
  setTransitionImageRect: (rect: DOMRect | null) => void;
  isReverse: boolean;
  setIsReverse: (value: boolean) => void;
}

const PageTransitionContext = createContext<PageTransitionContextType | undefined>(undefined);

interface TransitionState {
  isTransitioning: boolean;
  direction: ProjectTransitionDirection | null;
  snapshot: ProjectTransitionSnapshot | null;
}

const initialTransitionState: TransitionState = {
  isTransitioning: false,
  direction: null,
  snapshot: null,
};

export function PageTransitionProvider({ children }: { children: ReactNode }) {
  const [{ isTransitioning, direction, snapshot }, setTransitionState] =
    useState<TransitionState>(initialTransitionState);
  const [transitionImageSrc, setTransitionImageSrc] = useState<string | null>(null);
  const [transitionImageRect, setTransitionImageRect] = useState<DOMRect | null>(null);
  const [isReverse, setIsReverse] = useState(false);

  const setIsTransitioning = useCallback((value: boolean) => {
    setTransitionState((current) =>
      current.isTransitioning === value ? current : { ...current, isTransitioning: value },
    );
  }, []);

  const beginForward = useCallback((nextSnapshot: ProjectTransitionSnapshot) => {
    setTransitionState({
      isTransitioning: true,
      direction: 'forward',
      snapshot: nextSnapshot,
    });
  }, []);

  const beginReverse = useCallback((targetRect: ProjectTransitionRect) => {
    setTransitionState((current) => {
      if (current.snapshot === null) {
        return current;
      }

      return {
        isTransitioning: true,
        direction: 'reverse',
        snapshot: { ...current.snapshot, imageRect: targetRect },
      };
    });
  }, []);

  const completeTransition = useCallback(() => {
    setTransitionState((current) => ({
      isTransitioning: false,
      direction: current.direction,
      snapshot:
        current.direction === 'forward' && current.snapshot?.originPath === '/projets'
          ? current.snapshot
          : null,
    }));
  }, []);

  const clearTransition = useCallback(() => {
    setTransitionState(initialTransitionState);
  }, []);

  return (
    <PageTransitionContext.Provider
      value={{
        isTransitioning,
        direction,
        snapshot,
        beginForward,
        beginReverse,
        completeTransition,
        clearTransition,
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
