import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useState,
} from 'react';
import type {
  ProjectTransitionDirection,
  ProjectTransitionRect,
  ProjectTransitionSnapshot,
} from '../utils/projectTransition';

interface PageTransitionContextType {
  isTransitioning: boolean;
  direction: ProjectTransitionDirection | null;
  snapshot: ProjectTransitionSnapshot | null;
  captureSnapshot: (snapshot: ProjectTransitionSnapshot) => void;
  beginForward: (snapshot: ProjectTransitionSnapshot) => void;
  beginReverse: (targetRect: ProjectTransitionRect) => void;
  completeTransition: () => void;
  clearTransition: () => void;
}

const PageTransitionContext = createContext<
  PageTransitionContextType | undefined
>(undefined);

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

  const captureSnapshot = useCallback(
    (nextSnapshot: ProjectTransitionSnapshot) => {
      setTransitionState({
        isTransitioning: false,
        direction: null,
        snapshot: nextSnapshot,
      });
    },
    [],
  );

  const beginForward = useCallback(
    (nextSnapshot: ProjectTransitionSnapshot) => {
      setTransitionState({
        isTransitioning: true,
        direction: 'forward',
        snapshot: nextSnapshot,
      });
    },
    [],
  );

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
        current.direction === 'forward' &&
        current.snapshot?.originPath === '/projets'
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
        captureSnapshot,
        beginForward,
        beginReverse,
        completeTransition,
        clearTransition,
      }}
    >
      {children}
    </PageTransitionContext.Provider>
  );
}

export function usePageTransition() {
  const context = useContext(PageTransitionContext);
  if (context === undefined) {
    throw new Error(
      'usePageTransition must be used within a PageTransitionProvider',
    );
  }
  return context;
}
