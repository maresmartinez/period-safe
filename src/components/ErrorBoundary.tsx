import React from 'react';
import Button from './Button.tsx';

interface Props {
  children?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error) {
    // Only log error name and message; never log user data
    console.error('[PeriodSafe Error]', error.name, error.message);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div role="alert" className="p-8 text-center">
          <h2 className="text-xl font-semibold mb-2 text-neutral-900 dark:text-neutral-100">
            Something went wrong
          </h2>
          <p className="text-neutral-600 dark:text-neutral-400 mb-4 max-w-md mx-auto">
            Please refresh the page. Your data is safe and stored locally on your device.
          </p>
          <Button
            onClick={() => {
              window.location.reload();
            }}
            variant="primary"
            size="md"
          >
            Refresh the page
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
