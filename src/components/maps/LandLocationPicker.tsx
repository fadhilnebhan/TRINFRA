'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { MapPin, Navigation, X, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { getDistrictCoordinates, KERALA_CENTER } from '@/lib/locationData';
import 'leaflet/dist/leaflet.css';

interface Coordinates {
  lat: number;
  lng: number;
}

interface LandLocationPickerProps {
  value: Coordinates | null;
  onChange: (location: Coordinates | null) => void;
  district?: string;
  className?: string;
}

export default function LandLocationPicker({
  value,
  onChange,
  district,
  className = '',
}: LandLocationPickerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const leafletModuleRef = useRef<any>(null);

  const [isReady, setIsReady] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [mapLoadError, setMapLoadError] = useState<string | null>(null);

  // Helper to create the custom TRINFRA SVG marker
  const createMarkerIcon = useCallback((L: any) => {
    return L.divIcon({
      className: 'trinfra-custom-pin',
      html: `
        <div style="position: relative; width: 34px; height: 44px; display: flex; align-items: center; justify-content: center; cursor: grab;">
          <svg width="34" height="44" viewBox="0 0 34 44" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 4px 6px rgba(14,33,21,0.35));">
            <path d="M17 2C8.716 2 2 8.716 2 17C2 28.5 17 42 17 42C17 42 32 28.5 32 17C32 8.716 25.284 2 17 2Z" fill="#0E2115" stroke="#BD9655" stroke-width="2.5"/>
            <circle cx="17" cy="17" r="6" fill="#BD9655"/>
            <circle cx="17" cy="17" r="2.5" fill="#FFFFFF"/>
          </svg>
        </div>
      `,
      iconSize: [34, 44],
      iconAnchor: [17, 42],
    });
  }, []);

  // 1. Initialize Map
  useEffect(() => {
    let isMounted = true;

    async function initMap() {
      if (!mapContainerRef.current || mapInstanceRef.current) return;

      try {
        const L = (await import('leaflet')).default;
        if (!isMounted) return;
        leafletModuleRef.current = L;

        // Determine initial view: value > district center > Kerala center
        let initialCenter = KERALA_CENTER;
        let initialZoom = 7;

        if (value && Number.isFinite(value.lat) && Number.isFinite(value.lng)) {
          initialCenter = [value.lat, value.lng];
          initialZoom = 14;
        } else if (district) {
          const districtCoords = getDistrictCoordinates(district);
          if (districtCoords) {
            initialCenter = districtCoords;
            initialZoom = 11;
          }
        }

        const map = L.map(mapContainerRef.current, {
          center: initialCenter,
          zoom: initialZoom,
          zoomControl: true,
          scrollWheelZoom: 'center',
          attributionControl: true,
        });

        mapInstanceRef.current = map;

        // Add OpenStreetMap tiles
        const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(map);

        tileLayer.on('tileerror', () => {
          // Tile error handling
          console.warn('Map tile load error notice.');
        });

        // If existing pin exists on mount, place draggable marker
        if (value && Number.isFinite(value.lat) && Number.isFinite(value.lng)) {
          const icon = createMarkerIcon(L);
          const marker = L.marker([value.lat, value.lng], {
            icon,
            draggable: true,
            autoPan: true,
          }).addTo(map);

          marker.on('dragend', () => {
            const pos = marker.getLatLng();
            onChange({
              lat: Number(pos.lat.toFixed(6)),
              lng: Number(pos.lng.toFixed(6)),
            });
          });

          markerRef.current = marker;
        }

        // Map Click / Tap handler to place/adjust pin
        map.on('click', (e: any) => {
          const { lat, lng } = e.latlng;
          const cleanLat = Number(lat.toFixed(6));
          const cleanLng = Number(lng.toFixed(6));

          if (markerRef.current) {
            markerRef.current.setLatLng([cleanLat, cleanLng]);
          } else {
            const icon = createMarkerIcon(L);
            const marker = L.marker([cleanLat, cleanLng], {
              icon,
              draggable: true,
              autoPan: true,
            }).addTo(map);

            marker.on('dragend', () => {
              const pos = marker.getLatLng();
              onChange({
                lat: Number(pos.lat.toFixed(6)),
                lng: Number(pos.lng.toFixed(6)),
              });
            });

            markerRef.current = marker;
          }

          onChange({ lat: cleanLat, lng: cleanLng });
          setGeoError(null);
        });

        setIsReady(true);
      } catch (err: any) {
        console.error('Failed to initialize interactive map:', err);
        if (isMounted) {
          setMapLoadError('Map couldn\u2019t load right now. You can continue without pinning your location.');
        }
      }
    }

    initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
      }
    };
  }, []); // Run once on mount

  // 2. Respond to District Changes (Assistance only, without setting pin)
  useEffect(() => {
    if (!mapInstanceRef.current || !district || value) return;

    const districtCoords = getDistrictCoordinates(district);
    if (districtCoords) {
      mapInstanceRef.current.flyTo(districtCoords, 11, {
        duration: 1.0,
      });
    }
  }, [district, value]);

  // 3. User-Initiated "Use My Current Location"
  const handleUseCurrentLocation = () => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    setGeoError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLocating(false);
        const { latitude, longitude } = position.coords;
        const cleanLat = Number(latitude.toFixed(6));
        const cleanLng = Number(longitude.toFixed(6));

        const L = leafletModuleRef.current;
        const map = mapInstanceRef.current;

        if (map && L) {
          map.flyTo([cleanLat, cleanLng], 15, { duration: 1.2 });

          if (markerRef.current) {
            markerRef.current.setLatLng([cleanLat, cleanLng]);
          } else {
            const icon = createMarkerIcon(L);
            const marker = L.marker([cleanLat, cleanLng], {
              icon,
              draggable: true,
              autoPan: true,
            }).addTo(map);

            marker.on('dragend', () => {
              const pos = marker.getLatLng();
              onChange({
                lat: Number(pos.lat.toFixed(6)),
                lng: Number(pos.lng.toFixed(6)),
              });
            });

            markerRef.current = marker;
          }
        }

        onChange({ lat: cleanLat, lng: cleanLng });
      },
      (err) => {
        setIsLocating(false);
        console.warn('Geolocation access error:', err.code, err.message);
        setGeoError(
          "We couldn't access your current location. You can pin the land manually on the map."
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  };

  // 4. Clear Pin Handler
  const handleClearPin = () => {
    if (markerRef.current && mapInstanceRef.current) {
      mapInstanceRef.current.removeLayer(markerRef.current);
      markerRef.current = null;
    }
    onChange(null);
    setGeoError(null);
  };

  return (
    <div className={`space-y-2.5 ${className}`}>
      {/* Map Card Container */}
      <div className="relative w-full h-[300px] sm:h-[320px] rounded-xl border border-gray-200 bg-surface-alt overflow-hidden shadow-sm group">
        {/* Map Load Error State */}
        {mapLoadError ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-gray-50 z-20">
            <AlertCircle className="text-amber-600 mb-2" size={28} />
            <p className="text-xs sm:text-sm text-gray-700 max-w-xs leading-relaxed font-medium">
              {mapLoadError}
            </p>
          </div>
        ) : (
          <>
            {/* DOM Container for Leaflet */}
            <div
              ref={mapContainerRef}
              id="trinfra-land-picker-map"
              className="w-full h-full z-0"
              style={{ minHeight: '300px' }}
              tabIndex={0}
              aria-label="Interactive Land Location Picker Map"
            />

            {/* Subtle Loading Placeholder until Leaflet mounts */}
            {!isReady && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#FBFBFA] z-10">
                <Loader2 size={24} className="text-primary/60 animate-spin mb-2" />
                <span className="text-xs text-gray-500 font-medium tracking-wide">
                  Loading interactive map…
                </span>
              </div>
            )}
          </>
        )}

        {/* Floating Top Control: Pin Status Badge & Clear Action */}
        <div className="absolute top-2.5 left-2.5 right-2.5 z-[500] flex items-center justify-between pointer-events-none">
          {value ? (
            <div className="pointer-events-auto inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0E2115]/90 backdrop-blur-md text-white border border-[#BD9655]/40 shadow-lg text-xs animate-in fade-in duration-200">
              <CheckCircle2 size={13} className="text-[#BD9655]" />
              <span className="font-medium text-[11px] sm:text-xs">
                Location pinned: <span className="font-mono text-[#BD9655]">{value.lat.toFixed(4)}°, {value.lng.toFixed(4)}°</span>
              </span>
              <button
                type="button"
                onClick={handleClearPin}
                className="ml-1 text-white/70 hover:text-white transition-colors p-0.5"
                title="Clear Pin"
                aria-label="Clear Pin"
              >
                <X size={13} />
              </button>
            </div>
          ) : (
            <div className="pointer-events-auto inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/90 backdrop-blur-md text-gray-600 border border-gray-200 shadow-sm text-[11px]">
              <MapPin size={12} className="text-[#BD9655]" />
              <span>Tap on map to pin land location</span>
            </div>
          )}

          {/* User-Initiated "Use My Location" Button (Top Right) */}
          <button
            type="button"
            onClick={handleUseCurrentLocation}
            disabled={isLocating}
            className="pointer-events-auto inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/95 hover:bg-white text-gray-700 hover:text-primary text-[11px] sm:text-xs font-semibold border border-gray-200/90 shadow-md transition-all disabled:opacity-60"
            title="Use My Current Location"
            aria-label="Use My Current Location"
          >
            {isLocating ? (
              <>
                <Loader2 size={12} className="animate-spin text-primary" />
                <span>Locating…</span>
              </>
            ) : (
              <>
                <Navigation size={12} className="text-[#BD9655]" />
                <span className="hidden sm:inline">Use My Location</span>
                <span className="sm:hidden">My Location</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Geolocation Denied / Warning Notice (Inline, Non-Blocking) */}
      {geoError && (
        <div className="flex items-start gap-2 p-2.5 rounded-lg bg-amber-50/80 border border-amber-200/80 text-amber-900 text-xs animate-in fade-in">
          <AlertCircle size={14} className="text-amber-700 shrink-0 mt-0.5" />
          <p className="leading-snug text-[11px] sm:text-xs text-amber-800">
            {geoError}
          </p>
        </div>
      )}

      {/* Helper Footer */}
      <div className="flex items-center justify-between text-[11px] text-gray-500 px-0.5">
        <span>{value ? 'Drag the pin to adjust parcel position' : 'Click anywhere on map to drop a pin'}</span>
        {value && (
          <button
            type="button"
            onClick={handleClearPin}
            className="text-red-600 hover:text-red-700 hover:underline font-medium"
          >
            Remove Pin
          </button>
        )}
      </div>
    </div>
  );
}
