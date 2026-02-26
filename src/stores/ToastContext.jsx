import { createContext, useContext, useReducer, useCallback, useRef } from 'react';

const ToastContext = createContext(null);

function reducer(state, action) {
  switch (action.type) {
    case 'ADD':
      return [...state, action.toast];
    case 'REMOVE':
      return state.filter((t) => t.id !== action.id);
    default:
      return state;
  }
}

export function ToastProvider({ children }) {
  const [toasts, dispatch] = useReducer(reducer, []);
  const timersRef = useRef({});

  const showToast = useCallback(({ type = 'info', message, duration = 4000 }) => {
    const id = crypto.randomUUID();
    dispatch({ type: 'ADD', toast: { id, type, message } });

    timersRef.current[id] = setTimeout(() => {
      dispatch({ type: 'REMOVE', id });
      delete timersRef.current[id];
    }, duration);
  }, []);

  const dismissToast = useCallback((id) => {
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

// eslint-disable-next-line react-refresh/only-export-components
export function useToastContext() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToastContext must be used within ToastProvider');
  return ctx;
}
