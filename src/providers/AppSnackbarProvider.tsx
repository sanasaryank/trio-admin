import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import { Alert, Snackbar } from '@mui/material';

export type SnackbarSeverity = 'error' | 'success' | 'info' | 'warning';

interface SnackbarItem {
  key: number;
  message: string;
  severity: SnackbarSeverity;
}

interface AppSnackbarContextValue {
  showError: (message: string) => void;
  showSuccess: (message: string) => void;
  showInfo: (message: string) => void;
  showWarning: (message: string) => void;
}

const AppSnackbarContext = createContext<AppSnackbarContextValue | null>(null);

const AUTO_HIDE_DURATION_MS = 6000;

export function AppSnackbarProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState<SnackbarItem | null>(null);
  const queueRef = useRef<SnackbarItem[]>([]);
  const keyRef = useRef(0);
  const processQueueRef = useRef(() => {});

  const processQueue = useCallback(() => {
    if (queueRef.current.length === 0) {
      setCurrent(null);
      setOpen(false);
      return;
    }
    const next = queueRef.current.shift();
    if (next) {
      setCurrent(next);
      setOpen(true);
    }
  }, []);

  processQueueRef.current = processQueue;

  const enqueue = useCallback((message: string, severity: SnackbarSeverity) => {
    keyRef.current += 1;
    const item: SnackbarItem = { key: keyRef.current, message, severity };
    if (!current) {
      setCurrent(item);
      setOpen(true);
    } else {
      queueRef.current.push(item);
    }
  }, [current]);

  const handleClose = useCallback((_event: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') return;
    setOpen(false);
  }, []);

  const handleExited = useCallback(() => {
    setCurrent(null);
    processQueueRef.current();
  }, []);

  const showError = useCallback((message: string) => {
    enqueue(message, 'error');
  }, [enqueue]);

  const showSuccess = useCallback((message: string) => {
    enqueue(message, 'success');
  }, [enqueue]);

  const showInfo = useCallback((message: string) => {
    enqueue(message, 'info');
  }, [enqueue]);

  const showWarning = useCallback((message: string) => {
    enqueue(message, 'warning');
  }, [enqueue]);

  const value: AppSnackbarContextValue = {
    showError,
    showSuccess,
    showInfo,
    showWarning,
  };

  return (
    <AppSnackbarContext.Provider value={value}>
      {children}
      <Snackbar
        key={current?.key}
        open={open}
        autoHideDuration={AUTO_HIDE_DURATION_MS}
        onClose={handleClose}
        TransitionProps={{ onExited: handleExited }}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        sx={{ mt: 2 }}
      >
        <Alert
          elevation={6}
          variant="filled"
          severity={current?.severity ?? 'info'}
          onClose={() => handleClose({} as React.SyntheticEvent)}
        >
          {current?.message ?? ''}
        </Alert>
      </Snackbar>
    </AppSnackbarContext.Provider>
  );
}

export function useAppSnackbar(): AppSnackbarContextValue {
  const ctx = useContext(AppSnackbarContext);
  if (!ctx) {
    throw new Error('useAppSnackbar must be used within AppSnackbarProvider');
  }
  return ctx;
}
