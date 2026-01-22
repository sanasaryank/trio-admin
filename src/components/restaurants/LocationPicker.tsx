import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import { Box, Typography } from '@mui/material';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { env } from '../../config/env';
import { logger } from '../../utils/logger';

// Fix for default marker icon
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

// Yerevan center as default
const DEFAULT_CENTER: [number, number] = [
  env.mapDefaultCenter.lat,
  env.mapDefaultCenter.lng,
];

interface LocationPickerProps {
  lat: number;
  lng: number;
  onChange: (lat: number, lng: number) => void;
  onAddressChange?: (address: string) => void;
  onLocationMetadataChange?: (metadata: { city?: string; district?: string }) => void;
  cities?: Array<{ id: string; name: string }>;
  districts?: Array<{ id: string; name: string; cityId: string }>;
}

/**
 * Component for handling map click events
 */
const MapClickHandler = React.memo<{ onChange: (lat: number, lng: number) => void }>(
  ({ onChange }) => {
    useMapEvents({
      click: (e) => {
        onChange(e.latlng.lat, e.latlng.lng);
      },
    });
    return null;
  }
);

MapClickHandler.displayName = 'MapClickHandler';

/**
 * Component for updating map center when position changes
 */
const MapCenterUpdater = React.memo<{ position: [number, number] }>(({ position }) => {
  const map = useMap();

  useEffect(() => {
    map.setView(position, map.getZoom());
  }, [position, map]);

  return null;
});

MapCenterUpdater.displayName = 'MapCenterUpdater';

/**
 * Reverse geocode coordinates to get address and location metadata using Nominatim API
 * Note: May fail due to CORS restrictions in development (localhost)
 */
let lastGeocodingTime = 0;

const reverseGeocode = async (
  lat: number,
  lng: number
): Promise<{
  address: string | null;
  city: string | null;
  district: string | null;
}> => {
  try {
    // Respect Nominatim rate limit (1 request per second)
    const now = Date.now();
    const timeSinceLastRequest = now - lastGeocodingTime;
    if (timeSinceLastRequest < 1000) {
      await new Promise(resolve => setTimeout(resolve, 1000 - timeSinceLastRequest));
    }
    lastGeocodingTime = Date.now();

    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      {
        headers: {
          'Accept-Language': 'hy',
          'User-Agent': 'TrioSuperAdmin/1.0.0 (contact: admin@trio.am)',
        },
      }
    );

    if (!response.ok) {
      logger.warn('Reverse geocoding failed', { status: response.status });
      return { address: null, city: null, district: null };
    }

    const data = await response.json();

    // Build address from components
    const address = data.address;
    const parts: string[] = [];

    if (address.road) parts.push(address.road);
    if (address.house_number) parts.push(address.house_number);
    if (address.suburb || address.neighbourhood) parts.push(address.suburb || address.neighbourhood);
    if (address.city || address.town || address.village) {
      parts.push(address.city || address.town || address.village);
    }

    // Extract city (marz/province) and district
    // For Armenia: state/county = marz (e.g., "Երևան"), suburb/neighbourhood = district
    const city = address.state || address.county || address.city || address.town || address.village || null;
    const district =
      address.suburb ||
      address.neighbourhood ||
      address.quarter ||
      address.district ||
      null;

    return {
      address: parts.join(', ') || data.display_name,
      city,
      district,
    };
  } catch (error) {
    // Silently fail on CORS or network errors (common in localhost development)
    if (error instanceof TypeError && error.message.includes('fetch')) {
      logger.info('Reverse geocoding unavailable (CORS restriction)');
    } else {
      logger.error('Reverse geocoding failed', error as Error);
    }
    return { address: null, city: null, district: null };
  }
};

/**
 * LocationPicker component for selecting a location on a map
 * Uses Leaflet for map rendering and allows click/drag to set coordinates
 */
export const LocationPicker = React.memo<LocationPickerProps>(
  ({ lat, lng, onChange, onAddressChange, onLocationMetadataChange, cities, districts }) => {
    const markerRef = useRef<L.Marker>(null);
    
    // Use default center (Yerevan) if coordinates are 0,0 or invalid
    const isValidCoordinates = lat !== 0 && lng !== 0 && lat !== null && lng !== null;
    const initialPosition: [number, number] = isValidCoordinates ? [lat, lng] : DEFAULT_CENTER;
    
    const [position, setPosition] = useState<[number, number]>(initialPosition);
    const [isGeocoding, setIsGeocoding] = useState(false);

    // Update position when props change
    useEffect(() => {
      const isValid = lat !== 0 && lng !== 0 && lat !== null && lng !== null;
      setPosition(isValid ? [lat, lng] : DEFAULT_CENTER);
    }, [lat, lng]);

    /**
     * Normalize location name for comparison
     * Handles multi-word names with various separators like "Նորք Մարաշ", "Նորք-Մարաշ", "Նորք - Մարաշ"
     */
    const normalizeLocationName = (name: string): string => {
      return name
        .toLowerCase()
        .trim()
        // Normalize hyphens: replace " - " and "-" with a single space
        .replace(/\s*-\s*/g, ' ')
        // Normalize multiple spaces to single space
        .replace(/\s+/g, ' ');
    };

    /**
     * Check if two location names match
     * Handles variations in spacing and hyphenation
     */
    const namesMatch = (name1: string, name2: string): boolean => {
      const normalized1 = normalizeLocationName(name1);
      const normalized2 = normalizeLocationName(name2);

      // Exact match after normalization
      if (normalized1 === normalized2) return true;

      // Check if all words from one name appear in the other (in order)
      const words1 = normalized1.split(' ').filter((w) => w.length > 0);
      const words2 = normalized2.split(' ').filter((w) => w.length > 0);

      // Both must have the same number of words for a match
      if (words1.length !== words2.length) return false;

      // All words must match in the same order
      return words1.every((word, index) => word === words2[index]);
    };

    /**
     * Find matching city and district from the geocoded data
     */
    const findMatchingLocation = useCallback(
      (cityName: string | null, districtName: string | null) => {
        if (!cities || !districts) return { cityId: undefined, districtId: undefined };

        let matchedCityId: string | undefined;
        let matchedDistrictId: string | undefined;

        // Try to find matching city
        if (cityName) {
          const matchedCity = cities.find((c) => namesMatch(c.name, cityName));
          matchedCityId = matchedCity?.id;
        }

        // Try to find matching district
        if (districtName) {
          // First try to find district within matched city
          if (matchedCityId) {
            const matchedDistrict = districts.find(
              (d) => d.cityId === matchedCityId && namesMatch(d.name, districtName)
            );
            matchedDistrictId = matchedDistrict?.id;
          }
          
          // If not found and no city matched, search all districts
          if (!matchedDistrictId && !matchedCityId) {
            const matchedDistrict = districts.find((d) => namesMatch(d.name, districtName));
            if (matchedDistrict) {
              matchedDistrictId = matchedDistrict.id;
              matchedCityId = matchedDistrict.cityId;
            }
          }
        }

        return { cityId: matchedCityId, districtId: matchedDistrictId };
      },
      [cities, districts]
    );

    /**
     * Update address and location metadata from coordinates
     */
    const updateAddress = useCallback(
      async (lat: number, lng: number) => {
        setIsGeocoding(true);
        const result = await reverseGeocode(lat, lng);

        if (result.address && onAddressChange) {
          onAddressChange(result.address);
        }

        if (onLocationMetadataChange) {
          const { cityId, districtId } = findMatchingLocation(result.city, result.district);
          onLocationMetadataChange({
            city: result.city || undefined,
            district: result.district || undefined,
            cityId,
            districtId,
          } as any);
        }

        setIsGeocoding(false);
      },
      [onAddressChange, onLocationMetadataChange, findMatchingLocation]
    );

  /**
   * Handle marker drag end event
   */
  const handleDragEnd = useCallback(() => {
    const marker = markerRef.current;
    if (marker) {
      const newPos = marker.getLatLng();
      setPosition([newPos.lat, newPos.lng]);
      onChange(newPos.lat, newPos.lng);
      updateAddress(newPos.lat, newPos.lng);
    }
  }, [onChange, updateAddress]);

  /**
   * Handle map click event
   */
  const handleMapClick = useCallback(
    (newLat: number, newLng: number) => {
      setPosition([newLat, newLng]);
      onChange(newLat, newLng);
      updateAddress(newLat, newLng);
    },
    [onChange, updateAddress]
  );

  /**
   * Formatted coordinate string
   */
  const coordinatesText = useMemo(
    () => `${position[0].toFixed(6)}, ${position[1].toFixed(6)}`,
    [position]
  );

  return (
    <Box>
      <MapContainer
        center={position}
        zoom={13}
        style={{ height: '400px', width: '100%' }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker
          ref={markerRef}
          position={position}
          draggable={true}
          eventHandlers={{
            dragend: handleDragEnd,
          }}
        />
        <MapClickHandler onChange={handleMapClick} />
        <MapCenterUpdater position={position} />
      </MapContainer>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
        Координаты: {coordinatesText}
        {isGeocoding && ' (получение адреса...)'}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        Кликните на карту или перетащите маркер для выбора местоположения
        {onAddressChange && ' (адрес обновится автоматически)'}. Для зума используйте кнопки + / - на карте.
      </Typography>
    </Box>
  );
});

LocationPicker.displayName = 'LocationPicker';
