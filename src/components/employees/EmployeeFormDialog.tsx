import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Box } from '@mui/material';
import { EmployeeFormPage, type EmployeeFormHandle } from '../../pages/employees/EmployeeFormPage';
import Button from '../ui/atoms/Button';
import { FormDialogLayout } from '../ui/molecules/FormDialogLayout';

interface EmployeeFormDialogProps {
  open: boolean;
  onClose: () => void;
  employeeId?: string;
  formRef: React.RefObject<EmployeeFormHandle | null>;
  isSubmitting: boolean;
  onSubmittingChange: (submitting: boolean) => void;
}

export const EmployeeFormDialog = ({
  open,
  onClose,
  employeeId,
  formRef,
  isSubmitting,
  onSubmittingChange,
}: EmployeeFormDialogProps) => {
  const { t } = useTranslation();

  const handleCancel = useCallback(() => {
    onClose();
  }, [onClose]);

  const handleSave = useCallback(() => {
    formRef.current?.submit();
  }, [formRef]);

  const title = (
    <Box component="span" sx={{ fontWeight: 600, fontSize: '1.25rem' }}>
      {employeeId ? t('employees.edit') : t('employees.new')}
    </Box>
  );

  const footer = (
    <>
      <Button variant="outlined" onClick={handleCancel} disabled={isSubmitting}>
        {t('common.cancel')}
      </Button>
      <Button variant="contained" color="primary" onClick={handleSave} loading={isSubmitting}>
        {t('common.save')}
      </Button>
    </>
  );

  return (
    <FormDialogLayout
      open={open}
      onClose={onClose}
      title={title}
      footer={footer}
      maxWidth="sm"
      fullWidth
      disableClose={isSubmitting}
      paperSx={{ height: 'auto', maxHeight: '90vh' }}
      aria-labelledby="employee-form-dialog-title"
    >
      <EmployeeFormPage
        ref={formRef}
        onClose={onClose}
        employeeId={employeeId}
        isDialog
        onSubmittingChange={onSubmittingChange}
      />
    </FormDialogLayout>
  );
};
