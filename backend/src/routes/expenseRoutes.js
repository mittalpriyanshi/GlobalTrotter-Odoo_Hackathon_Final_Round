const express = require('express');
const router = express.Router();
const {
  createExpense,
  getExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
  getTripExpenseAnalytics,
  getUserExpenseStats
} = require('../controllers/expenseController');
const authMiddleware = require('../middleware/authMiddleware');

// All expense routes require authentication
router.use(authMiddleware);

// Expense CRUD operations
router.post('/', createExpense);                    // POST /api/expenses
router.get('/', getExpenses);                       // GET /api/expenses?tripId=...&category=...&startDate=...&endDate=...
router.get('/stats', getUserExpenseStats);          // GET /api/expenses/stats?period=30d
router.get('/:expenseId', getExpenseById);          // GET /api/expenses/:expenseId
router.put('/:expenseId', updateExpense);           // PUT /api/expenses/:expenseId
router.delete('/:expenseId', deleteExpense);        // DELETE /api/expenses/:expenseId

// Analytics routes
router.get('/trip/:tripId/analytics', getTripExpenseAnalytics); // GET /api/expenses/trip/:tripId/analytics

module.exports = router;
