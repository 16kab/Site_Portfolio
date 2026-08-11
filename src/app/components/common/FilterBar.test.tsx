import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import FilterBar from './FilterBar';

describe('FilterBar', () => {
  it('rend une puce par option, "Tous" actif par défaut', () => {
    render(<FilterBar value="all" onChange={() => {}} />);
    expect(screen.getAllByRole('tab')).toHaveLength(4);
    expect(screen.getByRole('tab', { name: 'Tous' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
  });
  it('remonte le choix au clic', () => {
    const onChange = vi.fn();
    render(<FilterBar value="all" onChange={onChange} />);
    fireEvent.click(screen.getByRole('tab', { name: 'Mobile' }));
    expect(onChange).toHaveBeenCalledWith('mobile');
  });
  it('reflète la valeur active', () => {
    render(<FilterBar value="branding" onChange={() => {}} />);
    expect(screen.getByRole('tab', { name: 'Branding' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
  });
});
