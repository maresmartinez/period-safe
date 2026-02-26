import { ToastProvider } from './stores/ToastContext.jsx';
import ToastContainer from './components/Toast.jsx';

function App() {
  return (
    <ToastProvider>
      <div className="min-h-screen bg-white dark:bg-neutral-900">
        <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100 p-4">
          PeriodSafe
        </h1>
      </div>
      <ToastContainer />
    </ToastProvider>
  );
}

export default App;
