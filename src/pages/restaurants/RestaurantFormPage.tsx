import { useEffect, useMemo, useCallback, useRef, forwardRef, useImperativeHandle } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller, type FieldErrors } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Box, Paper, Typography, Divider, Grid, InputAdornment } from '@mui/material';
import { useTranslation } from 'react-i18next';

// API
import { restaurantsApi } from '../../api/endpoints';

// Atoms
import Button from '../../components/ui/atoms/Button';
import TextField from '../../components/ui/atoms/TextField';
import Checkbox from '../../components/ui/atoms/Checkbox';

// Molecules
import FormField from '../../components/ui/molecules/FormField';
import LoadingOverlay from '../../components/ui/molecules/LoadingOverlay';

// Restaurant components
import { LocationPicker } from '../../components/restaurants/LocationPicker';
import { ConnectionDataFields } from '../../components/restaurants/ConnectionDataFields';

// Hooks
import { useFetch, useFormSubmit, useRestaurantDictionaries } from '../../hooks';

// Utils
import { logger } from '../../utils/logger';
import { scrollToFirstError } from '../../utils/scrollToFirstError';
import { useAppSnackbar } from '../../providers/AppSnackbarProvider';
import { getDisplayName } from '../../utils/dictionaryUtils';

const createRestaurantSchema = (t: (key: string) => string) => z.object({
  name: z.object({
    ARM: z.string().min(1, t('validation.nameRequired')),
    RUS: z.string().min(1, t('validation.nameRequired')),
    ENG: z.string().min(1, t('validation.nameRequired')),
  }),
  crmUrl: z.string().url(t('validation.url')).refine(val => val.includes('.'), t('validation.url')),
  countryId: z.string().min(1, t('validation.selectCountry')),
  cityId: z.string().min(1, t('validation.selectCity')),
  districtId: z.string().min(1, t('validation.selectDistrict')),
  legalAddress: z.string().min(1, t('validation.legalAddressRequired')),
  tin: z.string()
    .min(1, t('validation.tinRequired'))
    .min(8, t('validation.tinLength'))
    .max(8, t('validation.tinMaxLength'))
    .regex(/^\d+$/, t('validation.tinDigitsOnly')),
  lat: z.number(),
  lng: z.number(),
  typeId: z.array(z.string()).min(1, t('validation.selectRestaurantType')),
  priceSegmentId: z.array(z.string()).min(1, t('validation.selectPriceSegment')),
  menuTypeId: z.array(z.string()).min(1, t('validation.selectMenuType')),
  integrationTypeId: z.string().min(1, t('validation.selectIntegrationType')),
  adminEmail: z.string().email(t('validation.email')),
  adminUsername: z.string().min(1, t('validation.usernameRequired')),
  adminPassword: z.string(),
  adminChangePassword: z.boolean(),
  connectionData: z.object({
    host: z.string().min(1, t('validation.hostRequired')).refine(val => val.includes('.'), t('validation.url')),
    port: z.number().min(1, t('validation.portRequired')),
    username: z.string().min(1, t('validation.usernameRequired')),
    password: z.string(),
    changePassword: z.boolean(),
  }).superRefine((data, ctx) => {
    // Password is required if changePassword is true
    if (data.changePassword) {
      if (!data.password || data.password.length < 6) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t('validation.passwordMinLength'),
          path: ['password'],
        });
      } else {
        const hasLetter = /[a-zA-Z]/.test(data.password);
        const hasNumber = /[0-9]/.test(data.password);
        if (!hasLetter || !hasNumber) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t('validation.passwordComplexity'),
            path: ['password'],
          });
        }
      }
    }
  }),
  isBlocked: z.boolean(),
}).superRefine((data, ctx) => {
  // Admin password is required if adminChangePassword is true
  if (data.adminChangePassword) {
    if (!data.adminPassword || data.adminPassword.length < 6) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: t('validation.passwordMinLength'),
        path: ['adminPassword'],
      });
    } else {
      const hasLetter = /[a-zA-Z]/.test(data.adminPassword);
      const hasNumber = /[0-9]/.test(data.adminPassword);
      if (!hasLetter || !hasNumber) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t('validation.passwordComplexity'),
          path: ['adminPassword'],
        });
      }
    }
  }
});

type RestaurantFormValues = z.infer<ReturnType<typeof createRestaurantSchema>>;

export interface RestaurantFormHandle {
  submit: () => void;
}

interface RestaurantFormPageProps {
  onClose?: () => void;
  restaurantId?: string;
  isDialog?: boolean;
  onSubmittingChange?: (isSubmitting: boolean) => void;
}

export const RestaurantFormPage = forwardRef<RestaurantFormHandle, RestaurantFormPageProps>(function RestaurantFormPage(
  { onClose, restaurantId, isDialog = false, onSubmittingChange },
  ref
) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id: routeId } = useParams<{ id: string }>();
  const id = restaurantId || routeId;
  const isEditMode = !!id;
  const isInitialLoadRef = useRef(true);
  const prevCountryIdRef = useRef<string>('');
  const prevCityIdRef = useRef<string>('');
  const restaurantHashRef = useRef<string | undefined>(undefined);

  const { showError, showSuccess } = useAppSnackbar();
  const { isSubmitting, handleSubmit: handleFormSubmit } = useFormSubmit<RestaurantFormValues>({ onError: showError });

  // Create schema with translations
  const restaurantSchema = useMemo(() => createRestaurantSchema(t), [t]);

  // React Hook Form
  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RestaurantFormValues>({
    resolver: zodResolver(restaurantSchema),
    mode: 'onBlur',
    defaultValues: {
      name: { ARM: '', RUS: '', ENG: '' },
      crmUrl: '',
      countryId: '',
      cityId: '',
      districtId: '',
      legalAddress: '',
      tin: '',
      lat: 40.1792, // Default: Yerevan
      lng: 44.4991,
      typeId: [],
      priceSegmentId: [],
      menuTypeId: [],
      integrationTypeId: '',
      adminEmail: '',
      adminUsername: '',
      adminPassword: '',
      adminChangePassword: !isEditMode,
      connectionData: {
        host: '',
        port: 0,
        username: '',
        password: '',
        changePassword: !isEditMode,
      },
      isBlocked: false,
    },
  });

  // Watch form values
  const selectedCountryId = watch('countryId');
  const selectedCityId = watch('cityId');
  const adminChangePassword = watch('adminChangePassword');
  const changePassword = watch('connectionData.changePassword');
  const currentLat = watch('lat');
  const currentLng = watch('lng');
  const currentTypeId = watch('typeId') || [];
  const currentPriceSegmentId = watch('priceSegmentId') || [];
  const currentMenuTypeId = watch('menuTypeId') || [];
  const currentIntegrationTypeId = watch('integrationTypeId');

  // Fetch restaurant data in edit mode
  const {
    data: restaurant,
    loading: isFetchingRestaurant,
    error: fetchError,
  } = useFetch(
    async () => {
      if (!isEditMode || !id) return null;
      try {
        return await restaurantsApi.getById(id);
      } catch (error) {
        logger.error('Error loading restaurant', error as Error, { restaurantId: id });
        return null;
      }
    },
    [id, isEditMode]
  );

  // Fetch dictionaries and locations
  const { data: dictionaries, loading: isFetchingDictionaries } = useRestaurantDictionaries();

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
      // Store hash for optimistic locking
      restaurantHashRef.current = restaurant.hash;

      // Store initial values BEFORE resetting form to prevent cascade
      prevCountryIdRef.current = String(restaurant.countryId);
      prevCityIdRef.current = String(restaurant.cityId);

      reset({
        name: restaurant.name,
        crmUrl: restaurant.crmUrl,
        countryId: String(restaurant.countryId),
        cityId: String(restaurant.cityId),
        districtId: String(restaurant.districtId),
        legalAddress: restaurant.legalAddress,
        tin: restaurant.tin,
        lat: restaurant.lat,
        lng: restaurant.lng,
        typeId: Array.isArray(restaurant.typeId) ? restaurant.typeId.map(String) : [],
        priceSegmentId: Array.isArray(restaurant.priceSegmentId) ? restaurant.priceSegmentId.map(String) : [],
        menuTypeId: Array.isArray(restaurant.menuTypeId) ? restaurant.menuTypeId.map(String) : [],
        integrationTypeId: String(restaurant.integrationTypeId),
        adminEmail: restaurant.adminEmail,
        adminUsername: restaurant.adminUsername,
        adminPassword: '',
        adminChangePassword: false,
        connectionData: {
          host: restaurant.connectionData.host,
          port: restaurant.connectionData.port,
          username: restaurant.connectionData.username,
          password: '',
          changePassword: false,
        },
        isBlocked: restaurant.isBlocked,
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
    if (selectedCountryId) {
      const currentCityId = watch('cityId');
      if (currentCityId) {
        const cityExists = filteredCities.some((c) => c.id === currentCityId);
        if (!cityExists) {
          setValue('cityId', '');
          setValue('districtId', '');
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
    if (selectedCityId) {
      const currentDistrictId = watch('districtId');
      if (currentDistrictId) {
        const districtExists = filteredDistricts.some((d) => d.id === currentDistrictId);
        if (!districtExists) {
          setValue('districtId', '');
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
            legalAddress: formData.legalAddress,
            tin: formData.tin,
            lat: formData.lat,
            lng: formData.lng,
            typeId: formData.typeId,
            priceSegmentId: formData.priceSegmentId,
            menuTypeId: formData.menuTypeId,
            integrationTypeId: formData.integrationTypeId,
            adminEmail: formData.adminEmail,
            adminUsername: formData.adminUsername,
            adminChangePassword: formData.adminChangePassword,
            ...(isEditMode && !formData.adminChangePassword
              ? {}
              : { adminPassword: formData.adminPassword || '' }),
            connectionData: {
              host: formData.connectionData.host,
              port: Number(formData.connectionData.port),
              username: formData.connectionData.username,
              changePassword: formData.connectionData.changePassword,
              ...(isEditMode && !formData.connectionData.changePassword
                ? {}
                : { password: formData.connectionData.password || '' }),
            },
            isBlocked: formData.isBlocked,
          };

          console.log(`Restaurant ${isEditMode ? 'update' : 'create'} data:`, submitData);

          // Include hash for optimistic locking in edit mode
          if (isEditMode && restaurantHashRef.current) {
            submitData.hash = restaurantHashRef.current;
          }

          if (isEditMode && id) {
            await restaurantsApi.update(id, submitData);
          } else {
            await restaurantsApi.create(submitData);
          }
        },
        () => {
          showSuccess(t(isEditMode ? 'common.updatedSuccessfully' : 'common.createdSuccessfully'));
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

  const handleLocationMetadataChange = useCallback(
    (metadata: { city?: string; district?: string; cityId?: string; districtId?: string }) => {
      // Update form fields with matched IDs
      if (metadata.cityId) {
        // Find the matched city to get its country
        const matchedCity = cities.find(c => c.id === metadata.cityId);
        if (matchedCity) {
          // Update refs to prevent cascade reset
          prevCountryIdRef.current = matchedCity.countryId;
          prevCityIdRef.current = metadata.cityId;

          // Set country first
          setValue('countryId', matchedCity.countryId);
          // Then set city
          setValue('cityId', metadata.cityId);
        }

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
    [setValue, districts, cities]
  );

  const handleChangePasswordToggle = useCallback(
    (value: boolean) => {
      setValue('connectionData.changePassword', value);
    },
    [setValue]
  );

  const handleAdminChangePasswordToggle = useCallback(
    (value: boolean) => {
      setValue('adminChangePassword', value);
    },
    [setValue]
  );

  const onInvalid = useCallback((errors: FieldErrors<RestaurantFormValues>) => {
    scrollToFirstError(errors);
  }, []);

  useImperativeHandle(ref, () => ({
    submit: () => {
      handleSubmit(onSubmit, onInvalid)();
    },
  }), [handleSubmit, onSubmit, onInvalid]);

  const submittingChangeRef = useRef(onSubmittingChange);
  submittingChangeRef.current = onSubmittingChange;
  useEffect(() => {
    if (isDialog && submittingChangeRef.current) {
      submittingChangeRef.current(isSubmitting);
    }
  }, [isDialog, isSubmitting]);

  useEffect(() => {
    if (fetchError) showError(fetchError.message);
  }, [fetchError, showError]);

  // Prepare select options
  const countryOptions = useMemo(
    () => [
      { value: '', label: t('restaurants.selectCountry') },
      ...countries.map((country) => ({ value: String(country.id), label: country.name })),
    ],
    [countries, t]
  );

  const cityOptions = useMemo(
    () => [
      { value: '', label: t('restaurants.selectCity') },
      ...filteredCities.map((city) => ({ value: String(city.id), label: city.name })),
    ],
    [filteredCities, t]
  );

  const districtOptions = useMemo(
    () => [
      { value: '', label: t('restaurants.selectDistrict') },
      ...filteredDistricts.map((district) => ({ value: String(district.id), label: district.name })),
    ],
    [filteredDistricts, t]
  );

  const restaurantTypeOptions = useMemo(
    () =>
      restaurantTypes
        .filter((type) => !type.isBlocked || currentTypeId.includes(String(type.id)))
        .map((type) => ({ value: String(type.id), label: getDisplayName(type.name) })),
    [restaurantTypes, currentTypeId]
  );

  const priceSegmentOptions = useMemo(
    () =>
      priceSegments
        .filter((segment) => !segment.isBlocked || currentPriceSegmentId.includes(String(segment.id)))
        .map((segment) => ({ value: String(segment.id), label: getDisplayName(segment.name) })),
    [priceSegments, currentPriceSegmentId]
  );

  const menuTypeOptions = useMemo(
    () =>
      menuTypes
        .filter((type) => !type.isBlocked || currentMenuTypeId.includes(String(type.id)))
        .map((type) => ({ value: String(type.id), label: getDisplayName(type.name) })),
    [menuTypes, currentMenuTypeId]
  );

  const integrationTypeOptions = useMemo(
    () =>
      integrationTypes
        .filter((type) => !type.isBlocked || currentIntegrationTypeId === String(type.id))
        .map((type) => ({
          value: String(type.id),
          label: getDisplayName(type.name),
        })),
    [integrationTypes, currentIntegrationTypeId]
  );

  const isLoading = isFetchingRestaurant || isFetchingDictionaries;

  if (isLoading) {
    return <LoadingOverlay loading={true} message={t('common.loadingData')} />;
  }

  const formContent = (
    <>
      <Box component="form" onSubmit={handleSubmit(onSubmit, onInvalid)} noValidate autoComplete="off">
        <Typography variant="h6" gutterBottom>
          {t('restaurants.basicInfo')}
        </Typography>

        <Grid container spacing={2}>
          <Grid size={12}>
            {/* Multilingual Name Inputs */}
            <Box>
              <Typography variant="caption" sx={{ mb: 1, display: 'block', color: 'text.secondary' }}>
                {t('restaurants.name')} *
              </Typography>

              {/* Armenian */}
              <Box sx={{ mb: 1.5 }}>
                <Controller
                  name="name.ARM"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label=""
                      type="text"
                      error={!!(errors as any)?.name?.ARM}
                      helperText={(errors as any)?.name?.ARM?.message}
                      required
                      disabled={isSubmitting}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Box
                              component="span"
                              sx={{
                                fontSize: '1.5rem',
                                lineHeight: 1,
                                display: 'flex',
                                alignItems: 'center',
                              }}
                            >
                              🇦🇲
                            </Box>
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                />
              </Box>

              {/* English */}
              <Box sx={{ mb: 1.5 }}>
                <Controller
                  name="name.ENG"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label=""
                      type="text"
                      error={!!(errors as any)?.name?.ENG}
                      helperText={(errors as any)?.name?.ENG?.message}
                      required
                      disabled={isSubmitting}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Box
                              component="span"
                              sx={{
                                fontSize: '1.5rem',
                                lineHeight: 1,
                                display: 'flex',
                                alignItems: 'center',
                              }}
                            >
                              🇺🇸
                            </Box>
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                />
              </Box>

              {/* Russian */}
              <Controller
                name="name.RUS"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label=""
                    type="text"
                    error={!!(errors as any)?.name?.RUS}
                    helperText={(errors as any)?.name?.RUS?.message}
                    required
                    disabled={isSubmitting}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Box
                            component="span"
                            sx={{
                              fontSize: '1.5rem',
                              lineHeight: 1,
                              display: 'flex',
                              alignItems: 'center',
                            }}
                          >
                            🇷🇺
                          </Box>
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              />
            </Box>
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
              disabled={isSubmitting || !selectedCountryId}
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
              disabled={isSubmitting || !selectedCityId}
            />
          </Grid>

          <Grid size={12}>
            <Typography variant="subtitle2" gutterBottom>
              {t('restaurants.location')}
            </Typography>
            <LocationPicker
              lat={currentLat}
              lng={currentLng}
              onChange={handleLocationChange}
              onLocationMetadataChange={handleLocationMetadataChange}
              cities={cities}
              districts={districts}
              countries={countries}
              selectedCountryId={selectedCountryId}
              selectedCityId={selectedCityId}
              selectedDistrictId={watch('districtId')}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <FormField
              name="typeId"
              control={control}
              label={t('restaurants.type')}
              type="multiselect"
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
              type="multiselect"
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
              type="multiselect"
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

          <Grid size={12}>
            <FormField
              name="adminUsername"
              control={control}
              label={t('restaurants.adminUsername')}
              type="text"
              required
              disabled={isSubmitting}
            />
          </Grid>

          {isEditMode && (
            <Grid size={12}>
              <Checkbox
                checked={adminChangePassword}
                onChange={handleAdminChangePasswordToggle}
                label={t('restaurants.changeAdminPassword')}
                disabled={isSubmitting}
              />
            </Grid>
          )}

          <Grid size={12}>
            <FormField
              name="adminPassword"
              control={control}
              label={t('restaurants.adminPassword')}
              type="password"
              required={!isEditMode || adminChangePassword}
              disabled={isSubmitting || (isEditMode && !adminChangePassword)}
              autoComplete="new-password"
            />
          </Grid>

          <Grid size={12}>
            <FormField
              name="legalAddress"
              control={control}
              label={t('restaurants.legalAddress')}
              type="text"
              required
              disabled={isSubmitting}
            />
          </Grid>

          <Grid size={12}>
            <FormField
              name="tin"
              control={control}
              label={t('restaurants.tin')}
              type="text"
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
          name="isBlocked"
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
});
