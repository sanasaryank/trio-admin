import { useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Box, Paper, Typography, Alert, Divider, Grid } from '@mui/material';
import { useTranslation } from 'react-i18next';

// API
import { restaurantsApi, dictionariesApi } from '../../api/endpoints';

// Atoms
import Button from '../../components/ui/atoms/Button';

// Molecules
import FormField from '../../components/ui/molecules/FormField';
import LoadingOverlay from '../../components/ui/molecules/LoadingOverlay';

// Restaurant components
import { LocationPicker } from '../../components/restaurants/LocationPicker';
import { ConnectionDataFields } from '../../components/restaurants/ConnectionDataFields';

// Hooks
import { useFetch, useFormSubmit } from '../../hooks';

// Types
import type {
  Country,
  City,
  District,
  RestaurantType,
  PriceSegment,
  MenuType,
  IntegrationType,
} from '../../types';

const restaurantSchema = z.object({
  name: z.string().min(1, 'Название обязательно для заполнения'),
  crmUrl: z.string().url('Некорректный URL'),
  countryId: z.number().min(1, 'Выберите страну'),
  cityId: z.number().min(1, 'Выберите город'),
  districtId: z.number().min(1, 'Выберите район'),
  address: z.string().min(1, 'Адрес обязателен для заполнения'),
  lat: z.number(),
  lng: z.number(),
  typeId: z.number().min(1, 'Выберите тип ресторана'),
  priceSegmentId: z.number().min(1, 'Выберите ценовой сегмент'),
  menuTypeId: z.number().min(1, 'Выберите тип меню'),
  integrationTypeId: z.number().min(1, 'Выберите тип интеграции'),
  adminEmail: z.string().email('Некорректный email'),
  connectionData: z.object({
    host: z.string().min(1, 'Хост обязателен для заполнения'),
    port: z.number().min(1, 'Порт обязателен для заполнения'),
    username: z.string().min(1, 'Имя пользователя обязательно для заполнения'),
    password: z.string(),
    changePassword: z.boolean(),
  }).refine(
    (data) => {
      // Password is required if changePassword is true or in create mode
      if (data.changePassword && !data.password) {
        return false;
      }
      return true;
    },
    {
      message: 'Пароль обязателен для заполнения',
      path: ['password'],
    }
  ),
  blocked: z.boolean(),
});

type RestaurantFormValues = z.infer<typeof restaurantSchema>;

interface RestaurantFormPageProps {
  onClose?: () => void;
  restaurantId?: number;
  isDialog?: boolean;
  onSubmitCallback?: (handler: () => void) => void;
  onSubmittingChange?: (isSubmitting: boolean) => void;
}

export const RestaurantFormPage = ({ onClose, restaurantId, isDialog = false, onSubmitCallback, onSubmittingChange }: RestaurantFormPageProps = {}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id: routeId } = useParams<{ id: string }>();
  const id = restaurantId?.toString() || routeId;
  const isEditMode = !!id;
  const isInitialLoadRef = useRef(true);
  const prevCountryIdRef = useRef<number>(0);
  const prevCityIdRef = useRef<number>(0);

  // Form submission hook
  const { isSubmitting, error: submitError, handleSubmit: handleFormSubmit } = useFormSubmit<RestaurantFormValues>();

  // React Hook Form
  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
  } = useForm<RestaurantFormValues>({
    resolver: zodResolver(restaurantSchema),
    defaultValues: {
      name: '',
      crmUrl: '',
      countryId: 0,
      cityId: 0,
      districtId: 0,
      address: '',
      lat: 40.1792, // Default: Yerevan
      lng: 44.4991,
      typeId: 0,
      priceSegmentId: 0,
      menuTypeId: 0,
      integrationTypeId: 0,
      adminEmail: '',
      connectionData: {
        host: '',
        port: 0,
        username: '',
        password: '',
        changePassword: !isEditMode,
      },
      blocked: false,
    },
  });

  // Watch form values
  const selectedCountryId = watch('countryId');
  const selectedCityId = watch('cityId');
  const changePassword = watch('connectionData.changePassword');
  const currentLat = watch('lat');
  const currentLng = watch('lng');

  // Fetch restaurant data in edit mode
  const {
    data: restaurant,
    loading: isFetchingRestaurant,
    error: fetchError,
  } = useFetch(
    async () => {
      if (!isEditMode || !id) return null;
      return await restaurantsApi.getById(parseInt(id, 10));
    },
    [id, isEditMode]
  );

  // Fetch dictionaries
  const { data: dictionaries, loading: isFetchingDictionaries } = useFetch(
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

  // Reset form with restaurant data when loaded
  useEffect(() => {
    if (restaurant) {
      // Store initial values BEFORE resetting form to prevent cascade
      prevCountryIdRef.current = restaurant.countryId;
      prevCityIdRef.current = restaurant.cityId;

      reset({
        name: restaurant.name,
        crmUrl: restaurant.crmUrl,
        countryId: restaurant.countryId,
        cityId: restaurant.cityId,
        districtId: restaurant.districtId,
        address: restaurant.address,
        lat: restaurant.lat,
        lng: restaurant.lng,
        typeId: restaurant.typeId,
        priceSegmentId: restaurant.priceSegmentId,
        menuTypeId: restaurant.menuTypeId,
        integrationTypeId: restaurant.integrationTypeId,
        adminEmail: restaurant.adminEmail,
        connectionData: {
          host: restaurant.connectionData.host,
          port: restaurant.connectionData.port,
          username: restaurant.connectionData.username,
          password: '',
          changePassword: false,
        },
        blocked: restaurant.blocked,
      });

      // Mark initial load as complete after a short delay to allow reset to complete
      setTimeout(() => {
        isInitialLoadRef.current = false;
      }, 0);
    }
  }, [restaurant, reset]);

  // Filtered cities based on selected country
  const filteredCities = useMemo(() => {
    if (!selectedCountryId) return [];
    return cities.filter((city) => city.countryId === selectedCountryId);
  }, [cities, selectedCountryId]);

  // Filtered districts based on selected city
  const filteredDistricts = useMemo(() => {
    if (!selectedCityId) return [];
    return districts.filter((district) => district.cityId === selectedCityId);
  }, [districts, selectedCityId]);

  // Cascade dropdown: reset city and district when country changes (only if manual change)
  useEffect(() => {
    // Skip if we're still loading initial data or if country hasn't changed from previous value
    if (isInitialLoadRef.current || selectedCountryId === prevCountryIdRef.current) {
      return;
    }

    // Update the ref for next comparison
    prevCountryIdRef.current = selectedCountryId;

    // Reset dependent fields if city is not valid for the new country
    if (selectedCountryId > 0) {
      const currentCityId = watch('cityId');
      if (currentCityId > 0) {
        const cityExists = filteredCities.some((c) => c.id === currentCityId);
        if (!cityExists) {
          setValue('cityId', 0);
          setValue('districtId', 0);
        }
      }
    }
  }, [selectedCountryId, filteredCities, setValue, watch]);

  // Cascade dropdown: reset district when city changes (only if manual change)
  useEffect(() => {
    // Skip if we're still loading initial data or if city hasn't changed from previous value
    if (isInitialLoadRef.current || selectedCityId === prevCityIdRef.current) {
      return;
    }

    // Update the ref for next comparison
    prevCityIdRef.current = selectedCityId;

    // Reset dependent fields if district is not valid for the new city
    if (selectedCityId > 0) {
      const currentDistrictId = watch('districtId');
      if (currentDistrictId > 0) {
        const districtExists = filteredDistricts.some((d) => d.id === currentDistrictId);
        if (!districtExists) {
          setValue('districtId', 0);
        }
      }
    }
  }, [selectedCityId, filteredDistricts, setValue, watch]);

  // Handlers
  const onSubmit = useCallback(
    async (data: RestaurantFormValues) => {
      await handleFormSubmit(
        data,
        async (formData) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const submitData: any = {
            name: formData.name,
            crmUrl: formData.crmUrl,
            countryId: formData.countryId,
            cityId: formData.cityId,
            districtId: formData.districtId,
            address: formData.address,
            lat: formData.lat,
            lng: formData.lng,
            typeId: formData.typeId,
            priceSegmentId: formData.priceSegmentId,
            menuTypeId: formData.menuTypeId,
            integrationTypeId: formData.integrationTypeId,
            adminEmail: formData.adminEmail,
            connectionData: {
              host: formData.connectionData.host,
              port: formData.connectionData.port,
              username: formData.connectionData.username,
              ...(isEditMode && !formData.connectionData.changePassword
                ? {}
                : { password: formData.connectionData.password || '' }),
            },
            blocked: formData.blocked,
          };

          if (isEditMode && id) {
            await restaurantsApi.update(parseInt(id, 10), submitData);
          } else {
            await restaurantsApi.create(submitData);
          }
        },
        () => {
          if (onClose) {
            onClose();
          } else {
            navigate('/restaurants');
          }
        }
      );
    },
    [handleFormSubmit, isEditMode, id, navigate, onClose]
  );

  const handleCancel = useCallback(() => {
    if (onClose) {
      onClose();
    } else {
      navigate('/restaurants');
    }
  }, [navigate, onClose]);

  const handleLocationChange = useCallback(
    (lat: number, lng: number) => {
      setValue('lat', lat);
      setValue('lng', lng);
    },
    [setValue]
  );

  const handleAddressChange = useCallback(
    (address: string) => {
      setValue('address', address);
    },
    [setValue]
  );

  const handleLocationMetadataChange = useCallback(
    (metadata: { city?: string; district?: string; cityId?: number; districtId?: number }) => {
      // Update form fields with matched IDs
      if (metadata.cityId) {
        setValue('cityId', metadata.cityId);
        
        // Only update district if it belongs to the matched city
        if (metadata.districtId) {
          const districtBelongsToCity = districts.some(
            d => d.id === metadata.districtId && d.cityId === metadata.cityId
          );
          if (districtBelongsToCity) {
            setValue('districtId', metadata.districtId);
          }
        }
      }
    },
    [setValue, districts]
  );

  const handleChangePasswordToggle = useCallback(
    (value: boolean) => {
      setValue('connectionData.changePassword', value);
    },
    [setValue]
  );

  // Notify parent about submit handler - only once when dialog is opened
  const submitCallbackRef = useRef(onSubmitCallback);
  submitCallbackRef.current = onSubmitCallback;

  useEffect(() => {
    if (isDialog && submitCallbackRef.current) {
      submitCallbackRef.current(handleSubmit(onSubmit));
    }
  }, [isDialog]); // Only run when dialog opens

  // Notify parent about submitting state changes
  const submittingChangeRef = useRef(onSubmittingChange);
  submittingChangeRef.current = onSubmittingChange;

  useEffect(() => {
    if (isDialog && submittingChangeRef.current) {
      submittingChangeRef.current(isSubmitting);
    }
  }, [isDialog, isSubmitting]);

  // Prepare select options
  const countryOptions = useMemo(
    () => [
      { value: 0, label: t('restaurants.selectCountry') },
      ...countries.map((country) => ({ value: country.id, label: country.name })),
    ],
    [countries, t]
  );

  const cityOptions = useMemo(
    () => [
      { value: 0, label: t('restaurants.selectCity') },
      ...filteredCities.map((city) => ({ value: city.id, label: city.name })),
    ],
    [filteredCities, t]
  );

  const districtOptions = useMemo(
    () => [
      { value: 0, label: t('restaurants.selectDistrict') },
      ...filteredDistricts.map((district) => ({ value: district.id, label: district.name })),
    ],
    [filteredDistricts, t]
  );

  const restaurantTypeOptions = useMemo(
    () => [
      { value: 0, label: t('restaurants.selectType') },
      ...restaurantTypes.map((type) => ({ value: type.id, label: type.name })),
    ],
    [restaurantTypes, t]
  );

  const priceSegmentOptions = useMemo(
    () => [
      { value: 0, label: t('restaurants.selectSegment') },
      ...priceSegments.map((segment) => ({ value: segment.id, label: segment.name })),
    ],
    [priceSegments, t]
  );

  const menuTypeOptions = useMemo(
    () => [
      { value: 0, label: t('restaurants.selectType') },
      ...menuTypes.map((type) => ({ value: type.id, label: type.name })),
    ],
    [menuTypes, t]
  );

  const integrationTypeOptions = useMemo(
    () => [
      { value: 0, label: t('restaurants.selectType') },
      ...integrationTypes.map((type) => ({ value: type.id, label: type.name })),
    ],
    [integrationTypes, t]
  );

  const isLoading = isFetchingRestaurant || isFetchingDictionaries;
  const error = fetchError?.message || submitError;

  if (isLoading) {
    return <LoadingOverlay loading={true} message={t('common.loadingData')} />;
  }

  const formContent = (
    <>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <Typography variant="h6" gutterBottom>
            {t('restaurants.basicInfo')}
          </Typography>

          <Grid container spacing={2}>
            <Grid size={12}>
              <FormField
                name="name"
                control={control}
                label={t('restaurants.name')}
                type="text"
                required
                disabled={isSubmitting}
              />
            </Grid>

            <Grid size={12}>
              <FormField
                name="crmUrl"
                control={control}
                label={t('restaurants.crmUrl')}
                type="text"
                required
                disabled={isSubmitting}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <FormField
                name="countryId"
                control={control}
                label={t('restaurants.country')}
                type="select"
                options={countryOptions}
                required
                disabled={isSubmitting}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <FormField
                name="cityId"
                control={control}
                label={t('restaurants.city')}
                type="select"
                options={cityOptions}
                required
                disabled={isSubmitting || selectedCountryId === 0}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <FormField
                name="districtId"
                control={control}
                label={t('restaurants.district')}
                type="select"
                options={districtOptions}
                required
                disabled={isSubmitting || selectedCityId === 0}
              />
            </Grid>

            <Grid size={12}>
              <FormField
                name="address"
                control={control}
                label={t('restaurants.address')}
                type="text"
                required
                disabled={isSubmitting}
              />
            </Grid>

            <Grid size={12}>
              <Typography variant="subtitle2" gutterBottom>
                {t('restaurants.location')} *
              </Typography>
              <LocationPicker
                lat={currentLat}
                lng={currentLng}
                onChange={handleLocationChange}
                onAddressChange={handleAddressChange}
                onLocationMetadataChange={handleLocationMetadataChange}
                cities={cities}
                districts={districts}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <FormField
                name="typeId"
                control={control}
                label={t('restaurants.type')}
                type="select"
                options={restaurantTypeOptions}
                required
                disabled={isSubmitting}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <FormField
                name="priceSegmentId"
                control={control}
                label={t('restaurants.priceSegment')}
                type="select"
                options={priceSegmentOptions}
                required
                disabled={isSubmitting}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <FormField
                name="menuTypeId"
                control={control}
                label={t('restaurants.menuType')}
                type="select"
                options={menuTypeOptions}
                required
                disabled={isSubmitting}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <FormField
                name="integrationTypeId"
                control={control}
                label={t('restaurants.integrationType')}
                type="select"
                options={integrationTypeOptions}
                required
                disabled={isSubmitting}
              />
            </Grid>

            <Grid size={12}>
              <FormField
                name="adminEmail"
                control={control}
                label={t('restaurants.adminEmail')}
                type="email"
                required
                disabled={isSubmitting}
              />
            </Grid>
          </Grid>

          <ConnectionDataFields
            control={control}
            isEditMode={isEditMode}
            changePassword={changePassword}
            onChangePasswordToggle={handleChangePasswordToggle}
            disabled={isSubmitting}
          />

          <Divider sx={{ my: 3 }} />

          <FormField
            name="blocked"
            control={control}
            label={t('common.blocked')}
            type="switch"
            disabled={isSubmitting}
          />

          {!isDialog && (
            <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                loading={isSubmitting}
              >
                {t('common.save')}
              </Button>
              <Button
                variant="outlined"
                onClick={handleCancel}
                disabled={isSubmitting}
              >
                {t('common.cancel')}
              </Button>
            </Box>
          )}
        </Box>
    </>
  );

  if (isDialog) {
    return <>{formContent}</>;
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        {isEditMode ? t('restaurants.editing') : t('restaurants.creating')}
      </Typography>

      <Paper sx={{ p: 3, mt: 3 }}>
        {formContent}
      </Paper>
    </Box>
  );
};
