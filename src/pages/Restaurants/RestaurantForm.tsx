import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  FormControlLabel,
  Checkbox,
  Paper,
  Stack,
  Grid,
  MenuItem,
  Divider,
} from '@mui/material';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { MainLayout } from '@/components/Layout/MainLayout';
import { restaurantsAPI, dictionariesAPI } from '@/api/mock';
import type { RestaurantFormData, Country, City, District } from '@/types';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

/**
 * Map component with click handler
 */
function MapClickHandler({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: (e) => {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

/**
 * Restaurant create/edit form
 */
const RestaurantForm = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);

  const [changePassword, setChangePassword] = useState(false);
  const [countries, setCountries] = useState<Country[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);

  const [formData, setFormData] = useState<RestaurantFormData>({
    name: '',
    crmLink: '',
    countryId: 0,
    cityId: 0,
    districtId: 0,
    address: '',
    latitude: 55.7558,
    longitude: 37.6173,
    typeId: 0,
    priceSegmentId: 0,
    menuTypeId: 0,
    integrationTypeId: 0,
    adminEmail: '',
    connectionData: {
      host: 'localhost',
      port: 5432,
      username: 'admin',
      password: '',
    },
    blocked: false,
  });

  useEffect(() => {
    // Load dictionaries
    setCountries(dictionariesAPI.getAll('countries') as Country[]);

    if (isEdit && id) {
      const restaurant = restaurantsAPI.getById(Number(id));
      if (restaurant) {
        setFormData({
          name: restaurant.name,
          crmLink: restaurant.crmLink,
          countryId: restaurant.countryId,
          cityId: restaurant.cityId,
          districtId: restaurant.districtId,
          address: restaurant.address,
          latitude: restaurant.latitude,
          longitude: restaurant.longitude,
          typeId: restaurant.typeId,
          priceSegmentId: restaurant.priceSegmentId,
          menuTypeId: restaurant.menuTypeId,
          integrationTypeId: restaurant.integrationTypeId,
          adminEmail: restaurant.adminEmail,
          connectionData: {
            ...restaurant.connectionData,
            password: '', // Don't show existing password
          },
          blocked: restaurant.blocked,
        });
      }
    }
  }, [id, isEdit]);

  useEffect(() => {
    if (formData.countryId) {
      const countryCities = dictionariesAPI.getCitiesByCountry(formData.countryId);
      setCities(countryCities);
      if (!countryCities.find(c => c.id === formData.cityId)) {
        setFormData(prev => ({ ...prev, cityId: 0, districtId: 0 }));
      }
    } else {
      setCities([]);
      setDistricts([]);
    }
  }, [formData.countryId]);

  useEffect(() => {
    if (formData.cityId) {
      const cityDistricts = dictionariesAPI.getDistrictsByCity(formData.cityId);
      setDistricts(cityDistricts);
      if (!cityDistricts.find(d => d.id === formData.districtId)) {
        setFormData(prev => ({ ...prev, districtId: 0 }));
      }
    } else {
      setDistricts([]);
    }
  }, [formData.cityId]);

  const restaurantTypes = dictionariesAPI.getAll('restaurantTypes');
  const priceSegments = dictionariesAPI.getAll('priceSegments');
  const menuTypes = dictionariesAPI.getAll('menuTypes');
  const integrationTypes = dictionariesAPI.getAll('integrationTypes');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const dataToSubmit = { ...formData };
    if (!changePassword && isEdit) {
      // Don't update password if not changing
      const existing = restaurantsAPI.getById(Number(id));
      if (existing) {
        dataToSubmit.connectionData.password = existing.connectionData.password;
      }
    }

    if (isEdit && id) {
      restaurantsAPI.update(Number(id), dataToSubmit);
    } else {
      restaurantsAPI.create(dataToSubmit);
    }

    navigate('/restaurants');
  };

  const handleLocationSelect = (lat: number, lng: number) => {
    setFormData({ ...formData, latitude: lat, longitude: lng });
  };

  return (
    <MainLayout title={isEdit ? 'Редактирование ресторана' : 'Новый ресторан'}>
      <Typography variant="h4" gutterBottom>
        {isEdit ? 'Редактирование ресторана' : 'Новый ресторан'}
      </Typography>

      <form onSubmit={handleSubmit}>
        <Paper sx={{ p: 3, mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Основная информация
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Название"
                required
                fullWidth
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="CRM Link"
                required
                fullWidth
                value={formData.crmLink}
                onChange={(e) => setFormData({ ...formData, crmLink: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Email администратора"
                type="email"
                required
                fullWidth
                value={formData.adminEmail}
                onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.blocked}
                    onChange={(e) => setFormData({ ...formData, blocked: e.target.checked })}
                  />
                }
                label="Заблокирован"
              />
            </Grid>
          </Grid>
        </Paper>

        <Paper sx={{ p: 3, mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Местоположение
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <TextField
                select
                label="Страна"
                required
                fullWidth
                value={formData.countryId || ''}
                onChange={(e) => setFormData({ ...formData, countryId: Number(e.target.value) })}
              >
                <MenuItem value="">Выберите страну</MenuItem>
                {countries.map((country) => (
                  <MenuItem key={country.id} value={country.id}>
                    {country.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                select
                label="Город"
                required
                fullWidth
                value={formData.cityId || ''}
                onChange={(e) => setFormData({ ...formData, cityId: Number(e.target.value) })}
                disabled={!formData.countryId}
              >
                <MenuItem value="">Выберите город</MenuItem>
                {cities.map((city) => (
                  <MenuItem key={city.id} value={city.id}>
                    {city.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                select
                label="Район"
                required
                fullWidth
                value={formData.districtId || ''}
                onChange={(e) => setFormData({ ...formData, districtId: Number(e.target.value) })}
                disabled={!formData.cityId}
              >
                <MenuItem value="">Выберите район</MenuItem>
                {districts.map((district) => (
                  <MenuItem key={district.id} value={district.id}>
                    {district.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Адрес"
                required
                fullWidth
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Широта"
                type="number"
                required
                fullWidth
                value={formData.latitude}
                onChange={(e) => setFormData({ ...formData, latitude: Number(e.target.value) })}
                inputProps={{ step: 'any' }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Долгота"
                type="number"
                required
                fullWidth
                value={formData.longitude}
                onChange={(e) => setFormData({ ...formData, longitude: Number(e.target.value) })}
                inputProps={{ step: 'any' }}
              />
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ height: 400, border: '1px solid #ccc', borderRadius: 1 }}>
                <MapContainer
                  center={[formData.latitude, formData.longitude]}
                  zoom={13}
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <Marker position={[formData.latitude, formData.longitude]} />
                  <MapClickHandler onLocationSelect={handleLocationSelect} />
                </MapContainer>
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                Кликните на карту, чтобы выбрать координаты
              </Typography>
            </Grid>
          </Grid>
        </Paper>

        <Paper sx={{ p: 3, mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Характеристики
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                select
                label="Тип ресторана"
                required
                fullWidth
                value={formData.typeId || ''}
                onChange={(e) => setFormData({ ...formData, typeId: Number(e.target.value) })}
              >
                <MenuItem value="">Выберите тип</MenuItem>
                {restaurantTypes.map((type) => (
                  <MenuItem key={type.id} value={type.id}>
                    {type.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                select
                label="Ценовой сегмент"
                required
                fullWidth
                value={formData.priceSegmentId || ''}
                onChange={(e) => setFormData({ ...formData, priceSegmentId: Number(e.target.value) })}
              >
                <MenuItem value="">Выберите сегмент</MenuItem>
                {priceSegments.map((segment) => (
                  <MenuItem key={segment.id} value={segment.id}>
                    {segment.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                select
                label="Тип меню"
                required
                fullWidth
                value={formData.menuTypeId || ''}
                onChange={(e) => setFormData({ ...formData, menuTypeId: Number(e.target.value) })}
              >
                <MenuItem value="">Выберите тип меню</MenuItem>
                {menuTypes.map((type) => (
                  <MenuItem key={type.id} value={type.id}>
                    {type.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                select
                label="Тип интеграции"
                required
                fullWidth
                value={formData.integrationTypeId || ''}
                onChange={(e) => setFormData({ ...formData, integrationTypeId: Number(e.target.value) })}
              >
                <MenuItem value="">Выберите тип интеграции</MenuItem>
                {integrationTypes.map((type) => (
                  <MenuItem key={type.id} value={type.id}>
                    {type.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
        </Paper>

        <Paper sx={{ p: 3, mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Данные подключения
          </Typography>
          {isEdit && (
            <FormControlLabel
              control={
                <Checkbox
                  checked={changePassword}
                  onChange={(e) => setChangePassword(e.target.checked)}
                />
              }
              label="Сменить пароль"
              sx={{ mb: 2 }}
            />
          )}
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Host"
                required
                fullWidth
                value={formData.connectionData.host}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    connectionData: { ...formData.connectionData, host: e.target.value },
                  })
                }
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Port"
                type="number"
                required
                fullWidth
                value={formData.connectionData.port}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    connectionData: { ...formData.connectionData, port: Number(e.target.value) },
                  })
                }
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Username"
                required
                fullWidth
                value={formData.connectionData.username}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    connectionData: { ...formData.connectionData, username: e.target.value },
                  })
                }
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Password"
                type="password"
                required={!isEdit || changePassword}
                disabled={isEdit && !changePassword}
                fullWidth
                value={formData.connectionData.password}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    connectionData: { ...formData.connectionData, password: e.target.value },
                  })
                }
              />
            </Grid>
          </Grid>
        </Paper>

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 3 }}>
          <Button variant="outlined" onClick={() => navigate('/restaurants')}>
            Отмена
          </Button>
          <Button type="submit" variant="contained">
            Сохранить
          </Button>
        </Box>
      </form>
    </MainLayout>
  );
};

export default RestaurantForm;
