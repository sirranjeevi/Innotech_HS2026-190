import React, { useState, useRef } from 'react';
import { UploadCloud, Image as ImageIcon, X, Check, Sparkles } from 'lucide-react';
import Button from './Button';

/**
 * Reusable ImageUpload Component for Issue Evidence
 */
export default function ImageUpload({
  value,
  onChange,
  label = 'Upload Image Evidence',
  helperText = 'Attach photo of the grievance (PNG, JPG, max 5MB)',
  className = '',
}) {
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState(value || null);
  const [fileName, setFileName] = useState('');
  const inputRef = useRef(null);

  // Sample preset images for quick testing
  const sampleCivicPhotos = [
    { label: 'Pothole Sample', url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80' },
    { label: 'Water Leak Sample', url: 'https://images.unsplash.com/photo-1541888946425-d0fbb180c5f2?auto=format&fit=crop&w=800&q=80' },
    { label: 'Streetlight Sample', url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80' },
  ];

  const handleFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (JPG or PNG).');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target.result;
      setPreview(result);
      setFileName(file.name);
      onChange?.(result);
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleSelectPreset = (url, name) => {
    setPreview(url);
    setFileName(name);
    onChange?.(url);
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    setPreview(null);
    setFileName('');
    if (inputRef.current) inputRef.current.value = '';
    onChange?.(null);
  };

  return (
    <div className={`form-group ${className}`.trim()}>
      {label && <label className="form-label">{label}</label>}

      {preview ? (
        <div
          style={{
            position: 'relative',
            borderRadius: 'var(--radius-md)',
            overflow: 'hidden',
            border: '1.5px solid var(--color-primary-300)',
            backgroundColor: '#0F172A',
            maxHeight: '260px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <img
            src={preview}
            alt="Evidence preview"
            style={{
              width: '100%',
              maxHeight: '260px',
              objectFit: 'cover',
              display: 'block',
            }}
          />

          <button
            type="button"
            onClick={handleRemove}
            style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              backgroundColor: 'rgba(15, 23, 42, 0.75)',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
            }}
            title="Remove photo"
          >
            <X size={16} />
          </button>

          <div
            style={{
              position: 'absolute',
              bottom: '10px',
              left: '10px',
              backgroundColor: 'rgba(15, 23, 42, 0.75)',
              color: '#FFFFFF',
              padding: '4px 10px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '12px',
              fontWeight: '500',
              backdropFilter: 'blur(4px)',
            }}
          >
            {fileName || 'Attached Photo'}
          </div>
        </div>
      ) : (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          style={{
            border: `2px dashed ${dragActive ? 'var(--color-primary)' : 'var(--color-border-strong)'}`,
            backgroundColor: dragActive ? 'var(--color-primary-50)' : 'var(--color-surface)',
            borderRadius: 'var(--radius-lg)',
            padding: '30px 20px',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all var(--transition-fast)',
          }}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />

          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-primary-50)',
              color: 'var(--color-primary-600)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px',
            }}
          >
            <UploadCloud size={26} />
          </div>

          <h5 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--color-text-main)', marginBottom: '4px' }}>
            Click to upload or drag and drop
          </h5>
          <p style={{ fontSize: '12.5px', color: 'var(--color-text-muted)', marginBottom: '14px' }}>
            {helperText}
          </p>

          {/* Quick preset selector for easy testing */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--color-text-subtle)', textTransform: 'uppercase' }}>
              Or quick test:
            </span>
            {sampleCivicPhotos.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '11.5px', padding: '3px 8px' }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelectPreset(sample.url, sample.label);
                }}
              >
                <Sparkles size={11} color="var(--color-accent-600)" />
                <span>{sample.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
