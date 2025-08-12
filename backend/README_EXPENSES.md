# GlobalTrotter Backend - Expense & Budget Management API

## Overview
Complete expense tracking and budget management system designed to work seamlessly with the frontend `ExpensePage.jsx` component.

## Features
✅ **Expense Management**
- Create, read, update, delete expenses
- Category-based organization (Accommodation, Transportation, Food, etc.)
- Multi-currency support
- Payment method tracking
- Date range filtering and search

✅ **Budget Management**
- Set budgets by category for each trip
- Real-time budget vs. expense tracking
- Alert system when approaching budget limits
- Budget cloning between trips
- Comprehensive budget analytics

✅ **Analytics & Reporting**
- Trip expense analytics with category breakdown
- User expense statistics over time periods
- Budget vs. actual spending comparisons
- Alert notifications for budget overruns

✅ **Integration Ready**
- Designed to match frontend localStorage patterns
- Compatible with existing trip management
- Ready for notification system integration

## API Endpoints

### Expense Endpoints

#### Create Expense
```http
POST /api/expenses
Authorization: Cookie (jwt) or Bearer token
Content-Type: application/json

{
  "tripId": "64f123...",
  "category": "Food",
  "amount": 45.50,
  "currency": "USD",
  "description": "Lunch at local restaurant",
  "date": "2024-01-15T12:30:00Z",
  "paymentMethod": "card",
  "location": "Paris, France",
  "notes": "Great local cuisine",
  "tags": ["restaurant", "local"]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Expense created successfully",
  "expense": {
    "_id": "64f456...",
    "user": "64f123...",
    "tripId": {
      "_id": "64f123...",
      "tripName": "Europe Adventure",
      "place": "Paris"
    },
    "category": "Food",
    "amount": 45.50,
    "currency": "USD",
    "description": "Lunch at local restaurant",
    "date": "2024-01-15T12:30:00.000Z",
    "paymentMethod": "card",
    "location": "Paris, France",
    "notes": "Great local cuisine",
    "tags": ["restaurant", "local"],
    "createdAt": "2024-01-15T15:30:00.000Z"
  }
}
```

#### Get Expenses
```http
GET /api/expenses?tripId=64f123...&category=Food&startDate=2024-01-01&endDate=2024-01-31&limit=50&page=1
```

**Response:**
```json
{
  "success": true,
  "expenses": [...],
  "pagination": {
    "currentPage": 1,
    "totalPages": 3,
    "totalItems": 142,
    "itemsPerPage": 50
  }
}
```

#### Update Expense
```http
PUT /api/expenses/:expenseId
Content-Type: application/json

{
  "amount": 50.00,
  "description": "Updated lunch expense",
  "notes": "Added tip"
}
```

#### Delete Expense
```http
DELETE /api/expenses/:expenseId
```

#### Get Trip Expense Analytics
```http
GET /api/expenses/trip/:tripId/analytics
```

**Response:**
```json
{
  "success": true,
  "analytics": {
    "tripId": "64f123...",
    "tripName": "Europe Adventure",
    "totalStats": {
      "total": 2450.75,
      "count": 89,
      "avgAmount": 27.54
    },
    "categoryBreakdown": [
      {
        "_id": "Food",
        "total": 680.50,
        "count": 32,
        "avgAmount": 21.27
      },
      {
        "_id": "Accommodation",
        "total": 850.00,
        "count": 7,
        "avgAmount": 121.43
      }
    ],
    "budgetSummary": {
      "totalBudget": 3000,
      "totalSpent": 2450.75,
      "totalRemaining": 549.25,
      "categories": [...],
      "overBudgetCategories": [],
      "alertCategories": [...]
    }
  }
}
```

#### Get User Expense Statistics
```http
GET /api/expenses/stats?period=30d
```

### Budget Endpoints

#### Create Budget
```http
POST /api/budgets
Content-Type: application/json

{
  "tripId": "64f123...",
  "category": "Food",
  "amount": 800.00,
  "currency": "USD",
  "startDate": "2024-01-01",
  "endDate": "2024-01-31",
  "alertThreshold": 80,
  "alertsEnabled": true,
  "notes": "Budget for food expenses in Paris"
}
```

#### Get Budgets
```http
GET /api/budgets?tripId=64f123...&category=Food&isActive=true
```

**Response:**
```json
{
  "success": true,
  "budgets": [
    {
      "_id": "64f789...",
      "tripId": {
        "_id": "64f123...",
        "tripName": "Europe Adventure",
        "place": "Paris"
      },
      "category": "Food",
      "amount": 800.00,
      "currency": "USD",
      "alertThreshold": 80,
      "alertsEnabled": true,
      "isActive": true,
      "spentAmount": 680.50,
      "percentage": 85.06,
      "remainingAmount": 119.50,
      "isOverBudget": false,
      "shouldAlert": true,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

#### Get Trip Budget Summary
```http
GET /api/budgets/trip/:tripId/summary
```

**Response:**
```json
{
  "success": true,
  "tripId": "64f123...",
  "tripName": "Europe Adventure",
  "budgetSummary": {
    "totalBudget": 3000,
    "totalSpent": 2450.75,
    "totalRemaining": 549.25,
    "categories": [
      {
        "category": "Food",
        "budgetAmount": 800,
        "spentAmount": 680.50,
        "remainingAmount": 119.50,
        "percentage": 85.06,
        "isOverBudget": false,
        "shouldAlert": true,
        "currency": "USD"
      }
    ],
    "overBudgetCategories": [],
    "alertCategories": [...]
  }
}
```

#### Get Budget Alerts
```http
GET /api/budgets/alerts
```

**Response:**
```json
{
  "success": true,
  "alerts": [
    {
      "budgetId": "64f789...",
      "tripId": "64f123...",
      "tripName": "Europe Adventure",
      "category": "Food",
      "budgetAmount": 800,
      "spentAmount": 680.50,
      "percentage": 85.06,
      "alertThreshold": 80,
      "isOverBudget": false,
      "severity": "low",
      "message": "You've spent 85.06% of your Food budget"
    }
  ]
}
```

#### Clone Budget
```http
POST /api/budgets/clone
Content-Type: application/json

{
  "sourceTripId": "64f123...",
  "targetTripId": "64f456..."
}
```

## Database Models

### Expense Model
```javascript
{
  user: ObjectId (ref: 'User', required),
  tripId: ObjectId (ref: 'Trip', required),
  category: String (enum: categories, required),
  amount: Number (required, min: 0),
  currency: String (default: 'USD'),
  description: String,
  date: Date (default: Date.now),
  paymentMethod: String (enum: ['cash', 'card', 'digital', 'other']),
  location: String,
  notes: String,
  tags: [String],
  receiptUrl: String,
  isVerified: Boolean (default: false),
  createdAt: Date,
  updatedAt: Date
}
```

### Budget Model
```javascript
{
  user: ObjectId (ref: 'User', required),
  tripId: ObjectId (ref: 'Trip', required),
  category: String (enum: categories, required),
  amount: Number (required, min: 0),
  currency: String (default: 'USD'),
  startDate: Date,
  endDate: Date,
  alertThreshold: Number (default: 80, min: 0, max: 100),
  alertsEnabled: Boolean (default: true),
  isActive: Boolean (default: true),
  notes: String,
  createdAt: Date,
  updatedAt: Date
}
```

## Expense Categories
Both models use the same category enumeration:
- Accommodation
- Transportation
- Food
- Activities
- Shopping
- Emergency
- Tips
- Insurance
- Visas
- Other

## Frontend Integration

### LocalStorage Compatibility
The API is designed to work alongside the current localStorage implementation in `ExpensePage.jsx`. You can gradually migrate from localStorage to API calls:

```javascript
// Current localStorage pattern in frontend
const expenses = JSON.parse(localStorage.getItem("gt_expenses") || "[]");
const budgets = JSON.parse(localStorage.getItem("gt_budgets") || "[]");

// API equivalent
const { data: expenses } = await axiosInstance.get('/expenses');
const { data: budgets } = await axiosInstance.get('/budgets');
```

### React Query Integration
```javascript
// Expenses
const { data: expenses, isLoading } = useQuery({
  queryKey: ['expenses', tripId],
  queryFn: () => axiosInstance.get(`/expenses?tripId=${tripId}`)
});

// Budgets
const { data: budgets } = useQuery({
  queryKey: ['budgets', tripId],
  queryFn: () => axiosInstance.get(`/budgets?tripId=${tripId}`)
});

// Budget alerts
const { data: alerts } = useQuery({
  queryKey: ['budget-alerts'],
  queryFn: () => axiosInstance.get('/budgets/alerts'),
  refetchInterval: 60000 // Check every minute
});
```

### Create Expense Example
```javascript
const createExpenseMutation = useMutation({
  mutationFn: (expenseData) => axiosInstance.post('/expenses', expenseData),
  onSuccess: () => {
    queryClient.invalidateQueries(['expenses']);
    queryClient.invalidateQueries(['budgets']); // Update budget calculations
    toast.success('Expense added successfully');
  }
});
```

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description here"
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized
- `404` - Not Found
- `500` - Internal Server Error

## Performance Features

### Database Optimization
- Composite indexes for efficient querying
- Aggregation pipelines for analytics
- Proper field indexing for filters

### Caching Strategies
Ready for Redis caching implementation:
- Budget calculations can be cached
- User statistics can be cached
- Trip analytics can be cached

### Pagination
All list endpoints support pagination to handle large datasets.

## Analytics Features

### Expense Analytics
- Total spending by category
- Average expense amounts
- Spending trends over time
- Trip-wise breakdowns

### Budget Analytics
- Budget vs. actual comparisons
- Alert generation for overspending
- Remaining budget calculations
- Category-wise budget utilization

## Security Features

### Data Protection
- User can only access their own expenses/budgets
- Trip ownership verification
- Input validation and sanitization

### Audit Trail
- Created/updated timestamps
- Expense verification status
- Budget change tracking

## Notification Integration

The system is ready for notification integration:

```javascript
// Budget alert example
if (budgetAlert.isOverBudget) {
  await notificationService.send({
    userId: budget.user,
    type: 'budget_exceeded',
    title: 'Budget Exceeded',
    message: `You've exceeded your ${budget.category} budget`,
    data: { budgetId: budget._id, tripId: budget.tripId }
  });
}
```

## Testing the API

### Create a Test Expense
```bash
curl -X POST http://localhost:5001/api/expenses \
  -H "Content-Type: application/json" \
  -H "Cookie: jwt=your-jwt-token" \
  -d '{
    "tripId": "your-trip-id",
    "category": "Food",
    "amount": 25.50,
    "description": "Coffee and pastry",
    "currency": "USD"
  }'
```

### Create a Test Budget
```bash
curl -X POST http://localhost:5001/api/budgets \
  -H "Content-Type: application/json" \
  -H "Cookie: jwt=your-jwt-token" \
  -d '{
    "tripId": "your-trip-id",
    "category": "Food",
    "amount": 500.00,
    "currency": "USD",
    "alertThreshold": 80
  }'
```

### Get Budget Alerts
```bash
curl -X GET http://localhost:5001/api/budgets/alerts \
  -H "Cookie: jwt=your-jwt-token"
```

## Next Steps

The expense and budget system is now ready for:
1. ✅ Frontend integration
2. ✅ Real-time budget tracking
3. ✅ Alert generation
4. 🚧 Receipt file upload
5. 🚧 Notification system integration
6. 🚧 Export/reporting features
7. 🚧 Currency conversion
8. 🚧 Expense categorization ML

This comprehensive expense and budget management system provides all the functionality needed by the frontend `ExpensePage.jsx` component and much more, with room for future enhancements.
