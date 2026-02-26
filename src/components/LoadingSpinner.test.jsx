import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import LoadingSpinner from './LoadingSpinner.jsx';

describe('LoadingSpinner', () => {
  it('has role="status"', () => {
    render(<LoadingSpinner />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('has default aria-label "Loading..."', () => {
    render(<LoadingSpinner />);
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Loading...');
  });

  it('accepts a custom label', () => {
    render(<LoadingSpinner label="Saving data" />);
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Saving data');
  });
});
