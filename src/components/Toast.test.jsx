import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, act, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ToastProvider } from '../stores/ToastContext.jsx';
import ToastContainer from './Toast.jsx';
import { useToast } from '../hooks/useToast.js';

afterEach(() => {
  vi.useRealTimers();
});

function TestHarness({ type = 'success', message = 'Test message', duration = 4000 }) {
  const { showToast } = useToast();
  return (
    <button onClick={() => showToast({ type, message, duration })}>
      Show Toast
    </button>
  );
}

function renderWithProvider(props = {}, userOptions = {}) {
  const user = userEvent.setup(userOptions);
  const ui = render(
    <ToastProvider>
      <TestHarness {...props} />
      <ToastContainer />
    </ToastProvider>
  );
  return { ...ui, user };
}

describe('Toast system', () => {
  it('shows toast after showToast call', async () => {
    const { user } = renderWithProvider({ type: 'success', message: 'Done!' });
    await user.click(screen.getByRole('button', { name: /show toast/i }));
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Done!')).toBeInTheDocument();
  });

  it('error toast has aria-live="assertive"', async () => {
    const { user } = renderWithProvider({ type: 'error', message: 'Error occurred' });
    await user.click(screen.getByRole('button', { name: /show toast/i }));
    expect(screen.getByRole('alert')).toHaveAttribute('aria-live', 'assertive');
  });

  it('success toast has aria-live="polite"', async () => {
    const { user } = renderWithProvider({ type: 'success', message: 'Saved' });
    await user.click(screen.getByRole('button', { name: /show toast/i }));
    expect(screen.getByRole('alert')).toHaveAttribute('aria-live', 'polite');
  });

  it('auto-dismisses after duration ms', () => {
    vi.useFakeTimers();
    render(
      <ToastProvider>
        <TestHarness type="info" message="Temporary" duration={1000} />
        <ToastContainer />
      </ToastProvider>
    );
    act(() => {
      fireEvent.click(screen.getByRole('button', { name: /show toast/i }));
    });
    expect(screen.getByRole('alert')).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(1001));
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('can be manually dismissed', async () => {
    const { user } = renderWithProvider({ type: 'success', message: 'Dismiss me' });
    await user.click(screen.getByRole('button', { name: /show toast/i }));
    await user.click(screen.getByRole('button', { name: /dismiss/i }));
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
