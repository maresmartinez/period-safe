import { NavLink } from 'react-router-dom';

interface NavItem {
  to: string;
  label: string;
  end: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Calendar', end: true },
  { to: '/log', label: 'Log', end: true },
  { to: '/history', label: 'History', end: true },
  { to: '/export', label: 'Import / Export', end: true },
  { to: '/settings', label: 'Settings', end: true },
];

export default function TabNav() {
  return (
    <nav
      aria-label="Main navigation"
      className="hidden md:flex border-b border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-4"
    >
      <div className="flex max-w-4xl mx-auto w-full">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              [
                'px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-inset',
                isActive
                  ? 'border-rose-500 text-rose-600 dark:text-rose-400'
                  : 'border-transparent text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:border-neutral-300 dark:hover:border-neutral-600',
              ].join(' ')
            }
          >
            {item.label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
