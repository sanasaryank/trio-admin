import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import { Box, Typography, TextField, InputAdornment, IconButton, CircularProgress } from '@mui/material';
import { Search as SearchIcon, Close as CloseIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
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
 * Shared state for rate limiting Nominatim API requests
 */
let lastGeocodingTime = 0;

/**
 * Respect Nominatim rate limit (1 request per second)
 */
const respectRateLimit = async () => {
  const now = Date.now();
  const timeSinceLastRequest = now - lastGeocodingTime;
  if (timeSinceLastRequest < 1000) {
    await new Promise(resolve => setTimeout(resolve, 1000 - timeSinceLastRequest));
  }
  lastGeocodingTime = Date.now();
};

interface GeocodingResult {
  lat: number;
  lng: number;
  display_name: string;
}

/**
 * Geocode address to coordinates using Nominatim API returning multiple results
 */
const forwardGeocode = async (query: string): Promise<GeocodingResult[]> => {
  try {
    await respectRateLimit();
    
    // Add country code hint for better results if needed, but keeping it general for now
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=10`,
      {
        headers: {
          'Accept-Language': 'hy',
          'User-Agent': 'TrioSuperAdmin/1.0.0 (contact: admin@trio.am)',
        },
      }
    );

    if (!response.ok) return [];
    const data = await response.json();
    if (!data || data.length === 0) return [];

    return data.map((item: any) => ({
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
      display_name: item.display_name,
    }));
  } catch (error) {
    logger.error('Forward geocoding failed', error as Error);
    return [];
  }
};

/**
 * Reverse geocode coordinates to get address and location metadata using Nominatim API
 * Note: May fail due to CORS restrictions in development (localhost)
 */
const reverseGeocode = async (
  lat: number,
  lng: number
): Promise<{
  address: string | null;
  city: string | null;
  district: string | null;
}> => {
  try {
    await respectRateLimit();

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
    const { t } = useTranslation();
    const markerRef = useRef<L.Marker>(null);
    const searchContainerRef = useRef<HTMLDivElement>(null);
    
    // Use default center (Yerevan) if coordinates are 0,0 or invalid
    const isValidCoordinates = lat !== 0 && lng !== 0 && lat !== null && lng !== null;
    const initialPosition: [number, number] = isValidCoordinates ? [lat, lng] : DEFAULT_CENTER;
    
    const [position, setPosition] = useState<[number, number]>(initialPosition);
    const [isGeocoding, setIsGeocoding] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [searchResults, setSearchResults] = useState<GeocodingResult[]>([]);
    const [showResults, setShowResults] = useState(false);

    // Update position when props change
    useEffect(() => {
      const isValid = lat !== 0 && lng !== 0 && lat !== null && lng !== null;
      setPosition(isValid ? [lat, lng] : DEFAULT_CENTER);
    }, [lat, lng]);

    // Close results when clicking outside
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
          setShowResults(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    /**
     * Normalize location name for comparison
     */
    const normalizeLocationName = (name: string): string => {
      return name
        .toLowerCase()
        .trim()
        .replace(/\s*-\s*/g, ' ')
        .replace(/\s+/g, ' ');
    };

    /**
     * Check if two location names match
     */
    const namesMatch = (name1: string, name2: string): boolean => {
      const normalized1 = normalizeLocationName(name1);
      const normalized2 = normalizeLocationName(name2);

      if (normalized1 === normalized2) return true;

      const words1 = normalized1.split(' ').filter((w) => w.length > 0);
      const words2 = normalized2.split(' ').filter((w) => w.length > 0);

      if (words1.length !== words2.length || words1.length === 0) return false;

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

        if (cityName) {
          const matchedCity = cities.find((c) => namesMatch(c.name, cityName));
          matchedCityId = matchedCity?.id;
        }

        if (districtName) {
          if (matchedCityId) {
            const matchedDistrict = districts.find(
              (d) => d.cityId === matchedCityId && namesMatch(d.name, districtName)
            );
            matchedDistrictId = matchedDistrict?.id;
          }
          
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
     * Handle result selection
     */
    const handleSelectResult = useCallback((result: GeocodingResult) => {
      setPosition([result.lat, result.lng]);
      onChange(result.lat, result.lng);
      updateAddress(result.lat, result.lng);
      setSearchResults([]);
      setShowResults(false);
      setSearchQuery(result.display_name);
    }, [onChange, updateAddress]);

    /**
     * Handle address search
     */
    const handleSearch = useCallback(async () => {
      if (!searchQuery.trim()) return;

      setIsSearching(true);
      setShowResults(false);

      const results = await forwardGeocode(searchQuery);

      if (results.length === 1) {
        handleSelectResult(results[0]);
      } else if (results.length > 1) {
        setSearchResults(results);
        setShowResults(true);
      } else {
        setSearchResults([]);
        setShowResults(false);
      }

      setIsSearching(false);
    }, [searchQuery, handleSelectResult]);

    /**
     * Handle key press in search field (Enter to search)
     */
    const handleKeyPress = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleSearch();
      }
    };

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
        {/* Address Search */}
        <Box ref={searchContainerRef} sx={{ mb: 2, position: 'relative' }}>
          <TextField
              fullWidth
              variant="outlined"
              size="small"
              placeholder={t('restaurants.enterAddress')}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (showResults) setShowResults(false);
              }}
              onKeyPress={handleKeyPress}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    {isSearching ? (
                      <CircularProgress size={20} />
                    ) : (
                      <>
                        {searchQuery && (
                          <IconButton size="small" onClick={() => {
                            setSearchQuery('');
                            setSearchResults([]);
                            setShowResults(false);
                          }}>
                            <CloseIcon fontSize="small" />
                          </IconButton>
                        )}
                      </>
                    )}
                  </InputAdornment>
                ),
              }}
            />
            
            {showResults && searchResults.length > 0 && (
              <Box
                sx={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  zIndex: 1000,
                  mt: 0.5,
                  bgcolor: 'background.paper',
                  boxShadow: 3,
                  borderRadius: 1,
                  maxHeight: 300,
                  overflowY: 'auto',
                }}
              >
                {searchResults.map((result, index) => (
                  <Box
                    key={index}
                    onClick={() => handleSelectResult(result)}
                    sx={{
                      p: 1.5,
                      cursor: 'pointer',
                      '&:hover': { bgcolor: 'action.hover' },
                      borderBottom: index < searchResults.length - 1 ? '1px solid' : 'none',
                      borderColor: 'divider',
                    }}
                  >
                    <Typography variant="body2">{result.display_name}</Typography>
                  </Box>
                ))}
              </Box>
            )}
        </Box>

        <MapContainer
          center={position}
          zoom={13}
          style={{ height: '400px', width: '100%', borderRadius: '8px' }}
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
        
        <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <Typography variant="body2" color="text.secondary">
            {t('common.coordinates')}: {coordinatesText}
            {isGeocoding && ` (${t('common.loading')}...)`}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {t('restaurants.locationPickerHint')}
          </Typography>
        </Box>
      </Box>
    );
  }
);

LocationPicker.displayName = 'LocationPicker';
