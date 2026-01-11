import { Box, Typography, Stack, Button, Divider } from '@mui/material';

interface FilterPanelProps {
  children?: React.ReactNode;
  onApply?: () => void;
  onReset?: () => void;
}

/**
 * Right panel for filters
 */
export const FilterPanel = ({ children, onApply, onReset }: FilterPanelProps) => {
  return (
    <Box sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h6" gutterBottom>
        Фильтры
      </Typography>
      <Divider sx={{ mb: 2 }} />
      
      <Stack spacing={2} sx={{ flex: 1 }}>
        {children}
      </Stack>

      {(onApply || onReset) && (
        <Stack spacing={1} sx={{ mt: 2 }}>
          {onApply && (
            <Button variant="contained" fullWidth onClick={onApply}>
              Применить
            </Button>
          )}
          {onReset && (
            <Button variant="outlined" fullWidth onClick={onReset}>
              Сбросить
            </Button>
          )}
        </Stack>
      )}
    </Box>
  );
};
