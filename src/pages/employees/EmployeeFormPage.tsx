import { useEffect, useCallback, useRef, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { Box, Paper, Typography, Alert, CircularProgress } from '@mui/material';
import { employeesApi } from '../../api/endpoints';
import { FormField } from '../../components/ui/molecules';
import { Button } from '../../components/ui/atoms';
import { useFormSubmit, useFetch } from '../../hooks';
import { logger } from '../../utils/logger';
import type { EmployeeFormData, Employee } from '../../types';

const createEmployeeSchema = (t: (key: string) => string) => z.object({
  firstName: z.string().min(1, t('validation.firstNameRequired')),
  lastName: z.string().min(1, t('validation.lastNameRequired')),
  username: z.string().min(3, t('validation.usernameMinLength')),
  password: z.string().optional(),
  changePassword: z.boolean().optional(),
  isBlocked: z.boolean(),
}).refine((data) => {
  // Password is required when creating a new employee
  if (!data.changePassword) {
    return true; // Skip validation if changePassword is false (edit mode)
  }
  return data.password && data.password.length >= 6;
}, {
  message: t('validation.passwordMinLength'),
  path: ['password'],
});

type EmployeeFormValues = z.infer<ReturnType<typeof createEmployeeSchema>>;

interface EmployeeFormPageProps {
  onClose?: () => void;
  employeeId?: string;
  isDialog?: boolean;
  onSubmitCallback?: (handler: () => void) => void;
  onSubmittingChange?: (isSubmitting: boolean) => void;
}

export const EmployeeFormPage = ({ onClose, employeeId, isDialog = false, onSubmitCallback, onSubmittingChange }: EmployeeFormPageProps = {}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id: routeId } = useParams<{ id: string }>();
  const id = employeeId || routeId;
  const isEditMode = !!id;

  // Store hash separately to ensure it persists
  const hashRef = useRef<string | undefined>(undefined);

  // Create schema with translations
  const employeeSchema = useMemo(() => createEmployeeSchema(t), [t]);

  // Form state
  const {
    control,
    handleSubmit,
    reset,
    watch,
  } = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      username: '',
      password: '',
      changePassword: !isEditMode,
      isBlocked: false,
    },
  });

  // Fetch employee data in edit mode
  const {
    data: employeeData,
    loading: isFetching,
    error: fetchError,
  } = useFetch<(Employee & { hash?: string }) | null>(
    async () => {
      if (isEditMode && id) {
        const data = await employeesApi.getById(id);
        logger. debug('Fetched employee data', { data });
        return data;
      }
      return null;
    },
    [id, isEditMode]
  );

  // Load employee data into form
  useEffect(() => {
    if (employeeData) {
      logger.debug('Loading employee data with hash', { hash: employeeData.hash });
      // Store hash in ref
      hashRef.current = employeeData.hash;
      
      reset({
        firstName: employeeData.firstName,
        lastName: employeeData.lastName,
        username: employeeData.username,
        password: '',
        changePassword: false,
        isBlocked: employeeData.isBlocked,
      });
    }
  }, [employeeData, reset]);

  // Form submission handler
  const { isSubmitting, error: submitError, handleSubmit: handleFormSubmit } =
    useFormSubmit<EmployeeFormValues>();

  // Submit callback
  const onSubmit = useCallback(
    async (data: EmployeeFormValues) => {
      await handleFormSubmit(
        data,
        async (formData) => {
          const employeePayload: EmployeeFormData = {
            firstName: formData.firstName,
            lastName: formData.lastName,
            isBlocked: formData.isBlocked,
          } as EmployeeFormData;

          // Username is only included when creating (cannot be changed in edit mode)
          if (!isEditMode) {
            employeePayload.username = formData.username;
          }

          // Include hash in edit mode for optimistic concurrency control
          if (isEditMode && hashRef.current) {
            employeePayload.hash = hashRef.current;
          } else if (isEditMode) {
            logger.warn('No hash available for PUT request!');
          }

          logger.debug('Employee PUT payload', { employeePayload });

          // Include password if in create mode or if changePassword is true
          if (!isEditMode || formData.changePassword) {
            employeePayload.password = formData.password;
            employeePayload.changePassword = formData.changePassword;
          }

          if (isEditMode && id) {
            await employeesApi.update(id, employeePayload);
          } else {
            await employeesApi.create(employeePayload);
          }
        },
        () => {
          if (onClose) {
            onClose();
          } else {
            navigate('/employees');
          }
        }
      );
    },
    [handleFormSubmit, isEditMode, id, navigate, onClose]
  );

  // Cancel callback
  const handleCancel = useCallback(() => {
    if (onClose) {
      onClose();
    } else {
      navigate('/employees');
    }
  }, [navigate, onClose]);

  // Notify parent about submit handler - only once when dialog is opened
  const submitCallbackRef = useRef(onSubmitCallback);
  submitCallbackRef.current = onSubmitCallback;

  useEffect(() => {
    if (isDialog && submitCallbackRef.current) {
      submitCallbackRef.current(handleSubmit(onSubmit));
    }
  }, [isDialog]); // Only run when dialog opens

  // Notify parent about submitting state changes
  const submittingChangeRef = useRef(onSubmittingChange);
  submittingChangeRef.current = onSubmittingChange;

  useEffect(() => {
    if (isDialog && submittingChangeRef.current) {
      submittingChangeRef.current(isSubmitting);
    }
  }, [isDialog, isSubmitting]);

  // Show loading state while fetching
  if (isFetching) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Show error if fetch failed
  const error = fetchError || submitError;

  const formContent = (
    <>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error instanceof Error ? error.message : error}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ mt: isDialog ? 3 : 0 }}>
        <Box sx={{ mb: 2 }}>
          <FormField
            name="firstName"
            control={control}
            label={t('employees.firstName')}
            type="text"
            required
            disabled={isSubmitting}
          />
        </Box>

        <Box sx={{ mb: 2 }}>
          <FormField
            name="lastName"
            control={control}
            label={t('employees.lastName')}
            type="text"
            required
            disabled={isSubmitting}
          />
        </Box>

        <Box sx={{ mb: 2 }}>
          <FormField
            name="username"
            control={control}
            label={t('employees.username')}
            type="text"
            required
            disabled={isSubmitting || isEditMode}
          />
        </Box>

        {isEditMode && (
          <Box sx={{ mb: 2 }}>
            <FormField
              name="changePassword"
              control={control}
              label={t('employees.changePassword')}
              type="switch"
              disabled={isSubmitting}
            />
          </Box>
        )}

        {(!isEditMode || watch('changePassword')) && (
          <Box sx={{ mb: 2 }}>
            <FormField
              name="password"
              control={control}
              label={t('employees.password')}
              type="password"
              required={!isEditMode || watch('changePassword')}
              disabled={isSubmitting}
            />
          </Box>
        )}

        <Box sx={{ mt: 2, mb: 2 }}>
          <FormField
            name="isBlocked"
            control={control}
            label={t('employees.blocked')}
            type="switch"
            disabled={isSubmitting}
          />
        </Box>

        {!isDialog && (
          <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={isSubmitting}
              loading={isSubmitting}
            >
              {t('common.save')}
            </Button>
            <Button
              variant="outlined"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              {t('common.cancel')}
            </Button>
          </Box>
        )}
      </Box>
    </>
  );

  if (isDialog) {
    return <>{formContent}</>;
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        {isEditMode ? t('employees.editing') : t('employees.creating')}
      </Typography>

      <Paper sx={{ p: 3, mt: 3, maxWidth: 600 }}>
        {formContent}
      </Paper>
    </Box>
  );
};
