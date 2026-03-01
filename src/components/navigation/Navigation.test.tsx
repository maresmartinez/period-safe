import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import type { ReactNode } from 'react';
import Header from './Header.tsx';
import BottomNav from './BottomNav.tsx';
import TabNav from './TabNav.tsx';
import NotFoundPage from './NotFoundPage.tsx';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function renderWithRouter(ui: ReactNode, { initialEntries = ['/'] } = {}) {
  return render(<MemoryRouter initialEntries={initialEntries}>{ui}</MemoryRouter>);
}

// ---------------------------------------------------------------------------
// Header
// ---------------------------------------------------------------------------
describe('Header', () => {
  it('renders the app title "PeriodSafe"', () => {
    renderWithRouter(<Header />);
    expect(screen.getByText('PeriodSafe')).toBeInTheDocument();
  });

  it('has a settings link', () => {
    renderWithRouter(<Header />);
    expect(screen.getByRole('link', { name: /settings/i })).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// NotFoundPage
// ---------------------------------------------------------------------------
describe('NotFoundPage', () => {
  it('renders a "Page not found" heading', () => {
    renderWithRouter(<NotFoundPage />);
    expect(screen.getByRole('heading', { name: /page not found/i })).toBeInTheDocument();
  });

  it('renders a link back to home', () => {
    renderWithRouter(<NotFoundPage />);
    const link = screen.getByRole('link', { name: /go back home/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/');
  });
});

// ---------------------------------------------------------------------------
// BottomNav
// ---------------------------------------------------------------------------
describe('BottomNav', () => {
  it('renders five navigation items', () => {
    renderWithRouter(<BottomNav />);
    const nav = screen.getByRole('navigation', { name: /main navigation/i });
    // Each NavLink is a link inside the nav
    const links = nav.querySelectorAll('a');
    expect(links).toHaveLength(5);
  });

  it('highlights Calendar as active on root route', () => {
    renderWithRouter(<BottomNav />, { initialEntries: ['/'] });
    const calendarLink = screen.getByRole('link', { name: /calendar/i });
    expect(calendarLink.className).toMatch(/rose/);
  });

  it('highlights Settings as active on /settings route', () => {
    renderWithRouter(<BottomNav />, { initialEntries: ['/settings'] });
    const settingsLink = screen.getByRole('link', { name: /settings/i });
    expect(settingsLink.className).toMatch(/rose/);
  });

  it('highlights Log as active on /log route', () => {
    renderWithRouter(<BottomNav />, { initialEntries: ['/log'] });
    const logLink = screen.getByRole('link', { name: /^log$/i });
    expect(logLink.className).toMatch(/rose/);
  });
});

// ---------------------------------------------------------------------------
// TabNav
// ---------------------------------------------------------------------------
describe('TabNav', () => {
  it('renders five navigation links', () => {
    renderWithRouter(<TabNav />);
    const nav = screen.getByRole('navigation', { name: /main navigation/i });
    const links = nav.querySelectorAll('a');
    expect(links).toHaveLength(5);
  });

  it('highlights Calendar tab as active on root route', () => {
    renderWithRouter(<TabNav />, { initialEntries: ['/'] });
    const calendarLink = screen.getByRole('link', { name: /calendar/i });
    expect(calendarLink.className).toMatch(/rose/);
  });

  it('highlights Settings tab as active on /settings route', () => {
    renderWithRouter(<TabNav />, { initialEntries: ['/settings'] });
    const settingsLink = screen.getByRole('link', { name: /settings/i });
    expect(settingsLink.className).toMatch(/rose/);
  });
});
