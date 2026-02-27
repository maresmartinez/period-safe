import { Link } from 'react-router-dom';
import { APP_NAME } from '../../config.ts';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      className="border-t border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 mt-8"
      aria-label="Site footer"
    >
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

          {/* Navigation links */}
          <nav aria-label="Footer navigation">
            <ul className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs">
                <li>
                <Link
                  to="/privacy"
                  className="text-neutral-500 dark:text-neutral-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 rounded"
                >
                  About
                </Link>
              </li>
              <li>
                <a
                  href="https://github.com/maresmartinez/period-safe"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-neutral-500 dark:text-neutral-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 rounded"
                >
                  GitHub
                </a>
              </li>
            </ul>
          </nav>

          {/* App info */}
          <div className="text-xs text-neutral-400 dark:text-neutral-500 flex flex-wrap items-center gap-x-1.5 gap-y-1">
            <span>© {year} {APP_NAME}</span>
          </div>

        </div>
      </div>
    </footer>
  );
}
