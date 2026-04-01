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

// ─── Types ───────────────────────────────────────────────────────────────────

interface LocationPickerProps {
  lat: number;
  lng: number;
  onChange: (lat: number, lng: number) => void;
  onAddressChange?: (address: string) => void;
  onLocationMetadataChange?: (metadata: { city?: string; district?: string }) => void;
  cities?: Array<{ id: string; name: string; countryId: string }>;
  districts?: Array<{ id: string; name: string; cityId: string }>;
  countries?: Array<{ id: string; name: string }>;
  selectedCountryId?: string;
  selectedCityId?: string;
  selectedDistrictId?: string;
}

interface GeocodingResult {
  lat: number;
  lng: number;
  display_name: string;
}

/** Bounding box returned by Nominatim: [south_lat, north_lat, west_lng, east_lng] */
interface RegionBounds {
  south: number;
  north: number;
  west: number;
  east: number;
}

// ─── Map sub-components ──────────────────────────────────────────────────────

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

const MapCenterUpdater = React.memo<{ position: [number, number] }>(({ position }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(position, map.getZoom());
  }, [position, map]);
  return null;
});
MapCenterUpdater.displayName = 'MapCenterUpdater';

// ─── Rate limit ──────────────────────────────────────────────────────────────

let lastGeocodingTime = 0;

const respectRateLimit = async () => {
  const now = Date.now();
  const timeSinceLastRequest = now - lastGeocodingTime;
  if (timeSinceLastRequest < 1000) {
    await new Promise(resolve => setTimeout(resolve, 1000 - timeSinceLastRequest));
  }
  lastGeocodingTime = Date.now();
};

// ─── Nominatim helpers ───────────────────────────────────────────────────────

const NOMINATIM_HEADERS = {
  'Accept-Language': 'hy',
  'User-Agent': 'TrioAdmin/1.0.0 (contact: admin@trio.am)',
};

/**
 * Search for addresses within an optional viewbox.
 * When `viewbox` is provided the query is the raw user input only —
 * geographic scoping is handled entirely by the bounding-box + bounded=1.
 */
const forwardGeocode = async (
  query: string,
  options?: {
    viewbox?: RegionBounds;
    countrycodes?: string;
  }
): Promise<GeocodingResult[]> => {
  try {
    await respectRateLimit();

    const params = new URLSearchParams({
      format: 'json',
      q: query,
      limit: '10',
      addressdetails: '1',
    });

    if (options?.viewbox) {
      const { west, north, east, south } = options.viewbox;
      params.append('viewbox', `${west},${north},${east},${south}`);
      params.append('bounded', '1');
    }

    if (options?.countrycodes) {
      params.append('countrycodes', options.countrycodes);
    }

    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?${params.toString()}`,
      { headers: NOMINATIM_HEADERS }
    );

    if (!res.ok) return [];
    const data = await res.json();
    if (!data?.length) return [];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
 * Geocode a region name (e.g. "Avan, Yerevan") and return its centre + bounding box.
 * The bounding box is what Nominatim considers the boundary of the place.
 */
const geocodeRegion = async (
  locationName: string,
  countrycodes?: string
): Promise<{ lat: number; lng: number; bounds: RegionBounds } | null> => {
  try {
    await respectRateLimit();

    const params = new URLSearchParams({
      format: 'json',
      q: locationName,
      limit: '1',
      addressdetails: '1',
    });

    if (countrycodes) params.append('countrycodes', countrycodes);

    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?${params.toString()}`,
      { headers: NOMINATIM_HEADERS }
    );

    if (!res.ok) return null;
    const data = await res.json();
    if (!data?.length) return null;

    const item = data[0];
    const bb = item.boundingbox; // [south, north, west, east] as strings

    return {
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
      bounds: {
        south: parseFloat(bb[0]),
        north: parseFloat(bb[1]),
        west: parseFloat(bb[2]),
        east: parseFloat(bb[3]),
      },
    };
  } catch (error) {
    logger.error('Region geocoding failed', error as Error);
    return null;
  }
};

/**
 * Reverse-geocode coordinates → address + city / district names.
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

    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      { headers: NOMINATIM_HEADERS }
    );

    if (!res.ok) {
      logger.warn('Reverse geocoding failed', { status: res.status });
      return { address: null, city: null, district: null };
    }

    const data = await res.json();
    const address = data.address;
    const parts: string[] = [];

    if (address.road) parts.push(address.road);
    if (address.house_number) parts.push(address.house_number);
    if (address.suburb || address.neighbourhood) parts.push(address.suburb || address.neighbourhood);
    if (address.city || address.town || address.village) {
      parts.push(address.city || address.town || address.village);
    }

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
    if (error instanceof TypeError && error.message.includes('fetch')) {
      logger.info('Reverse geocoding unavailable (CORS restriction)');
    } else {
      logger.error('Reverse geocoding failed', error as Error);
    }
    return { address: null, city: null, district: null };
  }
};

/**
 * Resolve the country code (ISO 3166-1 alpha-2) from a country name.
 * Handles both Armenian and English names used in the dictionary.
 */
const resolveCountryCode = (name: string | undefined): string | undefined => {
  if (!name) return undefined;
  const lower = name.toLowerCase();
  if (lower.includes('armenia') || name.includes('Հայաստան')) return 'am';
  if (lower.includes('georgia') || name.includes('Վրաստusage')) return 'ge';
  if (lower.includes('russia') || name.includes('러시다')) return 'ru';
  // Fall-through – no hard restriction for unknown countries
  return undefined;
};

// ─── LocationPicker Component ────────────────────────────────────────────────

export const LocationPicker = React.memo<LocationPickerProps>(
  ({
    lat,
    lng,
    onChange,
    onAddressChange,
    onLocationMetadataChange,
    cities,
    districts,
    countries,
    selectedCountryId,
    selectedCityId,
    selectedDistrictId,
  }) => {
    const { t } = useTranslation();
    const markerRef = useRef<L.Marker>(null);
    const searchContainerRef = useRef<HTMLDivElement>(null);

    // ── coordinate helpers ──
    const isValidCoordinates = lat !== 0 && lng !== 0 && lat !== null && lng !== null;
    const initialPosition: [number, number] = isValidCoordinates ? [lat, lng] : DEFAULT_CENTER;

    // ── local state ──
    const [position, setPosition] = useState<[number, number]>(initialPosition);
    const [isGeocoding, setIsGeocoding] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [searchResults, setSearchResults] = useState<GeocodingResult[]>([]);
    const [showResults, setShowResults] = useState(false);
    const skipNextSearchRef = useRef(false);
    const isFirstLoadRef = useRef(true);

    /**
     * Refs that store the *current* region bounds and country code.
     * Used inside `handleSearch` so the callback never captures stale values.
     */
    const regionBoundsRef = useRef<RegionBounds | null>(null);
    const countryCodeRef = useRef<string | undefined>(undefined);

    // ── sync position from props ──
    useEffect(() => {
      const isValid = lat !== 0 && lng !== 0 && lat !== null && lng !== null;
      setPosition(isValid ? [lat, lng] : DEFAULT_CENTER);
    }, [lat, lng]);

    // ── close dropdown on outside click ──
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
          setShowResults(false);
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // ── name-matching helpers ──
    const normalizeLocationName = (name: string): string =>
      name.toLowerCase().trim().replace(/\s*-\s*/g, ' ').replace(/\s+/g, ' ');

    const namesMatch = (name1: string, name2: string): boolean => {
      const n1 = normalizeLocationName(name1);
      const n2 = normalizeLocationName(name2);
      if (n1 === n2) return true;
      const w1 = n1.split(' ').filter(w => w.length > 0);
      const w2 = n2.split(' ').filter(w => w.length > 0);
      if (w1.length !== w2.length || w1.length === 0) return false;
      return w1.every((word, i) => word === w2[i]);
    };

    const findMatchingLocation = useCallback(
      (cityName: string | null, districtName: string | null) => {
        if (!cities || !districts) return { cityId: undefined, districtId: undefined };

        let matchedCityId: string | undefined;
        let matchedDistrictId: string | undefined;

        if (cityName) {
          matchedCityId = cities.find(c => namesMatch(c.name, cityName))?.id;
        }

        if (districtName) {
          if (matchedCityId) {
            matchedDistrictId = districts.find(
              d => d.cityId === matchedCityId && namesMatch(d.name, districtName)
            )?.id;
          }
          if (!matchedDistrictId && !matchedCityId) {
            const matched = districts.find(d => namesMatch(d.name, districtName));
            if (matched) {
              matchedDistrictId = matched.id;
              matchedCityId = matched.cityId;
            }
          }
        }
        return { cityId: matchedCityId, districtId: matchedDistrictId };
      },
      [cities, districts]
    );

    // ── reverse-geocode after click / drag ──
    const updateAddress = useCallback(
      async (newLat: number, newLng: number) => {
        setIsGeocoding(true);
        const result = await reverseGeocode(newLat, newLng);

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

    // ── result selection ──
    const handleSelectResult = useCallback(
      (result: GeocodingResult) => {
        setPosition([result.lat, result.lng]);
        onChange(result.lat, result.lng);
        updateAddress(result.lat, result.lng);
        setSearchResults([]);
        setShowResults(false);
        skipNextSearchRef.current = true;
        setSearchQuery(result.display_name);
      },
      [onChange, updateAddress]
    );

    // ── address search (uses refs, so deps stay stable) ──
    const handleSearch = useCallback(async (query: string) => {
      if (!query.trim() || query.length < 3) {
        setSearchResults([]);
        setShowResults(false);
        return;
      }

      setIsSearching(true);

      const results = await forwardGeocode(query, {
        viewbox: regionBoundsRef.current ?? undefined,
        countrycodes: countryCodeRef.current,
      });

      if (results.length > 0) {
        setSearchResults(results);
        setShowResults(true);
      } else {
        setSearchResults([]);
        setShowResults(false);
      }

      setIsSearching(false);
    }, []);

    // ── debounced auto-search ──
    useEffect(() => {
      const timer = setTimeout(() => {
        if (skipNextSearchRef.current) {
          skipNextSearchRef.current = false;
          return;
        }
        if (searchQuery.trim().length >= 3) {
          handleSearch(searchQuery);
        } else {
          setSearchResults([]);
          setShowResults(false);
        }
      }, 500);

      return () => clearTimeout(timer);
    }, [searchQuery, handleSearch]);

    // ── Enter key = immediate search ──
    const handleKeyPress = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleSearch(searchQuery);
      }
    };

    // ── marker drag ──
    const handleDragEnd = useCallback(() => {
      const marker = markerRef.current;
      if (marker) {
        const newPos = marker.getLatLng();
        setPosition([newPos.lat, newPos.lng]);
        onChange(newPos.lat, newPos.lng);
        updateAddress(newPos.lat, newPos.lng);
      }
    }, [onChange, updateAddress]);

    // ── map click ──
    const handleMapClick = useCallback(
      (newLat: number, newLng: number) => {
        setPosition([newLat, newLng]);
        onChange(newLat, newLng);
        updateAddress(newLat, newLng);
      },
      [onChange, updateAddress]
    );

    // ──────────────────────────────────────────────────────────────────────────
    // KEY EFFECT: when country / city / district selection changes,
    //   1. resolve the country code → stored in countryCodeRef
    //   2. geocode the most specific selection → get its bounding box
    //   3. store bounding box in regionBoundsRef
    //   4. centre the map on the resolved location
    // ──────────────────────────────────────────────────────────────────────────
    useEffect(() => {
      // On first load with valid existing coordinates, keep the position
      if (isFirstLoadRef.current) {
        isFirstLoadRef.current = false;

        // Still resolve country code + region bounds even on initial load
        const countryName = countries?.find(c => c.id === selectedCountryId)?.name;
        countryCodeRef.current = resolveCountryCode(countryName);

        if (isValidCoordinates) return; // don't pan on initial load when editing
      }

      const syncRegion = async () => {
        // Resolve human-readable names from IDs
        const countryName = countries?.find(c => c.id === selectedCountryId)?.name;
        const cityName = cities?.find(c => c.id === selectedCityId)?.name;
        const districtName = districts?.find(d => d.id === selectedDistrictId)?.name;

        // Update country code ref
        countryCodeRef.current = resolveCountryCode(countryName);

        // Build query from most-specific → least-specific
        const queryParts = [districtName, cityName, countryName].filter(Boolean);
        if (queryParts.length === 0) {
          regionBoundsRef.current = null;
          return;
        }

        const locationQuery = queryParts.join(', ');
        const region = await geocodeRegion(locationQuery, countryCodeRef.current);

        if (region) {
          regionBoundsRef.current = region.bounds;
          setPosition([region.lat, region.lng]);
          onChange(region.lat, region.lng);
        }
      };

      syncRegion();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedCountryId, selectedCityId, selectedDistrictId]);

    // ── formatted coords ──
    const coordinatesText = useMemo(
      () => `${position[0].toFixed(6)}, ${position[1].toFixed(6)}`,
      [position]
    );

    // ── render ──
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
                zIndex: 1100,
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
