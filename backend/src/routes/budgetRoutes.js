const express = require('express');
const router = express.Router();
const {
  createBudget,
  getBudgets,
  getBudgetById,
  updateBudget,
  deleteBudget,
  getTripBudgetSummary,
  getBudgetAlerts,
  cloneBudget
} = require('../controllers/budgetController');
const authMiddleware = require('../middleware/authMiddleware');

// All budget routes require authentication
router.use(authMiddleware);

// Budget CRUD operations
router.post('/', createBudget);                     // POST /api/budgets
router.get('/', getBudgets);                        // GET /api/budgets?tripId=...&category=...&isActive=...
router.get('/alerts', getBudgetAlerts);             // GET /api/budgets/alerts
router.get('/:budgetId', getBudgetById);            // GET /api/budgets/:budgetId
router.put('/:budgetId', updateBudget);             // PUT /api/budgets/:budgetId
router.delete('/:budgetId', deleteBudget);          // DELETE /api/budgets/:budgetId

// Trip-specific routes
router.get('/trip/:tripId/summary', getTripBudgetSummary); // GET /api/budgets/trip/:tripId/summary

// Utility routes
router.post('/clone', cloneBudget);                 // POST /api/budgets/clone

module.exports = router;
