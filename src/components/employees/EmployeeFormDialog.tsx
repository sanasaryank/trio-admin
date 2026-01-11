import { useState, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogTitle, DialogContent, IconButton, Box } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { EmployeeFormPage } from '../../pages/employees/EmployeeFormPage';
import Button from '../ui/atoms/Button';

interface EmployeeFormDialogProps {
  open: boolean;
  onClose: () => void;
  employeeId?: number;
}

export const EmployeeFormDialog = ({ open, onClose, employeeId }: EmployeeFormDialogProps) => {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submitHandlerRef = useRef<(() => void) | null>(null);

  const handleSubmitCallback = useCallback((handler: () => void) => {
    submitHandlerRef.current = handler;
  }, []);

  const handleSubmit = useCallback(() => {
    if (submitHandlerRef.current) {
      submitHandlerRef.current();
    }
  }, []);

  const handleCancel = useCallback(() => {
    onClose();
  }, [onClose]);

  const handleSubmittingChange = useCallback((submitting: boolean) => {
    setIsSubmitting(submitting);
  }, []);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pb: 2,
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Box component="span" sx={{ fontWeight: 600, fontSize: '1.25rem' }}>
          {employeeId ? t('employees.edit') : t('employees.new')}
        </Box>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            color: 'text.secondary',
            '&:hover': {
              bgcolor: 'action.hover',
            },
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent
        sx={{
          pt: 0,
          pb: 3,
        }}
      >
        <EmployeeFormPage
          onClose={onClose}
          employeeId={employeeId}
          isDialog
          onSubmitCallback={handleSubmitCallback}
          onSubmittingChange={handleSubmittingChange}
        />
        <Box
          sx={{
            mt: 3,
            pt: 2,
            borderTop: '1px solid',
            borderColor: 'divider',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 2,
          }}
        >
          <Button
            variant="outlined"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            {t('common.cancel')}
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            loading={isSubmitting}
          >
            {t('common.save')}
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};
