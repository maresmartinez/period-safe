import { createContext, useContext, useReducer, useCallback, useRef } from 'react';
import type { ReactNode } from 'react';
import type { Toast, ShowToastOptions, ToastType } from '../types.ts';

interface ToastContextValue {
  toasts: Toast[];
  showToast: (opts: ShowToastOptions) => void;
  dismissToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

type ToastAction =
  | { type: 'ADD'; toast: Toast }
  | { type: 'REMOVE'; id: string };

function reducer(state: Toast[], action: ToastAction): Toast[] {
  switch (action.type) {
    case 'ADD':
      return [...state, action.toast];
    case 'REMOVE':
      return state.filter((t) => t.id !== action.id);
    default:
      return state;
  }
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, dispatch] = useReducer(reducer, []);
  const timersRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const showToast = useCallback(({ type = 'info' as ToastType, message, duration = 4000 }: ShowToastOptions) => {
    const id = crypto.randomUUID();
    dispatch({ type: 'ADD', toast: { id, type, message } });

    timersRef.current[id] = setTimeout(() => {
      dispatch({ type: 'REMOVE', id });
      delete timersRef.current[id];
    }, duration);
  }, []);

  const dismissToast = useCallback((id: string) => {
    clearTimeout(timersRef.current[id]);
    delete timersRef.current[id];
    dispatch({ type: 'REMOVE', id });
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, showToast, dismissToast }}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToastContext(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToastContext must be used within ToastProvider');
  return ctx;
}
