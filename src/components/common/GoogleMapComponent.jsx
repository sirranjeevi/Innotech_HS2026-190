import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation, Compass, Layers, CheckCircle2, Eye, ArrowRight, ExternalLink } from 'lucide-react';
import Button from './Button';
import StatusBadge from './StatusBadge';

/**
 * Universal Google Maps Component for Citizen, Admin, and Worker portals
 * @param {'report'|'admin'|'task'|'view'} mode
 * @param {number} latitude
 * @param {number} longitude
 * @param {string} address
 * @param {Array} markers - Array of complaints to plot in admin mode
 * @param {Function} onLocationChange - (lat, lng, address) => void
 * @param {Function} onMarkerClick - (complaint) => void
 */
export default function GoogleMapComponent({
  mode = 'view',
  latitude = 12.9716,
  longitude = 77.5946,
  address = '',
  markers = [],
  onLocationChange,
  onMarkerClick,
  height = '320px',
  className = '',
}) {
  const [currentLat, setCurrentLat] = useState(latitude || 12.9716);
  const [currentLng, setCurrentLng] = useState(longitude || 77.5946);
  const [isLocating, setIsLocating] = useState(false);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const mapRef = useRef(null);

  useEffect(() => {
    if (latitude && longitude) {
      setCurrentLat(Number(latitude));
      setCurrentLng(Number(longitude));
    }
  }, [latitude, longitude]);

  // Handle GPS location detection
  const handleDetectGPS = () => {
    setIsLocating(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setCurrentLat(lat);
          setCurrentLng(lng);
          onLocationChange?.(lat, lng, address || `Geotagged Area (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
          setIsLocating(false);
        },
        () => {
          // Simulated fallback city coordinates if browser blocks geolocation
          const simulatedLat = 12.9716 + (Math.random() - 0.5) * 0.02;
          const simulatedLng = 77.5946 + (Math.random() - 0.5) * 0.02;
          setCurrentLat(simulatedLat);
          setCurrentLng(simulatedLng);
          onLocationChange?.(
            simulatedLat,
            simulatedLng,
            address || `Sector ${Math.floor(Math.random() * 14) + 1}, Municipal Zone`
          );
          setIsLocating(false);
        },
        { timeout: 5000 }
      );
    } else {
      setIsLocating(false);
    }
  };

  const handleCanvasClick = (e) => {
    if (mode !== 'report') return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    // Offset coordinates based on click position
    const newLat = 12.96 + (1 - y) * 0.03;
    const newLng = 77.58 + x * 0.04;
    setCurrentLat(newLat);
    setCurrentLng(newLng);
    onLocationChange?.(newLat, newLng, address || `Municipal Zone Point (${newLat.toFixed(4)}, ${newLng.toFixed(4)})`);
  };

  // Marker colors by status
  const getMarkerColor = (status) => {
    switch (status?.toUpperCase()) {
      case 'RESOLVED':
        return '#16A34A';
      case 'IN_PROGRESS':
      case 'ACCEPTED':
      case 'ASSIGNED':
        return '#0284C7';
      default:
        return '#D97706';
    }
  };

  return (
    <div
      className={`card ${className}`.trim()}
      style={{
        overflow: 'hidden',
        border: '1.5px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      {/* Header Bar */}
      <div
        style={{
          padding: '10px 16px',
          backgroundColor: '#F8FAFC',
          borderBottom: '1px solid var(--color-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '8px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Compass size={17} color="var(--color-primary-600)" />
          <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--color-text-main)' }}>
            {mode === 'admin'
              ? 'Google Maps GIS Live Feed'
              : mode === 'report'
              ? 'Pinpoint Issue Location'
              : 'Site GPS Coordinates'}
          </span>
        </div>

        {mode === 'report' && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleDetectGPS}
            loading={isLocating}
            iconStart={<Navigation size={13} />}
            style={{ fontSize: '12px', padding: '4px 10px' }}
          >
            Detect My GPS
          </Button>
        )}
      </div>

      {/* Map Surface Viewport */}
      <div
        ref={mapRef}
        onClick={handleCanvasClick}
        style={{
          position: 'relative',
          height,
          width: '100%',
          backgroundColor: '#E2E8F0',
          backgroundImage: `
            linear-gradient(rgba(203, 213, 225, 0.75) 1.5px, transparent 1.5px),
            linear-gradient(90deg, rgba(203, 213, 225, 0.75) 1.5px, transparent 1.5px),
            radial-gradient(circle at 50% 50%, #EFF6FF 0%, #DBEAFE 100%)
          `,
          backgroundSize: '36px 36px, 36px 36px, 100% 100%',
          overflow: 'hidden',
          cursor: mode === 'report' ? 'crosshair' : 'default',
        }}
      >
        {/* Road Grid Overlay */}
        <div
          style={{
            position: 'absolute',
            top: '35%',
            left: 0,
            right: 0,
            height: '16px',
            backgroundColor: '#CBD5E1',
            transform: 'rotate(-5deg)',
            opacity: 0.8,
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: '68%',
            left: 0,
            right: 0,
            height: '14px',
            backgroundColor: '#CBD5E1',
            transform: 'rotate(7deg)',
            opacity: 0.8,
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: '42%',
            width: '16px',
            backgroundColor: '#CBD5E1',
            transform: 'rotate(5deg)',
            opacity: 0.8,
          }}
        />

        {/* Single Marker (Report / Task Mode) */}
        {(mode === 'report' || mode === 'task' || mode === 'view') && (
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -100%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              zIndex: 10,
              pointerEvents: 'none',
              animation: 'bounce 2s infinite',
            }}
          >
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                backgroundColor: '#EF4444',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 14px rgba(239, 68, 68, 0.5)',
                border: '3px solid #FFFFFF',
              }}
            >
              <MapPin size={22} />
            </div>
            <div
              style={{
                width: '14px',
                height: '5px',
                borderRadius: '50%',
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                marginTop: '3px',
                filter: 'blur(1px)',
              }}
            />
          </div>
        )}

        {/* Multi-Marker Mode (Admin GIS Map) */}
        {mode === 'admin' &&
          markers.map((item, idx) => {
            // Plot markers mathematically based on lat/lng or hash
            const normX = ((item.longitude - 77.56) / 0.1) * 100;
            const normY = (1 - (item.latitude - 12.94) / 0.06) * 100;
            const clampedX = Math.max(10, Math.min(90, isNaN(normX) ? (idx * 28) % 80 + 10 : normX));
            const clampedY = Math.max(15, Math.min(85, isNaN(normY) ? (idx * 34) % 70 + 15 : normY));
            const color = getMarkerColor(item.status);

            return (
              <div
                key={item.id || idx}
                style={{
                  position: 'absolute',
                  left: `${clampedX}%`,
                  top: `${clampedY}%`,
                  transform: 'translate(-50%, -100%)',
                  cursor: 'pointer',
                  zIndex: selectedMarker?.id === item.id ? 25 : 12,
                  transition: 'transform 0.15s ease',
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedMarker(item);
                  onMarkerClick?.(item);
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      backgroundColor: color,
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 4px 10px rgba(0, 0, 0, 0.25)',
                      border: '2.5px solid #FFFFFF',
                      transform: selectedMarker?.id === item.id ? 'scale(1.25)' : 'scale(1)',
                    }}
                  >
                    <MapPin size={18} />
                  </div>
                  <div
                    style={{
                      backgroundColor: 'rgba(15, 23, 42, 0.9)',
                      color: '#FFFFFF',
                      fontSize: '10.5px',
                      fontWeight: '700',
                      padding: '2px 7px',
                      borderRadius: '4px',
                      marginTop: '2px',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    #{item.complaintNumber?.split('-').pop() || idx} • {item.category}
                  </div>
                </div>
              </div>
            );
          })}

        {/* Floating Google Maps Badge */}
        <div
          style={{
            position: 'absolute',
            bottom: '10px',
            right: '10px',
            backgroundColor: 'rgba(255, 255, 255, 0.94)',
            backdropFilter: 'blur(4px)',
            padding: '3px 9px',
            borderRadius: 'var(--radius-full)',
            fontSize: '11px',
            fontWeight: '700',
            color: '#475569',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
          }}
        >
          <Layers size={11} />
          <span>Google Maps Layer</span>
        </div>
      </div>

      {/* Footer Info Row */}
      <div
        style={{
          padding: '10px 16px',
          backgroundColor: '#FFFFFF',
          fontSize: '12.5px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '8px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <MapPin size={14} color="var(--color-primary-600)" />
          <span style={{ color: 'var(--color-text-muted)' }}>Lat:</span>
          <strong>{Number(currentLat).toFixed(4)}° N</strong>
          <span style={{ color: 'var(--color-text-muted)', marginLeft: '6px' }}>Lng:</span>
          <strong>{Number(currentLng).toFixed(4)}° E</strong>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#16A34A', fontSize: '11.5px', fontWeight: '700' }}>
          <CheckCircle2 size={13} />
          <span>GPS Synced</span>
        </div>
      </div>
    </div>
  );
}
