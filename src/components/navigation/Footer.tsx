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

          {/* Tagline */}
          <div className="flex items-center gap-2 text-neutral-500 dark:text-neutral-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-4 h-4 text-rose-400 flex-shrink-0"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M10 1a4.5 4.5 0 0 0-4.5 4.5V9H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-.5V5.5A4.5 4.5 0 0 0 10 1Zm3 8V5.5a3 3 0 1 0-6 0V9h6Z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-xs">Your data never leaves your device</span>
          </div>

          {/* Navigation links */}
          <nav aria-label="Footer navigation">
            <ul className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs">
              <li>
                <Link
                  to="/privacy"
                  className="text-neutral-500 dark:text-neutral-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 rounded"
                >
                  Privacy Philosophy
                </Link>
              </li>
              <li>
                <Link
                  to="/export"
                  className="text-neutral-500 dark:text-neutral-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 rounded"
                >
                  Export / Backup Data
                </Link>
              </li>
              <li>
                <Link
                  to="/settings"
                  className="text-neutral-500 dark:text-neutral-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 rounded"
                >
                  Settings
                </Link>
              </li>
            </ul>
          </nav>

          {/* App info */}
          <div className="text-xs text-neutral-400 dark:text-neutral-500 flex flex-wrap items-center gap-x-1.5 gap-y-1">
            <span>© {year} {APP_NAME}</span>
            <span aria-hidden="true">·</span>
            <span>v1.0</span>
            <span aria-hidden="true">·</span>
            <span>Open source</span>
            <span aria-hidden="true">·</span>
            <span>Built for your privacy</span>
          </div>

        </div>
      </div>
    </footer>
  );
}
