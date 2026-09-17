# Google Maps restaurant-location feasibility

## Decision

**Yes.** The restaurant modal can use Google Maps to search for a location,
receive its latitude/longitude, and show that location with an interactive map
and draggable marker. The recommended implementation is the current Maps
JavaScript API with the **Place Autocomplete (New) widget**, not the legacy
Autocomplete service.

Google documents that `PlaceAutocompleteElement` supplies the predictions UI;
after selection, its `PlacePrediction` converts to a `Place`, whose
`fetchFields()` call can retrieve `formattedAddress` and `location`.
`location.lat()` and `location.lng()` are the values this application needs.
The same guide supports country restriction, viewport bias/restriction, and
`establishment` type filtering. [Google: Place Autocomplete Widget](https://developers.google.com/maps/documentation/javascript/place-autocomplete-new)

## Existing project fit

The necessary form contract is already in place:

| Concern | Existing location |
| --- | --- |
| Restaurant modal | `src/components/restaurants/RestaurantFormDialog.tsx` renders `RestaurantFormPage` |
| Location UI | `src/components/restaurants/LocationPicker.tsx` |
| Stored coordinates | `lat` and `lng` are strings in `RestaurantFormPage` and restaurant types |
| Form update path | `handleLocationChange` writes `lat` and `lng` via React Hook Form |
| Existing provider | `LocationPicker` uses React Leaflet, OpenStreetMap tiles, and Nominatim |
| Environment configuration | `src/config/env.ts`; documented in `docs/ENVIRONMENT.md` |

Therefore, replacing the internals of `LocationPicker` (or adding a separate
`GoogleLocationPicker` behind a feature flag) can preserve the existing props:
`lat`, `lng`, `onChange(lat, lng)`, and optional address/metadata callbacks.
No restaurant API payload change is needed for coordinates.

## Recommended browser implementation

1. In one Google Cloud project, enable **Maps JavaScript API** and **Places API
   (New)**, attach billing, and create a browser key.
2. Add a browser-visible `VITE_GOOGLE_MAPS_API_KEY` configuration value. Vite
   embeds `VITE_*` values into the client bundle, so this is deliberately a
   restricted public browser key, never a server secret.
3. Use `@googlemaps/js-api-loader` and its dynamic imports. Configure it once
   with the key, then load the `maps` and `places` libraries only when the
   modal/picker mounts. Google recommends this promise-based loader to defer
   libraries and improve initial-page performance. [Google: Load the Maps JavaScript API](https://developers.google.com/maps/documentation/javascript/load-maps-js-api)
4. Create `new Map(element, { center, zoom })` at the saved coordinate (or the
   configured Yerevan default); create/update one marker. On map click or
   marker drag, call the existing `onChange(lat, lng)`.
5. Create `new PlaceAutocompleteElement()` above the map (or as a map control).
   On its `gmp-select` event, call:

   ```ts
   const place = placePrediction.toPlace();
   await place.fetchFields({ fields: ['formattedAddress', 'location'] });
   const { lat, lng } = place.location!;
   onChange(lat(), lng());
   onAddressChange?.(place.formattedAddress ?? '');
   map.setCenter({ lat: lat(), lng: lng() });
   marker.setPosition({ lat: lat(), lng: lng() });
   ```

   Requesting only these two fields limits the returned data and cost. The
   widget manages the autocomplete session for its selected prediction; Google
   recommends specifying only the fields needed. [Google: Autocomplete (New)
   cost guidance](https://developers.google.com/maps/documentation/places/web-service/place-autocomplete)
6. Match current regional behavior: set `includedRegionCodes` from the selected
   country and either update `locationRestriction` from the Google map bounds
   or set a sensible `locationBias`. Optionally use
   `includedPrimaryTypes: ['establishment']` only if restaurant/business search
   is desired; omit it for arbitrary street-address searches. Google recommends
   providing a nontrivial viewport/bias when possible. [Google: Place
   Autocomplete constraints](https://developers.google.com/maps/documentation/javascript/place-autocomplete-new)

Use Google Maps for both the displayed map and the Google autocomplete flow.
That avoids a confusing mixed-provider user experience and is consistent with
Google's documentation for its map-based Places integrations. Do not add a
second map below the existing Leaflet picker.

## Dependencies and implementation boundaries

- Add `@googlemaps/js-api-loader`; no React wrapper is required. It keeps the
  integration small and compatible with the app's existing React 19 setup.
- Replace the Leaflet-only map components (`MapContainer`, `TileLayer`,
  `Marker`, click/center helpers) within `LocationPicker`, or create a new
  provider-specific component and switch it at the `RestaurantFormPage` call
  site. Remove Leaflet dependencies only after no other code imports them.
- Add the key to the Zod environment schema and every relevant `.env*.example`
  / channel environment file according to the project’s documented environment
  convention. Do not commit a real key.
- Google place selection supplies a formatted address, but city/district IDs
  are application dictionary IDs. Retain or replace the existing
  `onLocationMetadataChange` matching logic deliberately; Google address
  components may need an explicit `fetchFields({ fields: ['addressComponents',
  'formattedAddress', 'location'] })` if automatic city/district selection must
  remain reliable.
- Keep map-click/drag coordinate selection as a fallback for locations that
  do not appear in autocomplete. Reverse-geocoding click/drag coordinates is a
  separate product/API decision and is not required to store latitude/longitude.

## Billing, security, and operations

- Maps JavaScript API requests require a valid API key and billing enabled;
  Places API also requires billing and an API key or OAuth token.
  [Google: Maps JavaScript API troubleshooting](https://developers.google.com/maps/documentation/javascript/troubleshooting)
  [Google: Places API usage and billing](https://developers.google.com/maps/documentation/places/web-service/usage-and-billing)
- Configure the browser key with **Website / HTTP referrer restrictions** for
  `https://admin.trio.am/*`, `https://stage.admin.trio.am/*`, and the chosen
  development origin(s), then API-restrict it to Maps JavaScript API and Places
  API (New). Prefer separate keys per application/environment. Google recommends
  one application restriction plus relevant API restrictions and warns that the
  owner is financially responsible for abuse of unrestricted keys.
  [Google: API security best practices](https://developers.google.com/maps/api-security-best-practices)
- Do not use an IP-restricted server key in this Vite client. Keep any future
  REST Geocoding/Places key server-side, separately scoped and IP-restricted.
  Google says web-service keys are not expected to be exposed to untrusted
  clients. [Google: Protect web-service API keys](https://developers.google.com/maps/api-security-best-practices#protect-web-service-api-keys)
- Set budgets, quota limits, and billing alerts before rollout; Places charges
  depend on the SKU and data fields requested. Recheck live pricing during
  approval rather than embedding a price in code or documentation.

## Acceptance checks for an implementation

1. Opening new/edit restaurant dialogs lazy-loads one Google map without
   duplicate script-loader initialization.
2. Selecting an Armenian address/place updates map center, marker, visible
   coordinates, and submitted `lat`/`lng` exactly once.
3. Country and city/district scope bias/restrict predictions as intended.
4. Clicking/dragging the marker updates and persists coordinates.
5. The key works only from approved development, stage, and production origins;
   blocked origins return the expected authorization error.
6. The picker handles missing key, network failure, and no selected place with
   a usable fallback/error state, and has tests for selection and coordinate
   propagation.

## Sources

All sources below are first-party Google Maps Platform documentation, checked
2026-08-07.

- [Place Autocomplete Widget](https://developers.google.com/maps/documentation/javascript/place-autocomplete-new)
- [Load the Maps JavaScript API](https://developers.google.com/maps/documentation/javascript/load-maps-js-api)
- [Autocomplete (New) billing and cost guidance](https://developers.google.com/maps/documentation/places/web-service/place-autocomplete)
- [Places API usage and billing](https://developers.google.com/maps/documentation/places/web-service/usage-and-billing)
- [Google Maps Platform API security best practices](https://developers.google.com/maps/api-security-best-practices)
