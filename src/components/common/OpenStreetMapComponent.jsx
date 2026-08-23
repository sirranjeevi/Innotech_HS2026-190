import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { MapPin, Navigation, Compass, Layers, CheckCircle2 } from 'lucide-react';
import Button from './Button';

// Custom SVG Icons for OpenStreetMap Pins
const createCustomIcon = (color = '#0284C7', text = '') => {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 46" width="32" height="42">
      <defs>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="#000" flood-opacity="0.3"/>
        </filter>
      </defs>
      <path d="M18 0 C8.06 0 0 8.06 0 18 C0 31.5 18 46 18 46 C18 46 36 31.5 36 18 C36 8.06 27.94 0 18 0 Z" fill="${color}" filter="url(#shadow)"/>
      <circle cx="18" cy="18" r="8" fill="#FFFFFF"/>
      <circle cx="18" cy="18" r="4" fill="${color}"/>
    </svg>
  `;
  return L.divIcon({
    html: svg,
    className: 'custom-osm-marker',
    iconSize: [32, 42],
    iconAnchor: [16, 42],
    popupAnchor: [0, -38],
  });
};

const getStatusColor = (status) => {
  switch (status?.toUpperCase()) {
    case 'SUBMITTED':
      return '#D97706'; // Amber
    case 'VERIFIED':
      return '#2563EB'; // Blue
    case 'ASSIGNED':
      return '#4F46E5'; // Indigo
    case 'ACCEPTED':
      return '#7C3AED'; // Purple
    case 'IN_PROGRESS':
      return '#0284C7'; // Sky
    case 'RESOLVED':
      return '#16A34A'; // Green
    default:
      return '#0284C7';
  }
};

/**
 * Universal OpenStreetMap Component powered by Leaflet & Nominatim API
 */
export default function OpenStreetMapComponent({
  mode = 'single', // 'report' | 'single' | 'multi' | 'task'
  latitude = 12.9716,
  longitude = 77.5946,
  address = '',
  markers = [], // for multi mode
  onLocationChange = null,
  height = '360px',
  onMarkerClick = null,
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const activeMarkerRef = useRef(null);
  const markerGroupRef = useRef(null);

  const [currentLat, setCurrentLat] = useState(Number(latitude) || 12.9716);
  const [currentLng, setCurrentLng] = useState(Number(longitude) || 77.5946);
  const [isLocating, setIsLocating] = useState(false);
  const [geoAddress, setGeoAddress] = useState(address || '');

  // Reverse Geocode using OpenStreetMap Nominatim API
  const reverseGeocode = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        { headers: { 'Accept-Language': 'en' } }
      );
      if (response.ok) {
        const data = await response.json();
        if (data && data.display_name) {
          const shortAddr = data.display_name.split(',').slice(0, 3).join(', ');
          setGeoAddress(shortAddr);
          if (onLocationChange) {
            onLocationChange(lat, lng, shortAddr);
          }
        }
      }
    } catch (err) {
      console.warn('Nominatim reverse geocode note:', err);
    }
  };

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Avoid double initialization
    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [currentLat, currentLng],
        zoom: mode === 'multi' ? 12 : 15,
        zoomControl: true,
      });

      // Add OpenStreetMap Tile Layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;
      markerGroupRef.current = L.featureGroup().addTo(map);
    }

    const map = mapInstanceRef.current;
    const markerGroup = markerGroupRef.current;

    // Clear existing markers
    markerGroup.clearLayers();

    if (mode === 'report' || mode === 'single' || mode === 'task') {
      const pinColor = mode === 'report' ? '#0284C7' : '#16A34A';
      const marker = L.marker([currentLat, currentLng], {
        icon: createCustomIcon(pinColor),
        draggable: mode === 'report',
      }).addTo(markerGroup);

      if (mode === 'report') {
        marker.on('dragend', (e) => {
          const { lat, lng } = e.target.getLatLng();
          setCurrentLat(lat);
          setCurrentLng(lng);
          reverseGeocode(lat, lng);
        });

        map.on('click', (e) => {
          const { lat, lng } = e.latlng;
          marker.setLatLng([lat, lng]);
          setCurrentLat(lat);
          setCurrentLng(lng);
          reverseGeocode(lat, lng);
        });
      }

      if (address || geoAddress) {
        marker.bindPopup(`<strong>Location:</strong><br/>${address || geoAddress}`).openPopup();
      }

      activeMarkerRef.current = marker;
      map.setView([currentLat, currentLng], map.getZoom());
    } else if (mode === 'multi' && markers.length > 0) {
      markers.forEach((m) => {
        const lat = Number(m.latitude) || 12.9716;
        const lng = Number(m.longitude) || 77.5946;
        const markerColor = getStatusColor(m.status);

        const marker = L.marker([lat, lng], {
          icon: createCustomIcon(markerColor),
        }).addTo(markerGroup);

        const popupHtml = `
          <div style="min-width: 180px; font-family: inherit;">
            <div style="font-size: 11px; font-weight: 700; color: #64748B;">#${m.complaintNumber || m.id}</div>
            <div style="font-size: 14px; font-weight: 800; color: #0F172A; margin: 2px 0 4px;">${m.category}</div>
            <div style="font-size: 12px; color: #475569; margin-bottom: 6px;">${m.address || ''}</div>
            <div style="display: inline-block; font-size: 10.5px; font-weight: 700; padding: 2px 6px; border-radius: 4px; background: ${markerColor}20; color: ${markerColor}; border: 1px solid ${markerColor}40;">
              ${m.status}
            </div>
            ${
              onMarkerClick
                ? `<div style="margin-top: 8px;"><button id="popup-btn-${m.id}" style="width: 100%; background: #0284C7; color: white; border: none; padding: 5px 8px; border-radius: 4px; font-size: 11px; font-weight: 700; cursor: pointer;">Inspect Details</button></div>`
                : ''
            }
          </div>
        `;

        marker.bindPopup(popupHtml);

        marker.on('popupopen', () => {
          const btn = document.getElementById(`popup-btn-${m.id}`);
          if (btn && onMarkerClick) {
            btn.onclick = () => onMarkerClick(m);
          }
        });
      });

      if (markers.length > 0) {
        map.fitBounds(markerGroup.getBounds(), { padding: [40, 40] });
      }
    }

    return () => {
      // Cleanup on unmount handled gracefully
    };
  }, [mode, markers]);

  // Handle GPS Auto-detect
  const handleDetectGPS = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        setCurrentLat(lat);
        setCurrentLng(lng);
        setIsLocating(false);

        if (mapInstanceRef.current) {
          mapInstanceRef.current.setView([lat, lng], 16);
        }
        if (activeMarkerRef.current) {
          activeMarkerRef.current.setLatLng([lat, lng]);
        }

        reverseGeocode(lat, lng);
      },
      (err) => {
        console.warn('GPS detection failed:', err);
        setIsLocating(false);
        alert('Could not access GPS location. You can click on the map to place the pin.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div style={{ position: 'relative', width: '100%', borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--color-border)' }}>
      {/* Map Container */}
      <div ref={mapContainerRef} style={{ width: '100%', height }} />

      {/* Report Mode Controls Floating Bar */}
      {mode === 'report' && (
        <div
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            zIndex: 1000,
            display: 'flex',
            gap: '8px',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            padding: '6px 10px',
            borderRadius: 'var(--radius-md)',
            boxShadow: '0 2px 10px rgba(0,0,0,0.15)',
            border: '1px solid var(--color-border)',
            alignItems: 'center',
          }}
        >
          <button
            type="button"
            onClick={handleDetectGPS}
            disabled={isLocating}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'var(--color-primary-600)',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              padding: '6px 12px',
              fontSize: '12px',
              fontWeight: '700',
              cursor: 'pointer',
            }}
          >
            <Navigation size={14} />
            <span>{isLocating ? 'Locating...' : 'Use My GPS'}</span>
          </button>
        </div>
      )}

      {/* Lat / Lng Coordinate Overlay Footer */}
      <div
        style={{
          position: 'absolute',
          bottom: '8px',
          left: '8px',
          zIndex: 1000,
          backgroundColor: 'rgba(15, 23, 42, 0.85)',
          color: '#FFFFFF',
          padding: '4px 10px',
          borderRadius: 'var(--radius-sm)',
          fontSize: '11px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          backdropFilter: 'blur(4px)',
        }}
      >
        <MapPin size={12} color="#38BDF8" />
        <span>
          OSM Coords: {currentLat.toFixed(5)}, {currentLng.toFixed(5)}
        </span>
      </div>
    </div>
  );
}
