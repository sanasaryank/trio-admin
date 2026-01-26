import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  Typography,
  Paper,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { Button } from '../ui/atoms';
import { SearchField } from '../ui/molecules';
import { RestaurantInfoPopover } from './RestaurantInfoPopover';
import { SlotScheduleCell } from './SlotScheduleCell';
import { AddRestaurantsModal } from './AddRestaurantsModal';
import type {
  Restaurant,
  DictionaryItem,
  CampaignTarget,
  Schedule,
  Placement,
} from '../../types';

interface TargetingTabProps {
  targets: CampaignTarget[];
  onChange: (targets: CampaignTarget[]) => void;
  restaurants: Restaurant[];
  cities: DictionaryItem[];
  districts: DictionaryItem[];
  restaurantTypes: DictionaryItem[];
  menuTypes: DictionaryItem[];
  priceSegments: DictionaryItem[];
  placements: Placement[];
  schedules: Schedule[];
  campaignTargetingRules?: {
    locationsMode: 'allowed' | 'denied';
    locations: number[];
    restaurantTypesMode: 'allowed' | 'denied';
    restaurantTypes: number[];
    menuTypesMode: 'allowed' | 'denied';
    menuTypes: number[];
  };
}

export const TargetingTab = ({
  targets,
  onChange,
  restaurants,
  cities,
  districts,
  restaurantTypes,
  menuTypes,
  priceSegments,
  placements,
  schedules,
  campaignTargetingRules,
}: TargetingTabProps) => {
  const { t } = useTranslation();
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const targetedRestaurantIds = targets.map((t) => t.id);
  const targetedRestaurants = restaurants.filter((r) => targetedRestaurantIds.includes(r.id));

  const filteredRestaurants = useMemo(() => {
    if (!searchTerm) return targetedRestaurants;
    return targetedRestaurants.filter((r) =>
      r.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [targetedRestaurants, searchTerm]);

  const handleToggleRestaurant = (restaurantId: number) => {
    const isTargeted = targetedRestaurantIds.includes(restaurantId);
    if (isTargeted) {
      // Remove restaurant from targets
      onChange(targets.filter((t) => t.id !== restaurantId));
    } else {
      // Add restaurant to targets with no slots enabled
      onChange([...targets, { id: restaurantId, slots: [] }]);
    }
  };

  const handleToggleSlot = (restaurantId: number, slotId: number, enabled: boolean) => {
    const newTargets = [...targets];
    const targetIndex = newTargets.findIndex((t) => t.id === restaurantId);

    if (targetIndex === -1) {
      // Auto-select restaurant if not already targeted
      newTargets.push({
        id: restaurantId,
        slots: enabled ? [{ id: slotId, schedules: [] }] : [],
      });
    } else {
      const target = newTargets[targetIndex];
      const slotIndex = target.slots.findIndex((s) => s.id === slotId);

      if (enabled) {
        if (slotIndex === -1) {
          // Add slot
          target.slots.push({ id: slotId, schedules: [] });
        }
      } else {
        if (slotIndex !== -1) {
          // Remove slot (and its schedules)
          target.slots.splice(slotIndex, 1);
        }
      }
    }

    onChange(newTargets);
  };

  const handleSchedulesChange = (
    restaurantId: number,
    slotId: number,
    scheduleIds: number[]
  ) => {
    const newTargets = [...targets];
    const target = newTargets.find((t) => t.id === restaurantId);

    if (target) {
      const slot = target.slots.find((s) => s.id === slotId);
      if (slot) {
        slot.schedules = scheduleIds;
        onChange(newTargets);
      }
    }
  };

  const handleAddRestaurants = (restaurantIds: number[]) => {
    const newTargets = [...targets];
    restaurantIds.forEach((id) => {
      if (!targetedRestaurantIds.includes(id)) {
        newTargets.push({ id, slots: [] });
      }
    });
    onChange(newTargets);
  };

  const getSlotInfo = (restaurantId: number, slotId: number) => {
    const target = targets.find((t) => t.id === restaurantId);
    if (!target) return { enabled: false, schedules: [] };

    const slot = target.slots.find((s) => s.id === slotId);
    return {
      enabled: !!slot,
      schedules: slot?.schedules || [],
    };
  };

  const handleToggleAll = () => {
    const allSelected = filteredRestaurants.every((r) => targetedRestaurantIds.includes(r.id));
    if (allSelected) {
      // Deselect all filtered restaurants
      const remainingIds = filteredRestaurants.map((r) => r.id);
      onChange(targets.filter((t) => !remainingIds.includes(t.id)));
    } else {
      // Select all filtered restaurants
      const newTargets = [...targets];
      filteredRestaurants.forEach((restaurant) => {
        if (!targetedRestaurantIds.includes(restaurant.id)) {
          newTargets.push({ id: restaurant.id, slots: [] });
        }
      });
      onChange(newTargets);
    }
  };

  const allSelected = filteredRestaurants.length > 0 && filteredRestaurants.every((r) => targetedRestaurantIds.includes(r.id));
  const someSelected = filteredRestaurants.some((r) => targetedRestaurantIds.includes(r.id)) && !allSelected;

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <Box sx={{ flexGrow: 1 }}>
          <SearchField
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder={t('campaigns.targeting.searchRestaurants')}
          />
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setAddModalOpen(true)}
        >
          {t('common.add')}
        </Button>
      </Box>

      {filteredRestaurants.length > 0 ? (
        <TableContainer component={Paper} sx={{ flexGrow: 1, overflow: 'auto' }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={allSelected}
                    indeterminate={someSelected}
                    onChange={handleToggleAll}
                  />
                </TableCell>
                <TableCell>{t('restaurants.fields.name')}</TableCell>
                {placements.map((placement) => (
                  <TableCell key={placement.id} align="center">
                    {placement.name}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredRestaurants.map((restaurant) => {
                const isTargeted = targetedRestaurantIds.includes(restaurant.id);
                return (
                  <TableRow key={restaurant.id} hover>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={isTargeted}
                        onChange={() => handleToggleRestaurant(restaurant.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography>{restaurant.name}</Typography>
                        <RestaurantInfoPopover
                          restaurant={restaurant}
                          cities={cities}
                          districts={districts}
                          restaurantTypes={restaurantTypes}
                          menuTypes={menuTypes}
                          priceSegments={priceSegments}
                        />
                      </Box>
                    </TableCell>
                    {placements.map((placement) => {
                      const slotInfo = getSlotInfo(restaurant.id, placement.id);
                      return (
                        <TableCell key={placement.id} align="center">
                          <SlotScheduleCell
                            restaurantId={restaurant.id}
                            slotId={placement.id}
                            enabled={slotInfo.enabled}
                            selectedSchedules={slotInfo.schedules}
                            schedules={schedules}
                            onToggle={handleToggleSlot}
                            onSchedulesChange={handleSchedulesChange}
                            disabled={!isTargeted}
                          />
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Box
          sx={{
            flexGrow: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography color="text.secondary">
            {targetedRestaurants.length === 0
              ? t('campaigns.targeting.noRestaurantsAdded')
              : t('campaigns.targeting.noRestaurantsFound')}
          </Typography>
        </Box>
      )}

      <AddRestaurantsModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onAdd={handleAddRestaurants}
        restaurants={restaurants}
        districts={districts}
        restaurantTypes={restaurantTypes}
        menuTypes={menuTypes}
        excludeIds={targetedRestaurantIds}
        defaultFilters={campaignTargetingRules}
      />
    </Box>
  );
};
