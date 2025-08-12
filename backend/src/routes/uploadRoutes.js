const express = require('express');
const router = express.Router();
const {
  uploadProfilePicture,
  uploadTravelPhotos,
  uploadItineraryDocuments,
  uploadExpenseReceipts,
  deleteFile,
  getFileInfo,
  getUserFiles
} = require('../controllers/fileUploadController');
const authMiddleware = require('../middleware/authMiddleware');

// All upload routes require authentication
router.use(authMiddleware);

// File upload endpoints
router.post('/profile-picture', uploadProfilePicture);       // POST /api/upload/profile-picture
router.post('/travel-photos', uploadTravelPhotos);           // POST /api/upload/travel-photos
router.post('/itinerary-documents', uploadItineraryDocuments); // POST /api/upload/itinerary-documents
router.post('/expense-receipts', uploadExpenseReceipts);     // POST /api/upload/expense-receipts

// File management
router.get('/files', getUserFiles);                          // GET /api/upload/files?type=images
router.get('/files/:filename', getFileInfo);                 // GET /api/upload/files/:filename
router.delete('/files/:filename', deleteFile);               // DELETE /api/upload/files/:filename

module.exports = router;
