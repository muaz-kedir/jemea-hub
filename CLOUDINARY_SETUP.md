# Cloudinary Image Upload Setup Guide

Complete guide for setting up secure image uploads to Cloudinary using Node.js backend and React frontend.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Project Structure](#project-structure)
3. [Backend Setup](#backend-setup)
4. [Frontend Setup](#frontend-setup)
5. [Running the Application](#running-the-application)
6. [API Documentation](#api-documentation)
7. [Usage Examples](#usage-examples)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Cloudinary account (free tier available at https://cloudinary.com)

---

## Project Structure

```
jemea-hub/
├── server/                      # Backend (Express)
│   ├── config/
│   │   └── cloudinary.js       # Cloudinary configuration
│   ├── middleware/
│   │   └── upload.js           # Multer middleware
│   ├── routes/
│   │   └── uploadRoute.js      # Upload routes
│   ├── .env                    # Backend environment variables
│   ├── package.json
│   └── server.js               # Express server entry point
│
├── src/                        # Frontend (React)
│   ├── components/
│   │   └── ImageUploader.jsx   # Image uploader component
│   └── pages/
│       └── ImageUploadDemo.tsx # Demo page
│
├── .env                        # Frontend environment variables
└── CLOUDINARY_SETUP.md         # This file
```

---

## Backend Setup

### 1. Install Dependencies

Navigate to the server directory and install required packages:

```bash
cd server
npm install
```

**Dependencies installed:**
- `express` - Web framework
- `multer` - File upload handling
- `cloudinary` - Cloudinary SDK
- `cors` - Cross-origin resource sharing
- `dotenv` - Environment variables

**Dev Dependencies:**
- `nodemon` - Auto-restart server on changes

### 2. Configure Environment Variables

Create or update `server/.env` file:

```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Server Configuration
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

**How to get Cloudinary credentials:**

1. Sign up at https://cloudinary.com
2. Go to Dashboard
3. Copy your credentials:
   - Cloud Name
   - API Key
   - API Secret

**Current Configuration (from your .env):**
```env
CLOUDINARY_CLOUD_NAME=HUMSJ_acadamic_Sec
CLOUDINARY_API_KEY=553854382693153
CLOUDINARY_API_SECRET=hZ5rFMPVkIUAT_lsv0hl8V3CwUU
```

### 3. Backend File Overview

#### `server/config/cloudinary.js`
- Configures Cloudinary SDK with credentials
- Verifies configuration on startup
- Exports cloudinary instance

#### `server/middleware/upload.js`
- Configures Multer for memory storage
- Validates file types (images only)
- Sets file size limit (5MB)

#### `server/routes/uploadRoute.js`
- **POST /api/upload** - Upload single image
- **POST /api/upload/multiple** - Upload multiple images
- **DELETE /api/upload/:publicId** - Delete image
- Handles errors and returns JSON responses

#### `server/server.js`
- Express server setup
- Middleware configuration (CORS, JSON parsing)
- Route mounting
- Error handling
- Health check endpoint

---

## Frontend Setup

### 1. Install Dependencies (if needed)

The frontend uses existing dependencies from your React project. Ensure you have:

```bash
npm install
```

### 2. Configure Environment Variables

Create or update `.env` in the root directory:

```env
# Frontend Configuration
VITE_API_URL=http://localhost:5000
```

### 3. Frontend Component Overview

#### `src/components/ImageUploader.jsx`

**Features:**
- File selection with drag & drop support
- Image preview before upload
- File validation (type and size)
- Upload progress indicator
- Success/error messages
- Display uploaded image with URL
- Copy URL to clipboard
- Responsive design

**Props:**
- `onUploadSuccess(imageData)` - Callback when upload succeeds
- `folder` - Cloudinary folder name (optional)

**Usage:**
```jsx
import ImageUploader from '@/components/ImageUploader';

function MyComponent() {
  const handleUploadSuccess = (imageData) => {
    console.log('Uploaded:', imageData.url);
    // Use imageData.url in your application
  };

  return <ImageUploader onUploadSuccess={handleUploadSuccess} />;
}
```

#### `src/pages/ImageUploadDemo.tsx`

Demo page showcasing the ImageUploader component with:
- Upload interface
- Gallery of uploaded images
- Image metadata display
- Usage instructions

---

## Running the Application

### Step 1: Start the Backend Server

```bash
# Navigate to server directory
cd server

# Install dependencies (first time only)
npm install

# Start the server
npm start

# Or use nodemon for development (auto-restart)
npm run dev
```

**Expected output:**
```
✅ Cloudinary configured successfully
   Cloud Name: HUMSJ_acadamic_Sec

🚀 Server started successfully!
   Port: 5000
   Environment: development
   Health check: http://localhost:5000/health
   Upload endpoint: http://localhost:5000/api/upload

📝 Available endpoints:
   POST   /api/upload          - Upload single image
   POST   /api/upload/multiple - Upload multiple images
   DELETE /api/upload/:id      - Delete image by public_id
```

### Step 2: Start the Frontend

Open a new terminal:

```bash
# Navigate to project root
cd ..

# Start Vite dev server
npm run dev
```

**Expected output:**
```
VITE v4.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

### Step 3: Test the Application

1. Open browser to `http://localhost:5173`
2. Navigate to the Image Upload Demo page
3. Select an image file
4. Click "Upload Image"
5. See the uploaded image with its Cloudinary URL

---

## API Documentation

### POST /api/upload

Upload a single image to Cloudinary.

**Request:**
- Method: `POST`
- Content-Type: `multipart/form-data`
- Body: Form data with `image` field

**Example using fetch:**
```javascript
const formData = new FormData();
formData.append('image', fileInput.files[0]);

const response = await fetch('http://localhost:5000/api/upload', {
  method: 'POST',
  body: formData,
});

const data = await response.json();
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Image uploaded successfully",
  "data": {
    "url": "https://res.cloudinary.com/...",
    "public_id": "jemea-hub/abc123",
    "width": 1200,
    "height": 800,
    "format": "jpg",
    "size": 245678
  }
}
```

**Error Response (400/500):**
```json
{
  "success": false,
  "error": "Error message here"
}
```

### POST /api/upload/multiple

Upload multiple images at once (max 10).

**Request:**
- Method: `POST`
- Content-Type: `multipart/form-data`
- Body: Form data with `images` field (array)

**Example:**
```javascript
const formData = new FormData();
for (let file of fileInput.files) {
  formData.append('images', file);
}

const response = await fetch('http://localhost:5000/api/upload/multiple', {
  method: 'POST',
  body: formData,
});
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "3 images uploaded successfully",
  "data": [
    {
      "url": "https://res.cloudinary.com/...",
      "public_id": "jemea-hub/abc123",
      "width": 1200,
      "height": 800,
      "format": "jpg"
    },
    // ... more images
  ]
}
```

### DELETE /api/upload/:publicId

Delete an image from Cloudinary.

**Request:**
- Method: `DELETE`
- URL Parameter: `publicId` (URL-encoded)

**Example:**
```javascript
const publicId = encodeURIComponent('jemea-hub/abc123');
const response = await fetch(`http://localhost:5000/api/upload/${publicId}`, {
  method: 'DELETE',
});
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Image deleted successfully"
}
```

### GET /health

Health check endpoint.

**Response:**
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

## Usage Examples

### Example 1: Simple Upload in React

```jsx
import { useState } from 'react';

function SimpleUpload() {
  const [imageUrl, setImageUrl] = useState('');

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch('http://localhost:5000/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (data.success) {
        setImageUrl(data.data.url);
      }
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  return (
    <div>
      <input type="file" onChange={handleFileChange} accept="image/*" />
      {imageUrl && <img src={imageUrl} alt="Uploaded" />}
    </div>
  );
}
```

### Example 2: Upload with Progress

```jsx
import { useState } from 'react';

function UploadWithProgress() {
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);

  const uploadImage = async (file) => {
    setUploading(true);
    const formData = new FormData();
    formData.append('image', file);

    // Simulate progress
    const interval = setInterval(() => {
      setProgress(prev => Math.min(prev + 10, 90));
    }, 200);

    try {
      const response = await fetch('http://localhost:5000/api/upload', {
        method: 'POST',
        body: formData,
      });

      clearInterval(interval);
      setProgress(100);

      const data = await response.json();
      return data.data.url;
    } catch (error) {
      clearInterval(interval);
      throw error;
    } finally {
      setUploading(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  return (
    <div>
      {uploading && (
        <div>
          <div style={{ width: `${progress}%` }}>Progress: {progress}%</div>
        </div>
      )}
    </div>
  );
}
```

### Example 3: Integration with Admin Dashboard

```jsx
// In your TrainingAdminDashboard, LibraryAdminDashboard, etc.
import ImageUploader from '@/components/ImageUploader';

function AdminDashboard() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageUrl: '', // Store Cloudinary URL here
  });

  const handleImageUpload = (imageData) => {
    // Update form with Cloudinary URL
    setFormData(prev => ({
      ...prev,
      imageUrl: imageData.url
    }));
  };

  const handleSubmit = async () => {
    // Save to Firestore with imageUrl from Cloudinary
    await addDoc(collection(db, 'trainings'), {
      ...formData,
      createdAt: Timestamp.now(),
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={formData.title}
        onChange={(e) => setFormData({...formData, title: e.target.value})}
      />
      
      <ImageUploader onUploadSuccess={handleImageUpload} />
      
      {formData.imageUrl && (
        <img src={formData.imageUrl} alt="Preview" />
      )}
      
      <button type="submit">Save</button>
    </form>
  );
}
```

---

## Troubleshooting

### Backend Issues

**Problem: "Cloudinary configuration is incomplete"**
- Solution: Check `server/.env` file has all three Cloudinary credentials
- Verify credentials are correct (no extra spaces)

**Problem: "CORS error"**
- Solution: Ensure `FRONTEND_URL` in `server/.env` matches your frontend URL
- Default is `http://localhost:5173` for Vite

**Problem: "Port already in use"**
- Solution: Change `PORT` in `server/.env` or kill the process using port 5000
- Windows: `netstat -ano | findstr :5000` then `taskkill /PID <PID> /F`

**Problem: "File too large"**
- Solution: File size limit is 5MB. Compress image or increase limit in `server/middleware/upload.js`

### Frontend Issues

**Problem: "Failed to fetch"**
- Solution: Ensure backend server is running on port 5000
- Check `VITE_API_URL` in `.env` is correct
- Verify no firewall blocking localhost connections

**Problem: "Invalid file type"**
- Solution: Only JPEG, PNG, GIF, WebP, SVG are allowed
- Check file extension and MIME type

**Problem: "Image not displaying"**
- Solution: Check browser console for errors
- Verify Cloudinary URL is valid
- Check if image was actually uploaded to Cloudinary dashboard

### Cloudinary Issues

**Problem: "Unauthorized"**
- Solution: Verify API credentials in `server/.env`
- Check if API key/secret are correct in Cloudinary dashboard

**Problem: "Quota exceeded"**
- Solution: Free tier has limits. Check Cloudinary dashboard for usage
- Consider upgrading plan or optimizing images

---

## Security Best Practices

1. **Never expose API credentials in frontend**
   - All uploads go through backend
   - Credentials stay in `server/.env`

2. **Validate file types and sizes**
   - Already implemented in `upload.js` middleware
   - Adjust limits as needed

3. **Use environment variables**
   - Never commit `.env` files to git
   - Add `.env` to `.gitignore`

4. **Implement authentication**
   - Add auth middleware before upload routes
   - Verify user permissions

5. **Rate limiting**
   - Consider adding rate limiting for production
   - Prevent abuse of upload endpoint

---

## Production Deployment

### Backend (Node.js)

1. Set `NODE_ENV=production` in environment
2. Use process manager (PM2, Forever)
3. Set up reverse proxy (Nginx)
4. Enable HTTPS
5. Configure proper CORS origins

### Frontend (React)

1. Build production bundle: `npm run build`
2. Deploy to hosting (Vercel, Netlify, etc.)
3. Update `VITE_API_URL` to production backend URL

### Environment Variables

**Backend (.env):**
```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://your-frontend-domain.com
```

**Frontend (.env):**
```env
VITE_API_URL=https://your-backend-domain.com
```

---

## Additional Resources

- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [Multer Documentation](https://github.com/expressjs/multer)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [React File Upload Tutorial](https://react.dev/)

---

## Support

For issues or questions:
1. Check this documentation
2. Review console logs (backend and frontend)
3. Check Cloudinary dashboard for upload status
4. Verify all environment variables are set correctly

---

**Last Updated:** November 2024
**Version:** 1.0.0
