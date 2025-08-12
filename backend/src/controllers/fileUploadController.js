const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const crypto = require('crypto');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = crypto.randomUUID();
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${uniqueSuffix}${ext}`);
  }
});

// File filter for allowed file types
const fileFilter = (req, file, cb) => {
  const allowedTypes = {
    'image/jpeg': '.jpg',
    'image/jpg': '.jpg',
    'image/png': '.png',
    'image/gif': '.gif',
    'image/webp': '.webp',
    'application/pdf': '.pdf',
    'text/plain': '.txt',
    'application/msword': '.doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx'
  };

  if (allowedTypes[file.mimetype]) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images, PDFs, and documents are allowed.'));
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 5 // Maximum 5 files at once
  }
});

// Upload profile picture
exports.uploadProfilePicture = [
  upload.single('profilePicture'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }

      const userId = req.user.id;
      const User = require('../models/User');

      // Generate file URL
      const fileUrl = `/uploads/${req.file.filename}`;

      // Update user profile picture
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Delete old profile picture if it exists and is a local file
      if (user.profilePic && user.profilePic.startsWith('/uploads/')) {
        try {
          const oldFilePath = path.join(__dirname, '../../', user.profilePic);
          await fs.unlink(oldFilePath);
        } catch (error) {
          console.log('Old profile picture not found or could not be deleted');
        }
      }

      user.profilePic = fileUrl;
      await user.save();

      res.json({
        success: true,
        message: 'Profile picture uploaded successfully',
        fileUrl,
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          profilePic: user.profilePic
        }
      });
    } catch (err) {
      console.error('Upload profile picture error:', err);
      res.status(500).json({
        success: false,
        message: 'Server error uploading profile picture'
      });
    }
  }
];

// Upload multiple travel photos
exports.uploadTravelPhotos = [
  upload.array('photos', 5),
  async (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No files uploaded'
        });
      }

      const userId = req.user.id;
      const { tripId, journalEntryId, captions } = req.body;

      // Process uploaded files
      const uploadedFiles = req.files.map((file, index) => ({
        filename: file.filename,
        originalName: file.originalname,
        url: `/uploads/${file.filename}`,
        size: file.size,
        mimetype: file.mimetype,
        caption: Array.isArray(captions) ? captions[index] : captions || ''
      }));

      // If tripId is provided, associate photos with trip
      if (tripId) {
        const Trip = require('../models/Trip');
        const trip = await Trip.findOne({ _id: tripId, owner: userId });
        
        if (!trip) {
          return res.status(404).json({
            success: false,
            message: 'Trip not found or access denied'
          });
        }

        // Add photos to trip (you might want to add a photos field to Trip model)
      }

      // If journalEntryId is provided, associate photos with journal entry
      if (journalEntryId) {
        const JournalEntry = require('../models/JournalEntry');
        const entry = await JournalEntry.findOne({ _id: journalEntryId, owner: userId });
        
        if (!entry) {
          return res.status(404).json({
            success: false,
            message: 'Journal entry not found or access denied'
          });
        }

        // Add photos to journal entry
        uploadedFiles.forEach(file => {
          entry.photos.push({
            url: file.url,
            caption: file.caption,
            uploadedAt: new Date()
          });
        });

        await entry.save();
      }

      res.json({
        success: true,
        message: `${uploadedFiles.length} files uploaded successfully`,
        files: uploadedFiles
      });
    } catch (err) {
      console.error('Upload travel photos error:', err);
      res.status(500).json({
        success: false,
        message: 'Server error uploading travel photos'
      });
    }
  }
];

// Upload itinerary documents
exports.uploadItineraryDocuments = [
  upload.array('documents', 3),
  async (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No files uploaded'
        });
      }

      const userId = req.user.id;
      const { itineraryId } = req.body;

      const Itinerary = require('../models/Itinerary');
      const itinerary = await Itinerary.findOne({ _id: itineraryId, owner: userId });

      if (!itinerary) {
        return res.status(404).json({
          success: false,
          message: 'Itinerary not found or access denied'
        });
      }

      // Process uploaded files
      const uploadedFiles = req.files.map(file => ({
        filename: file.filename,
        originalName: file.originalname,
        url: `/uploads/${file.filename}`,
        size: file.size,
        mimetype: file.mimetype
      }));

      res.json({
        success: true,
        message: `${uploadedFiles.length} documents uploaded successfully`,
        files: uploadedFiles
      });
    } catch (err) {
      console.error('Upload itinerary documents error:', err);
      res.status(500).json({
        success: false,
        message: 'Server error uploading itinerary documents'
      });
    }
  }
];

// Upload expense receipts
exports.uploadExpenseReceipts = [
  upload.single('receipt'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }

      const userId = req.user.id;
      const { expenseId } = req.body;

      // Generate file URL
      const fileUrl = `/uploads/${req.file.filename}`;

      // If expenseId is provided, associate receipt with expense
      if (expenseId) {
        const Expense = require('../models/Expense');
        const expense = await Expense.findOne({ _id: expenseId, owner: userId });
        
        if (!expense) {
          return res.status(404).json({
            success: false,
            message: 'Expense not found or access denied'
          });
        }

        expense.receiptUrl = fileUrl;
        await expense.save();
      }

      res.json({
        success: true,
        message: 'Receipt uploaded successfully',
        fileUrl,
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size
      });
    } catch (err) {
      console.error('Upload expense receipt error:', err);
      res.status(500).json({
        success: false,
        message: 'Server error uploading expense receipt'
      });
    }
  }
];

// Delete uploaded file
exports.deleteFile = async (req, res) => {
  try {
    const { filename } = req.params;
    const userId = req.user.id;

    // Security check: ensure filename doesn't contain path traversal
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return res.status(400).json({
        success: false,
        message: 'Invalid filename'
      });
    }

    const filePath = path.join(__dirname, '../../uploads', filename);

    // Check if file exists
    try {
      await fs.access(filePath);
    } catch (error) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    // Delete the file
    await fs.unlink(filePath);

    res.json({
      success: true,
      message: 'File deleted successfully'
    });
  } catch (err) {
    console.error('Delete file error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error deleting file'
    });
  }
};

// Get file info
exports.getFileInfo = async (req, res) => {
  try {
    const { filename } = req.params;

    // Security check
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return res.status(400).json({
        success: false,
        message: 'Invalid filename'
      });
    }

    const filePath = path.join(__dirname, '../../uploads', filename);

    try {
      const stats = await fs.stat(filePath);
      
      res.json({
        success: true,
        file: {
          filename,
          size: stats.size,
          uploadedAt: stats.birthtime,
          lastModified: stats.mtime,
          url: `/uploads/${filename}`
        }
      });
    } catch (error) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }
  } catch (err) {
    console.error('Get file info error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error getting file info'
    });
  }
};

// Get user's uploaded files
exports.getUserFiles = async (req, res) => {
  try {
    const userId = req.user.id;
    const { type, limit = 20, page = 1 } = req.query;

    // This is a basic implementation - in a real app, you'd want to track
    // file ownership in the database
    const uploadDir = path.join(__dirname, '../../uploads');
    
    try {
      const files = await fs.readdir(uploadDir);
      const fileInfos = [];

      for (const filename of files) {
        try {
          const filePath = path.join(uploadDir, filename);
          const stats = await fs.stat(filePath);
          
          fileInfos.push({
            filename,
            size: stats.size,
            uploadedAt: stats.birthtime,
            url: `/uploads/${filename}`,
            type: path.extname(filename).toLowerCase()
          });
        } catch (error) {
          // Skip files that can't be accessed
          continue;
        }
      }

      // Sort by upload date, newest first
      fileInfos.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));

      // Apply type filter
      let filteredFiles = fileInfos;
      if (type === 'images') {
        filteredFiles = fileInfos.filter(file => 
          ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(file.type)
        );
      } else if (type === 'documents') {
        filteredFiles = fileInfos.filter(file => 
          ['.pdf', '.doc', '.docx', '.txt'].includes(file.type)
        );
      }

      // Apply pagination
      const skip = (parseInt(page) - 1) * parseInt(limit);
      const paginatedFiles = filteredFiles.slice(skip, skip + parseInt(limit));

      res.json({
        success: true,
        files: paginatedFiles,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(filteredFiles.length / parseInt(limit)),
          totalItems: filteredFiles.length,
          itemsPerPage: parseInt(limit)
        }
      });
    } catch (error) {
      res.json({
        success: true,
        files: [],
        pagination: {
          currentPage: 1,
          totalPages: 0,
          totalItems: 0,
          itemsPerPage: parseInt(limit)
        }
      });
    }
  } catch (err) {
    console.error('Get user files error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error getting user files'
    });
  }
};
