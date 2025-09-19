// hooks/useStaticFile.ts
import { useState, useEffect } from 'react';

interface UseStaticFileResult {
  fileUrl: string | null;
  loading: boolean;
  error: string | null;
}

export function useStaticFile(fileName: string | null): UseStaticFileResult {
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('useStaticFile effect triggered with fileName:', fileName);
    
    if (!fileName) {
      console.log('No fileName provided, resetting state');
      setFileUrl(null);
      setLoading(false);
      setError(null);
      return;
    }

    const fetchStaticFile = async () => {
      console.log('Starting fetchStaticFile for:', fileName);
      setLoading(true);
      setError(null);

      try {
        const apiUrl = `/api/static/${encodeURIComponent(fileName)}`;
        console.log('Fetching static file from:', apiUrl);
        
        const response = await fetch(apiUrl);
        
        console.log('API Response status:', response.status);
        console.log('API Response ok:', response.ok);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.log('API Error response:', errorText);
          throw new Error(`Failed to fetch static file: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('API Response data:', data);
        
        if (data.signedUrl) {
          console.log('Setting fileUrl to:', data.signedUrl);
          setFileUrl(data.signedUrl);
        } else {
          console.log('No signedUrl in response data');
          throw new Error('No signed URL returned');
        }
      } catch (err) {
        console.error('Error in fetchStaticFile:', err);
        setError(err instanceof Error ? err.message : 'Failed to load static file');
        setFileUrl(null);
      } finally {
        console.log('Setting loading to false');
        setLoading(false);
      }
    };

    fetchStaticFile();
  }, [fileName]);

  console.log('useStaticFile returning:', { fileUrl, loading, error });
  return { fileUrl, loading, error };
}