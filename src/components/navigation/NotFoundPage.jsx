import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <p className="text-6xl font-bold text-neutral-200 dark:text-neutral-700 select-none" aria-hidden="true">
        404
      </p>
      <h1 className="mt-4 text-xl font-semibold text-neutral-900 dark:text-neutral-100">
        Page not found
      </h1>
      <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
        The page you&apos;re looking for doesn&apos;t exist.
      </p>
      <Link
        to="/"
        className="mt-6 text-sm font-medium text-rose-600 dark:text-rose-400 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 rounded"
      >
        Go back home
      </Link>
    </div>
  );
}
