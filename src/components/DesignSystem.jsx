import { useState } from 'react';
import Button from './Button.jsx';
import Card from './Card.jsx';
import Modal from './Modal.jsx';
import LoadingSpinner from './LoadingSpinner.jsx';
import { useToast } from '../hooks/useToast.js';

export default function DesignSystem() {
  const [modalOpen, setModalOpen] = useState(false);
  const { showToast } = useToast();

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 p-8 space-y-10">
      <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
        PeriodSafe Design System
      </h1>

      {/* Buttons */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-neutral-700 dark:text-neutral-300">Buttons</h2>
        <div className="flex flex-wrap gap-3">
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger">Danger</Button>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="primary" size="sm">Small</Button>
          <Button variant="primary" size="md">Medium</Button>
          <Button variant="primary" size="lg">Large</Button>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="primary" loading>Loading</Button>
          <Button variant="primary" disabled>Disabled</Button>
        </div>
      </section>

      {/* Card */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-neutral-700 dark:text-neutral-300">Card</h2>
        <Card className="max-w-sm">
          <p className="text-neutral-700 dark:text-neutral-300">
            This is a card component with a warm neutral background and subtle shadow.
          </p>
        </Card>
      </section>

      {/* Spinners */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-neutral-700 dark:text-neutral-300">Loading Spinner</h2>
        <div className="flex items-center gap-6 text-rose-500">
          <LoadingSpinner size="sm" />
          <LoadingSpinner size="md" />
          <LoadingSpinner size="lg" />
        </div>
      </section>

      {/* Modal */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-neutral-700 dark:text-neutral-300">Modal</h2>
        <Button onClick={() => setModalOpen(true)}>Open Modal</Button>
        <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Example Modal">
          <p className="text-neutral-600 dark:text-neutral-400 mb-4">
            This modal traps focus inside and closes with ESC or the backdrop.
          </p>
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={() => setModalOpen(false)}>Confirm</Button>
          </div>
        </Modal>
      </section>

      {/* Toasts */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-neutral-700 dark:text-neutral-300">Toasts</h2>
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => showToast({ type: 'success', message: 'Period logged successfully!' })}>
            Success Toast
          </Button>
          <Button variant="danger" onClick={() => showToast({ type: 'error', message: 'Something went wrong.' })}>
            Error Toast
          </Button>
          <Button variant="secondary" onClick={() => showToast({ type: 'info', message: 'Data imported.' })}>
            Info Toast
          </Button>
        </div>
      </section>
    </div>
  );
}
