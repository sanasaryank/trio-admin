import { useState, useCallback } from 'react';

/**
 * Return type for useFormSubmit hook
 */
export interface UseFormSubmitReturn<T> {
  /** Whether form is currently submitting */
  isSubmitting: boolean;
  /** Error message if submit failed */
  error: string | null;
  /** Function to handle form submission */
  handleSubmit: (
    data: T,
    submitFn: (data: T) => Promise<void>,
    onSuccess?: () => void
  ) => Promise<void>;
}

export interface UseFormSubmitOptions {
  /** Called when submit fails with the error message (e.g. to show toast) */
  onError?: (message: string) => void;
}

/**
 * Hook for handling form submission with loading and error states
 *
 * @template T - The type of form data
 * @returns Object with submission state and submit handler
 *
 * @example
 * ```tsx
 * const { showError } = useAppSnackbar();
 * const { isSubmitting, error, handleSubmit } = useFormSubmit<FormData>({ onError: showError });
 * ```
 */
function useFormSubmit<T>(options?: UseFormSubmitOptions): UseFormSubmitReturn<T> {
  const { onError } = options ?? {};
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(
    async (
      data: T,
      submitFn: (data: T) => Promise<void>,
      onSuccess?: () => void
    ) => {
      try {
        setIsSubmitting(true);
        setError(null);
        await submitFn(data);
        if (onSuccess) {
          onSuccess();
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'An error occurred during submission';
        setError(errorMessage);
        onError?.(errorMessage);
        throw err; // Re-throw to allow caller to handle if needed
      } finally {
        setIsSubmitting(false);
      }
    },
    [onError]
  );

  return {
    isSubmitting,
    error,
    handleSubmit,
  };
}

export default useFormSubmit;
