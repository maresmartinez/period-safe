import { useNavigate } from 'react-router-dom';
import PeriodForm from './PeriodForm.jsx';

export default function PeriodFormPage() {
  const navigate = useNavigate();

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-6">
        Log Period
      </h1>
      <PeriodForm
        initialData={null}
        onSuccess={() => navigate('/')}
        onCancel={() => navigate('/')}
      />
    </div>
  );
}
