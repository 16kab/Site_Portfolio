import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

describe('test environment', () => {
  it('renders React into jsdom', () => {
    render(<button type="button">Tester</button>);

    expect(screen.getByRole('button', { name: 'Tester' })).toBeInTheDocument();
  });
});
