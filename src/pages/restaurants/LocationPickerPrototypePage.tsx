/**
 * PROTOTYPE — not production code.
 *
 * Question: Which Google Maps location-selection layout is clearest inside the
 * restaurant form? Three variants are switchable with ?variant=A|B|C.
 * It loads the real Maps JavaScript API only when a restricted browser key is configured.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowBack,
  ArrowForward,
  DragIndicator,
  MyLocation,
} from '@mui/icons-material';
import {
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { env } from '../../config/env';

type Variant = 'A' | 'B' | 'C';

const variants: Array<{ key: Variant; name: string }> = [
  { key: 'A', name: 'Search-first split view' },
  { key: 'B', name: 'Map-first confirmation' },
  { key: 'C', name: 'Compact form field' },
];

const initialLocations = [
  { name: 'Republic Square', address: 'Hanrapetutyan St, Yerevan', lat: 40.1772, lng: 44.5126 },
  { name: 'Cascade Complex', address: '10 Tamanyan St, Yerevan', lat: 40.1911, lng: 44.5154 },
  { name: 'Dalma Garden Mall', address: '3 Tsitsernakaberd Hwy, Yerevan', lat: 40.1859, lng: 44.4722 },
];

type LocationValue = { name: string; address: string; lat: number; lng: number };

type GoogleWindow = Window & {
  google?: { maps?: { Map: new (element: HTMLElement, options: object) => GoogleMap; Marker: new (options: object) => GoogleMarker; event: { clearInstanceListeners: (instance: object) => void } } };
};
type GoogleMap = { setCenter: (center: object) => void; addListener: (event: string, callback: (event: { latLng?: { lat: () => number; lng: () => number } }) => void) => void };
type GoogleMarker = { setPosition: (position: object) => void; addListener: (event: string, callback: () => void) => void; getPosition: () => { lat: () => number; lng: () => number } | undefined };
type PlacePrediction = { toPlace: () => { fetchFields: (options: { fields: string[] }) => Promise<void>; formattedAddress?: string; displayName?: string; location?: { lat: () => number; lng: () => number } } };

let mapsScript: Promise<void> | undefined;

function loadGoogleMaps() {
  if (mapsScript) return mapsScript;
  mapsScript = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[data-google-maps-prototype]');
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('Google Maps failed to load.')));
      return;
    }
    const script = document.createElement('script');
    script.dataset.googleMapsPrototype = 'true';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(env.googleMapsApiKey)}&libraries=places&v=weekly`;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Google Maps failed to load.'));
    document.head.appendChild(script);
  });
  return mapsScript;
}

function GoogleLocationMap({ height, location, onLocationChange }: { height: number | string; location: LocationValue; onLocationChange: (location: LocationValue) => void }) {
  const mapElement = useRef<HTMLDivElement>(null);
  const autocompleteElement = useRef<HTMLDivElement>(null);
  const locationRef = useRef(location);
  const onLocationChangeRef = useRef(onLocationChange);
  const [error, setError] = useState<string>();

  useEffect(() => {
    locationRef.current = location;
    onLocationChangeRef.current = onLocationChange;
  }, [location, onLocationChange]);

  useEffect(() => {
    if (!env.googleMapsApiKey) return;
    let disposed = false;
    let marker: GoogleMarker | undefined;
    let map: GoogleMap | undefined;
    const setCoordinates = (lat: number, lng: number, details?: Partial<LocationValue>) => {
      if (disposed) return;
      marker?.setPosition({ lat, lng });
      map?.setCenter({ lat, lng });
      onLocationChangeRef.current({ ...locationRef.current, ...details, lat, lng });
    };
    void loadGoogleMaps().then(async () => {
      const googleMaps = (window as GoogleWindow).google?.maps;
      if (!googleMaps || !mapElement.current || !autocompleteElement.current) throw new Error('Google Maps did not initialize.');
      const initialLocation = locationRef.current;
      map = new googleMaps.Map(mapElement.current, { center: { lat: initialLocation.lat, lng: initialLocation.lng }, zoom: 15, streetViewControl: false, mapTypeControl: false });
      marker = new googleMaps.Marker({ map, position: { lat: initialLocation.lat, lng: initialLocation.lng }, draggable: true });
      map.addListener('click', event => {
        const position = event.latLng;
        if (position) setCoordinates(position.lat(), position.lng(), { name: 'Pinned location', address: `${position.lat().toFixed(6)}, ${position.lng().toFixed(6)}` });
      });
      marker.addListener('dragend', () => {
        const position = marker?.getPosition();
        if (position) setCoordinates(position.lat(), position.lng(), { name: 'Pinned location', address: `${position.lat().toFixed(6)}, ${position.lng().toFixed(6)}` });
      });

      const placesLibrary = await (googleMaps as unknown as { importLibrary: (name: string) => Promise<{ PlaceAutocompleteElement: new () => HTMLElement }> }).importLibrary('places');
      const autocomplete = new placesLibrary.PlaceAutocompleteElement();
      autocomplete.setAttribute('placeholder', 'Search an address or place');
      autocomplete.addEventListener('gmp-select', async event => {
        const prediction = (event as CustomEvent<{ placePrediction: PlacePrediction }>).detail.placePrediction;
        const place = prediction.toPlace();
        await place.fetchFields({ fields: ['displayName', 'formattedAddress', 'location'] });
        if (!place.location) return;
        setCoordinates(place.location.lat(), place.location.lng(), { name: place.displayName ?? 'Selected place', address: place.formattedAddress ?? '' });
      });
      autocompleteElement.current.replaceChildren(autocomplete);
    }).catch(loadError => !disposed && setError(loadError instanceof Error ? loadError.message : 'Google Maps failed to load.'));
    return () => {
      disposed = true;
      if (map) (window as GoogleWindow).google?.maps?.event.clearInstanceListeners(map);
      if (marker) (window as GoogleWindow).google?.maps?.event.clearInstanceListeners(marker);
    };
  }, []); // The map is initialized once per visible prototype variant.

  if (!env.googleMapsApiKey) return <Paper variant="outlined" sx={{ p: 3, minHeight: height, display: 'grid', placeItems: 'center', textAlign: 'center' }}><Box><Typography variant="subtitle1">Google Maps key required</Typography><Typography variant="body2" color="text.secondary">Add a restricted `VITE_GOOGLE_MAPS_API_KEY` to `.env.local`, then restart `bun local`.</Typography></Box></Paper>;

  return <Box sx={{ height, minHeight: 220, position: 'relative', borderRadius: 2, overflow: 'hidden' }}><Box ref={mapElement} sx={{ height: '100%' }} /><Box ref={autocompleteElement} sx={{ position: 'absolute', top: 12, left: 12, right: 12, zIndex: 1, '& gmp-place-autocomplete': { width: 'min(480px, 100%)' } }} />{error && <Paper sx={{ position: 'absolute', inset: 16, display: 'grid', placeItems: 'center', p: 2, textAlign: 'center' }}><Typography color="error">{error}</Typography></Paper>}</Box>;
}

function LocationState({ location }: { location: LocationValue }) {
  const place = location;
  return (
    <Paper variant="outlined" sx={{ p: 1.5, bgcolor: 'grey.50' }}>
      <Typography variant="caption" color="text.secondary">Prototype state — this is what the form would receive</Typography>
      <Typography variant="body2" sx={{ fontWeight: 600 }}>{place.address}</Typography>
      <Typography component="code" variant="caption">lat: {place.lat.toFixed(6)} · lng: {place.lng.toFixed(6)}</Typography>
    </Paper>
  );
}

export function LocationPickerPrototypePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const requested = searchParams.get('variant');
  const variant: Variant = requested === 'B' || requested === 'C' ? requested : 'A';
  const [location, setLocation] = useState<LocationValue>(initialLocations[0]);

  const setVariant = useCallback((next: Variant) => {
    navigate(`/restaurants/location-picker-prototype?variant=${next}`, { replace: true });
  }, [navigate]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.matches('input, textarea, [contenteditable="true"]')) return;
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
      event.preventDefault();
      const currentIndex = variants.findIndex(item => item.key === variant);
      const offset = event.key === 'ArrowRight' ? 1 : -1;
      setVariant(variants[(currentIndex + offset + variants.length) % variants.length].key);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [setVariant, variant]);

  return (
    <Box sx={{ maxWidth: 1040, mx: 'auto', pb: 12 }}>
      <Typography variant="overline" color="warning.main">Throwaway UI prototype</Typography>
      <Typography variant="h4" gutterBottom>Restaurant location picker</Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>Three layouts for Google Maps search, coordinate capture, and map confirmation. No changes are saved.</Typography>

      {variant === 'A' && (
        <Paper sx={{ p: { xs: 2, md: 3 } }}>
          <Typography variant="h6" gutterBottom>Location</Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '360px 1fr' }, gap: 3 }}>
            <Stack spacing={1.5}><Typography variant="subtitle2">Search and choose a result on the map</Typography><LocationState location={location} /></Stack>
            <Box><GoogleLocationMap height={430} location={location} onLocationChange={setLocation} /><Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>Click map or drag the pin to refine the coordinate.</Typography></Box>
          </Box>
        </Paper>
      )}

      {variant === 'B' && (
        <Paper sx={{ overflow: 'hidden', position: 'relative' }}>
          <GoogleLocationMap height={510} location={location} onLocationChange={setLocation} />
          <Paper elevation={6} sx={{ m: { xs: 1.5, sm: 3 }, mt: -10, position: 'relative', p: 2.5 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" gap={2}><Box><Typography variant="subtitle2">Confirm pin location</Typography><Typography variant="body2" color="text.secondary">Search or position the pin on the map, then confirm.</Typography></Box><Button variant="contained" startIcon={<MyLocation />}>Use this pin</Button></Stack>
            <Divider sx={{ my: 2 }} /><LocationState location={location} />
          </Paper>
        </Paper>
      )}

      {variant === 'C' && (
        <Paper sx={{ p: { xs: 2, md: 3 } }}>
          <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ md: 'center' }} sx={{ mb: 2 }} gap={1}>
            <Box><Typography variant="h6">Restaurant address</Typography><Typography variant="body2" color="text.secondary">A compact location field that expands only when needed.</Typography></Box><Chip icon={<DragIndicator />} label="Pin is draggable" variant="outlined" />
          </Stack>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1.1fr .9fr' }, gap: 2 }}>
            <Stack spacing={2}><Typography variant="body2" color="text.secondary">Use autocomplete, click the map, or drag the pin.</Typography><LocationState location={location} /></Stack>
            <GoogleLocationMap height="100%" location={location} onLocationChange={setLocation} />
          </Box>
        </Paper>
      )}

      {import.meta.env.DEV && <PrototypeSwitcher variant={variant} onChange={setVariant} />}
    </Box>
  );
}

function PrototypeSwitcher({ variant, onChange }: { variant: Variant; onChange: (variant: Variant) => void }) {
  const currentIndex = variants.findIndex(item => item.key === variant);
  const cycle = (offset: number) => onChange(variants[(currentIndex + offset + variants.length) % variants.length].key);
  const current = variants[currentIndex];
  return (
    <Paper elevation={8} sx={{ position: 'fixed', zIndex: 1300, bottom: 24, left: '50%', transform: 'translateX(-50%)', borderRadius: 20, px: 1, py: .5, display: 'flex', alignItems: 'center', gap: 1, bgcolor: 'grey.900', color: 'common.white' }}>
      <IconButton color="inherit" aria-label="Previous prototype variant" onClick={() => cycle(-1)}><ArrowBack /></IconButton>
      <Typography variant="body2" sx={{ minWidth: 190, textAlign: 'center' }}>{current.key} — {current.name}</Typography>
      <IconButton color="inherit" aria-label="Next prototype variant" onClick={() => cycle(1)}><ArrowForward /></IconButton>
    </Paper>
  );
}
