import { useState } from 'react';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import ImageUploader from '@/components/ImageUploader';
import { Card } from '@/components/ui/card';
import { Image as ImageIcon } from 'lucide-react';

const ImageUploadDemo = () => {
  const [uploadedImages, setUploadedImages] = useState<any[]>([]);

  const handleUploadSuccess = (imageData: any) => {
    console.log('Image uploaded:', imageData);
    setUploadedImages((prev) => [...prev, imageData]);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Page Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
            <ImageIcon className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Image Upload Demo</h1>
          <p className="text-muted-foreground">
            Upload images to Cloudinary and see them displayed instantly
          </p>
        </div>

        {/* Image Uploader Component */}
        <div className="mb-8">
          <ImageUploader onUploadSuccess={handleUploadSuccess} />
        </div>

        {/* Uploaded Images Gallery */}
        {uploadedImages.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Uploaded Images ({uploadedImages.length})</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {uploadedImages.map((image, index) => (
                <Card key={index} className="p-4">
                  <img
                    src={image.url}
                    alt={`Upload ${index + 1}`}
                    className="w-full h-48 object-cover rounded-lg mb-3"
                  />
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Format:</span>
                      <span className="font-medium">{image.format?.toUpperCase()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Dimensions:</span>
                      <span className="font-medium">{image.width} × {image.height}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Size:</span>
                      <span className="font-medium">{(image.size / 1024).toFixed(2)} KB</span>
                    </div>
                    <div className="pt-2 border-t">
                      <p className="text-xs text-muted-foreground break-all">
                        {image.public_id}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Instructions */}
        <Card className="p-6 mt-8 bg-accent/50">
          <h3 className="font-bold mb-3">How to Use:</h3>
          <ol className="space-y-2 text-sm text-muted-foreground">
            <li>1. Click the upload area or drag and drop an image</li>
            <li>2. Preview your selected image</li>
            <li>3. Click "Upload Image" to send it to Cloudinary</li>
            <li>4. Once uploaded, you'll see the image URL and details</li>
            <li>5. Copy the URL to use it anywhere in your application</li>
          </ol>
        </Card>
      </div>

      <BottomNav />
    </div>
  );
};

export default ImageUploadDemo;
