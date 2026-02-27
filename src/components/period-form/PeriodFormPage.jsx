import { useNavigate, useLocation } from 'react-router-dom';
import PeriodForm from './PeriodForm.jsx';

export default function PeriodFormPage() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const editPeriod = state?.period ?? null;

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-6">
        {editPeriod ? 'Edit Period' : 'Log Period'}
      </h1>
      <PeriodForm
        initialData={editPeriod}
        onSuccess={() => navigate('/')}
        onCancel={() => navigate('/')}
      />
    </div>
  );
}
