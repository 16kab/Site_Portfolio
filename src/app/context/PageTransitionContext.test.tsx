import { useRef } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import {
  PageTransitionProvider,
  usePageTransition,
} from './PageTransitionContext';
import type { ProjectTransitionSnapshot } from '../utils/projectTransition';

const projectSnapshot: ProjectTransitionSnapshot = {
  imageSrc: '/test.webp',
  imageRect: { left: 10, top: 20, width: 300, height: 200 },
  projectLink: '/projets/test',
  originPath: '/projets',
  scrollTop: 480,
};

function Harness({
  snapshot = projectSnapshot,
}: {
  snapshot?: ProjectTransitionSnapshot;
}) {
  const {
    isTransitioning,
    direction,
    snapshot: transitionSnapshot,
    captureSnapshot,
    beginForward,
    beginReverse,
    completeTransition,
    clearTransition,
  } = usePageTransition();
  const initialCallbacks = useRef({
    captureSnapshot,
    beginForward,
    beginReverse,
    completeTransition,
    clearTransition,
  });
  const callbacksStable =
    initialCallbacks.current.captureSnapshot === captureSnapshot &&
    initialCallbacks.current.beginForward === beginForward &&
    initialCallbacks.current.beginReverse === beginReverse &&
    initialCallbacks.current.completeTransition === completeTransition &&
    initialCallbacks.current.clearTransition === clearTransition;

  return (
    <>
      <output data-testid="state">
        {isTransitioning ? 'active' : 'idle'}:{direction ?? 'none'}:
        {transitionSnapshot?.projectLink ?? 'none'}
      </output>
      <output data-testid="snapshot">
        {JSON.stringify(transitionSnapshot)}
      </output>
      <output data-testid="callbacks-stable">{String(callbacksStable)}</output>
      <output data-testid="api-ready">
        {String(
          [
            captureSnapshot,
            beginForward,
            beginReverse,
            completeTransition,
            clearTransition,
          ].every((callback) => typeof callback === 'function'),
        )}
      </output>
      <button type="button" onClick={() => beginForward(snapshot)}>
        Begin forward
      </button>
      <button type="button" onClick={() => captureSnapshot?.(snapshot)}>
        Capture snapshot
      </button>
      <button
        type="button"
        onClick={() =>
          beginReverse({ left: 20, top: 30, width: 320, height: 220 })
        }
      >
        Begin reverse
      </button>
      <button type="button" onClick={completeTransition}>
        Complete
      </button>
      <button type="button" onClick={clearTransition}>
        Clear
      </button>
    </>
  );
}

const renderHarness = (snapshot?: ProjectTransitionSnapshot) =>
  render(
    <PageTransitionProvider>
      <Harness snapshot={snapshot} />
    </PageTransitionProvider>,
  );

describe('PageTransitionProvider', () => {
  it('captures a snapshot without starting a transition', () => {
    renderHarness();

    fireEvent.click(screen.getByRole('button', { name: 'Capture snapshot' }));

    expect(screen.getByTestId('api-ready')).toHaveTextContent('true');
    expect(screen.getByTestId('state')).toHaveTextContent(
      'idle:none:/projets/test',
    );
    expect(screen.getByTestId('snapshot')).toHaveTextContent(
      JSON.stringify(projectSnapshot),
    );
  });

  it('retains a projects snapshot after forward completion and clears it after reverse completion', () => {
    renderHarness();

    expect(screen.getByTestId('state')).toHaveTextContent('idle:none:none');

    fireEvent.click(screen.getByRole('button', { name: 'Begin forward' }));
    expect(screen.getByTestId('state')).toHaveTextContent(
      'active:forward:/projets/test',
    );
    expect(screen.getByTestId('snapshot')).toHaveTextContent(
      JSON.stringify(projectSnapshot),
    );

    fireEvent.click(screen.getByRole('button', { name: 'Complete' }));
    expect(screen.getByTestId('state')).toHaveTextContent(
      'idle:forward:/projets/test',
    );
    expect(screen.getByTestId('snapshot')).toHaveTextContent(
      JSON.stringify(projectSnapshot),
    );

    fireEvent.click(screen.getByRole('button', { name: 'Begin reverse' }));
    expect(screen.getByTestId('state')).toHaveTextContent(
      'active:reverse:/projets/test',
    );
    expect(screen.getByTestId('snapshot')).toHaveTextContent(
      JSON.stringify({
        ...projectSnapshot,
        imageRect: { left: 20, top: 30, width: 320, height: 220 },
      }),
    );

    fireEvent.click(screen.getByRole('button', { name: 'Complete' }));
    expect(screen.getByTestId('state')).toHaveTextContent('idle:reverse:none');
    expect(screen.getByTestId('callbacks-stable')).toHaveTextContent('true');
  });

  it('clears a completed forward snapshot whose origin is not projects', () => {
    renderHarness({ ...projectSnapshot, originPath: '/' });

    fireEvent.click(screen.getByRole('button', { name: 'Begin forward' }));
    fireEvent.click(screen.getByRole('button', { name: 'Complete' }));

    expect(screen.getByTestId('state')).toHaveTextContent('idle:forward:none');
  });

  it('ignores reverse transitions until a forward snapshot exists', () => {
    renderHarness();

    expect(screen.getByTestId('api-ready')).toHaveTextContent('true');
    fireEvent.click(screen.getByRole('button', { name: 'Begin reverse' }));

    expect(screen.getByTestId('state')).toHaveTextContent('idle:none:none');
  });

  it('clears the full typed transition state', () => {
    renderHarness();

    fireEvent.click(screen.getByRole('button', { name: 'Begin forward' }));
    expect(screen.getByTestId('state')).toHaveTextContent(
      'active:forward:/projets/test',
    );
    fireEvent.click(screen.getByRole('button', { name: 'Clear' }));

    expect(screen.getByTestId('state')).toHaveTextContent('idle:none:none');
  });
});
