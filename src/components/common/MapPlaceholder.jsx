import React, { useState } from 'react';
import { MapPin, Navigation, Compass, Layers, CheckCircle2 } from 'lucide-react';
import Button from './Button';

/**
 * Interactive Map Placeholder Component for Citizen Issue Reporting
 */
export default function MapPlaceholder({
  location = '12.9716° N, 77.5946° E',
  address = '',
  onLocationChange,
  className = '',
}) {
  const [isLocating, setIsLocating] = useState(false);
  const [currentCoords, setCurrentCoords] = useState(location || '12.9716° N, 77.5946° E');

  const presetLocations = [
    { coords: '12.9716° N, 77.5946° E', name: '4th Main Crossroad, Sector 7' },
    { coords: '12.9625° N, 77.6381° E', name: 'Gate 2, Rosewood Colony, Indiranagar' },
    { coords: '12.9780° N, 77.6408° E', name: '2nd Avenue, Sector 12, Municipal Zone' },
    { coords: '12.9812° N, 77.6015° E', name: 'Central Vegetable Market Junction' },
  ];

  const handleAutoDetect = () => {
    setIsLocating(true);
    setTimeout(() => {
      // Pick a random location or geolocate
      const randomLoc = presetLocations[Math.floor(Math.random() * presetLocations.length)];
      setCurrentCoords(randomLoc.coords);
      onLocationChange?.(randomLoc.coords, randomLoc.name);
      setIsLocating(false);
    }, 600);
  };

  return (
    <div
      className={`card ${className}`.trim()}
      style={{
        overflow: 'hidden',
        border: '1.5px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
      }}
    >
      {/* Map Header Toolbar */}
      <div
        style={{
          padding: '12px 16px',
          backgroundColor: '#F8FAFC',
          borderBottom: '1px solid var(--color-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '10px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Compass size={18} color="var(--color-primary-600)" />
          <span style={{ fontSize: '13.5px', fontWeight: '700', color: 'var(--color-text-main)' }}>
            Location Pinpoint & Geotagging
          </span>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleAutoDetect}
          loading={isLocating}
          iconStart={<Navigation size={14} />}
          style={{ fontSize: '12.5px', padding: '6px 12px' }}
        >
          Auto-Detect GPS
        </Button>
      </div>

      {/* Stylized Map Viewport Canvas */}
      <div
        style={{
          position: 'relative',
          height: '200px',
          backgroundColor: '#E2E8F0',
          backgroundImage: `
            linear-gradient(rgba(226, 232, 240, 0.7) 1.5px, transparent 1.5px),
            linear-gradient(90deg, rgba(226, 232, 240, 0.7) 1.5px, transparent 1.5px),
            radial-gradient(circle at 50% 50%, #E0F2FE 0%, #DBEAFE 100%)
          `,
          backgroundSize: '30px 30px, 30px 30px, 100% 100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'crosshair',
        }}
        onClick={handleAutoDetect}
        title="Click to place location pin"
      >
        {/* Simulated Road Lines */}
        <div
          style={{
            position: 'absolute',
            width: '100%',
            height: '14px',
            backgroundColor: '#CBD5E1',
            transform: 'rotate(-12deg)',
            opacity: 0.7,
          }}
        />
        <div
          style={{
            position: 'absolute',
            width: '14px',
            height: '100%',
            backgroundColor: '#CBD5E1',
            transform: 'rotate(18deg)',
            opacity: 0.7,
          }}
        />

        {/* Center Animated Location Pin */}
        <div
          style={{
            position: 'relative',
            zIndex: 2,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            animation: 'bounce 2s infinite',
          }}
        >
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              backgroundColor: '#EF4444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              boxShadow: '0 4px 14px rgba(239, 68, 68, 0.5)',
              border: '3px solid #FFFFFF',
            }}
          >
            <MapPin size={22} />
          </div>
          <div
            style={{
              width: '14px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: 'rgba(0, 0, 0, 0.25)',
              marginTop: '4px',
              filter: 'blur(1px)',
            }}
          />
        </div>

        {/* Floating Map Layers Pill */}
        <div
          style={{
            position: 'absolute',
            bottom: '12px',
            right: '12px',
            backgroundColor: 'rgba(255, 255, 255, 0.92)',
            backdropFilter: 'blur(4px)',
            padding: '4px 10px',
            borderRadius: 'var(--radius-full)',
            fontSize: '11px',
            fontWeight: '600',
            color: 'var(--color-text-muted)',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
          }}
        >
          <Layers size={12} />
          <span>Interactive Map (Simulator)</span>
        </div>
      </div>

      {/* Map Footer Information */}
      <div
        style={{
          padding: '12px 16px',
          backgroundColor: '#FFFFFF',
          fontSize: '13px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '8px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <MapPin size={15} color="var(--color-primary-600)" />
          <span style={{ color: 'var(--color-text-muted)' }}>Coordinates:</span>
          <strong style={{ color: 'var(--color-text-main)' }}>{currentCoords}</strong>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#16A34A', fontSize: '12px', fontWeight: '600' }}>
          <CheckCircle2 size={14} />
          <span>Geotag Active</span>
        </div>
      </div>
    </div>
  );
}
