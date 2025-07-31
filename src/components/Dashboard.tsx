import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'

export const Dashboard: React.FC = () => {
  const { user, signOut } = useAuth()
  const [uploading, setUploading] = useState(false)
  const [uploadedImages, setUploadedImages] = useState<string[]>([])
  const [message, setMessage] = useState('')



  useEffect(() => {
    loadImages()
  }, [])

  const loadImages = async () => {
    try {
      const { data, error } = await supabase.storage
        .from('images')
        .list(`${user?.id}/`, {
          limit: 100,
          offset: 0,
        })

      if (error) {
        console.error('Error loading images:', error)
        return
      }

      if (data) {
        const imageUrls = data.map(file => {
          const { data: urlData } = supabase.storage
            .from('images')
            .getPublicUrl(`${user?.id}/${file.name}`)
          return urlData.publicUrl
        })
        setUploadedImages(imageUrls)
        // console.log('users image', imageUrls);
        
      }
    } catch (error) {
      console.error('Error loading images:', error)
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !user) return

    setUploading(true)
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
    } catch (error: any) {
      setMessage(`Error uploading image: ${error.message}`)
    } finally {
      setUploading(false)
    }
  }

  const handleSignOut = async () => {
    await signOut()
  }


  const handleDeleteImage = async (url: string) => {
    try {
      const { error } = await supabase.storage
        .from('images')
        .remove([url])
      if (error) {
        throw error
      }
      loadImages() // Reload images after deletion
    } catch (error: any) {
      console.error('Error deleting image:', error.message)
    }
  }
  

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <div className="user-info">
          <span>Welcome, {user?.email}</span>
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
            disabled={uploading}
            className="file-input"
          />
          {uploading && <p>Uploading...</p>}
          {message && <p className={message.includes('Error') ? 'error-message' : 'success-message'}>{message}</p>}
        </div>
      </div>

      <div className="images-section">
        <h2>Your Images</h2>
        <div className="images-grid">
          {uploadedImages.length > 0 ? (  
            uploadedImages.map((url, index) => (
              <div key={index} className="image-item">
                <img src={url} alt={`Uploaded ${index + 1}`} />
                <button onClick={() => handleDeleteImage(url)}>Delete</button>
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
