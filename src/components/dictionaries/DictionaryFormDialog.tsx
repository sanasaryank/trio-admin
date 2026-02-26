import { useCallback, useEffect, useMemo, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, Box, Alert, CircularProgress, IconButton, InputAdornment, Typography } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';
import { dictionariesApi } from '../../api/endpoints';
import { logger } from '../../utils/logger';
import { getDictionaryFieldsConfig } from '../../utils/dictionaryUtils';
import type { DictionaryKey, DictionaryFormData, Country, City, District } from '../../types';

// Reusable components
import Button from '../ui/atoms/Button';
import TextField from '../ui/atoms/TextField';
import FormField from '../ui/molecules/FormField';
import Select from '../ui/atoms/Select';

// Reusable hooks
import useFetch from '../../hooks/useFetch';

interface DictionaryFormDialogProps {
  open: boolean;
  dictKey: DictionaryKey;
  itemId?: string;
  onClose: () => void;
  onSave: () => void;
}

const createValidationSchema = (dictKey: DictionaryKey, t: (key: string) => string) => {
  const config = getDictionaryFieldsConfig(dictKey);

  // For dictionaries, use multilingual name structure
  const isGeographicData = ['countries', 'cities', 'districts'].includes(dictKey);
  
  const nameSchema = isGeographicData 
    ? z.string().min(1, t('validation.nameRequired'))
    : z.object({
        ARM: z.string().min(1, t('validation.nameRequired')),
        RUS: z.string().min(1, t('validation.nameRequired')),
        ENG: z.string().min(1, t('validation.nameRequired')),
      });

  let schema = z.object({
    name: nameSchema,
    isBlocked: z.boolean(),
    ...(isGeographicData ? {} : { description: z.string().optional() }),
  });

  if (config.hasCountrySelector) {
    schema = schema.extend({
      countryId: z.string().min(1, t('validation.required')),
    });
  }

  if (config.hasCitySelector) {
    schema = schema.extend({
      cityId: z.number().min(1, t('validation.required')),
    });
  }

  if (config.hasPlacementFields) {
    schema = schema.extend({
      rotation: z.number().min(1, t('validation.required')),
      refreshTtl: z.number().min(1, t('validation.required')),
      noAdjacentSameAdvertiser: z.boolean(),
    });
  }

  return schema;
};

export const DictionaryFormDialog = ({
  open,
  dictKey,
  itemId,
  onClose,
  onSave,
}: DictionaryFormDialogProps) => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const isEditMode = itemId !== undefined;
  const config = useMemo(() => getDictionaryFieldsConfig(dictKey), [dictKey]);
  const isGeographicData = ['countries', 'cities', 'districts'].includes(dictKey);

  const [error, setError] = useState<string | null>(null);
  const [selectedCountryId, setSelectedCountryId] = useState<string | null>(null);

  const validationSchema = useMemo(() => createValidationSchema(dictKey, t), [dictKey, t]);
  type FormData = z.infer<typeof validationSchema>;

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(validationSchema),
    defaultValues: {
      name: isGeographicData ? '' : { ARM: '', RUS: '', ENG: '' },
      isBlocked: false,
      ...(!isGeographicData && { description: '' }),
      ...(config.hasCountrySelector && { countryId: '' }),
      ...(config.hasCitySelector && { cityId: '' }),
      ...(config.hasPlacementFields && { rotation: 30, refreshTtl: 300, noAdjacentSameAdvertiser: false }),
    } as FormData,
  });

  // Watch countryId for districts to filter cities  
  const formValues = watch();
  const watchedCountryId = 'countryId' in formValues ? String(formValues.countryId || '') : undefined;

  // Fetch countries if needed
  const { data: countries, loading: countriesLoading } = useFetch<Country[]>(
    async () => {
      if (!config.hasCountrySelector && !config.hasCitySelector) return [];
      try {
        return ((await dictionariesApi.list('countries')) as Country[]).filter((c) => !c.isBlocked);
      } catch (error) {
        logger.error('Error loading countries', error as Error, { context: 'DictionaryFormDialog' });
        return [];
      }
    },
    [open, config.hasCountrySelector, config.hasCitySelector]
  );

  // Fetch cities if needed
  const { data: cities, loading: citiesLoading } = useFetch<City[]>(
    async () => {
      if (!config.hasCitySelector) return [];
      try {
        return ((await dictionariesApi.list('cities')) as City[]).filter((c) => !c.isBlocked);
      } catch (error) {
        logger.error('Error loading cities', error as Error, { context: 'DictionaryFormDialog' });
        return [];
      }
    },
    [open, config.hasCitySelector]
  );

  // Fetch item data in edit mode
  const { data: itemData, loading: itemLoading } = useFetch(
    async () => {
      if (!isEditMode || !open) return null;
      return await dictionariesApi.getById(dictKey, itemId);
    },
    [open, isEditMode, itemId, dictKey]
  );

  const isLoading = countriesLoading || citiesLoading || itemLoading;

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (!open) {
      reset();
      setError(null);
      setSelectedCountryId(null);
    } else if (!isEditMode) {
      // Reset to default values when opening in create mode
      reset({
        name: isGeographicData ? '' : { ARM: '', RUS: '', ENG: '' },
        isBlocked: false,
        ...(!isGeographicData && { description: '' }),
        ...(config.hasCountrySelector && { countryId: '' }),
        ...(config.hasCitySelector && { cityId: '' }),
        ...(config.hasPlacementFields && { rotation: 30, refreshTtl: 300, noAdjacentSameAdvertiser: false }),
      } as FormData);
    }
  }, [open, reset, isEditMode, isGeographicData, config]);

  // Update form when item data is loaded
  useEffect(() => {
    if (itemData && isEditMode) {
      const resetData: Record<string, unknown> = {
        name: itemData.name,
        isBlocked: itemData.isBlocked,
      };
      
      // Add description for non-geographic data
      if (!isGeographicData && 'description' in itemData) {
        resetData.description = itemData.description;
      }
      
      if (config.hasCountrySelector && 'countryId' in itemData) {
        resetData.countryId = (itemData as City).countryId;
      }
      
      if (config.hasCitySelector && 'cityId' in itemData) {
        resetData.cityId = (itemData as District).cityId;
      }
      
      if (config.hasPlacementFields && 'rotation' in itemData) {
        const placement = itemData as import('../../types').Placement;
        resetData.rotation = placement.rotation;
        resetData.refreshTtl = placement.refreshTtl;
        resetData.noAdjacentSameAdvertiser = placement.noAdjacentSameAdvertiser;
      }
      
      reset(resetData);

      // Set selected country for districts
      if (config.hasCitySelector && 'cityId' in itemData && cities) {
        const city = cities.find((c) => c.id === (itemData as District).cityId);
        if (city) {
          setSelectedCountryId(city.countryId);
        }
      }
    }
  }, [itemData, isEditMode, reset, config, cities, isGeographicData]);

  // Update selected country when watchedCountryId changes
  useEffect(() => {
    if (config.hasCitySelector && watchedCountryId) {
      setSelectedCountryId(watchedCountryId);
    }
  }, [watchedCountryId, config.hasCitySelector]);

  // Submit handler
  const onSubmit = useCallback(
    async (data: FormData) => {
      try {
        const formData: Record<string, unknown> = {
          name: data.name,
          isBlocked: data.isBlocked,
        };
        
        // Add hash for updates (required by backend)
        if (isEditMode && itemData && 'hash' in itemData) {
          formData.hash = (itemData as any).hash;
        }
        
        // Add description for non-geographic data
        if (!isGeographicData && 'description' in data) {
          formData.description = data.description;
        }
        
        if (config.hasCountrySelector && 'countryId' in data) {
          formData.countryId = data.countryId;
        }
        
        if (config.hasCitySelector && 'cityId' in data) {
          formData.cityId = data.cityId;
        }
        
        if (config.hasPlacementFields && 'rotation' in data) {
          formData.rotation = data.rotation;
          formData.refreshTtl = (data as any).refreshTtl;
          formData.noAdjacentSameAdvertiser = (data as any).noAdjacentSameAdvertiser;
        }

        if (isEditMode) {
          await dictionariesApi.update(dictKey, itemId, formData as unknown as DictionaryFormData);
          enqueueSnackbar(t('common.savedSuccessfully'), { variant: 'success' });
        } else {
          await dictionariesApi.create(dictKey, formData as unknown as DictionaryFormData);
          enqueueSnackbar(t('common.createdSuccessfully'), { variant: 'success' });
        }

        onSave();
        onClose();
      } catch (err) {
        setError(err instanceof Error ? err.message : t('common.error'));
        enqueueSnackbar(t('common.error'), { variant: 'error' });
      }
    },
    [config, isEditMode, dictKey, itemId, onSave, onClose, t, enqueueSnackbar, isGeographicData, itemData]
  );

  // Country change handler for districts
  const handleCountryChange = useCallback(
    (countryId: string) => {
      setSelectedCountryId(countryId);
      // Reset city selection when country changes
      if (config.hasCitySelector) {
        setValue('cityId' as any, '');
      }
    },
    [config.hasCitySelector, setValue]
  );

  // Filtered cities based on selected country
  const filteredCities = useMemo(() => {
    if (!cities) return [];
    return selectedCountryId ? cities.filter((city) => city.countryId === selectedCountryId) : cities;
  }, [cities, selectedCountryId]);

  // Country options for select
  const countryOptions = useMemo(() => {
    if (!countries) return [];
    return countries.map((country) => ({
      value: country.id,
      label: country.name,
    }));
  }, [countries]);

  // City options for select (for cities dictionary)
  const cityOptionsForCities = useMemo(() => {
    if (!cities) return [];
    return filteredCities.map((city) => ({
      value: city.id,
      label: city.name,
    }));
  }, [filteredCities, cities]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          height: '90vh',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 3,
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
          {isEditMode ? t('common.edit') : t('dictionaries.addEntry')}
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
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <Box sx={{ flexGrow: 1, overflow: 'auto', pb: 2 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 3 }}>
            {/* Name field(s) */}
            {isGeographicData ? (
              <FormField name="name" control={control as any} label={t('dictionaries.name')} type="text" required />
            ) : (
              <>
                {/* Multilingual Name Inputs */}
                <Box>
                  <Typography variant="caption" sx={{ mb: 1, display: 'block', color: 'text.secondary' }}>
                    {t('dictionaries.name')} *
                  </Typography>
                  
                  {/* Armenian */}
                  <Box sx={{ mb: 1.5 }}>
                    <Controller
                      name={"name.ARM" as any}
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label=""
                          type="text"
                          error={!!(errors as any)?.name?.ARM}
                          helperText={(errors as any)?.name?.ARM?.message}
                          required
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
                      name={"name.ENG" as any}
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label=""
                          type="text"
                          error={!!(errors as any)?.name?.ENG}
                          helperText={(errors as any)?.name?.ENG?.message}
                          required
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
                    name={"name.RUS" as any}
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label=""
                        type="text"
                        error={!!(errors as any)?.name?.RUS}
                        helperText={(errors as any)?.name?.RUS?.message}
                        required
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

                {/* Description Field */}
                <Controller
                  name={"description" as any}
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label={t('dictionaries.description')}
                      type="text"
                      multiline
                      rows={3}
                    />
                  )}
                />
              </>
            )}

            {/* Country selector for cities */}
            {config.hasCountrySelector && (
              <Controller
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                name={'countryId' as any}
                control={control}
                render={({ field }) => (
                  <Select
                    name={field.name}
                    label={t('dictionaries.country')}
                    value={typeof field.value === 'string' ? field.value : ''}
                    onChange={(value) => {
                      field.onChange(value);
                      handleCountryChange(value as string);
                    }}
                    options={[
                      { value: '', label: t('restaurants.selectCountry') },
                      ...countryOptions,
                    ]}
                    error={!!(errors as any).countryId}
                    helperText={(errors as any).countryId?.message}
                    required
                  />
                )}
              />
            )}

            {/* City selector for districts */}
            {config.hasCitySelector && (
              <>
                {/* Country filter for districts */}
                <Select
                  name="countryFilter"
                  label={t('dictionaries.country')}
                  value={selectedCountryId || ''}
                  onChange={(value) => handleCountryChange(value as string)}
                  options={[
                    { value: '', label: t('common.all') },
                    ...countryOptions,
                  ]}
                />

                {/* City selector */}
                <Controller
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  name={'cityId' as any}
                  control={control}
                  render={({ field }) => (
                    <Select
                      name={field.name}
                      label={t('dictionaries.city')}
                      value={field.value || 0}
                      onChange={(value) => field.onChange(value)}
                      options={[
                        { value: 0, label: t('restaurants.selectCity') },
                        ...cityOptionsForCities,
                      ]}
                      error={!!(errors as any).cityId}
                      helperText={(errors as any).cityId?.message}
                      required
                    />
                  )}
                />
              </>
            )}

            {/* Placement fields */}
            {config.hasPlacementFields && (
              <>
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                <FormField 
                  name="rotation" 
                  control={control as any} 
                  label={t('dictionaries.rotation')} 
                  type="number" 
                  required 
                  helperText={t('dictionaries.rotationHelper')}
                />
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                <FormField 
                  name="refreshTtl" 
                  control={control as any} 
                  label={t('dictionaries.refreshTtl')} 
                  type="number" 
                  required 
                  helperText={t('dictionaries.refreshTtlHelper')}
                />
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                <FormField 
                  name="noAdjacentSameAdvertiser" 
                  control={control as any} 
                  label={t('dictionaries.noAdjacentSameAdvertiser')} 
                  type="switch"
                />
              </>
            )}

            {/* Blocked switch */}
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            <FormField name="isBlocked" control={control as any} label={t('common.blocked')} type="switch" />
          </Box>
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
          <Button
            variant="outlined"
            onClick={onClose}
            disabled={isSubmitting}
          >
            {t('common.cancel')}
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit(onSubmit)}
            loading={isSubmitting}
            disabled={isLoading}
          >
            {t('common.save')}
          </Button>
        </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};
