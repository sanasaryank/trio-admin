import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Box } from '@mui/material';
import { RestaurantFormPage, type RestaurantFormHandle } from '../../pages/restaurants/RestaurantFormPage';
import Button from '../ui/atoms/Button';
import { FormDialogLayout } from '../ui/molecules/FormDialogLayout';

interface RestaurantFormDialogProps {
  open: boolean;
  onClose: () => void;
  restaurantId?: string;
  formRef: React.RefObject<RestaurantFormHandle | null>;
  isSubmitting: boolean;
  onSubmittingChange: (submitting: boolean) => void;
}

export const RestaurantFormDialog = ({
  open,
  onClose,
  restaurantId,
  formRef,
  isSubmitting,
  onSubmittingChange,
}: RestaurantFormDialogProps) => {
  const { t } = useTranslation();

  const handleCancel = useCallback(() => {
    onClose();
  }, [onClose]);

  const handleSave = useCallback(() => {
    formRef.current?.submit();
  }, [formRef]);

  const title = (
    <Box component="span" sx={{ fontWeight: 600, fontSize: '1.25rem' }}>
      {restaurantId ? t('restaurants.edit') : t('restaurants.new')}
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
      maxWidth="md"
      fullWidth
      disableClose={isSubmitting}
      aria-labelledby="restaurant-form-dialog-title"
    >
      <RestaurantFormPage
        ref={formRef}
        onClose={onClose}
        restaurantId={restaurantId}
        isDialog
        onSubmittingChange={onSubmittingChange}
      />
    </FormDialogLayout>
  );
};
