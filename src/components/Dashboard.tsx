import React, { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'

export const Dashboard: React.FC = () => {
  const { user, signOut } = useAuth()
  const [uploadedImages, setUploadedImages] = useState<{url: string, path: string}[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  // const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBucketPublic, setIsBucketPublic] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    console.log('isBucketPublic:', isBucketPublic);
  }, [isBucketPublic]);

  useEffect(() => {
    console.log(uploadedImages)
  }, [uploadedImages])

  const loadImages = useCallback(async () => {
    if (!user?.id) return;
    setIsLoading(true);
    setError(null);
    
    try {
      // First, check if the bucket exists and get its public status
      const { data: bucket, error: bucketError } = await supabase.storage.getBucket('images');
      if (bucketError) throw bucketError;
      
      setIsBucketPublic(bucket?.public || false);
      
      // List all files in the user's folder
      const { data: files, error: listError } = await supabase.storage
        .from('images')
        .list(`${user.id}/`, {
          limit: 100,
          offset: 0,
          sortBy: { column: 'created_at', order: 'desc' },
        });

      if (listError) throw listError;

      if (files && files.length > 0) {
        const imageUrls = await Promise.all(
          files.map(async (file) => {
            try {
              if (isBucketPublic) {
                // For public buckets, use getPublicUrl with cache buster
                const { data: urlData } = supabase.storage
                  .from('images')
                  .getPublicUrl(`${user.id}/${file.name}`);
                return `${urlData.publicUrl}?t=${Date.now()}`;
              } else {
                // For private buckets, create a signed URL
                const { data: signedUrlData, error: signedUrlError } = await supabase.storage
                  .from('images')
                  .createSignedUrl(`${user.id}/${file.name}`, 3600); // 1 hour expiry
                
                if (signedUrlError) throw signedUrlError;
                return signedUrlData?.signedUrl || '';
              }
            } catch (error) {
              console.error(`Error processing file ${file.name}:`, error);
              return ''; // Skip files that cause errors
            }
          })
        );
        
        // Filter out any empty objects from failed URL generations and create objects with url and path
        const validImages = imageUrls.map((url, index) => ({
          url,
          path: `${user.id}/${files[index].name}`
        })).filter(img => Boolean(img.url));
        setUploadedImages(validImages);
      } else {
        setUploadedImages([]); // Clear images if no files found
      }
    } catch (error) {
      console.error('Error loading images:', error);
      setError('Failed to load images');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, isBucketPublic]);

  useEffect(() => {
    loadImages()
  }, [loadImages])

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !user) return

    setIsUploading(true)
    setMessage('')

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `${user.id}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, file)

      if (uploadError) {
        throw uploadError
      }

      setMessage('Image uploaded successfully!')
      loadImages() // Reload images after upload
    } catch (error) {
      setMessage(`Error uploading image: ${error instanceof Error ? error.message : 'Upload failed'}`)
    } finally {
      setIsUploading(false)
    }
  }

  const handleSignOut = async () => {
    await signOut()
  }


  const handleDeleteImage = async (path: string) => {
    try {
      const { error } = await supabase.storage
        .from('images')
        .remove([path])
      if (error) {
        throw error
      }
      setMessage('Image deleted successfully!')
      loadImages() // Reload images after deletion
    } catch (error) {
      console.error('Error deleting image:', error instanceof Error ? error.message : 'Delete failed')
      setMessage('Failed to delete image')
    }
  }
  

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <div className="user-info">
          <span>Welcome, {user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email}</span>
          <button onClick={handleSignOut} className="sign-out-button">
            Sign Out
          </button>
        </div>
      </div>

      <div className="upload-section">
        <h2>Upload Image</h2>
        <div className="upload-area">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            disabled={isUploading}
            className="file-input"
          />
          {isUploading ? 'Uploading...' : 'Upload Image'}
          {message && (
            <p className={message.includes('Error') ? 'error' : 'success'}>
              {message}
            </p>
          )}
          {error && (
            <p className="error">{error}</p>
          )}
          {isLoading && (
            <p>Loading images...</p>
          )}
        </div>
      </div>

      <div className="images-section">
        <h2>Your Images</h2>
        <div className="images-grid">
          {uploadedImages.length > 0 ? (  
            uploadedImages.map((image, index) => (
              <div key={index} className="image-item">
                <img src={image.url} alt={`Uploaded ${index + 1}`} />
                <button onClick={() => handleDeleteImage(image.path)} className="delete-button">Delete</button>
              </div>
            ))
          ) : (
            <p>No images uploaded yet.</p>
          )}
        </div>
      </div>
    </div>
  )
}
