import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import BorderGlow, { getCursorAngle, getEdgeProximity } from './BorderGlow';

describe('BorderGlow', () => {
  it('maps the pointer from the center to the nearest edge', () => {
    expect(getEdgeProximity(200, 100, 100, 50)).toBe(0);
    expect(getEdgeProximity(200, 100, 200, 50)).toBe(1);
    expect(getCursorAngle(200, 100, 200, 50)).toBe(90);
  });

  it('returns zero proximity for degenerate rectangles', () => {
    expect(getEdgeProximity(0, 100, 0, 50)).toBe(0);
    expect(getEdgeProximity(200, 0, 100, 0)).toBe(0);
  });

  it('writes proximity and direction to CSS variables', () => {
    render(<BorderGlow data-testid="glow">content</BorderGlow>);
    const glow = screen.getByTestId('glow');

    vi.spyOn(glow, 'getBoundingClientRect').mockReturnValue({
      left: 0,
      top: 0,
      width: 200,
      height: 100,
      right: 200,
      bottom: 100,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });

    fireEvent.pointerMove(glow, { clientX: 200, clientY: 50 });

    expect(glow.style.getPropertyValue('--edge-proximity')).toBe('100.000');
    expect(glow.style.getPropertyValue('--cursor-angle')).toBe('90.000deg');
  });

  it('does not write NaN proximity for a degenerate rectangle', () => {
    render(<BorderGlow data-testid="degenerate-glow">content</BorderGlow>);
    const glow = screen.getByTestId('degenerate-glow');

    vi.spyOn(glow, 'getBoundingClientRect').mockReturnValue({
      left: 0,
      top: 0,
      width: 0,
      height: 100,
      right: 0,
      bottom: 100,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });

    fireEvent.pointerMove(glow, { clientX: 0, clientY: 50 });

    expect(glow.style.getPropertyValue('--edge-proximity')).toBe('0.000');
  });
});
