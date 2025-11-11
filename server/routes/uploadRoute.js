import express from 'express';
import { cloudinary } from '../config/cloudinary.js';
import upload from '../middleware/upload.js';

const router = express.Router();

/**
 * Upload image to Cloudinary
 * POST /api/upload
 * Accepts: multipart/form-data with 'image' field
 * Returns: { success: true, url: string, public_id: string }
 */
router.post('/upload', upload.single('image'), async (req, res) => {
  try {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No image file provided. Please upload an image.',
      });
    }

    console.log(`📤 Uploading image: ${req.file.originalname} (${(req.file.size / 1024).toFixed(2)} KB)`);

    // Upload to Cloudinary using upload_stream
    // This method works with buffers from memory storage
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'jemea-hub', // Organize uploads in a folder
          resource_type: 'auto', // Automatically detect resource type
          transformation: [
            { width: 1200, height: 1200, crop: 'limit' }, // Limit max dimensions
            { quality: 'auto' }, // Automatic quality optimization
            { fetch_format: 'auto' }, // Automatic format selection (WebP when supported)
          ],
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      );

      // Write the buffer to the upload stream
      uploadStream.end(req.file.buffer);
    });

    console.log(`✅ Image uploaded successfully: ${uploadResult.public_id}`);

    // Return the secure URL and other useful information
    res.status(200).json({
      success: true,
      message: 'Image uploaded successfully',
      data: {
        url: uploadResult.secure_url,
        public_id: uploadResult.public_id,
        width: uploadResult.width,
        height: uploadResult.height,
        format: uploadResult.format,
        size: uploadResult.bytes,
      },
    });
  } catch (error) {
    console.error('❌ Upload error:', error);
    
    // Handle specific Cloudinary errors
    if (error.http_code) {
      return res.status(error.http_code).json({
        success: false,
        error: error.message || 'Cloudinary upload failed',
      });
    }

    // Generic error response
    res.status(500).json({
      success: false,
      error: 'Failed to upload image. Please try again.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

/**
 * Delete image from Cloudinary
 * DELETE /api/upload/:publicId
 * Returns: { success: true, message: string }
 */
router.delete('/upload/:publicId', async (req, res) => {
  try {
    const { publicId } = req.params;
    
    // Replace URL-encoded slashes back to actual slashes
    const decodedPublicId = decodeURIComponent(publicId);
    
    console.log(`🗑️  Deleting image: ${decodedPublicId}`);

    const result = await cloudinary.uploader.destroy(decodedPublicId);

    if (result.result === 'ok') {
      console.log(`✅ Image deleted successfully: ${decodedPublicId}`);
      res.status(200).json({
        success: true,
        message: 'Image deleted successfully',
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Image not found or already deleted',
      });
    }
  } catch (error) {
    console.error('❌ Delete error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete image',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

/**
 * Upload multiple images to Cloudinary
 * POST /api/upload/multiple
 * Accepts: multipart/form-data with 'images' field (array)
 * Returns: { success: true, urls: array }
 */
router.post('/upload/multiple', upload.array('images', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No image files provided',
      });
    }

    console.log(`📤 Uploading ${req.files.length} images...`);

    // Upload all files in parallel
    const uploadPromises = req.files.map((file) => {
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'jemea-hub',
            resource_type: 'auto',
            transformation: [
              { width: 1200, height: 1200, crop: 'limit' },
              { quality: 'auto' },
              { fetch_format: 'auto' },
            ],
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        uploadStream.end(file.buffer);
      });
    });

    const results = await Promise.all(uploadPromises);

    console.log(`✅ ${results.length} images uploaded successfully`);

    res.status(200).json({
      success: true,
      message: `${results.length} images uploaded successfully`,
      data: results.map((result) => ({
        url: result.secure_url,
        public_id: result.public_id,
        width: result.width,
        height: result.height,
        format: result.format,
      })),
    });
  } catch (error) {
    console.error('❌ Multiple upload error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upload images',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

export default router;
