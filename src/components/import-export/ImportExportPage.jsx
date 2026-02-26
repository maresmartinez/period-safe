import { useRef, useState } from 'react';
import Button from '../Button.jsx';
import Card from '../Card.jsx';
import Modal from '../Modal.jsx';
import { useToast } from '../../hooks/useToast.js';
import {
  exportData,
  downloadJSON,
  getExportFilename,
  validateImportShape,
  importData,
  MAX_IMPORT_FILE_SIZE,
} from '../../utils/dataTransfer.js';
import { clearAllPeriods } from '../../services/periodService.js';
import { resetSettings } from '../../services/settingsService.js';

// ---------------------------------------------------------------------------
// ImportExportPage
// ---------------------------------------------------------------------------
export default function ImportExportPage() {
  const { showToast } = useToast();
  const fileInputRef = useRef(null);

  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);

  // Holds validated payload waiting for strategy choice
  const [pendingPayload, setPendingPayload] = useState(null);
  const [importModalOpen, setImportModalOpen] = useState(false);

  // Clear-all confirmation
  const [clearModalOpen, setClearModalOpen] = useState(false);
  const [clearing, setClearing] = useState(false);

  // -------------------------------------------------------------------------
  // Export
  // -------------------------------------------------------------------------
  async function handleExport() {
    setExporting(true);
    try {
      const json = await exportData();
      downloadJSON(json, getExportFilename());
      showToast('Data exported successfully.', 'success');
    } catch (err) {
      showToast('Export failed. Please try again.', 'error');
    } finally {
      setExporting(false);
    }
  }

  // -------------------------------------------------------------------------
  // Import — file picker
  // -------------------------------------------------------------------------
  function handleImportClick() {
    fileInputRef.current?.click();
  }

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    // Reset so the same file can be picked again
    e.target.value = '';

    if (!file) return;

    if (file.size > MAX_IMPORT_FILE_SIZE) {
      showToast('File is too large (max 10 MB). Export a smaller backup.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      let parsed;
      try {
        parsed = JSON.parse(event.target.result);
      } catch {
        showToast('Could not read file — make sure it is a valid JSON file.', 'error');
        return;
      }

      const { valid, errors } = validateImportShape(parsed);
      if (!valid) {
        showToast(`Invalid file: ${errors[0]}`, 'error');
        return;
      }

      setPendingPayload(parsed);
      setImportModalOpen(true);
    };
    reader.onerror = () => {
      showToast('Failed to read the file. Please try again.', 'error');
    };
    reader.readAsText(file);
  }

  // -------------------------------------------------------------------------
  // Import — strategy chosen in modal
  // -------------------------------------------------------------------------
  async function handleImportStrategy(strategy) {
    setImportModalOpen(false);
    if (!pendingPayload) return;
    setImporting(true);
    try {
      await importData(pendingPayload, strategy);
      const count = pendingPayload.data.periods.length;
      showToast(
        `Import complete. ${count} period${count !== 1 ? 's' : ''} ${strategy === 'overwrite' ? 'restored' : 'merged'}.`,
        'success'
      );
    } catch (err) {
      showToast('Import failed. Your existing data was not changed.', 'error');
    } finally {
      setPendingPayload(null);
      setImporting(false);
    }
  }

  function handleImportModalClose() {
    setImportModalOpen(false);
    setPendingPayload(null);
  }

  // -------------------------------------------------------------------------
  // Clear all data
  // -------------------------------------------------------------------------
  async function handleClearConfirm() {
    setClearModalOpen(false);
    setClearing(true);
    try {
      await clearAllPeriods();
      resetSettings();
      showToast('All data cleared.', 'success');
    } catch (err) {
      showToast('Failed to clear data. Please try again.', 'error');
    } finally {
      setClearing(false);
    }
  }

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
      {/* Privacy framing */}
      <Card>
        <div className="flex items-start gap-3">
          <span className="text-2xl" aria-hidden="true">
            🔒
          </span>
          <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
            Your data lives only on this device. Exporting gives you a backup you control.
            PeriodSafe never sends your data anywhere.
          </p>
        </div>
      </Card>

      {/* Export */}
      <Card>
        <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100 mb-1">
          Export data
        </h2>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
          Download all your logged periods and settings as a JSON file. Keep it somewhere safe as
          your personal backup.
        </p>
        <Button onClick={handleExport} loading={exporting} disabled={exporting}>
          Download backup
        </Button>
      </Card>

      {/* Import */}
      <Card>
        <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100 mb-1">
          Import data
        </h2>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
          Restore from a previously exported PeriodSafe JSON file. You will be asked whether to
          replace all existing data or merge the imported records.
        </p>
        <Button
          variant="secondary"
          onClick={handleImportClick}
          loading={importing}
          disabled={importing}
          aria-label="Choose a backup file to import"
        >
          Choose file…
        </Button>
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          className="sr-only"
          aria-hidden="true"
          tabIndex={-1}
          onChange={handleFileChange}
        />
      </Card>

      {/* Danger zone */}
      <Card>
        <h2 className="text-base font-semibold text-red-600 dark:text-red-400 mb-1">
          Danger zone
        </h2>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
          Permanently delete all logged periods and reset settings to defaults. Export a backup
          first if you want to keep your data.
        </p>
        <Button
          variant="danger"
          onClick={() => setClearModalOpen(true)}
          loading={clearing}
          disabled={clearing}
        >
          Clear all data
        </Button>
      </Card>

      {/* Import strategy modal */}
      <Modal
        isOpen={importModalOpen}
        onClose={handleImportModalClose}
        title="Import data"
        size="sm"
      >
        <p className="text-sm text-neutral-700 dark:text-neutral-300 mb-1">
          Found{' '}
          <strong>
            {pendingPayload?.data?.periods?.length ?? 0} period
            {(pendingPayload?.data?.periods?.length ?? 0) !== 1 ? 's' : ''}
          </strong>{' '}
          in the file. How would you like to import?
        </p>

        <div className="space-y-3 mt-4">
          <button
            onClick={() => handleImportStrategy('overwrite')}
            className="w-full text-left rounded-lg border border-neutral-200 dark:border-neutral-700 p-3 hover:bg-neutral-50 dark:hover:bg-neutral-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 transition-colors"
          >
            <p className="font-medium text-sm text-neutral-900 dark:text-neutral-100">
              Overwrite
            </p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              Delete all existing data and replace with the imported file. Settings will also be
              replaced.
            </p>
          </button>

          <button
            onClick={() => handleImportStrategy('merge')}
            className="w-full text-left rounded-lg border border-neutral-200 dark:border-neutral-700 p-3 hover:bg-neutral-50 dark:hover:bg-neutral-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 transition-colors"
          >
            <p className="font-medium text-sm text-neutral-900 dark:text-neutral-100">Merge</p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              Add imported periods to your existing data. Duplicate entries are skipped. Your current
              settings are kept.
            </p>
          </button>
        </div>

        <div className="mt-4 flex justify-end">
          <Button variant="ghost" size="sm" onClick={handleImportModalClose}>
            Cancel
          </Button>
        </div>
      </Modal>

      {/* Clear-all confirmation modal */}
      <Modal
        isOpen={clearModalOpen}
        onClose={() => setClearModalOpen(false)}
        title="Clear all data?"
        size="sm"
      >
        <p className="text-sm text-neutral-700 dark:text-neutral-300">
          This will permanently delete all your logged periods and reset your settings. This cannot
          be undone. Export your data first if you want a backup.
        </p>
        <div className="mt-6 flex gap-3 justify-end">
          <Button variant="ghost" size="sm" onClick={() => setClearModalOpen(false)}>
            Cancel
          </Button>
          <Button variant="danger" size="sm" onClick={handleClearConfirm}>
            Clear everything
          </Button>
        </div>
      </Modal>
    </div>
  );
}
