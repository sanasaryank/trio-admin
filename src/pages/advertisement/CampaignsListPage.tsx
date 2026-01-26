import { useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Stack, Typography, Tabs, Tab } from '@mui/material';
import { Add as AddIcon, FilterList as FilterListIcon, Edit as EditIcon } from '@mui/icons-material';
import { DataTable, SearchField, Pagination, ConfirmDialog, FilterDrawer } from '../../components/ui/molecules';
import type { Column } from '../../components/ui/molecules/DataTable';
import { Button, IconButton, Switch, Select } from '../../components/ui/atoms';
import { useTableState, useDebounce, useConfirmDialog, useDrawer, useFilters } from '../../hooks';
import { useSnackbar } from 'notistack';
import { campaignsApi, advertisersApi, dictionariesApi, restaurantsApi, schedulesApi } from '../../api';
import type { Campaign, CampaignFormData, Advertiser, DictionaryItem, Restaurant, Schedule, CampaignTarget, Placement } from '../../types';
import { TargetingTab } from '../../components/campaigns/TargetingTab';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogTitle,
  DialogContent,
} from '@mui/material';
import { FormField } from '../../components/ui/molecules';
import { formatDate } from '../../utils/dateUtils';

const createCampaignSchema = (t: (key: string) => string) =>
  z.object({
    advertiserId: z.number().min(1, t('campaigns.validation.advertiserRequired')),
    name: z.string().min(1, t('campaigns.validation.nameRequired')),
    startDate: z.number().min(1, t('campaigns.validation.startDateRequired')),
    endDate: z.number().min(1, t('campaigns.validation.endDateRequired')),
    budget: z.number().min(0, t('campaigns.validation.budgetRequired')),
    budgetDaily: z.number().min(0, t('campaigns.validation.budgetDailyRequired')),
    price: z.number().min(0, t('campaigns.validation.priceRequired')),
    pricingModel: z.enum(['CPM', 'CPC', 'CPV', 'CPA']),
    spendStrategy: z.enum(['even', 'asap', 'frontload']),
    frequencyCapStrategy: z.enum(['soft', 'strict']),
    frequencyCap: z.object({
      per_user: z.object({
        impressions: z.object({
          count: z.number().min(0),
          window_sec: z.number().min(0),
        }),
        clicks: z.object({
          count: z.number().min(0),
          window_sec: z.number().min(0),
        }),
      }),
      per_session: z.object({
        impressions: z.object({
          count: z.number().min(0),
          window_sec: z.number().min(0),
        }),
        clicks: z.object({
          count: z.number().min(0),
          window_sec: z.number().min(0),
        }),
      }),
    }),
    priority: z.number().min(0),
    weight: z.number().min(0),
    overdeliveryRatio: z.number().min(0).max(100),
    locationsMode: z.enum(['allowed', 'denied']),
    locations: z.array(z.number()),
    restaurantTypesMode: z.enum(['allowed', 'denied']),
    restaurantTypes: z.array(z.number()),
    menuTypesMode: z.enum(['allowed', 'denied']),
    menuTypes: z.array(z.number()),
    placements: z.array(z.number()),
    targets: z.array(z.object({
      id: z.number(),
      slots: z.array(z.object({
        id: z.number(),
        schedules: z.array(z.number()),
      })),
    })),
    blocked: z.boolean(),
  });

type CampaignFormValues = z.infer<ReturnType<typeof createCampaignSchema>>;

export default function CampaignsListPage() {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const confirmDialog = useConfirmDialog();
  const filterDrawer = useDrawer();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [advertisers, setAdvertisers] = useState<Advertiser[]>([]);
  const [locations, setLocations] = useState<DictionaryItem[]>([]);
  const [restaurantTypes, setRestaurantTypes] = useState<DictionaryItem[]>([]);
  const [menuTypes, setMenuTypes] = useState<DictionaryItem[]>([]);
  const [placements, setPlacements] = useState<Placement[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [cities, setCities] = useState<DictionaryItem[]>([]);
  const [priceSegments, setPriceSegments] = useState<DictionaryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 300);
  
  const { filters, updateFilter, resetFilters } = useFilters<{
    status: string;
    advertiserId: number | string;
  }>({
    status: 'active',
    advertiserId: '',
  });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [activeTab, setActiveTab] = useState(0);

  const getAdvertiserName = (advertiserId: number) => {
    const advertiser = advertisers.find(a => a.id === advertiserId);
    return advertiser ? advertiser.name : '-';
  };

  const filteredCampaigns = campaigns.filter((campaign) => {
    // Search filter
    if (debouncedSearch) {
      const search = debouncedSearch.toLowerCase();
      const advertiserName = getAdvertiserName(campaign.advertiserId).toLowerCase();
      const matchesSearch = campaign.name.toLowerCase().includes(search) ||
        advertiserName.includes(search);
      if (!matchesSearch) return false;
    }
    
    // Status filter
    if (filters.status === 'active' && campaign.blocked) return false;
    if (filters.status === 'blocked' && !campaign.blocked) return false;
    
    // Advertiser filter
    if (filters.advertiserId && campaign.advertiserId !== Number(filters.advertiserId)) return false;
    
    return true;
  });

  const tableState = useTableState<Campaign>({
    data: filteredCampaigns,
    initialRowsPerPage: 10,
    defaultSortColumn: 'name' as keyof Campaign,
    defaultSortDirection: 'asc',
  });

  const schema = createCampaignSchema(t);
  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { isSubmitting },
  } = useForm<CampaignFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      advertiserId: 0,
      name: '',
      startDate: Math.floor(Date.now() / 1000),
      endDate: Math.floor(Date.now() / 1000),
      budget: 0,
      budgetDaily: 0,
      price: 0,
      pricingModel: 'CPM',
      spendStrategy: 'even',
      frequencyCapStrategy: 'soft',
      frequencyCap: {
        per_user: {
          impressions: { count: 3, window_sec: 3600 },
          clicks: { count: 1, window_sec: 3600 },
        },
        per_session: {
          impressions: { count: 1, window_sec: 900 },
          clicks: { count: 1, window_sec: 3600 },
        },
      },
      priority: 1,
      weight: 1,
      overdeliveryRatio: 0,
      locationsMode: 'denied',
      locations: [],
      restaurantTypesMode: 'denied',
      restaurantTypes: [],
      menuTypesMode: 'denied',
      menuTypes: [],
      placements: [],
      targets: [],
      blocked: false,
    },
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [
        campaignsData, 
        advertisersData, 
        locationsData, 
        typesData, 
        menuTypesData, 
        placementsData,
        restaurantsData,
        schedulesData,
        citiesData,
        priceSegmentsData
      ] = await Promise.all([
        campaignsApi.list(),
        advertisersApi.list(),
        dictionariesApi.list('districts'),
        dictionariesApi.list('restaurant-types'),
        dictionariesApi.list('menu-types'),
        dictionariesApi.list('placements'),
        restaurantsApi.list(),
        schedulesApi.list(),
        dictionariesApi.list('cities'),
        dictionariesApi.list('price-segments'),
      ]);
      setCampaigns(campaignsData);
      setAdvertisers(advertisersData);
      setLocations(locationsData);
      setRestaurantTypes(typesData);
      setMenuTypes(menuTypesData);
      setPlacements(placementsData as Placement[]);
      setRestaurants(restaurantsData);
      setSchedules(schedulesData);
      setCities(citiesData);
      setPriceSegments(priceSegmentsData);
    } catch (error) {
      enqueueSnackbar(t('common.error.loadFailed'), { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenDialog = (campaign?: Campaign) => {
    if (campaign) {
      setEditingCampaign(campaign);
      reset({
        advertiserId: campaign.advertiserId,
        name: campaign.name,
        startDate: campaign.startDate,
        endDate: campaign.endDate,
        budget: campaign.budget,
        budgetDaily: campaign.budgetDaily,
        price: campaign.price,
        pricingModel: campaign.pricingModel,
        spendStrategy: campaign.spendStrategy,
        frequencyCapStrategy: campaign.frequencyCapStrategy,
        frequencyCap: campaign.frequencyCap,
        priority: campaign.priority,
        weight: campaign.weight,
        overdeliveryRatio: campaign.overdeliveryRatio,
        locationsMode: campaign.locationsMode,
        locations: campaign.locations,
        restaurantTypesMode: campaign.restaurantTypesMode,
        restaurantTypes: campaign.restaurantTypes,
        menuTypesMode: campaign.menuTypesMode,
        menuTypes: campaign.menuTypes,
        placements: campaign.placements,
        targets: campaign.targets || [],
        blocked: campaign.blocked,
      });
    } else {
      setEditingCampaign(null);
      reset({
        advertiserId: 0,
        name: '',
        startDate: Math.floor(Date.now() / 1000),
        endDate: Math.floor(Date.now() / 1000),
        budget: 0,
        budgetDaily: 0,
        price: 0,
        pricingModel: 'CPM',
        spendStrategy: 'even',
        frequencyCapStrategy: 'soft',
        frequencyCap: {
          per_user: {
            impressions: { count: 3, window_sec: 3600 },
            clicks: { count: 1, window_sec: 3600 },
          },
          per_session: {
            impressions: { count: 1, window_sec: 900 },
            clicks: { count: 1, window_sec: 3600 },
          },
        },
        priority: 1,
        weight: 1,
        overdeliveryRatio: 0,
        locationsMode: 'denied',
        locations: [],
        restaurantTypesMode: 'denied',
        restaurantTypes: [],
        menuTypesMode: 'denied',
        menuTypes: [],
        placements: [],
        targets: [],
        blocked: false,
      });
    }
    setActiveTab(0);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingCampaign(null);
    setActiveTab(0);
    reset();
  };

  const handleFormSubmit = async (data: CampaignFormValues) => {
    try {
      const formData: CampaignFormData = {
        advertiserId: data.advertiserId,
        name: data.name,
        startDate: data.startDate,
        endDate: data.endDate,
        budget: data.budget,
        budgetDaily: data.budgetDaily,
        price: data.price,
        pricingModel: data.pricingModel,
        spendStrategy: data.spendStrategy,
        frequencyCapStrategy: data.frequencyCapStrategy,
        frequencyCap: data.frequencyCap,
        priority: data.priority,
        weight: data.weight,
        overdeliveryRatio: data.overdeliveryRatio,
        locationsMode: data.locationsMode,
        locations: data.locations.length === 0 ? locations.map(l => l.id) : data.locations,
        restaurantTypesMode: data.restaurantTypesMode,
        restaurantTypes: data.restaurantTypes.length === 0 ? restaurantTypes.map(t => t.id) : data.restaurantTypes,
        menuTypesMode: data.menuTypesMode,
        menuTypes: data.menuTypes.length === 0 ? menuTypes.map(m => m.id) : data.menuTypes,
        placements: data.placements.length === 0 ? placements.map(p => p.id) : data.placements,
        targets: data.targets,
        blocked: data.blocked,
      };

      if (editingCampaign) {
        await campaignsApi.update(editingCampaign.id, formData);
        enqueueSnackbar(t('common.success.updated'), { variant: 'success' });
      } else {
        await campaignsApi.create(formData);
        enqueueSnackbar(t('common.success.created'), { variant: 'success' });
      }

      handleCloseDialog();
      await loadData();
    } catch (error) {
      enqueueSnackbar(t('common.error.saveFailed'), { variant: 'error' });
    }
  };

  const handleBlock = useCallback((campaign: Campaign) => {
    const action = campaign.blocked ? 'unblock' : 'block';
    confirmDialog.open({
      title: t(`campaigns.confirm.${action}Title`),
      message: t(`campaigns.confirm.${action}Message`, { name: campaign.name }),
      confirmText: t('common.confirm'),
      cancelText: t('common.cancel'),
      onConfirm: async () => {
        try {
          await campaignsApi.block(campaign.id, !campaign.blocked);
          enqueueSnackbar(t(`common.success.${action}ed`), { variant: 'success' });
          await loadData();
        } catch (error) {
          enqueueSnackbar(t('common.error.saveFailed'), { variant: 'error' });
        }
      },
    });
  }, [t, confirmDialog, enqueueSnackbar]);

  const columns = useMemo<Column<Campaign>[]>(() => [
    {
      id: 'advertiser',
      label: t('campaigns.fields.advertiser'),
      sortable: true,
      render: (campaign) => getAdvertiserName(campaign.advertiserId),
    },
    {
      id: 'name',
      label: t('campaigns.fields.name'),
      sortable: true,
      render: (campaign) => campaign.name,
    },
    {
      id: 'startDate',
      label: t('campaigns.fields.startDate'),
      sortable: true,
      render: (campaign) => formatDate(campaign.startDate),
    },
    {
      id: 'endDate',
      label: t('campaigns.fields.endDate'),
      sortable: true,
      render: (campaign) => formatDate(campaign.endDate),
    },
    {
      id: 'budget',
      label: t('campaigns.fields.budget'),
      sortable: true,
      render: (campaign) => `$${campaign.budget.toLocaleString()}`,
    },
    {
      id: 'actions',
      label: t('common.actions'),
      sortable: false,
      align: 'right',
      render: (campaign) => (
        <Stack direction="row" spacing={1} justifyContent="flex-end">
          <IconButton
            icon={<EditIcon />}
            size="small"
            onClick={() => handleOpenDialog(campaign)}
            aria-label={t('common.edit')}
          />
          <Switch
            checked={!campaign.blocked}
            onChange={() => handleBlock(campaign)}
          />
        </Stack>
      ),
    },
  ], [t, advertisers, handleBlock, handleOpenDialog]);

  const advertiserOptions = advertisers.map(a => ({ value: a.id, label: a.name }));
  const locationOptions = locations.map(l => ({ value: l.id, label: l.name }));
  const typeOptions = restaurantTypes.map(t => ({ value: t.id, label: t.name }));
  const menuTypeOptions = menuTypes.map(m => ({ value: m.id, label: m.name }));
  const placementOptions = placements.map(p => ({ value: p.id, label: p.name }));

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">{t('campaigns.title')}</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<FilterListIcon />}
            onClick={filterDrawer.open}
          >
            {t('common.filters')}
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            {t('campaigns.addNew')}
          </Button>
        </Box>
      </Box>

      <Box sx={{ mb: 2 }}>
        <SearchField
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder={t('campaigns.search')}
        />
      </Box>

      <DataTable<Campaign>
        columns={columns}
        data={tableState.paginatedData}
        loading={loading}
        sortColumn={tableState.sortColumn ?? undefined}
        sortDirection={tableState.sortDirection}
        onSort={(column) => tableState.handleSort(column as keyof Campaign)}
        rowKey="id"
      />

      <Pagination
        page={tableState.page}
        totalPages={tableState.totalPages}
        onPageChange={tableState.handlePageChange}
        rowsPerPage={tableState.rowsPerPage}
        onRowsPerPageChange={tableState.handleRowsPerPageChange}
        rowsPerPageOptions={[5, 10, 25]}
        totalCount={filteredCampaigns.length}
      />

      <Dialog 
        open={dialogOpen} 
        onClose={handleCloseDialog} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            height: '90vh',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
          },
        }}
      >
        <DialogTitle sx={{ flexShrink: 0 }}>
          {editingCampaign ? t('campaigns.editTitle') : t('campaigns.addTitle')}
        </DialogTitle>
        
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          sx={{ borderBottom: 1, borderColor: 'divider', px: 3, flexShrink: 0 }}
        >
          <Tab label={t('campaigns.tabs.general')} />
          <Tab label={t('campaigns.tabs.pricing')} />
          <Tab label={t('campaigns.tabs.frequency')} />
          <Tab label={t('campaigns.tabs.targeting')} />
          <Tab label={t('campaigns.tabs.restaurantTargeting')} />
        </Tabs>
        
        <DialogContent
          sx={{
            pt: 3,
            pb: 0,
            flexGrow: 1,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Box component="form" onSubmit={handleSubmit(handleFormSubmit)} sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <Box sx={{ flexGrow: 1, overflow: 'auto', pb: 2 }}>
            {activeTab === 0 && (
              <Stack spacing={2} sx={{ mt: 1 }}>
                <FormField
                  name="advertiserId"
                  control={control}
                  type="autocomplete"
                  label={t('campaigns.fields.advertiser')}
                  options={advertiserOptions}
                  required
                />
                <FormField
                  name="name"
                  control={control}
                  type="text"
                  label={t('campaigns.fields.name')}
                  required
                />
                <Stack direction="row" spacing={2}>
                  <FormField
                    name="startDate"
                    control={control}
                    type="date"
                    label={t('campaigns.fields.startDate')}
                    required
                  />
                  <FormField
                    name="endDate"
                    control={control}
                    type="date"
                    label={t('campaigns.fields.endDate')}
                    required
                  />
                </Stack>
                <Stack direction="row" spacing={2}>
                  <FormField
                    name="priority"
                    control={control}
                    type="number"
                    label={t('campaigns.fields.priority')}
                    required
                  />
                  <FormField
                    name="weight"
                    control={control}
                    type="number"
                    label={t('campaigns.fields.weight')}
                    required
                  />
                  <FormField
                    name="overdeliveryRatio"
                    control={control}
                    type="number"
                    label={t('campaigns.fields.overdeliveryRatio')}
                    helperText={t('campaigns.fields.overdeliveryRatioHelper')}
                    required
                  />
                </Stack>
                <FormField
                  name="blocked"
                  control={control}
                  type="checkbox"
                  label={t('campaigns.fields.blocked')}
                />
              </Stack>
            )}
            
            {activeTab === 1 && (
              <Stack spacing={2} sx={{ mt: 1 }}>
                <Stack direction="row" spacing={2}>
                  <FormField
                    name="budget"
                    control={control}
                    type="number"
                    label={t('campaigns.fields.budget')}
                    required
                  />
                  <FormField
                    name="budgetDaily"
                    control={control}
                    type="number"
                    label={t('campaigns.fields.budgetDaily')}
                    required
                  />
                </Stack>
                <FormField
                  name="price"
                  control={control}
                  type="number"
                  label={t('campaigns.fields.price')}
                  required
                />
                <Stack direction="row" spacing={2}>
                  <FormField
                    name="pricingModel"
                    control={control}
                    type="select"
                    label={t('campaigns.fields.pricingModel')}
                    options={[
                      { value: 'CPM', label: 'CPM' },
                      { value: 'CPC', label: 'CPC' },
                      { value: 'CPV', label: 'CPV' },
                      { value: 'CPA', label: 'CPA' },
                    ]}
                    required
                  />
                  <FormField
                    name="spendStrategy"
                    control={control}
                    type="select"
                    label={t('campaigns.fields.spendStrategy')}
                    options={[
                      { value: 'even', label: t('campaigns.spendStrategies.even') },
                      { value: 'asap', label: t('campaigns.spendStrategies.asap') },
                      { value: 'frontload', label: t('campaigns.spendStrategies.frontload') },
                    ]}
                    required
                  />
                </Stack>
              </Stack>
            )}
            
            {activeTab === 2 && (
              <Stack spacing={2} sx={{ mt: 1 }}>
                <FormField
                  name="frequencyCapStrategy"
                  control={control}
                  type="select"
                  label={t('campaigns.fields.frequencyCapStrategy')}
                  options={[
                    { value: 'soft', label: t('campaigns.frequencyCapStrategies.soft') },
                    { value: 'strict', label: t('campaigns.frequencyCapStrategies.strict') },
                  ]}
                  required
                />
                <Typography variant="body2" sx={{ mt: 2, mb: 1, fontWeight: 500 }}>
                  {t('campaigns.fields.frequencyCapPerUser')}
                </Typography>
                <Stack direction="row" spacing={2}>
                  <FormField
                    name="frequencyCap.per_user.impressions.count"
                    control={control}
                    type="number"
                    label={t('campaigns.fields.impressionsCount')}
                    required
                  />
                  <FormField
                    name="frequencyCap.per_user.impressions.window_sec"
                    control={control}
                    type="number"
                    label={t('campaigns.fields.windowSec')}
                    helperText={t('campaigns.fields.windowSecHelper')}
                    required
                  />
                </Stack>
                <Stack direction="row" spacing={2}>
                  <FormField
                    name="frequencyCap.per_user.clicks.count"
                    control={control}
                    type="number"
                    label={t('campaigns.fields.clicksCount')}
                    required
                  />
                  <FormField
                    name="frequencyCap.per_user.clicks.window_sec"
                    control={control}
                    type="number"
                    label={t('campaigns.fields.windowSec')}
                    helperText={t('campaigns.fields.windowSecHelper')}
                    required
                  />
                </Stack>
                <Typography variant="body2" sx={{ mt: 2, mb: 1, fontWeight: 500 }}>
                  {t('campaigns.fields.frequencyCapPerSession')}
                </Typography>
                <Stack direction="row" spacing={2}>
                  <FormField
                    name="frequencyCap.per_session.impressions.count"
                    control={control}
                    type="number"
                    label={t('campaigns.fields.impressionsCount')}
                    required
                  />
                  <FormField
                    name="frequencyCap.per_session.impressions.window_sec"
                    control={control}
                    type="number"
                    label={t('campaigns.fields.windowSec')}
                    helperText={t('campaigns.fields.windowSecHelper')}
                    required
                  />
                </Stack>
                <Stack direction="row" spacing={2}>
                  <FormField
                    name="frequencyCap.per_session.clicks.count"
                    control={control}
                    type="number"
                    label={t('campaigns.fields.clicksCount')}
                    required
                  />
                  <FormField
                    name="frequencyCap.per_session.clicks.window_sec"
                    control={control}
                    type="number"
                    label={t('campaigns.fields.windowSec')}
                    helperText={t('campaigns.fields.windowSecHelper')}
                    required
                  />
                </Stack>
              </Stack>
            )}
            
            {activeTab === 3 && (
              <Stack spacing={2} sx={{ mt: 1 }}>
                <FormField
                  name="locationsMode"
                  control={control}
                  type="radio"
                  label={t('campaigns.fields.locationsMode')}
                  options={[
                    { value: 'allowed', label: t('campaigns.modes.allowed') },
                    { value: 'denied', label: t('campaigns.modes.denied') },
                  ]}
                />
                <FormField
                  name="locations"
                  control={control}
                  type="multiselect"
                  label={t('campaigns.fields.locations')}
                  options={locationOptions}
                  helperText={t('campaigns.fields.locationsHelper')}
                />
                <FormField
                  name="restaurantTypesMode"
                  control={control}
                  type="radio"
                  label={t('campaigns.fields.restaurantTypesMode')}
                  options={[
                    { value: 'allowed', label: t('campaigns.modes.allowed') },
                    { value: 'denied', label: t('campaigns.modes.denied') },
                  ]}
                />
                <FormField
                  name="restaurantTypes"
                  control={control}
                  type="multiselect"
                  label={t('campaigns.fields.restaurantTypes')}
                  options={typeOptions}
                  helperText={t('campaigns.fields.restaurantTypesHelper')}
                />
                <FormField
                  name="menuTypesMode"
                  control={control}
                  type="radio"
                  label={t('campaigns.fields.menuTypesMode')}
                  options={[
                    { value: 'allowed', label: t('campaigns.modes.allowed') },
                    { value: 'denied', label: t('campaigns.modes.denied') },
                  ]}
                />
                <FormField
                  name="menuTypes"
                  control={control}
                  type="multiselect"
                  label={t('campaigns.fields.menuTypes')}
                  options={menuTypeOptions}
                  helperText={t('campaigns.fields.menuTypesHelper')}
                />
                <FormField
                  name="placements"
                  control={control}
                  type="multiselect"
                  label={t('campaigns.fields.placements')}
                  options={placementOptions}
                  helperText={t('campaigns.fields.placementsHelper')}
                />
              </Stack>
            )}

            {/* Tab 4: Restaurant Targeting */}
            {activeTab === 4 && (
              <TargetingTab
                targets={watch('targets')}
                onChange={(newTargets: CampaignTarget[]) => setValue('targets', newTargets)}
                restaurants={restaurants}
                schedules={schedules}
                placements={placements}
                cities={cities}
                districts={locations}
                restaurantTypes={restaurantTypes}
                menuTypes={menuTypes}
                priceSegments={priceSegments}
                campaignTargetingRules={{
                  locationsMode: watch('locationsMode'),
                  locations: watch('locations'),
                  restaurantTypesMode: watch('restaurantTypesMode'),
                  restaurantTypes: watch('restaurantTypes'),
                  menuTypesMode: watch('menuTypesMode'),
                  menuTypes: watch('menuTypes'),
                }}
              />
            )}
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
              <Button onClick={handleCloseDialog} variant="outlined" disabled={isSubmitting}>
                {t('common.cancel')}
              </Button>
              <Button type="submit" variant="contained" disabled={isSubmitting}>
                {t('common.save')}
              </Button>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>

      <FilterDrawer
        open={filterDrawer.isOpen}
        onClose={filterDrawer.close}
        onApply={() => filterDrawer.close()}
        onReset={resetFilters}
        title={t('common.filters')}
      >
        <Select
          name="status"
          label={t('common.status')}
          value={filters.status}
          onChange={(value) => updateFilter('status', value as 'active' | 'blocked' | 'all')}
          options={[
            { value: 'all', label: t('common.all') },
            { value: 'active', label: t('common.active') },
            { value: 'blocked', label: t('common.blocked') },
          ]}
        />

        <Select
          name="advertiserId"
          label={t('campaigns.fields.advertiser')}
          value={filters.advertiserId}
          onChange={(value) => updateFilter('advertiserId', value ? Number(value) : '')}
          options={[
            { value: '', label: t('common.all') },
            ...advertiserOptions,
          ]}
        />
      </FilterDrawer>

      <ConfirmDialog {...confirmDialog.dialogProps} />
    </Box>
  );
}
