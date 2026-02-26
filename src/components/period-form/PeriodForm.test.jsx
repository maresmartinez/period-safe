import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import PeriodForm from './PeriodForm.jsx';
import { ToastProvider } from '../../stores/ToastContext.jsx';
import ToastContainer from '../Toast.jsx';
import * as periodService from '../../services/periodService.js';

vi.mock('../../services/periodService.js', () => ({
  createPeriod: vi.fn(),
  updatePeriod: vi.fn(),
}));

function renderForm(props = {}) {
  const onSuccess = props.onSuccess ?? vi.fn();
  const onCancel = props.onCancel ?? vi.fn();

  render(
    <ToastProvider>
      <PeriodForm
        initialData={props.initialData ?? null}
        onSuccess={onSuccess}
        onCancel={onCancel}
      />
      <ToastContainer />
    </ToastProvider>
  );

  return { onSuccess, onCancel };
}

describe('PeriodForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all field types', () => {
    renderForm();

    expect(screen.getByLabelText(/start date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/end date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/flow/i)).toBeInTheDocument();
    expect(screen.getByRole('group', { name: /symptoms/i })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: /mood/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/notes/i)).toBeInTheDocument();
  });

  it('shows inline error when submitted without startDate', async () => {
    renderForm();

    fireEvent.click(screen.getByRole('button', { name: /log period/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/start date is required/i);
    expect(periodService.createPeriod).not.toHaveBeenCalled();
  });

  it('shows inline error when endDate is before startDate', async () => {
    renderForm();

    fireEvent.change(screen.getByLabelText(/start date/i), { target: { value: '2024-03-10' } });
    fireEvent.change(screen.getByLabelText(/end date/i), { target: { value: '2024-03-05' } });
    fireEvent.click(screen.getByRole('button', { name: /log period/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/end date must be on or after/i);
    expect(periodService.createPeriod).not.toHaveBeenCalled();
  });

  it('clears startDate error when the field is updated', async () => {
    renderForm();

    fireEvent.click(screen.getByRole('button', { name: /log period/i }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/start date is required/i);

    fireEvent.change(screen.getByLabelText(/start date/i), { target: { value: '2024-03-01' } });
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('calls createPeriod with correct data shape on valid submit', async () => {
    const mockPeriod = { id: 'abc', startDate: '2024-03-01', schemaVersion: 1 };
    periodService.createPeriod.mockResolvedValue(mockPeriod);

    const { onSuccess } = renderForm();

    fireEvent.change(screen.getByLabelText(/start date/i), { target: { value: '2024-03-01' } });
    fireEvent.change(screen.getByLabelText(/flow/i), { target: { value: 'heavy' } });
    fireEvent.click(screen.getByLabelText(/cramps/i));
    fireEvent.click(screen.getByLabelText(/mood: 3 out of 5/i));
    fireEvent.change(screen.getByLabelText(/notes/i), { target: { value: 'Test notes' } });
    fireEvent.click(screen.getByRole('button', { name: /log period/i }));

    await waitFor(() => {
      expect(periodService.createPeriod).toHaveBeenCalledWith(
        expect.objectContaining({
          startDate: '2024-03-01',
          endDate: null,
          flow: 'heavy',
          symptoms: ['cramps'],
          mood: 3,
          notes: 'Test notes',
        })
      );
    });

    expect(onSuccess).toHaveBeenCalledWith(mockPeriod);
  });

  it('shows error toast and does not call onSuccess when createPeriod throws', async () => {
    periodService.createPeriod.mockRejectedValue({ code: 'DB_ERROR', message: 'Failed' });

    const { onSuccess } = renderForm();

    fireEvent.change(screen.getByLabelText(/start date/i), { target: { value: '2024-03-01' } });
    fireEvent.click(screen.getByRole('button', { name: /log period/i }));

    expect(await screen.findByText(/failed to save/i)).toBeInTheDocument();
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it('shows success toast and calls onSuccess when createPeriod succeeds', async () => {
    const mockPeriod = { id: 'xyz', startDate: '2024-03-01', schemaVersion: 1 };
    periodService.createPeriod.mockResolvedValue(mockPeriod);

    const { onSuccess } = renderForm();

    fireEvent.change(screen.getByLabelText(/start date/i), { target: { value: '2024-03-01' } });
    fireEvent.click(screen.getByRole('button', { name: /log period/i }));

    expect(await screen.findByText(/period logged successfully/i)).toBeInTheDocument();
    expect(onSuccess).toHaveBeenCalledWith(mockPeriod);
  });

  it('pre-populates all fields in edit mode', () => {
    const initialData = {
      id: 'edit-id',
      startDate: '2024-02-01',
      endDate: '2024-02-05',
      flow: 'medium',
      symptoms: ['cramps', 'fatigue'],
      mood: 3,
      notes: 'Some notes',
      schemaVersion: 1,
    };

    renderForm({ initialData });

    expect(screen.getByLabelText(/start date/i)).toHaveValue('2024-02-01');
    expect(screen.getByLabelText(/end date/i)).toHaveValue('2024-02-05');
    expect(screen.getByLabelText(/flow/i)).toHaveValue('medium');
    expect(screen.getByLabelText(/cramps/i)).toBeChecked();
    expect(screen.getByLabelText(/fatigue/i)).toBeChecked();
    expect(screen.getByLabelText(/headache/i)).not.toBeChecked();
    expect(screen.getByRole('button', { name: /mood: 3 out of 5/i })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
    expect(screen.getByRole('button', { name: /mood: 1 out of 5/i })).toHaveAttribute(
      'aria-pressed',
      'false'
    );
    expect(screen.getByLabelText(/notes/i)).toHaveValue('Some notes');
  });

  it('calls updatePeriod (not createPeriod) when editing an existing period', async () => {
    const initialData = {
      id: 'edit-id',
      startDate: '2024-02-01',
      endDate: null,
      flow: null,
      symptoms: [],
      mood: null,
      notes: null,
      schemaVersion: 1,
    };
    const mockUpdated = { ...initialData, flow: 'light' };
    periodService.updatePeriod.mockResolvedValue(mockUpdated);

    const { onSuccess } = renderForm({ initialData });

    fireEvent.click(screen.getByRole('button', { name: /save changes/i }));

    await waitFor(() => {
      expect(periodService.updatePeriod).toHaveBeenCalledWith(
        'edit-id',
        expect.objectContaining({ startDate: '2024-02-01' })
      );
    });

    expect(periodService.createPeriod).not.toHaveBeenCalled();
    expect(onSuccess).toHaveBeenCalledWith(mockUpdated);
  });

  it('calls onCancel when cancel button is clicked', () => {
    const { onCancel } = renderForm();
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it('disables submit button and shows spinner while saving', async () => {
    // Never resolves — keeps loading state active
    periodService.createPeriod.mockImplementation(() => new Promise(() => {}));

    renderForm();

    fireEvent.change(screen.getByLabelText(/start date/i), { target: { value: '2024-03-01' } });
    fireEvent.click(screen.getByRole('button', { name: /log period/i }));

    const submitButton = screen.getByRole('button', { name: /log period/i });
    expect(submitButton).toBeDisabled();
    expect(screen.getByRole('status')).toBeInTheDocument();
  });
});
