import { useEffect, useCallback, useRef, useMemo, forwardRef, useImperativeHandle } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, type FieldErrors } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { Box, Paper, Typography, CircularProgress } from '@mui/material';
import { employeesApi } from '../../api/endpoints';
import { FormField } from '../../components/ui/molecules';
import { Button } from '../../components/ui/atoms';
import { useFormSubmit, useFetch } from '../../hooks';
import { logger } from '../../utils/logger';
import { scrollToFirstError } from '../../utils/scrollToFirstError';
import { useAppSnackbar } from '../../providers/AppSnackbarProvider';
import type { EmployeeFormData, Employee } from '../../types';

const createEmployeeSchema = (t: (key: string) => string) => z.object({
  firstName: z.string().min(1, t('validation.firstNameRequired')),
  lastName: z.string().min(1, t('validation.lastNameRequired')),
  username: z.string().min(3, t('validation.usernameMinLength')),
  password: z.string().optional(),
  changePassword: z.boolean().optional(),
  isBlocked: z.boolean(),
}).superRefine((data, ctx) => {
  // Password is required when creating a new employee or when changePassword is true
  if (data.changePassword) {
    if (!data.password || data.password.length < 6) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: t('validation.passwordMinLength'),
        path: ['password'],
      });
    } else {
      const hasLetter = /[a-zA-Z]/.test(data.password);
      const hasNumber = /[0-9]/.test(data.password);
      if (!hasLetter || !hasNumber) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t('validation.passwordComplexity'),
          path: ['password'],
        });
      }
    }
  }
});

type EmployeeFormValues = z.infer<ReturnType<typeof createEmployeeSchema>>;

export interface EmployeeFormHandle {
  submit: () => void;
}

interface EmployeeFormPageProps {
  onClose?: () => void;
  employeeId?: string;
  isDialog?: boolean;
  onSubmittingChange?: (isSubmitting: boolean) => void;
}

export const EmployeeFormPage = forwardRef<EmployeeFormHandle, EmployeeFormPageProps>(function EmployeeFormPage(
  { onClose, employeeId, isDialog = false, onSubmittingChange },
  ref
) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id: routeId } = useParams<{ id: string }>();
  const id = employeeId || routeId;
  const isEditMode = !!id;

  const hashRef = useRef<string | undefined>(undefined);

  const employeeSchema = useMemo(() => createEmployeeSchema(t), [t]);

  const {
    control,
    handleSubmit,
    reset,
    watch,
  } = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeSchema),
    mode: 'onBlur',
    defaultValues: {
      firstName: '',
      lastName: '',
      username: '',
      password: '',
      changePassword: !isEditMode,
      isBlocked: false,
    },
  });

  const {
    data: employeeData,
    loading: isFetching,
    error: fetchError,
  } = useFetch<(Employee & { hash?: string }) | null>(
    async () => {
      if (isEditMode && id) {
        const data = await employeesApi.getById(id);
        logger.debug('Fetched employee data', { data });
        return data;
      }
      return null;
    },
    [id, isEditMode]
  );

  useEffect(() => {
    if (employeeData) {
      logger.debug('Loading employee data with hash', { hash: employeeData.hash });
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

  const { showError } = useAppSnackbar();
  const { isSubmitting, handleSubmit: handleFormSubmit } =
    useFormSubmit<EmployeeFormValues>({ onError: showError });

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

          if (!isEditMode) {
            employeePayload.username = formData.username;
          }

          if (isEditMode && hashRef.current) {
            employeePayload.hash = hashRef.current;
          } else if (isEditMode) {
            logger.warn('No hash available for PUT request!');
          }

          logger.debug('Employee PUT payload', { employeePayload });

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

  const handleCancel = useCallback(() => {
    if (onClose) {
      onClose();
    } else {
      navigate('/employees');
    }
  }, [navigate, onClose]);

  const onInvalid = useCallback((errors: FieldErrors<EmployeeFormValues>) => {
    scrollToFirstError(errors);
  }, []);

  useImperativeHandle(ref, () => ({
    submit: () => {
      handleSubmit(onSubmit, onInvalid)();
    },
  }), [handleSubmit, onSubmit, onInvalid]);

  const submittingChangeRef = useRef(onSubmittingChange);
  submittingChangeRef.current = onSubmittingChange;
  useEffect(() => {
    if (isDialog && submittingChangeRef.current) {
      submittingChangeRef.current(isSubmitting);
    }
  }, [isDialog, isSubmitting]);

  useEffect(() => {
    if (fetchError) showError(fetchError.message);
  }, [fetchError, showError]);

  if (isFetching) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  const formContent = (
    <>
      <Box component="form" onSubmit={handleSubmit(onSubmit, onInvalid)} noValidate autoComplete="off" sx={{ mt: isDialog ? 3 : 0 }}>
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
              autoComplete="new-password"
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
});
