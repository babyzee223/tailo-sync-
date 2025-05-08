import React, { useState, useRef, useCallback } from 'react';
import { Camera, Upload, ChevronLeft, ChevronRight, X, Plus, GripHorizontal } from 'lucide-react';
import type { Photo, Annotation } from '../types';

type Props = {
  photos: Photo[];
  onPhotosChange?: (photos: Photo[]) => void;
  onNotesChange?: (notes: string) => void;
  alterationsDescription?: string;
  onAlterationsDescriptionChange?: (description: string) => void;
  annotations?: Record<string, Annotation[]>;
  onAnnotationsChange?: (photoIndex: number, annotations: Annotation[]) => void;
};

const PhotoAnnotator: React.FC<Props> = ({ 
  photos = [], 
  onPhotosChange,
  onNotesChange,
  alterationsDescription = '',
  onAlterationsDescriptionChange,
  annotations = {},
  onAnnotationsChange
}) => {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAnnotation, setSelectedAnnotation] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number; offsetX?: number; offsetY?: number } | null>(null);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handlePhotoCapture = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    const file = e.target.files?.[0];
    if (!file || !onPhotosChange) return;

    try {
      setIsLoading(true);
      const processedImage = await processImage(file);
      
      const newPhotos = [...photos];
      newPhotos.push({
        url: processedImage,
        notes: '',
        annotations: []
      });
      
      onPhotosChange(newPhotos);
      setCurrentPhotoIndex(newPhotos.length - 1);
    } catch (error) {
      console.error('Error processing photo:', error);
      alert('Failed to process photo. Please try again.');
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (cameraInputRef.current) cameraInputRef.current.value = '';
    }
  }, [photos, onPhotosChange]);

  const processImage = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          const MAX_SIZE = 1200;
          if (width > height && width > MAX_SIZE) {
            height = (height * MAX_SIZE) / width;
            width = MAX_SIZE;
          } else if (height > MAX_SIZE) {
            width = (width * MAX_SIZE) / height;
            height = MAX_SIZE;
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Failed to get canvas context'));
            return;
          }

          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);
          
          resolve(canvas.toDataURL('image/jpeg', 0.8));
        };
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  };

  const handleContainerClick = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!isAddingNote) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    if (!containerRef.current || !photos[currentPhotoIndex] || isDragging || isResizing) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const point = 'touches' in e ? e.touches[0] : e;
    const x = point.clientX - rect.left;
    const y = point.clientY - rect.top;

    const newAnnotation: Annotation = {
      id: Date.now().toString(),
      x,
      y,
      text: '',
      width: 200,
      height: 100
    };

    const updatedPhotos = [...photos];
    if (!updatedPhotos[currentPhotoIndex].annotations) {
      updatedPhotos[currentPhotoIndex].annotations = [];
    }
    updatedPhotos[currentPhotoIndex].annotations.push(newAnnotation);
    onPhotosChange?.(updatedPhotos);
    setSelectedAnnotation(newAnnotation.id);
    setIsAddingNote(false);
  }, [isAddingNote, photos, currentPhotoIndex, isDragging, isResizing, onPhotosChange]);

  const handleDragStart = useCallback((e: React.MouseEvent | React.TouchEvent, annotation: Annotation) => {
    const target = e.target as HTMLElement;
    if (target.tagName.toLowerCase() === 'textarea' || target.closest('textarea')) {
      return; // Don't start dragging if clicking on textarea or its children
    }
    
    e.preventDefault();
    e.stopPropagation();
    
    const point = 'touches' in e ? e.touches[0] : e;
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    
    setIsDragging(true);
    setSelectedAnnotation(annotation.id);
    setDragStart({
      x: point.clientX,
      y: point.clientY,
      offsetX: point.clientX - rect.left,
      offsetY: point.clientY - rect.top
    });
  }, []);

  const handleDragMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging || !dragStart || !selectedAnnotation || !containerRef.current || !onPhotosChange) return;

    e.preventDefault();
    e.stopPropagation();

    const point = 'touches' in e ? e.touches[0] : e;
    const containerRect = containerRef.current.getBoundingClientRect();
    
    const newX = point.clientX - containerRect.left - (dragStart.offsetX || 0);
    const newY = point.clientY - containerRect.top - (dragStart.offsetY || 0);

    // Update annotation position
    const updatedPhotos = [...photos];
    const currentPhoto = updatedPhotos[currentPhotoIndex];
    currentPhoto.annotations = currentPhoto.annotations.map(ann => 
      ann.id === selectedAnnotation
        ? { ...ann, x: Math.max(0, newX), y: Math.max(0, newY) }
        : ann
    );

    onPhotosChange(updatedPhotos);
  }, [isDragging, dragStart, selectedAnnotation, photos, currentPhotoIndex, onPhotosChange]);

  const handleDragEnd = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    setIsDragging(false);
    setDragStart(null);
  }, [isDragging]);

  const handleAnnotationChange = useCallback((id: string, text: string) => {
    if (!onPhotosChange) return;

    const updatedPhotos = [...photos];
    const currentPhoto = updatedPhotos[currentPhotoIndex];
    
    if (!currentPhoto.annotations) {
      currentPhoto.annotations = [];
    }

    currentPhoto.annotations = currentPhoto.annotations.map(ann =>
      ann.id === id ? { ...ann, text } : ann
    );

    onPhotosChange(updatedPhotos);
  }, [photos, currentPhotoIndex, onPhotosChange]);

  const handleDeleteAnnotation = useCallback((id: string) => {
    if (!onPhotosChange) return;

    const updatedPhotos = [...photos];
    const currentPhoto = updatedPhotos[currentPhotoIndex];
    
    if (!currentPhoto.annotations) {
      currentPhoto.annotations = [];
    }

    currentPhoto.annotations = currentPhoto.annotations.filter(ann => ann.id !== id);
    onPhotosChange(updatedPhotos);
    setSelectedAnnotation(null);
  }, [photos, currentPhotoIndex, onPhotosChange]);

  const currentPhoto = photos[currentPhotoIndex];
  const currentAnnotations = currentPhoto?.annotations || [];

  return (
    <div className="bg-gray-100 rounded-lg overflow-hidden">
      {/* Photo Actions */}
      <div className="p-4 bg-white border-b flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handlePhotoCapture}
          />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handlePhotoCapture}
          />
          <button
            type="button"
            onClick={() => cameraInputRef.current?.click()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
          >
            <Camera className="w-5 h-5 mr-2" />
            Take Photo
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center"
          >
            <Upload className="w-5 h-5 mr-2" />
            Upload
          </button>
          {photos.length > 0 && (
            <button
              type="button"
              onClick={() => setIsAddingNote(true)}
              className={`px-4 py-2 rounded-lg flex items-center ${
                isAddingNote 
                  ? 'bg-green-100 text-green-700 hover:bg-green-200'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              <Plus className="w-5 h-5 mr-2" />
              {isAddingNote ? 'Click to Place Note' : 'Add Note'}
            </button>
          )}
        </div>

        {photos.length > 0 && (
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setCurrentPhotoIndex(prev => Math.max(0, prev - 1))}
                disabled={currentPhotoIndex === 0}
                className="p-2 disabled:opacity-50 hover:bg-gray-100 rounded-lg"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-sm text-gray-600">
                {currentPhotoIndex + 1} / {photos.length}
              </span>
              <button
                type="button"
                onClick={() => setCurrentPhotoIndex(prev => Math.min(photos.length - 1, prev + 1))}
                disabled={currentPhotoIndex === photos.length - 1}
                className="p-2 disabled:opacity-50 hover:bg-gray-100 rounded-lg"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Alterations Description */}
      <div className="p-4 bg-white border-t">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Alterations Description
        </label>
        <textarea
          ref={textareaRef}
          value={alterationsDescription}
          onChange={(e) => onAlterationsDescriptionChange?.(e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter detailed description of all alterations needed..."
        />
      </div>

      {/* Photo Display */}
      <div 
        ref={containerRef}
        className={`relative ${isAddingNote ? 'cursor-crosshair' : 'cursor-default'}`}
        style={{ minHeight: '400px', touchAction: 'none' }}
        onClick={handleContainerClick}
        onMouseMove={handleDragMove}
        onMouseUp={handleDragEnd}
        onMouseLeave={handleDragEnd}
        onTouchMove={handleDragMove}
        onTouchEnd={handleDragEnd}
        onTouchCancel={handleDragEnd}
      >
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto" />
              <p className="mt-2 text-gray-600">Processing photo...</p>
            </div>
          </div>
        ) : photos.length > 0 ? (
          <div className="relative">
            <img
              src={currentPhoto.url}
              alt={`Photo ${currentPhotoIndex + 1}`}
              className="w-full h-full object-contain"
              style={{ maxHeight: '600px' }}
            />
            {currentAnnotations.map((annotation) => (
              <div
                key={annotation.id}
                style={{
                  position: 'absolute',
                  left: annotation.x,
                  top: annotation.y,
                  width: annotation.width,
                  height: annotation.height,
                  cursor: isDragging ? 'grabbing' : 'grab'
                }}
                className="bg-white shadow-lg rounded-lg p-2"
                onMouseDown={(e) => handleDragStart(e, annotation)}
                onTouchStart={(e) => handleDragStart(e, annotation)}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="cursor-move p-1">
                    <GripHorizontal className="w-4 h-4 text-gray-400" />
                  </div>
                  <button
                    onClick={() => handleDeleteAnnotation(annotation.id)}
                    className="text-red-500 hover:text-red-600 p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <textarea
                  value={annotation.text}
                  onChange={(e) => handleAnnotationChange(annotation.id, e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                  onTouchStart={(e) => e.stopPropagation()}
                  className="w-full resize-none border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Enter note..."
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <Camera className="w-12 h-12 mx-auto mb-2" />
              <p>No photos yet</p>
              <p className="text-sm mt-1">Use the buttons above to add photos</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(PhotoAnnotator);