import express from 'express';
import { cloudinary } from '../config/cloudinary.js';
import resourceUpload from '../middleware/resourceUpload.js';
import { admin, firestore } from '../config/firebaseAdmin.js';

const router = express.Router();

const ensureFirestoreConfigured = (res) => {
  if (!firestore) {
    res.status(500).json({
      success: false,
      error: 'Firestore is not configured on the server. Please supply Firebase Admin credentials.',
    });
    return false;
  }
  return true;
};

const uploadToCloudinary = (file) => {
  const isImage = file.mimetype.startsWith('image/');
  const uploadOptions = {
    folder: 'jemea-hub/resources',
    resource_type: isImage ? 'auto' : 'raw',
  };

  if (isImage) {
    uploadOptions.transformation = [
      { width: 1600, height: 1600, crop: 'limit' },
      { quality: 'auto' },
      { fetch_format: 'auto' },
    ];
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });

    uploadStream.end(file.buffer);
  });
};

router.post('/resources', resourceUpload.single('file'), async (req, res) => {
  if (!ensureFirestoreConfigured(res)) return;

  try {
    const { title, description, placement, college, department, year, semester, course, tags, postedBy } = req.body;

    if (!title || !placement) {
      return res.status(400).json({
        success: false,
        error: 'Title and placement are required.',
      });
    }

    if (!['landing', 'academic'].includes(placement)) {
      return res.status(400).json({
        success: false,
        error: 'Placement must be either "landing" or "academic".',
      });
    }

    if (placement === 'academic' && (!college || !department || !year || !semester || !course)) {
      return res.status(400).json({
        success: false,
        error: 'College, department, year, semester, and course are required for academic resources.',
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'A resource file must be uploaded under the "file" field.',
      });
    }

    const uploadResult = await uploadToCloudinary(req.file);

    const parsedTags = Array.isArray(tags)
      ? tags
      : typeof tags === 'string'
        ? tags.split(',').map((tag) => tag.trim()).filter(Boolean)
        : [];

    const docData = {
      title: title.trim(),
      description: description?.trim() || '',
      placement,
      college: placement === 'academic' ? college?.trim() || null : null,
      department: placement === 'academic' ? department?.trim() || null : null,
      year: placement === 'academic' ? year?.trim() || null : null,
      semester: placement === 'academic' ? semester?.trim() || null : null,
      course: placement === 'academic' ? course?.trim() || null : null,
      tags: parsedTags,
      postedBy: postedBy?.trim() || null,
      file: {
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
        resourceType: uploadResult.resource_type || 'raw',
        format: uploadResult.format || req.file.originalname.split('.').pop() || 'unknown',
        bytes: uploadResult.bytes || req.file.size,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
      },
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const docRef = await firestore.collection('classified_resources').add(docData);
    const docSnapshot = await docRef.get();

    res.status(201).json({
      success: true,
      message: 'Resource created successfully.',
      data: { id: docSnapshot.id, ...docSnapshot.data() },
    });
  } catch (error) {
    console.error('❌ Failed to create resource:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create resource.',
    });
  }
});

router.get('/resources', async (req, res) => {
  console.log('📥 GET /resources - Query params:', req.query);
  
  if (!ensureFirestoreConfigured(res)) return;

  try {
    const { placement, college, department, year, semester, course } = req.query;

    let queryRef = firestore.collection('classified_resources');

    if (placement) {
      queryRef = queryRef.where('placement', '==', placement);
    }

    if (college) {
      queryRef = queryRef.where('college', '==', college);
    }

    if (department) {
      queryRef = queryRef.where('department', '==', department);
    }

    if (year) {
      queryRef = queryRef.where('year', '==', year);
    }

    if (semester) {
      queryRef = queryRef.where('semester', '==', semester);
    }

    if (course) {
      queryRef = queryRef.where('course', '==', course);
    }

    const snapshot = await queryRef.get();
    const resources = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    resources.sort((a, b) => {
      const aTime = a.createdAt?.toMillis?.() || 0;
      const bTime = b.createdAt?.toMillis?.() || 0;
      return bTime - aTime;
    });

    console.log(`✅ GET /resources - Found ${resources.length} resources`);

    res.status(200).json({
      success: true,
      data: resources,
    });
  } catch (error) {
    console.error('❌ Failed to fetch resources:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch resources.',
    });
  }
});

router.get('/resources/:id', async (req, res) => {
  if (!ensureFirestoreConfigured(res)) return;

  try {
    const { id } = req.params;
    const docRef = firestore.collection('classified_resources').doc(id);
    const snapshot = await docRef.get();

    if (!snapshot.exists) {
      return res.status(404).json({
        success: false,
        error: 'Resource not found.',
      });
    }

    res.status(200).json({
      success: true,
      data: { id: snapshot.id, ...snapshot.data() },
    });
  } catch (error) {
    console.error('❌ Failed to fetch resource:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch resource.',
    });
  }
});

router.delete('/resources/:id', async (req, res) => {
  if (!ensureFirestoreConfigured(res)) return;

  try {
    const { id } = req.params;
    const docRef = firestore.collection('classified_resources').doc(id);
    const snapshot = await docRef.get();

    if (!snapshot.exists) {
      return res.status(404).json({
        success: false,
        error: 'Resource not found.',
      });
    }

    const resourceData = snapshot.data();
    const publicId = resourceData?.file?.publicId;
    const resourceType = resourceData?.file?.resourceType || 'raw';

    if (publicId) {
      try {
        await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
      } catch (cloudinaryError) {
        console.error('⚠️  Failed to remove file from Cloudinary:', cloudinaryError);
      }
    }

    await docRef.delete();

    res.status(200).json({
      success: true,
      message: 'Resource deleted successfully.',
    });
  } catch (error) {
    console.error('❌ Failed to delete resource:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to delete resource.',
    });
  }
});

export default router;
