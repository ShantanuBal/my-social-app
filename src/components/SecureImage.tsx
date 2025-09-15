// components/SecureImage.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { User } from 'lucide-react';

interface SecureImageProps {
  fileName?: string;
  alt: string;
  className?: string;
  fallbackIcon?: React.ReactNode;
}

export default function SecureImage({ 
  fileName, 
  alt, 
  className = "",
  fallbackIcon 
}: SecureImageProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!fileName) {
      setImageUrl(null);
      return;
    }

    const fetchSignedUrl = async () => {
      setLoading(true);
      setError(false);
      
      try {
        const response = await fetch(`/api/user/profile-picture/${encodeURIComponent(fileName)}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch image URL');
        }
        
        const data = await response.json();
        setImageUrl(data.signedUrl);
      } catch (err) {
        console.error('Error fetching signed URL:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchSignedUrl();
  }, [fileName]);

  if (loading) {
    return (
      <div className={`bg-gray-700 animate-pulse flex items-center justify-center ${className}`}>
        <User className="w-4 h-4 text-gray-500" />
      </div>
    );
  }

  if (error || !imageUrl || !fileName) {
    return (
      <div className={`bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center ${className}`}>
        {fallbackIcon || <User className="w-4 h-4 text-white" />}
      </div>
    );
  }

  return (
    <img
      src={imageUrl}
      alt={alt}
      className={className}
      onError={() => setError(true)}
    />
  );
}