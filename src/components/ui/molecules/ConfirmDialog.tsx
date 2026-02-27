import React from 'react';
import { DialogContentText, Box } from '@mui/material';
import Button from '../atoms/Button';
import { FormDialogLayout } from './FormDialogLayout';

export interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  confirmColor?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = React.memo(({
  open,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Подтвердить',
  cancelText = 'Отмена',
  confirmColor = 'primary',
}) => {
  const footer = (
    <>
      <Button onClick={onCancel} variant="outlined" color="secondary">
        {cancelText}
      </Button>
      <Button onClick={onConfirm} variant="contained" color={confirmColor}>
        {confirmText}
      </Button>
    </>
  );

  return (
    <FormDialogLayout
      open={open}
      onClose={onCancel}
      title={<Box component="span" sx={{ fontWeight: 600, fontSize: '1.25rem' }}>{title}</Box>}
      footer={footer}
      maxWidth="xs"
      fullWidth
      paperSx={{ height: 'auto', maxHeight: '90vh' }}
      aria-labelledby="confirm-dialog-title"
    >
      <DialogContentText id="confirm-dialog-description" component="div">
        {message}
      </DialogContentText>
    </FormDialogLayout>
  );
});

ConfirmDialog.displayName = 'ConfirmDialog';

export default ConfirmDialog;
