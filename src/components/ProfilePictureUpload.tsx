// components/ProfilePictureUpload.tsx
'use client';

import React, { useState, useRef } from 'react';
import { Camera, Upload, X, Loader2, User, Trash2 } from 'lucide-react';
import SecureImage from './SecureImage';

interface ProfilePictureUploadProps {
  currentAvatar?: string;
  onUploadSuccess: (imageUrl: string, thumbnailUrl?: string) => void;
  onRemoveSuccess: () => void;
}

export default function ProfilePictureUpload({ 
  currentAvatar, 
  onUploadSuccess, 
  onRemoveSuccess 
}: ProfilePictureUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    setError('');

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Please upload JPEG, PNG, or WebP images only.');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB.');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    uploadFile(file);
  };

  const uploadFile = async (file: File) => {
    setIsUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/user/profile-picture', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      onUploadSuccess(data.imageUrl, data.thumbnailUrl);
      setPreview(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
      setPreview(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveAvatar = async () => {
    setIsRemoving(true);
    setError('');

    try {
      const response = await fetch('/api/user/profile-picture', {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Removal failed');
      }

      onRemoveSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Removal failed');
    } finally {
      setIsRemoving(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const clearPreview = () => {
    setPreview(null);
    setError('');
  };

  return (
    <div className="relative">
      {/* Current Avatar Display */}
      <div className="relative group">
        <div className="w-20 h-20 rounded-full overflow-hidden bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
          {isUploading ? (
            <Loader2 className="w-6 h-6 text-white animate-spin" />
          ) : preview ? (
            <img
              src={preview}
              alt="Preview"
              className="w-full h-full object-cover"
            />
          ) : currentAvatar ? (
            <SecureImage
              fileName={currentAvatar}
              alt="Profile"
              className="w-full h-full object-cover"
              fallbackIcon={<User className="w-8 h-8 text-white" />}
            />
          ) : (
            <User className="w-8 h-8 text-white" />
          )}
        </div>

        {/* Upload Overlay */}
        {!isUploading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
            <Camera className="w-5 h-5 text-white" />
          </div>
        )}

        {/* Upload Button */}
        {!isUploading && (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="absolute -bottom-1 -right-1 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full transition-colors shadow-lg"
          >
            <Camera className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            handleFileSelect(file);
          }
        }}
        className="hidden"
      />

      {/* Drop Zone (when dragging) */}
      {dragActive && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <div className="bg-gray-800 border-2 border-dashed border-blue-400 rounded-lg p-8 text-center">
            <Upload className="w-12 h-12 text-blue-400 mx-auto mb-4" />
            <p className="text-white text-lg font-medium">Drop your image here</p>
            <p className="text-gray-400 text-sm">JPEG, PNG, or WebP (max 5MB)</p>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {preview && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-white font-semibold">Preview</h3>
              <button
                onClick={clearPreview}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex justify-center mb-4">
              <img
                src={preview}
                alt="Preview"
                className="w-32 h-32 rounded-full object-cover"
              />
            </div>

            <p className="text-gray-400 text-sm text-center mb-4">
              Your image will be resized to 400x400px and optimized for web.
            </p>

            {isUploading && (
              <div className="flex items-center justify-center">
                <Loader2 className="w-5 h-5 text-blue-400 animate-spin mr-2" />
                <span className="text-gray-300">Uploading...</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Remove Avatar Button */}
      {currentAvatar && !isUploading && (
        <button
          onClick={handleRemoveAvatar}
          disabled={isRemoving}
          className="absolute -top-1 -left-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white p-1.5 rounded-full transition-colors shadow-lg text-xs"
          title="Remove profile picture"
        >
          {isRemoving ? (
            <Loader2 className="w-2.5 h-2.5 animate-spin" />
          ) : (
            <Trash2 className="w-2.5 h-2.5" />
          )}
        </button>
      )}

      {/* Error Message */}
      {error && (
        <div className="absolute top-full left-0 mt-2 p-2 bg-red-600 text-white text-xs rounded shadow-lg whitespace-nowrap z-10">
          {error}
        </div>
      )}

      {/* Drag and Drop Event Handlers */}
      <div
        className="absolute inset-0 pointer-events-none"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      />
    </div>
  );
}