import { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Stack,
  Typography,
  Checkbox,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { Button } from '../ui/atoms';
import { SearchField } from '../ui/molecules';
import { SlotScheduleCell } from '../campaigns/SlotScheduleCell';
import { Select } from '../ui/atoms';
import type { Campaign, Placement, Schedule, Advertiser } from '../../types';

interface RestaurantCampaignsModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (campaignTargets: { campaignId: number; slots: { id: number; schedules: number[] }[] }[]) => void;
  restaurantId: number;
  restaurantName: string;
  campaigns: Campaign[];
  placements: Placement[];
  schedules: Schedule[];
  advertisers: Advertiser[];
}

interface CampaignTargetingState {
  [campaignId: number]: {
    targeted: boolean;
    slots: { id: number; schedules: number[] }[];
  };
}

export const RestaurantCampaignsModal = ({
  open,
  onClose,
  onSave,
  restaurantId,
  restaurantName,
  campaigns,
  placements,
  schedules,
  advertisers,
}: RestaurantCampaignsModalProps) => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAdvertiserId, setFilterAdvertiserId] = useState<number | ''>('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'blocked'>('all');

  // Initialize state from existing campaign targets
  const [targetingState, setTargetingState] = useState<CampaignTargetingState>(() => {
    const state: CampaignTargetingState = {};
    campaigns.forEach((campaign) => {
      const existingTarget = campaign.targets?.find((t) => t.id === restaurantId);
      state[campaign.id] = {
        targeted: !!existingTarget,
        slots: existingTarget?.slots || [],
      };
    });
    return state;
  });

  // Update state when campaigns change (e.g., when loaded asynchronously)
  useEffect(() => {
    if (campaigns.length > 0) {
      setTargetingState((prev) => {
        const newState: CampaignTargetingState = {};
        campaigns.forEach((campaign) => {
          // Keep existing state if available, otherwise initialize from campaign targets
          if (prev[campaign.id]) {
            newState[campaign.id] = prev[campaign.id];
          } else {
            const existingTarget = campaign.targets?.find((t) => t.id === restaurantId);
            newState[campaign.id] = {
              targeted: !!existingTarget,
              slots: existingTarget?.slots || [],
            };
          }
        });
        return newState;
      });
    }
  }, [campaigns, restaurantId]);

  const filteredCampaigns = useMemo(() => {
    return campaigns.filter((c) => {
      // Search filter
      if (searchTerm && !c.name.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      // Advertiser filter
      if (filterAdvertiserId && c.advertiserId !== filterAdvertiserId) {
        return false;
      }
      // Status filter
      if (filterStatus === 'active' && c.blocked) {
        return false;
      }
      if (filterStatus === 'blocked' && !c.blocked) {
        return false;
      }
      return true;
    });
  }, [campaigns, searchTerm, filterAdvertiserId, filterStatus]);

  const handleToggleCampaign = (campaignId: number) => {
    setTargetingState((prev) => {
      const current = prev[campaignId] || { targeted: false, slots: [] };
      return {
        ...prev,
        [campaignId]: {
          ...current,
          targeted: !current.targeted,
          slots: current.targeted ? [] : current.slots,
        },
      };
    });
  };

  const handleToggleSlot = (campaignId: number, slotId: number, enabled: boolean) => {
    setTargetingState((prev) => {
      const campaign = prev[campaignId] || { targeted: false, slots: [] };
      const slots = [...campaign.slots];
      const slotIndex = slots.findIndex((s) => s.id === slotId);

      if (enabled) {
        if (slotIndex === -1) {
          slots.push({ id: slotId, schedules: [] });
        }
      } else {
        if (slotIndex !== -1) {
          slots.splice(slotIndex, 1);
        }
      }

      return {
        ...prev,
        [campaignId]: {
          ...campaign,
          targeted: true, // Auto-target campaign when enabling a slot
          slots,
        },
      };
    });
  };

  const handleSchedulesChange = (
    campaignId: number,
    slotId: number,
    scheduleIds: number[]
  ) => {
    setTargetingState((prev) => {
      const campaign = prev[campaignId] || { targeted: false, slots: [] };
      const slots = [...campaign.slots];
      const slot = slots.find((s) => s.id === slotId);

      if (slot) {
        slot.schedules = scheduleIds;
      }

      return {
        ...prev,
        [campaignId]: {
          ...campaign,
          slots,
        },
      };
    });
  };

  const getSlotInfo = (campaignId: number, slotId: number) => {
    const campaign = targetingState[campaignId];
    if (!campaign) return { enabled: false, schedules: [] };

    const slot = campaign.slots.find((s) => s.id === slotId);
    return {
      enabled: !!slot,
      schedules: slot?.schedules || [],
    };
  };

  const getAdvertiserName = (advertiserId: number) => {
    const advertiser = advertisers.find((a) => a.id === advertiserId);
    return advertiser?.name || `ID: ${advertiserId}`;
  };

  const handleSave = () => {
    const campaignTargets = Object.entries(targetingState)
      .filter(([_, state]) => state.targeted)
      .map(([campaignId, state]) => ({
        campaignId: Number(campaignId),
        slots: state.slots,
      }));
    onSave(campaignTargets);
  };

  const handleClose = () => {
    // Reset state on close
    setSearchTerm('');
    setFilterAdvertiserId('');
    setFilterStatus('all');
    const state: CampaignTargetingState = {};
    campaigns.forEach((campaign) => {
      const existingTarget = campaign.targets?.find((t) => t.id === restaurantId);
      state[campaign.id] = {
        targeted: !!existingTarget,
        slots: existingTarget?.slots || [],
      };
    });
    setTargetingState(state);
    onClose();
  };

  const handleToggleAll = () => {
    const allTargeted = filteredCampaigns.every((c) => targetingState[c.id]?.targeted);
    const newState = { ...targetingState };
    
    filteredCampaigns.forEach((campaign) => {
      newState[campaign.id] = {
        ...newState[campaign.id],
        targeted: !allTargeted,
        slots: !allTargeted ? newState[campaign.id].slots : [],
      };
    });
    
    setTargetingState(newState);
  };

  const allSelected = filteredCampaigns.length > 0 && filteredCampaigns.every((c) => targetingState[c.id]?.targeted);
  const someSelected = filteredCampaigns.some((c) => targetingState[c.id]?.targeted) && !allSelected;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6">
            {t('restaurants.campaignTargeting')} - {restaurantName}
          </Typography>
          <IconButton size="small" onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2}>
          <SearchField
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder={t('campaigns.searchPlaceholder')}
          />

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Box sx={{ minWidth: 200 }}>
              <Select
                name="advertiser"
                label={t('campaigns.fields.advertiser')}
                value={filterAdvertiserId}
                onChange={(value) => setFilterAdvertiserId(value as number | '')}
                options={[
                  { value: '', label: t('common.all') },
                  ...advertisers.map((a) => ({ value: a.id, label: a.name })),
                ]}
              />
            </Box>
            <Box sx={{ minWidth: 150 }}>
              <Select
                name="status"
                label={t('common.status')}
                value={filterStatus}
                onChange={(value) => setFilterStatus(value as 'all' | 'active' | 'blocked')}
                options={[
                  { value: 'all', label: t('common.all') },
                  { value: 'active', label: t('common.active') },
                  { value: 'blocked', label: t('common.blocked') },
                ]}
              />
            </Box>
          </Box>

          {filteredCampaigns.length > 0 ? (
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={allSelected}
                        indeterminate={someSelected}
                        onChange={handleToggleAll}
                      />
                    </TableCell>
                    <TableCell>{t('campaigns.fields.name')}</TableCell>
                    <TableCell>{t('campaigns.fields.advertiser')}</TableCell>
                    <TableCell>{t('common.status')}</TableCell>
                    {placements.map((placement) => (
                      <TableCell key={placement.id} align="center">
                        {placement.name}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredCampaigns.map((campaign) => {
                    const isTargeted = targetingState[campaign.id]?.targeted;
                    return (
                      <TableRow key={campaign.id} hover>
                        <TableCell padding="checkbox">
                          <Checkbox
                            checked={isTargeted}
                            onChange={() => handleToggleCampaign(campaign.id)}
                          />
                        </TableCell>
                        <TableCell>{campaign.name}</TableCell>
                        <TableCell>{getAdvertiserName(campaign.advertiserId)}</TableCell>
                        <TableCell>
                          <Chip
                            label={campaign.blocked ? t('status.blocked') : t('status.active')}
                            color={campaign.blocked ? 'error' : 'success'}
                            size="small"
                          />
                        </TableCell>
                        {placements.map((placement) => {
                          const slotInfo = getSlotInfo(campaign.id, placement.id);
                          return (
                            <TableCell key={placement.id} align="center">
                              <SlotScheduleCell
                                restaurantId={restaurantId}
                                slotId={placement.id}
                                enabled={slotInfo.enabled}
                                selectedSchedules={slotInfo.schedules}
                                schedules={schedules}
                                onToggle={(_, slotId, enabled) =>
                                  handleToggleSlot(campaign.id, slotId, enabled)
                                }
                                onSchedulesChange={(_, slotId, scheduleIds) =>
                                  handleSchedulesChange(campaign.id, slotId, scheduleIds)
                                }
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
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                py: 4,
              }}
            >
              <Typography color="text.secondary">
                {t('campaigns.noCampaignsFound')}
              </Typography>
            </Box>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>{t('common.cancel')}</Button>
        <Button onClick={handleSave} variant="contained">
          {t('common.save')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
