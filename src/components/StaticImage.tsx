// components/StaticImage.tsx
'use client';

import { useStaticFile } from '../hooks/useStaticFile';
import { User } from 'lucide-react';

interface StaticImageProps {
  fileName: string;
  alt: string;
  className?: string;
  fallbackClassName?: string;
  fallbackIcon?: React.ReactNode;
}

export default function StaticImage({ 
  fileName, 
  alt, 
  className = "w-32 h-32 rounded-full object-cover", 
  fallbackClassName = "w-32 h-32 rounded-full bg-gray-700 flex items-center justify-center",
  fallbackIcon = <User className="w-8 h-8 text-gray-400" />
}: StaticImageProps) {
  const { fileUrl, loading, error } = useStaticFile(fileName);

  // Debug logging
  console.log('StaticImage Debug:', {
    fileName,
    fileUrl,
    loading,
    error
  });

  if (loading) {
    return (
      <div className={fallbackClassName}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
      </div>
    );
  }

  if (error || !fileUrl) {
    console.log('Showing fallback due to:', { error, fileUrl });
    return (
      <div className={fallbackClassName}>
        {fallbackIcon}
      </div>
    );
  }

  return (
    <img
      src={fileUrl}
      alt={alt}
      className={className}
      onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
        console.error('Failed to load static image. Image src was:', fileUrl);
        console.error('Error event:', e);
        // You could set a state here to show fallback
      }}
    />
  );
}