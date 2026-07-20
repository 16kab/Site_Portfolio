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
  /** La page d'arrivée s'est montée (la révélation peut avoir lieu) */
  hasArrived: boolean;
  captureSnapshot: (snapshot: ProjectTransitionSnapshot) => void;
  beginForward: (snapshot: ProjectTransitionSnapshot) => void;
  beginReverse: (targetRect: ProjectTransitionRect) => void;
  /** Signalé par la page d'arrivée une fois montée (lazy chunk chargé) */
  markArrival: () => void;
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
  hasArrived: boolean;
}

const initialTransitionState: TransitionState = {
  isTransitioning: false,
  direction: null,
  snapshot: null,
  hasArrived: false,
};

export function PageTransitionProvider({ children }: { children: ReactNode }) {
  const [
    { isTransitioning, direction, snapshot, hasArrived },
    setTransitionState,
  ] = useState<TransitionState>(initialTransitionState);

  const captureSnapshot = useCallback(
    (nextSnapshot: ProjectTransitionSnapshot) => {
      setTransitionState({
        isTransitioning: false,
        direction: null,
        snapshot: nextSnapshot,
        hasArrived: false,
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
        hasArrived: false,
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
        hasArrived: false,
      };
    });
  }, []);

  // Appelé par la page d'arrivée à son montage : tant que ce signal n'est
  // pas reçu, l'overlay de transition ne révèle pas la page (sinon il
  // découvrirait l'ancienne page, le chunk lazy n'étant pas encore chargé).
  const markArrival = useCallback(() => {
    setTransitionState((current) => {
      if (!current.isTransitioning || current.hasArrived) {
        return current;
      }
      return { ...current, hasArrived: true };
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
      hasArrived: false,
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
        hasArrived,
        captureSnapshot,
        beginForward,
        beginReverse,
        markArrival,
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
