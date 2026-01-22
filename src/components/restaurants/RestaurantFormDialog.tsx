import { useState, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogTitle, DialogContent, IconButton, Box } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { RestaurantFormPage } from '../../pages/restaurants/RestaurantFormPage';
import Button from '../ui/atoms/Button';

interface RestaurantFormDialogProps {
  open: boolean;
  onClose: () => void;
  restaurantId?: string;
}

export const RestaurantFormDialog = ({ open, onClose, restaurantId }: RestaurantFormDialogProps) => {
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
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          height: '90vh',
          maxHeight: '90vh',
          borderRadius: 3,
          display: 'flex',
          flexDirection: 'column',
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
          flexShrink: 0,
        }}
      >
        <Box component="span" sx={{ fontWeight: 600, fontSize: '1.25rem' }}>
          {restaurantId ? t('restaurants.edit') : t('restaurants.new')}
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
          pt: 3,
          pb: 0,
          flexGrow: 1,
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Box sx={{ flexGrow: 1, overflow: 'auto', pb: 2 }}>
          <RestaurantFormPage
            onClose={onClose}
            restaurantId={restaurantId}
            isDialog
            onSubmitCallback={handleSubmitCallback}
            onSubmittingChange={handleSubmittingChange}
          />
        </Box>
        <Box
          sx={{
            flexShrink: 0,
            px: 3,
            py: 2,
            borderTop: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 2,
            position: 'sticky',
            bottom: 0,
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
