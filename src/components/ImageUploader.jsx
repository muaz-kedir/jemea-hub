import { useState } from 'react';
import { Upload, X, Check, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const ImageUploader = ({ onUploadSuccess, folder = 'general' }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  // API base URL - uses same origin in production (Vercel serverless functions)
  const isLocalhost = typeof window !== 'undefined' && 
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
  const API_URL = import.meta.env.VITE_API_URL || (isLocalhost ? 'http://localhost:5000' : '');

  /**
   * Handle file selection
   */
  const handleFileSelect = (event) => {
    const file = event.target.files?.[0];
    
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('Please select a valid image file (JPEG, PNG, GIF, or WebP)');
      return;
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setError('File size must be less than 5MB');
      return;
    }

    // Clear previous errors
    setError(null);
    setUploadedImageUrl(null);

    // Set selected file
    setSelectedFile(file);

    // Create preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };

  /**
   * Upload image to backend
   */
  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select an image first');
      return;
    }

    setUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      // Create FormData
      const formData = new FormData();
      formData.append('image', selectedFile);

      // Simulate progress (since fetch doesn't support upload progress natively)
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Send POST request to backend
      const response = await fetch(`${API_URL}/api/upload`, {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      // Parse response
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      // Success!
      console.log('✅ Upload successful:', data);
      setUploadedImageUrl(data.data.url);
      
      // Call parent callback if provided
      if (onUploadSuccess) {
        onUploadSuccess(data.data);
      }

      // Reset after 2 seconds
      setTimeout(() => {
        setUploadProgress(0);
      }, 2000);

    } catch (err) {
      console.error('❌ Upload error:', err);
      setError(err.message || 'Failed to upload image. Please try again.');
      setUploadProgress(0);
    } finally {
      setUploading(false);
    }
  };

  /**
   * Clear selection and reset
   */
  const handleClear = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setUploadedImageUrl(null);
    setError(null);
    setUploadProgress(0);
    
    // Reset file input
    const fileInput = document.getElementById('image-upload-input');
    if (fileInput) fileInput.value = '';
  };

  /**
   * Copy URL to clipboard
   */
  const handleCopyUrl = async () => {
    if (uploadedImageUrl) {
      try {
        await navigator.clipboard.writeText(uploadedImageUrl);
        alert('URL copied to clipboard!');
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  };

  return (
    <Card className="p-6 max-w-2xl mx-auto">
      <div className="space-y-4">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Upload Image</h2>
          <p className="text-sm text-muted-foreground">
            Select an image to upload to Cloudinary (Max 5MB)
          </p>
        </div>

        {/* File Input */}
        <div className="space-y-2">
          <label
            htmlFor="image-upload-input"
            className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer hover:bg-accent/50 transition-colors"
          >
            {previewUrl ? (
              <div className="relative w-full h-full">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-full object-contain rounded-lg"
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    handleClear();
                  }}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-12 h-12 mb-3 text-muted-foreground" />
                <p className="mb-2 text-sm text-muted-foreground">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-muted-foreground">
                  PNG, JPG, GIF, WebP (MAX. 5MB)
                </p>
              </div>
            )}
          </label>
          <input
            id="image-upload-input"
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        {/* Selected File Info */}
        {selectedFile && !uploadedImageUrl && (
          <div className="p-3 bg-accent rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{selectedFile.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(selectedFile.size / 1024).toFixed(2)} KB
                </p>
              </div>
              <Check className="w-5 h-5 text-green-500 flex-shrink-0 ml-2" />
            </div>
          </div>
        )}

        {/* Progress Bar */}
        {uploading && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Uploading...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full bg-accent rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          </div>
        )}

        {/* Uploaded Image Display */}
        {uploadedImageUrl && (
          <div className="space-y-3">
            <div className="p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Check className="w-5 h-5 text-green-500" />
                <p className="text-sm font-medium text-green-700 dark:text-green-300">
                  Upload successful!
                </p>
              </div>
            </div>

            <div className="border rounded-lg overflow-hidden">
              <img
                src={uploadedImageUrl}
                alt="Uploaded"
                className="w-full h-64 object-contain bg-accent"
              />
            </div>

            <div className="p-3 bg-accent rounded-lg">
              <p className="text-xs text-muted-foreground mb-2">Image URL:</p>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={uploadedImageUrl}
                  readOnly
                  className="flex-1 px-3 py-2 text-sm bg-background border rounded-md"
                />
                <Button size="sm" onClick={handleCopyUrl}>
                  Copy
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          {!uploadedImageUrl ? (
            <>
              <Button
                onClick={handleUpload}
                disabled={!selectedFile || uploading}
                className="flex-1"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Image
                  </>
                )}
              </Button>
              {selectedFile && (
                <Button variant="outline" onClick={handleClear} disabled={uploading}>
                  Clear
                </Button>
              )}
            </>
          ) : (
            <Button onClick={handleClear} className="flex-1">
              Upload Another Image
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};

export default ImageUploader;
