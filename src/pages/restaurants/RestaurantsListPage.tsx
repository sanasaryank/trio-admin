import { useEffect, useMemo, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Box, Typography, Alert } from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  History as HistoryIcon,
  FilterList as FilterListIcon,
  QrCode as QrCodeIcon,
  BarChart as BarChartIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';

// API
import { restaurantsApi, dictionariesApi } from '../../api/endpoints';

// Atoms
import Button from '../../components/ui/atoms/Button';
import Select from '../../components/ui/atoms/Select';
import Link from '../../components/ui/atoms/Link';
import IconButton from '../../components/ui/atoms/IconButton';
import Switch from '../../components/ui/atoms/Switch';

// Molecules
import DataTable, { type Column } from '../../components/ui/molecules/DataTable';
import Pagination from '../../components/ui/molecules/Pagination';
import SearchField from '../../components/ui/molecules/SearchField';
import FilterDrawer from '../../components/ui/molecules/FilterDrawer';
import ConfirmDialog from '../../components/ui/molecules/ConfirmDialog';

// Common components
import { AuditDrawer } from '../../components/common/AuditDrawer';
import { RestaurantFormDialog } from '../../components/restaurants/RestaurantFormDialog';

// Hooks
import {
  useTableState,
  useFilters,
  useConfirmDialog,
  useFetch,
  useDrawer,
} from '../../hooks';

// Utils
import { formatTimestamp } from '../../utils/dateUtils';

// Types
import type {
  Restaurant,
  RestaurantFilters,
  Country,
  City,
  District,
  RestaurantType,
  PriceSegment,
  MenuType,
  IntegrationType,
} from '../../types';

type SortField =
  | 'id'
  | 'name'
  | 'cityId'
  | 'districtId'
  | 'createdAt'
  | 'lastClientActivityAt'
  | 'lastRestaurantActivityAt';

interface AuditDrawerState {
  restaurantId: number | null;
  restaurantName: string;
}

interface FormDialogState {
  open: boolean;
  restaurantId?: number;
}

export const RestaurantsListPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Form dialog state
  const [formDialog, setFormDialog] = useState<FormDialogState>({
    open: false,
    restaurantId: undefined,
  });

  // Fetch restaurants
  const {
    data: restaurants = [],
    loading: isLoading,
    error: fetchError,
    refetch: loadRestaurants,
  } = useFetch<Restaurant[]>(
    async () => await restaurantsApi.list(),
    []
  );

  // Fetch dictionaries
  const { data: dictionaries } = useFetch(
    async () => {
      const [
        countriesData,
        citiesData,
        districtsData,
        restaurantTypesData,
        priceSegmentsData,
        menuTypesData,
        integrationTypesData,
      ] = await Promise.all([
        dictionariesApi.list('countries'),
        dictionariesApi.list('cities'),
        dictionariesApi.list('districts'),
        dictionariesApi.list('restaurant-types'),
        dictionariesApi.list('price-segments'),
        dictionariesApi.list('menu-types'),
        dictionariesApi.list('integration-types'),
      ]);

      return {
        countries: countriesData as Country[],
        cities: citiesData as City[],
        districts: districtsData as District[],
        restaurantTypes: restaurantTypesData as RestaurantType[],
        priceSegments: priceSegmentsData as PriceSegment[],
        menuTypes: menuTypesData as MenuType[],
        integrationTypes: integrationTypesData as IntegrationType[],
      };
    },
    []
  );

  const {
    countries = [],
    cities = [],
    districts = [],
    restaurantTypes = [],
    priceSegments = [],
    menuTypes = [],
    integrationTypes = [],
  } = dictionaries || {};

  // Filters
  const { filters, updateFilter, resetFilters, applyFilters } = useFilters<RestaurantFilters>({
    search: '',
    status: 'active',
  });

  // Temporary filters for drawer
  const {
    filters: tempFilters,
    updateFilter: updateTempFilter,
    resetFilters: resetTempFilters,
  } = useFilters<RestaurantFilters>({
    search: '',
    status: 'active',
  });

  // Filter drawer
  const filterDrawer = useDrawer();

  // Confirm dialog
  const confirmDialog = useConfirmDialog();

  // Audit drawer
  const auditDrawer = useDrawer();
  const [auditState, setAuditState] = useState<AuditDrawerState>({
    restaurantId: null,
    restaurantName: '',
  });

  // Helper functions
  const getCityName = useCallback(
    (cityId: number): string => {
      return cities.find((c) => c.id === cityId)?.name || `#${cityId}`;
    },
    [cities]
  );

  const getDistrictName = useCallback(
    (districtId: number): string => {
      return districts.find((d) => d.id === districtId)?.name || `#${districtId}`;
    },
    [districts]
  );

  // Filtered cities based on selected country
  const filteredCities = useMemo(() => {
    if (!tempFilters.countryId) return cities;
    return cities.filter((city) => city.countryId === tempFilters.countryId);
  }, [cities, tempFilters.countryId]);

  // Filtered districts based on selected city
  const filteredDistricts = useMemo(() => {
    if (!tempFilters.cityId) return districts;
    return districts.filter((district) => district.cityId === tempFilters.cityId);
  }, [districts, tempFilters.cityId]);

  // Apply filters to restaurants
  const filteredRestaurants = useMemo(() => {
    return applyFilters(restaurants || [], (restaurant, currentFilters) => {
      // Status filter
      if (currentFilters.status !== 'all') {
        const isBlocked = currentFilters.status === 'blocked';
        if (restaurant.blocked !== isBlocked) return false;
      }

      // Search filter
      if (currentFilters.search) {
        const searchLower = currentFilters.search.toLowerCase();
        const matchesId = restaurant.id.toString().includes(searchLower);
        const matchesName = restaurant.name.toLowerCase().includes(searchLower);
        if (!matchesId && !matchesName) return false;
      }

      // Country filter
      if (currentFilters.countryId && restaurant.countryId !== currentFilters.countryId) {
        return false;
      }

      // City filter
      if (currentFilters.cityId && restaurant.cityId !== currentFilters.cityId) {
        return false;
      }

      // District filter
      if (currentFilters.districtId && restaurant.districtId !== currentFilters.districtId) {
        return false;
      }

      // Type filter
      if (currentFilters.typeId && restaurant.typeId !== currentFilters.typeId) {
        return false;
      }

      // Price segment filter
      if (currentFilters.priceSegmentId && restaurant.priceSegmentId !== currentFilters.priceSegmentId) {
        return false;
      }

      // Menu type filter
      if (currentFilters.menuTypeId && restaurant.menuTypeId !== currentFilters.menuTypeId) {
        return false;
      }

      // Integration type filter
      if (currentFilters.integrationTypeId && restaurant.integrationTypeId !== currentFilters.integrationTypeId) {
        return false;
      }

      return true;
    });
  }, [restaurants, applyFilters, filters]);

  // Table state with sorting and pagination
  const tableState = useTableState<Restaurant>({
    data: filteredRestaurants || [],
    initialRowsPerPage: 10,
    defaultSortColumn: 'id' as keyof Restaurant,
    defaultSortDirection: 'asc',
  });

  // Custom sorting that handles city and district names
  const sortedAndPaginatedData = useMemo(() => {
    let sorted = [...filteredRestaurants];

    if (tableState.sortColumn) {
      sorted.sort((a, b) => {
        let compareValue = 0;
        const sortField = tableState.sortColumn as SortField;

        switch (sortField) {
          case 'id':
            compareValue = a.id - b.id;
            break;
          case 'name':
            compareValue = a.name.localeCompare(b.name);
            break;
          case 'cityId':
            compareValue = getCityName(a.cityId).localeCompare(getCityName(b.cityId));
            break;
          case 'districtId':
            compareValue = getDistrictName(a.districtId).localeCompare(
              getDistrictName(b.districtId)
            );
            break;
          case 'createdAt':
            compareValue = a.createdAt - b.createdAt;
            break;
          case 'lastClientActivityAt':
            compareValue = (a.lastClientActivityAt || 0) - (b.lastClientActivityAt || 0);
            break;
          case 'lastRestaurantActivityAt':
            compareValue = (a.lastRestaurantActivityAt || 0) - (b.lastRestaurantActivityAt || 0);
            break;
        }

        return tableState.sortDirection === 'asc' ? compareValue : -compareValue;
      });
    }

    const start = tableState.page * tableState.rowsPerPage;
    return sorted.slice(start, start + tableState.rowsPerPage);
  }, [
    filteredRestaurants,
    tableState.sortColumn,
    tableState.sortDirection,
    tableState.page,
    tableState.rowsPerPage,
    getCityName,
    getDistrictName,
  ]);

  // Handlers
  const handleApplyFilters = useCallback(() => {
    Object.keys(tempFilters).forEach((key) => {
      updateFilter(key as keyof RestaurantFilters, tempFilters[key as keyof RestaurantFilters]);
    });
    tableState.handlePageChange(0);
    filterDrawer.close();
  }, [tempFilters, updateFilter, tableState, filterDrawer]);

  const handleResetFilters = useCallback(() => {
    resetFilters();
    resetTempFilters();
    tableState.handlePageChange(0);
    filterDrawer.close();
  }, [resetFilters, resetTempFilters, tableState, filterDrawer]);

  const handleBlockToggle = useCallback(
    (restaurant: Restaurant) => {
      confirmDialog.open({
        title: restaurant.blocked ? t('restaurants.unblockConfirmTitle') : t('restaurants.blockConfirmTitle'),
        message: restaurant.blocked
          ? t('restaurants.unblockConfirmMessage', { name: restaurant.name })
          : t('restaurants.blockConfirmMessage', { name: restaurant.name }),
        onConfirm: async () => {
          try {
            await restaurantsApi.block(restaurant.id, !restaurant.blocked);
            await loadRestaurants();
          } catch (err) {
            console.error('Error toggling block status:', err);
          }
        },
      });
    },
    [confirmDialog, loadRestaurants, t]
  );

  const handleEdit = useCallback(
    (id: number) => {
      setFormDialog({ open: true, restaurantId: id });
    },
    []
  );

  const handleViewAudit = useCallback(
    (restaurant: Restaurant) => {
      setAuditState({
        restaurantId: restaurant.id,
        restaurantName: restaurant.name,
      });
      auditDrawer.open();
    },
    [auditDrawer]
  );

  const handleAddRestaurant = useCallback(() => {
    setFormDialog({ open: true, restaurantId: undefined });
  }, []);

  const handleCloseFormDialog = useCallback(() => {
    setFormDialog({ open: false, restaurantId: undefined });
    loadRestaurants(); // Refresh list after closing dialog
  }, [loadRestaurants]);

  const handleQRCodes = useCallback(
    (id: number) => {
      navigate(`/restaurants/${id}/qr`);
    },
    [navigate]
  );

  const handleStatistics = useCallback(() => {
    alert('Not implemented');
  }, []);

  const handleConfigurationErrors = useCallback(() => {
    alert('Not implemented');
  }, []);

  const handleCountryChange = useCallback(
    (value: string | number) => {
      const countryId = value ? Number(value) : undefined;
      updateTempFilter('countryId', countryId);
      updateTempFilter('cityId', undefined);
      updateTempFilter('districtId', undefined);
    },
    [updateTempFilter]
  );

  const handleCityChange = useCallback(
    (value: string | number) => {
      const cityId = value ? Number(value) : undefined;
      updateTempFilter('cityId', cityId);
      updateTempFilter('districtId', undefined);
    },
    [updateTempFilter]
  );

  // Sync temp filters when drawer opens
  useEffect(() => {
    if (filterDrawer.isOpen) {
      Object.keys(filters).forEach((key) => {
        updateTempFilter(key as keyof RestaurantFilters, filters[key as keyof RestaurantFilters]);
      });
    }
  }, [filterDrawer.isOpen]);

  // Table columns
  const columns = useMemo<Column<Restaurant>[]>(
    () => [
      {
        id: 'id',
        label: 'ID',
        sortable: true,
        width: 80,
      },
      {
        id: 'name',
        label: t('restaurants.name'),
        sortable: true,
        render: (restaurant) => (
          <Link href={restaurant.crmUrl} external>
            {restaurant.name}
          </Link>
        ),
      },
      {
        id: 'cityId',
        label: t('restaurants.city'),
        sortable: true,
        render: (restaurant) => getCityName(restaurant.cityId),
      },
      {
        id: 'districtId',
        label: t('restaurants.district'),
        sortable: true,
        render: (restaurant) => getDistrictName(restaurant.districtId),
      },
      {
        id: 'createdAt',
        label: t('restaurants.created'),
        sortable: true,
        render: (restaurant) => formatTimestamp(restaurant.createdAt),
      },
      {
        id: 'lastClientActivityAt',
        label: t('restaurants.lastClientActivity'),
        sortable: true,
        render: (restaurant) =>
          restaurant.lastClientActivityAt
            ? formatTimestamp(restaurant.lastClientActivityAt)
            : '-',
      },
      {
        id: 'lastRestaurantActivityAt',
        label: t('restaurants.lastRestaurantActivity'),
        sortable: true,
        render: (restaurant) =>
          restaurant.lastRestaurantActivityAt
            ? formatTimestamp(restaurant.lastRestaurantActivityAt)
            : '-',
      },
      {
        id: 'actions',
        label: t('common.actions'),
        sortable: false,
        render: (restaurant) => (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'center',
              gap: 0.5,
            }}
          >
            <Switch
              checked={!restaurant.blocked}
              onChange={() => handleBlockToggle(restaurant)}
            />
            <IconButton
              onClick={() => handleEdit(restaurant.id)}
              tooltip={t('common.edit')}
              size="small"
              icon={<EditIcon />}
            />
            <IconButton
              onClick={() => handleViewAudit(restaurant)}
              tooltip={t('restaurants.auditLog')}
              size="small"
              icon={<HistoryIcon />}
            />
            <IconButton
              onClick={handleStatistics}
              tooltip={t('restaurants.statistics')}
              size="small"
              icon={<BarChartIcon />}
            />
            <IconButton
              onClick={handleConfigurationErrors}
              tooltip={t('restaurants.configurationErrors')}
              size="small"
              icon={<ErrorIcon />}
            />
            <IconButton
              onClick={() => handleQRCodes(restaurant.id)}
              tooltip={t('restaurants.qrCodes')}
              size="small"
              icon={<QrCodeIcon />}
            />
          </Box>
        ),
      },
    ],
    [
      getCityName,
      getDistrictName,
      handleBlockToggle,
      handleEdit,
      handleViewAudit,
      handleQRCodes,
      handleStatistics,
      handleConfigurationErrors,
      t,
    ]
  );

  const error = fetchError?.message || null;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">{t('restaurants.title')}</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<FilterListIcon />}
            onClick={filterDrawer.open}
          >
            {t('common.filters')}
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddRestaurant}>
            {t('restaurants.add')}
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ mb: 2 }}>
        <SearchField
          value={filters.search || ''}
          onChange={(value) => updateFilter('search', value)}
          placeholder={t('restaurants.searchPlaceholder')}
        />
      </Box>

      <DataTable
        columns={columns}
        data={sortedAndPaginatedData}
        loading={isLoading}
        onSort={(column) => tableState.handleSort(column as keyof Restaurant)}
        sortColumn={tableState.sortColumn ?? undefined}
        sortDirection={tableState.sortDirection}
        rowKey="id"
        emptyMessage={t('common.noData')}
      />

      <Pagination
        page={tableState.page}
        totalPages={tableState.totalPages}
        onPageChange={tableState.handlePageChange}
        rowsPerPage={tableState.rowsPerPage}
        onRowsPerPageChange={tableState.handleRowsPerPageChange}
        rowsPerPageOptions={[5, 10, 25, 50]}
        totalCount={filteredRestaurants.length}
      />

      {/* Filters Drawer */}
      <FilterDrawer
        open={filterDrawer.isOpen}
        onClose={filterDrawer.close}
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
        title={t('common.filters')}
      >
        <Select
          name="status"
          label={t('common.status')}
          value={tempFilters.status || 'active'}
          onChange={(value) => updateTempFilter('status', value as 'active' | 'blocked' | 'all')}
          options={[
            { value: 'active', label: t('common.active') },
            { value: 'blocked', label: t('common.blocked') },
            { value: 'all', label: t('common.all') },
          ]}
        />

        <Select
          name="country"
          label={t('restaurants.country')}
          value={tempFilters.countryId || ''}
          onChange={handleCountryChange}
          options={[
            { value: '', label: t('common.all') },
            ...countries.map((country) => ({
              value: country.id,
              label: country.name,
            })),
          ]}
        />

        <Select
          name="city"
          label={t('restaurants.city')}
          value={tempFilters.cityId || ''}
          onChange={handleCityChange}
          options={[
            { value: '', label: t('common.all') },
            ...filteredCities.map((city) => ({
              value: city.id,
              label: city.name,
            })),
          ]}
          disabled={!tempFilters.countryId}
        />

        <Select
          name="district"
          label={t('restaurants.district')}
          value={tempFilters.districtId || ''}
          onChange={(value) =>
            updateTempFilter('districtId', value ? Number(value) : undefined)
          }
          options={[
            { value: '', label: t('common.all') },
            ...filteredDistricts.map((district) => ({
              value: district.id,
              label: district.name,
            })),
          ]}
          disabled={!tempFilters.cityId}
        />

        <Select
          name="restaurantType"
          label={t('restaurants.type')}
          value={tempFilters.typeId || ''}
          onChange={(value) => updateTempFilter('typeId', value ? Number(value) : undefined)}
          options={[
            { value: '', label: t('common.all') },
            ...restaurantTypes.map((type) => ({
              value: type.id,
              label: type.name,
            })),
          ]}
        />

        <Select
          name="priceSegment"
          label={t('restaurants.priceSegment')}
          value={tempFilters.priceSegmentId || ''}
          onChange={(value) =>
            updateTempFilter('priceSegmentId', value ? Number(value) : undefined)
          }
          options={[
            { value: '', label: t('common.all') },
            ...priceSegments.map((segment) => ({
              value: segment.id,
              label: segment.name,
            })),
          ]}
        />

        <Select
          name="menuType"
          label={t('restaurants.menuType')}
          value={tempFilters.menuTypeId || ''}
          onChange={(value) => updateTempFilter('menuTypeId', value ? Number(value) : undefined)}
          options={[
            { value: '', label: t('common.all') },
            ...menuTypes.map((type) => ({
              value: type.id,
              label: type.name,
            })),
          ]}
        />

        <Select
          name="integrationType"
          label={t('restaurants.integrationType')}
          value={tempFilters.integrationTypeId || ''}
          onChange={(value) =>
            updateTempFilter('integrationTypeId', value ? Number(value) : undefined)
          }
          options={[
            { value: '', label: t('common.all') },
            ...integrationTypes.map((type) => ({
              value: type.id,
              label: type.name,
            })),
          ]}
        />
      </FilterDrawer>

      {/* Confirm Dialog */}
      <ConfirmDialog {...confirmDialog.dialogProps} />

      {/* Audit Drawer */}
      <AuditDrawer
        open={auditDrawer.isOpen}
        entityType="restaurant"
        entityId={auditState.restaurantId}
        entityLabel={auditState.restaurantName}
        onClose={auditDrawer.close}
      />

      {/* Restaurant Form Dialog */}
      <RestaurantFormDialog
        open={formDialog.open}
        onClose={handleCloseFormDialog}
        restaurantId={formDialog.restaurantId}
      />
    </Box>
  );
};
