import React, { useState, useRef, useEffect } from 'react';
import { Crop, ZoomIn, ZoomOut, Check, X, AlertCircle, Sparkles, RefreshCw } from 'lucide-react';

interface ImageCropModalProps {
  isOpen: boolean;
  imageSrc: string;
  onClose: () => void;
  onCropComplete: (croppedDataUrl: string, croppedFile: File) => void;
}

export default function ImageCropModal({
  isOpen,
  imageSrc,
  onClose,
  onCropComplete,
}: ImageCropModalProps) {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [validationError, setValidationError] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
    setValidationError(null);
  }, [imageSrc, isOpen]);

  if (!isOpen || !imageSrc) return null;

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleApplyCrop = () => {
    const canvas = document.createElement('canvas');
    const targetSize = 512;
    canvas.width = targetSize;
    canvas.height = targetSize;
    const ctx = canvas.getContext('2d');

    if (!ctx || !imageRef.current) {
      setValidationError('Could not initialize canvas context for cropping.');
      return;
    }

    const img = imageRef.current;
    
    // Draw cropped square
    ctx.fillStyle = '#0a0a0c';
    ctx.fillRect(0, 0, targetSize, targetSize);

    // Calculate dimensions
    const cropBoxSize = 280;
    const imgWidth = img.naturalWidth * scale;
    const imgHeight = img.naturalHeight * scale;

    const ratio = targetSize / cropBoxSize;
    const drawX = (position.x + (cropBoxSize - imgWidth) / 2) * ratio;
    const drawY = (position.y + (cropBoxSize - imgHeight) / 2) * ratio;
    const drawW = imgWidth * ratio;
    const drawH = imgHeight * ratio;

    ctx.drawImage(img, drawX, drawY, drawW, drawH);

    const croppedDataUrl = canvas.toDataURL('image/jpeg', 0.95);

    // Convert to File object
    canvas.toBlob(
      (blob) => {
        if (blob) {
          const croppedFile = new File([blob], 'cropped_portrait.jpg', { type: 'image/jpeg' });
          onCropComplete(croppedDataUrl, croppedFile);
          onClose();
        } else {
          setValidationError('Failed to generate cropped image file.');
        }
      },
      'image/jpeg',
      0.95
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-dark-900 border border-white/10 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
              <Crop className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-white">Crop & Align Portrait</h3>
              <p className="text-xs text-neutral-400">Position face centered inside the 3D calibration frame</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {validationError && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        {/* Crop Viewport */}
        <div
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className="relative w-full h-80 rounded-xl bg-black border border-cyan-500/30 overflow-hidden flex items-center justify-center cursor-move select-none"
        >
          {/* Background image being manipulated */}
          <img
            ref={imageRef}
            src={imageSrc}
            alt="Source Portrait"
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
              transformOrigin: 'center center',
              transition: isDragging ? 'none' : 'transform 0.05s ease-out',
            }}
            className="max-w-none pointer-events-none"
            draggable={false}
          />

          {/* Mask overlay surrounding circular/square crop target */}
          <div className="absolute inset-0 pointer-events-none">
            {/* 1:1 Square Crop Target with Center Crosshairs */}
            <div className="absolute inset-0 m-auto w-64 h-64 border-2 border-cyan-400 shadow-[0_0_0_9999px_rgba(0,0,0,0.65)] rounded-2xl flex items-center justify-center">
              {/* Guides */}
              <div className="w-full h-px bg-cyan-400/25" />
              <div className="h-full w-px bg-cyan-400/25 absolute" />
              <span className="absolute bottom-2 px-2 py-0.5 rounded bg-black/80 text-[10px] text-cyan-300 font-mono border border-cyan-500/30">
                FACE CALIBRATION REGION
              </span>
            </div>
          </div>
        </div>

        {/* Zoom & Positioning Controls */}
        <div className="flex items-center justify-between gap-4 bg-white/[0.03] p-3 rounded-xl border border-white/5">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setScale((s) => Math.max(0.5, s - 0.15))}
              className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-neutral-300 hover:text-white hover:bg-white/10"
              title="Zoom Out"
            >
              <ZoomOut className="h-4 w-4" />
            </button>
            <input
              type="range"
              min="0.5"
              max="3.0"
              step="0.05"
              value={scale}
              onChange={(e) => setScale(parseFloat(e.target.value))}
              className="w-32 accent-cyan-400 cursor-pointer"
            />
            <button
              type="button"
              onClick={() => setScale((s) => Math.min(3.0, s + 0.15))}
              className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-neutral-300 hover:text-white hover:bg-white/10"
              title="Zoom In"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              setScale(1);
              setPosition({ x: 0, y: 0 });
            }}
            className="px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[11px] text-neutral-400 hover:text-white flex items-center gap-1.5"
          >
            <RefreshCw className="h-3 w-3" /> Reset
          </button>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-400 hover:text-white hover:bg-white/5 border border-white/10 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApplyCrop}
            className="px-5 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-cyan-500 to-brand-600 hover:from-cyan-400 hover:to-brand-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.3)] flex items-center gap-1.5 transition-all"
          >
            <Check className="h-3.5 w-3.5" />
            Apply Crop & Calibrate 3D
          </button>
        </div>
      </div>
    </div>
  );
}
