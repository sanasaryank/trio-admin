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
import { getDisplayName } from '../../utils/dictionaryUtils';

// Types
import type {
  RestaurantListItem,
  RestaurantFilters,
  RestaurantType,
  PriceSegment,
  MenuType,
  IntegrationType,
} from '../../types';

type SortField =
  | 'id'
  | 'name'
  | 'cityName'
  | 'districtName';

interface AuditDrawerState {
  restaurantId: string | null;
  restaurantName: string;
}

interface FormDialogState {
  open: boolean;
  restaurantId?: string;
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
  } = useFetch<RestaurantListItem[]>(
    async () => {
      try {
        return await restaurantsApi.list();
      } catch (error) {
        console.error('Error loading restaurants:', error);
        return [];
      }
    },
    []
  );

  // Lazy load dictionaries only when filter drawer is opened
  const [dictionariesLoaded, setDictionariesLoaded] = useState(false);
  const { data: dictionaries } = useFetch(
    async () => {
      if (!dictionariesLoaded) return null;
      
      try {
        const [
          locationsData,
          restaurantTypesData,
          priceSegmentsData,
          menuTypesData,
          integrationTypesData,
        ] = await Promise.all([
          restaurantsApi.getLocations().catch(() => ({ countries: [], cities: [], districts: [] })),
          dictionariesApi.list('restaurant-types').catch(() => []),
          dictionariesApi.list('price-segments').catch(() => []),
          dictionariesApi.list('menu-types').catch(() => []),
          dictionariesApi.list('integration-types').catch(() => []),
        ]);

        return {
          countries: locationsData.countries || [],
          cities: locationsData.cities || [],
          districts: locationsData.districts || [],
          restaurantTypes: (restaurantTypesData as RestaurantType[]) || [],
          priceSegments: (priceSegmentsData as PriceSegment[]) || [],
          menuTypes: (menuTypesData as MenuType[]) || [],
          integrationTypes: (integrationTypesData as IntegrationType[]) || [],
        };
      } catch (error) {
        console.error('Error loading dictionaries:', error);
        return {
          countries: [],
          cities: [],
          districts: [],
          restaurantTypes: [],
          priceSegments: [],
          menuTypes: [],
          integrationTypes: [],
        };
      }
    },
    [dictionariesLoaded]
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

  // Helper functions - removed getCityName and getDistrictName as names come from API

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
        if (restaurant.isBlocked !== isBlocked) return false;
      }

      // Search filter
      if (currentFilters.search) {
        const searchLower = currentFilters.search.toLowerCase();
        const restaurantName = typeof restaurant.name === 'string' ? restaurant.name : getDisplayName(restaurant.name);
        const matchesName = restaurantName.toLowerCase().includes(searchLower);
        const matchesCity = restaurant.cityName.toLowerCase().includes(searchLower);
        const matchesDistrict = restaurant.districtName.toLowerCase().includes(searchLower);
        if (!matchesName && !matchesCity && !matchesDistrict) return false;
      }

      // Country filter - match by finding cities in that country
      if (currentFilters.countryId) {
        const citiesInCountry = cities.filter(c => c.countryId === currentFilters.countryId);
        const cityNamesInCountry = citiesInCountry.map(c => c.name);
        if (!cityNamesInCountry.includes(restaurant.cityName)) {
          return false;
        }
      }

      // City filter - match by city name
      if (currentFilters.cityId) {
        const selectedCity = cities.find(c => c.id === currentFilters.cityId);
        if (!selectedCity || restaurant.cityName !== selectedCity.name) {
          return false;
        }
      }

      // District filter - match by district name
      if (currentFilters.districtId) {
        const selectedDistrict = districts.find(d => d.id === currentFilters.districtId);
        if (!selectedDistrict || restaurant.districtName !== selectedDistrict.name) {
          return false;
        }
      }

      // Note: Type, price segment, menu type, and integration type filters 
      // are not available in the list API response, so they're removed
      // These filters would need to be applied server-side

      return true;
    });
  }, [restaurants, applyFilters, filters, cities, districts]);

  // Table state with sorting and pagination
  const tableState = useTableState<RestaurantListItem>({
    data: filteredRestaurants || [],
    initialRowsPerPage: 10,
    defaultSortColumn: 'id' as keyof RestaurantListItem,
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
            compareValue = a.id.localeCompare(b.id);
            break;
          case 'name': {
            const aName = typeof a.name === 'string' ? a.name : getDisplayName(a.name);
            const bName = typeof b.name === 'string' ? b.name : getDisplayName(b.name);
            compareValue = aName.localeCompare(bName);
            break;
          }
          case 'cityName':
            compareValue = a.cityName.localeCompare(b.cityName);
            break;
          case 'districtName':
            compareValue = a.districtName.localeCompare(b.districtName);
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
    (restaurant: RestaurantListItem) => {
      confirmDialog.open({
        title: restaurant.isBlocked ? t('restaurants.unblockConfirmTitle') : t('restaurants.blockConfirmTitle'),
        message: restaurant.isBlocked
          ? t('restaurants.unblockConfirmMessage', { name: restaurant.name })
          : t('restaurants.blockConfirmMessage', { name: restaurant.name }),
        confirmText: t('common.confirm'),
        cancelText: t('common.cancel'),
        onConfirm: async () => {
          try {
            await restaurantsApi.block(restaurant.id, !restaurant.isBlocked);
            await loadRestaurants();
          } catch (err) {
            console.error('Error toggling block status:', err);
            // Optionally show error message to user
            alert(t('common.error') + ': ' + (err as Error).message);
          }
        },
      });
    },
    [confirmDialog, loadRestaurants, t]
  );

  const handleEdit = useCallback(
    (id: string) => {
      setFormDialog({ open: true, restaurantId: id });
    },
    []
  );

  const handleViewAudit = useCallback(
    (restaurant: RestaurantListItem) => {
      // Convert name to string if it's a DictionaryName object
      const displayName = typeof restaurant.name === 'string' 
        ? restaurant.name 
        : getDisplayName(restaurant.name);
      
      setAuditState({
        restaurantId: restaurant.id,
        restaurantName: displayName,
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
    (id: string) => {
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
    (value: string | number | number[]) => {
      const countryId = value && !Array.isArray(value) ? String(value) : undefined;
      updateTempFilter('countryId', countryId);
      updateTempFilter('cityId', undefined);
      updateTempFilter('districtId', undefined);
    },
    [updateTempFilter]
  );

  const handleCityChange = useCallback(
    (value: string | number | number[]) => {
      const cityId = value && !Array.isArray(value) ? String(value) : undefined;
      updateTempFilter('cityId', cityId);
      updateTempFilter('districtId', undefined);
    },
    [updateTempFilter]
  );

  // Sync temp filters when drawer opens and load dictionaries if needed
  useEffect(() => {
    if (filterDrawer.isOpen) {
      Object.keys(filters).forEach((key) => {
        updateTempFilter(key as keyof RestaurantFilters, filters[key as keyof RestaurantFilters]);
      });
      // Load dictionaries on first filter drawer open
      if (!dictionariesLoaded) {
        setDictionariesLoaded(true);
      }
    }
  }, [filterDrawer.isOpen, filters, updateTempFilter, dictionariesLoaded]);

  // Table columns
  const columns = useMemo<Column<RestaurantListItem>[]>(
    () => [
      {
        id: 'name',
        label: t('restaurants.name'),
        sortable: true,
        render: (restaurant) => {
          // Handle both string and DictionaryName object
          const displayName = typeof restaurant.name === 'string' 
            ? restaurant.name 
            : getDisplayName(restaurant.name);
          
          // Only render as link if crmUrl exists
          if (restaurant.crmUrl) {
            return (
              <Link href={restaurant.crmUrl} external>
                {displayName}
              </Link>
            );
          }
          return displayName;
        },
      },
      {
        id: 'cityName',
        label: t('restaurants.city'),
        sortable: true,
        render: (restaurant) => restaurant.cityName,
      },
      {
        id: 'districtName',
        label: t('restaurants.district'),
        sortable: true,
        render: (restaurant) => restaurant.districtName,
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
              checked={!restaurant.isBlocked}
              disabled={true}
              onChange={() => {}}
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
        onSort={(column) => tableState.handleSort(column as keyof RestaurantListItem)}
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
              label: getDisplayName(country.name),
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
              label: getDisplayName(city.name),
            })),
          ]}
          disabled={!tempFilters.countryId}
        />

        <Select
          name="district"
          label={t('restaurants.district')}
          value={tempFilters.districtId || ''}
          onChange={(value) =>
            updateTempFilter('districtId', value && !Array.isArray(value) ? String(value) : undefined)
          }
          options={[
            { value: '', label: t('common.all') },
            ...filteredDistricts.map((district) => ({
              value: district.id,
              label: getDisplayName(district.name),
            })),
          ]}
          disabled={!tempFilters.cityId}
        />

        <Select
          name="restaurantType"
          label={t('restaurants.type')}
          value={(tempFilters.typeId || []) as any}
          onChange={(value) => updateTempFilter('typeId', Array.isArray(value) && value.length > 0 ? value.map(String) : undefined)}
          options={[
            ...restaurantTypes.map((type) => ({
              value: type.id,
              label: getDisplayName(type.name),
            })),
          ]}
          multiple={true}
        />

        <Select
          name="priceSegment"
          label={t('restaurants.priceSegment')}
          value={(tempFilters.priceSegmentId || []) as any}
          onChange={(value) =>
            updateTempFilter('priceSegmentId', Array.isArray(value) && value.length > 0 ? value.map(String) : undefined)
          }
          options={[
            ...priceSegments.map((segment) => ({
              value: segment.id,
              label: getDisplayName(segment.name),
            })),
          ]}
          multiple={true}
        />

        <Select
          name="menuType"
          label={t('restaurants.menuType')}
          value={(tempFilters.menuTypeId || []) as any}
          onChange={(value) => updateTempFilter('menuTypeId', Array.isArray(value) && value.length > 0 ? value.map(String) : undefined)}
          options={[
            ...menuTypes.map((type) => ({
              value: type.id,
              label: getDisplayName(type.name),
            })),
          ]}
          multiple={true}
        />

        <Select
          name="integrationType"
          label={t('restaurants.integrationType')}
          value={tempFilters.integrationTypeId || ''}
          onChange={(value) =>
            updateTempFilter('integrationTypeId', value && !Array.isArray(value) ? String(value) : undefined)
          }
          options={[
            { value: '', label: t('common.all') },
            ...integrationTypes.map((type) => ({
              value: type.id,
              label: getDisplayName(type.name),
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
