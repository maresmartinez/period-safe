import { Link } from 'react-router-dom';
import Card from '../Card.tsx';
import { APP_NAME } from '../../config.ts';

export default function PrivacyPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Back link */}
      <Link
        to="/"
        className="inline-flex items-center gap-1 text-sm text-rose-600 dark:text-rose-400 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 rounded mb-8"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="w-4 h-4"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 1 1 1.04 1.08L5.612 9.25H16.25A.75.75 0 0 1 17 10Z"
            clipRule="evenodd"
          />
        </svg>
        Back to Calendar
      </Link>

      {/* Hero */}
      <div className="mb-10 text-center">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-rose-100 dark:bg-rose-950 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-8 h-8 text-rose-500"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M10 1a4.5 4.5 0 0 0-4.5 4.5V9H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-.5V5.5A4.5 4.5 0 0 0 10 1Zm3 8V5.5a3 3 0 1 0-6 0V9h6Z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-3">
          Your Privacy, Your Control
        </h1>
        <p className="text-base text-neutral-600 dark:text-neutral-400 leading-relaxed">
          People with periods deserve to feel safe and completely in control of their health data.
          {' '}{APP_NAME} was built on that belief, from the ground up.
        </p>
      </div>

      <div className="space-y-5">
        {/* Why This Matters */}
        <Card>
          <section aria-labelledby="why-matters-heading">
            <h2
              id="why-matters-heading"
              className="text-base font-semibold text-neutral-900 dark:text-neutral-100 mb-3"
            >
              Why This Matters
            </h2>
            <div className="space-y-3 text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
              <p>
                Menstrual health data is among the most intimate information a person can have.
                It reflects your body&apos;s patterns, your reproductive health, and moments that
                are deeply personal. It should never be in the hands of a corporation, advertiser,
                or any third party — full stop.
              </p>
              <p>
                Many period tracking apps quietly collect and sell this data. {APP_NAME} takes
                the opposite approach: <strong>we made it technically impossible for your data
                to leave your device</strong>, not just a policy promise.
              </p>
            </div>
          </section>
        </Card>

        {/* How Your Data Is Stored */}
        <Card>
          <section aria-labelledby="how-stored-heading">
            <h2
              id="how-stored-heading"
              className="text-base font-semibold text-neutral-900 dark:text-neutral-100 mb-3"
            >
              How Your Data Is Stored
            </h2>
            <div className="space-y-3 text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
              <p>
                {APP_NAME} stores all your data in <strong>IndexedDB</strong> — a full database
                that lives entirely inside your browser, on your own device. Think of it like a
                filing cabinet built into the browser itself, that only you have the key to.
              </p>
              <p>
                IndexedDB is a browser standard supported by every modern browser. Data stored
                there:
              </p>
              <ul className="list-disc list-inside space-y-1.5 ml-2">
                <li>Lives on your device&apos;s local storage, not on any server</li>
                <li>Is not synced to the cloud by the app (browser sync is your choice)</li>
                <li>Is never read or accessed by us — we have no server to receive it</li>
                <li>Persists between sessions just like any other saved file on your device</li>
              </ul>
              <p>
                Your settings (like cycle length and theme preference) are stored in{' '}
                <strong>localStorage</strong>, another browser-local storage mechanism — also
                never transmitted anywhere.
              </p>
            </div>
          </section>
        </Card>

        {/* What We Never Do */}
        <Card>
          <section aria-labelledby="never-do-heading">
            <h2
              id="never-do-heading"
              className="text-base font-semibold text-neutral-900 dark:text-neutral-100 mb-3"
            >
              What We Never Do
            </h2>
            <ul className="space-y-2 text-sm text-neutral-700 dark:text-neutral-300">
              {[
                'Transmit your data to any server — there is no backend',
                'Require you to create an account or sign in',
                'Sell, share, or license your data to anyone',
                'Show you targeted ads based on your health data',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold mt-0.5 flex-shrink-0" aria-hidden="true">
                    ✕
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>
        </Card>

        {/* Your Data, Your Way */}
        <Card>
          <section aria-labelledby="your-data-heading">
            <h2
              id="your-data-heading"
              className="text-base font-semibold text-neutral-900 dark:text-neutral-100 mb-3"
            >
              Your Data, Your Way
            </h2>
            <div className="space-y-3 text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
              <p>
                Because your data lives on your device, you are always in control. You can:
              </p>
              <ul className="list-disc list-inside space-y-1.5 ml-2">
                <li>
                  <strong>Export</strong> all your period records as a portable JSON file at any time
                </li>
                <li>
                  <strong>Import</strong> a backup to restore your data or move between devices
                </li>
                <li>
                  <strong>Delete</strong> everything instantly — clearing your browser data
                  removes all records permanently
                </li>
              </ul>
              <p>
                If you clear your browser&apos;s storage, your entries will be gone — but that&apos;s
                entirely under your control, not ours. We recommend exporting a backup periodically.
              </p>
              <Link
                to="/export"
                className="inline-flex items-center gap-1 mt-2 text-rose-600 dark:text-rose-400 font-medium hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 rounded"
              >
                Export / Backup your data
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-4 h-4"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M3 10a.75.75 0 0 1 .75-.75h10.638L10.23 5.29a.75.75 0 1 1 1.04-1.08l5.5 5.25a.75.75 0 0 1 0 1.08l-5.5 5.25a.75.75 0 1 1-1.04-1.08l4.158-3.96H3.75A.75.75 0 0 1 3 10Z"
                    clipRule="evenodd"
                  />
                </svg>
              </Link>
            </div>
          </section>
        </Card>

        {/* Open Source */}
        <Card>
          <section aria-labelledby="open-source-heading">
            <h2
              id="open-source-heading"
              className="text-base font-semibold text-neutral-900 dark:text-neutral-100 mb-3"
            >
              Open Source &amp; Auditable
            </h2>
            <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
              {APP_NAME} is free and open source. That means the code that runs this app is
              publicly available and can be inspected by anyone. You don&apos;t have to take our
              word for any of this — you can verify it yourself. Privacy by design, not by promise.
            </p>
          </section>
        </Card>
      </div>

      {/* Footer note */}
      <p className="mt-8 text-center text-xs text-neutral-400 dark:text-neutral-500">
        {APP_NAME} — privacy by design, not by promise.
      </p>
    </div>
  );
}
