import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Modal from './Modal.jsx';

function renderModal(props = {}) {
  const defaults = {
    isOpen: true,
    onClose: vi.fn(),
    title: 'Test Modal',
    children: <p>Modal content</p>,
  };
  return render(<Modal {...defaults} {...props} />);
}

describe('Modal', () => {
  it('renders when isOpen is true', () => {
    renderModal({ isOpen: true });
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Test Modal')).toBeInTheDocument();
    expect(screen.getByText('Modal content')).toBeInTheDocument();
  });

  it('does not render when isOpen is false', () => {
    renderModal({ isOpen: false });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('has aria-modal="true"', () => {
    renderModal();
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
  });

  it('calls onClose when ESC is pressed', async () => {
    const onClose = vi.fn();
    renderModal({ onClose });
    await userEvent.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('calls onClose when close button is clicked', async () => {
    const onClose = vi.fn();
    renderModal({ onClose });
    await userEvent.click(screen.getByLabelText('Close dialog'));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('traps focus: Tab from last focusable element wraps to first', async () => {
    const onClose = vi.fn();
    renderModal({ onClose, children: <button>Inner Button</button> });
    const dialog = screen.getByRole('dialog');
    const focusable = dialog.querySelectorAll(
      'button:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    const last = focusable[focusable.length - 1];
    last.focus();
    await userEvent.keyboard('{Tab}');
    expect(document.activeElement).toBe(focusable[0]);
  });
});
