import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { renderHook, act } from '@testing-library/react';
import SettingsPage from './SettingsPage.jsx';
import useSettings from '../../hooks/useSettings.js';
import { ToastProvider } from '../../stores/ToastContext.jsx';

function renderWithToast(ui) {
  return render(<ToastProvider>{ui}</ToastProvider>);
}

describe('useSettings', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');
  });

  it('returns default values on first load', () => {
    const { result } = renderHook(() => useSettings());
    expect(result.current.settings).not.toBeNull();
    expect(result.current.settings.cycleLengthAverage).toBe(28);
    expect(result.current.settings.theme).toBe('light');
    expect(result.current.loading).toBe(false);
  });

  it('saves cycle length and persists to localStorage', () => {
    const { result } = renderHook(() => useSettings());
    act(() => {
      result.current.saveSettings({ cycleLengthAverage: 30 });
    });
    expect(result.current.settings.cycleLengthAverage).toBe(30);
    // Verify it reads back from localStorage
    const { result: result2 } = renderHook(() => useSettings());
    expect(result2.current.settings.cycleLengthAverage).toBe(30);
  });

  it('applies dark class when theme is set to dark', () => {
    const { result } = renderHook(() => useSettings());
    act(() => {
      result.current.saveSettings({ theme: 'dark' });
    });
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('removes dark class when theme is set to light', () => {
    document.documentElement.classList.add('dark');
    const { result } = renderHook(() => useSettings());
    act(() => {
      result.current.saveSettings({ theme: 'light' });
    });
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('resets to default values', () => {
    const { result } = renderHook(() => useSettings());
    act(() => {
      result.current.saveSettings({ cycleLengthAverage: 30, theme: 'dark' });
    });
    act(() => {
      result.current.resetSettings();
    });
    expect(result.current.settings.cycleLengthAverage).toBe(28);
    expect(result.current.settings.theme).toBe('light');
  });
});

describe('SettingsPage', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');
  });

  it('renders all three sections', () => {
    renderWithToast(<SettingsPage />);
    expect(screen.getByRole('heading', { name: 'Cycle' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Reminders' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Appearance' })).toBeInTheDocument();
  });

  it('shows cycle length input with default value 28', () => {
    renderWithToast(<SettingsPage />);
    const input = screen.getByLabelText('Average cycle length');
    expect(input).toHaveValue(28);
  });

  it('shows validation error for cycle length below 21', () => {
    renderWithToast(<SettingsPage />);
    const input = screen.getByLabelText('Average cycle length');
    fireEvent.change(input, { target: { value: '15' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('shows validation error for cycle length above 35', () => {
    renderWithToast(<SettingsPage />);
    const input = screen.getByLabelText('Average cycle length');
    fireEvent.change(input, { target: { value: '40' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('does not show validation error for valid cycle length', () => {
    renderWithToast(<SettingsPage />);
    const input = screen.getByLabelText('Average cycle length');
    fireEvent.change(input, { target: { value: '30' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('clears validation error when input changes', () => {
    renderWithToast(<SettingsPage />);
    const input = screen.getByLabelText('Average cycle length');
    fireEvent.change(input, { target: { value: '10' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(screen.getByRole('alert')).toBeInTheDocument();
    fireEvent.change(input, { target: { value: '28' } });
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('Light button has aria-pressed=true by default', () => {
    renderWithToast(<SettingsPage />);
    expect(screen.getByRole('button', { name: 'Light' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Dark' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('clicking Dark applies dark class to document element', () => {
    renderWithToast(<SettingsPage />);
    fireEvent.click(screen.getByRole('button', { name: 'Dark' }));
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('clicking Light removes dark class from document element', () => {
    document.documentElement.classList.add('dark');
    localStorage.setItem('periodSafe_userSettings', JSON.stringify({ theme: 'dark' }));
    renderWithToast(<SettingsPage />);
    fireEvent.click(screen.getByRole('button', { name: 'Light' }));
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('reminder toggle is disabled', () => {
    renderWithToast(<SettingsPage />);
    expect(screen.getByRole('switch')).toBeDisabled();
  });

  it('reminder toggle has aria-checked=false', () => {
    renderWithToast(<SettingsPage />);
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'false');
  });
});
