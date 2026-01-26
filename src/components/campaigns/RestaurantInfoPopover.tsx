import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  IconButton,
  Popover,
  Box,
  Typography,
  Stack,
  Chip,
} from '@mui/material';
import { Info as InfoIcon } from '@mui/icons-material';
import type { Restaurant, DictionaryItem } from '../../types';

interface RestaurantInfoPopoverProps {
  restaurant: Restaurant;
  cities: DictionaryItem[];
  districts: DictionaryItem[];
  restaurantTypes: DictionaryItem[];
  menuTypes: DictionaryItem[];
  priceSegments: DictionaryItem[];
}

export const RestaurantInfoPopover = ({
  restaurant,
  cities,
  districts,
  restaurantTypes,
  menuTypes,
  priceSegments,
}: RestaurantInfoPopoverProps) => {
  const { t } = useTranslation();
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  const getItemName = (items: DictionaryItem[], id: number) => {
    return items.find((item) => item.id === id)?.name || '-';
  };

  const getItemNames = (items: DictionaryItem[], ids: number | number[]) => {
    const idArray = Array.isArray(ids) ? ids : [ids];
    return idArray.map((id) => getItemName(items, id));
  };

  return (
    <>
      <IconButton size="small" onClick={handleClick} aria-label={t('common.info')}>
        <InfoIcon fontSize="small" />
      </IconButton>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        <Box sx={{ p: 2, minWidth: 300, maxWidth: 400 }}>
          <Typography variant="h6" gutterBottom>
            {restaurant.name}
          </Typography>
          <Stack spacing={1.5}>
            <Box>
              <Typography variant="caption" color="text.secondary">
                {t('restaurants.fields.city')}
              </Typography>
              <Typography variant="body2">
                {getItemName(cities, restaurant.cityId)}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                {t('restaurants.fields.district')}
              </Typography>
              <Typography variant="body2">
                {getItemName(districts, restaurant.districtId)}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                {t('restaurants.fields.types')}
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                {getItemNames(restaurantTypes, restaurant.typeId).map((name, idx) => (
                  <Chip key={idx} label={name} size="small" />
                ))}
              </Box>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                {t('restaurants.fields.menuTypes')}
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                {getItemNames(menuTypes, restaurant.menuTypeId).map((name, idx) => (
                  <Chip key={idx} label={name} size="small" />
                ))}
              </Box>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                {t('restaurants.fields.priceSegment')}
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                {getItemNames(priceSegments, restaurant.priceSegmentId).map((name, idx) => (
                  <Chip key={idx} label={name} size="small" />
                ))}
              </Box>
            </Box>
          </Stack>
        </Box>
      </Popover>
    </>
  );
};
