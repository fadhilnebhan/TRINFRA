'use client';

import { useEffect, useRef, useState } from 'react';
import { ExternalLink, MapPin, Loader2 } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

interface LandLocationViewerProps {
  latitude: number | null | undefined;
  longitude: number | null | undefined;
  locality?: string;
  district?: string;
  className?: string;
}

export default function LandLocationViewer({
  latitude,
  longitude,
  locality,
  district,
  className = '',
}: LandLocationViewerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [isReady, setIsReady] = useState(false);

  const hasCoords =
    latitude !== null &&
    latitude !== undefined &&
    longitude !== null &&
    longitude !== undefined &&
    Number.isFinite(latitude) &&
    Number.isFinite(longitude);

  useEffect(() => {
    let isMounted = true;

    async function initViewer() {
      if (!hasCoords || !mapContainerRef.current || mapInstanceRef.current) return;

      try {
        const L = (await import('leaflet')).default;
        if (!isMounted) return;

        const map = L.map(mapContainerRef.current, {
          center: [latitude as number, longitude as number],
          zoom: 14,
          zoomControl: true,
          scrollWheelZoom: false,
          dragging: true,
          attributionControl: true,
        });

        mapInstanceRef.current = map;

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; OpenStreetMap contributors',
        }).addTo(map);

        const customIcon = L.divIcon({
          className: 'trinfra-viewer-pin',
          html: `
            <div style="position: relative; width: 34px; height: 44px; display: flex; align-items: center; justify-content: center;">
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

        L.marker([latitude as number, longitude as number], {
          icon: customIcon,
          interactive: false,
        }).addTo(map);

        setIsReady(true);
      } catch (e) {
        console.error('Error initializing admin location viewer:', e);
      }
    }

    initViewer();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [hasCoords, latitude, longitude]);

  if (!hasCoords) {
    return (
      <div className={`p-4 rounded-xl bg-gray-50 border border-gray-200/80 text-center ${className}`}>
        <p className="text-xs text-gray-500 font-medium">
          No precise map coordinates submitted (Optional)
        </p>
        <p className="text-[11px] text-gray-400 mt-1">
          General Location: {[locality, district].filter(Boolean).join(', ') || 'Kerala'}
        </p>
      </div>
    );
  }

  const googleMapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Map Preview Box */}
      <div className="relative w-full h-[240px] rounded-xl border border-gray-200 bg-surface-alt overflow-hidden shadow-sm">
        <div
          ref={mapContainerRef}
          id="admin-land-viewer-map"
          className="w-full h-full z-0"
          style={{ minHeight: '240px' }}
        />

        {!isReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
            <Loader2 size={20} className="text-primary/60 animate-spin" />
          </div>
        )}

        {/* Read-Only Badge */}
        <div className="absolute top-2.5 left-2.5 z-[500] px-2.5 py-1 rounded-md bg-[#0E2115]/90 backdrop-blur-md text-white text-[11px] font-medium flex items-center gap-1.5 border border-[#BD9655]/40 shadow-sm">
          <MapPin size={12} className="text-[#BD9655]" />
          <span>Pinned Land Parcel</span>
        </div>
      </div>

      {/* Details & External Link Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl bg-[#0E2115]/5 border border-[#0E2115]/10 text-xs">
        <div>
          <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">
            Verified Coordinates
          </span>
          <span className="font-mono font-bold text-[#0E2115] text-[13px]">
            {latitude?.toFixed(5)}° N, {longitude?.toFixed(5)}° E
          </span>
        </div>

        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-gray-50 text-primary border border-gray-200 font-semibold shadow-sm transition-colors text-xs shrink-0 self-start sm:self-center"
        >
          <span>Open in Google Maps</span>
          <ExternalLink size={12} className="text-gray-400" />
        </a>
      </div>
    </div>
  );
}
