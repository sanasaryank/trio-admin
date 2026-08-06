// @vitest-environment jsdom
import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { I18nextProvider, initReactI18next } from 'react-i18next';
import i18n from 'i18next';

vi.mock('react-leaflet', () => ({
  MapContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TileLayer: () => null,
  Marker: () => null,
  useMapEvents: () => undefined,
  useMap: () => ({ setView: () => undefined, getZoom: () => 13 }),
}));

vi.mock('leaflet', () => ({
  default: {
    icon: () => ({}),
    Marker: { prototype: { options: {} } },
  },
}));

import { LocationPicker } from './LocationPicker';

const testI18n = i18n.createInstance();
void testI18n.use(initReactI18next).init({
  lng: 'en',
  resources: { en: { translation: {} } },
});

describe('LocationPicker', () => {
  it('renders coordinates returned as strings by the placements API', () => {
    expect(() => render(
      <I18nextProvider i18n={testI18n}>
        <LocationPicker
          lat="40.1783698"
          lng="44.5080489"
          onChange={() => undefined}
        />
      </I18nextProvider>
    )).not.toThrow();
  });
});
