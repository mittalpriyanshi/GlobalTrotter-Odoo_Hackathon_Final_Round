import { useState, useEffect } from "react";
import { Link } from "react-router";
import useAuthUser from "../hooks/useAuthUser";
import Navbar from "../components/Navbar";
import { PlusIcon, EditIcon, TrashIcon, DollarSignIcon, PieChartIcon, TrendingUpIcon, CalendarIcon } from "lucide-react";
import toast from "react-hot-toast";

const ExpensePage = () => {
  const { authUser } = useAuthUser();
  const [expenses, setExpenses] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isAddBudgetOpen, setIsAddBudgetOpen] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState("");
  const [savedTrips, setSavedTrips] = useState([]);
  
  const [newExpense, setNewExpense] = useState({
    tripId: "",
    category: "",
    amount: "",
    description: "",
    date: "",
    currency: "USD"
  });

  const [newBudget, setNewBudget] = useState({
    tripId: "",
    category: "",
    amount: "",
    currency: "USD"
  });

  const categories = [
    "Accommodation", "Transportation", "Food", "Activities", "Shopping", 
    "Emergency", "Tips", "Insurance", "Visas", "Other"
  ];

  const currencies = ["USD", "EUR", "GBP", "JPY", "AUD", "CAD", "CHF", "CNY", "INR"];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const trips = JSON.parse(localStorage.getItem("gt_trips") || "[]");
    const expenseData = JSON.parse(localStorage.getItem("gt_expenses") || "[]");
    const budgetData = JSON.parse(localStorage.getItem("gt_budgets") || "[]");
    
    setSavedTrips(trips);
    setExpenses(expenseData);
    setBudgets(budgetData);
  };

  const addExpense = () => {
    if (!newExpense.tripId || !newExpense.category || !newExpense.amount) {
      toast.error("Please fill in all required fields");
      return;
    }

    const expense = {
      id: Date.now(),
      ...newExpense,
      amount: parseFloat(newExpense.amount),
      createdAt: new Date().toISOString()
    };

    const updatedExpenses = [...expenses, expense];
    localStorage.setItem("gt_expenses", JSON.stringify(updatedExpenses));
    setExpenses(updatedExpenses);
    setNewExpense({
      tripId: "",
      category: "",
      amount: "",
      description: "",
      date: "",
      currency: "USD"
    });
    setIsAddExpenseOpen(false);
    toast.success("Expense added successfully");
  };

  const addBudget = () => {
    if (!newBudget.tripId || !newBudget.category || !newBudget.amount) {
      toast.error("Please fill in all required fields");
      return;
    }

    const budget = {
      id: Date.now(),
      ...newBudget,
      amount: parseFloat(newBudget.amount),
      createdAt: new Date().toISOString()
    };

    const updatedBudgets = [...budgets, budget];
    localStorage.setItem("gt_budgets", JSON.stringify(updatedBudgets));
    setBudgets(updatedBudgets);
    setNewBudget({
      tripId: "",
      category: "",
      amount: "",
      currency: "USD"
    });
    setIsAddBudgetOpen(false);
    toast.success("Budget added successfully");
  };

  const deleteExpense = (expenseId) => {
    const updatedExpenses = expenses.filter(expense => expense.id !== expenseId);
    localStorage.setItem("gt_expenses", JSON.stringify(updatedExpenses));
    setExpenses(updatedExpenses);
    toast.success("Expense deleted");
  };

  const deleteBudget = (budgetId) => {
    const updatedBudgets = budgets.filter(budget => budget.id !== budgetId);
    localStorage.setItem("gt_budgets", JSON.stringify(updatedBudgets));
    setBudgets(updatedBudgets);
    toast.success("Budget deleted");
  };

  const getFilteredData = () => {
    const filteredExpenses = selectedTrip 
      ? expenses.filter(expense => expense.tripId === selectedTrip)
      : expenses;
    
    const filteredBudgets = selectedTrip 
      ? budgets.filter(budget => budget.tripId === selectedTrip)
      : budgets;

    return { filteredExpenses, filteredBudgets };
  };

  const calculateStats = () => {
    const { filteredExpenses, filteredBudgets } = getFilteredData();
    
    const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const totalBudget = filteredBudgets.reduce((sum, budget) => sum + budget.amount, 0);
    
    const categoryStats = {};
    categories.forEach(category => {
      const categoryExpenses = filteredExpenses
        .filter(expense => expense.category === category)
        .reduce((sum, expense) => sum + expense.amount, 0);
      
      const categoryBudget = filteredBudgets
        .filter(budget => budget.category === category)
        .reduce((sum, budget) => sum + budget.amount, 0);
      
      if (categoryExpenses > 0 || categoryBudget > 0) {
        categoryStats[category] = {
          spent: categoryExpenses,
          budget: categoryBudget,
          remaining: categoryBudget - categoryExpenses
        };
      }
    });

    return {
      totalExpenses,
      totalBudget,
      remaining: totalBudget - totalExpenses,
      categoryStats
    };
  };

  const stats = calculateStats();
  const { filteredExpenses, filteredBudgets } = getFilteredData();

  const getTripName = (tripId) => {
    const trip = savedTrips.find(trip => trip.id.toString() === tripId);
    return trip ? trip.tripName : "Unknown Trip";
  };

  if (!authUser) {
    return (
      <div className="min-h-screen" data-theme="retro">
        <Navbar />
        <div className="flex items-center justify-center h-64">
          <p className="text-lg opacity-70">Please log in to track your expenses.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" data-theme="retro">
      <Navbar />
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-6xl mx-auto space-y-6">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold">Expense Tracker</h1>
              <p className="text-lg opacity-70">Manage your travel budget and expenses</p>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => setIsAddBudgetOpen(true)}
                className="btn btn-outline"
              >
                <PieChartIcon className="w-4 h-4 mr-2" />
                Set Budget
              </button>
              <button 
                onClick={() => setIsAddExpenseOpen(true)}
                className="btn btn-primary"
              >
                <PlusIcon className="w-4 h-4 mr-2" />
                Add Expense
              </button>
            </div>
          </div>

          {/* Trip Filter */}
          <div className="card bg-base-100 border border-primary/20">
            <div className="card-body">
              <div className="form-control max-w-xs">
                <label className="label">
                  <span className="label-text">Filter by Trip</span>
                </label>
                <select
                  className="select select-bordered"
                  value={selectedTrip}
                  onChange={(e) => setSelectedTrip(e.target.value)}
                >
                  <option value="">All Trips</option>
                  {savedTrips.map(trip => (
                    <option key={trip.id} value={trip.id.toString()}>
                      {trip.tripName}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="stat bg-base-100 border border-primary/20 rounded-lg">
              <div className="stat-figure text-primary">
                <DollarSignIcon className="w-8 h-8" />
              </div>
              <div className="stat-title">Total Budget</div>
              <div className="stat-value text-primary">${stats.totalBudget.toFixed(2)}</div>
            </div>
            <div className="stat bg-base-100 border border-primary/20 rounded-lg">
              <div className="stat-figure text-secondary">
                <TrendingUpIcon className="w-8 h-8" />
              </div>
              <div className="stat-title">Total Spent</div>
              <div className="stat-value text-secondary">${stats.totalExpenses.toFixed(2)}</div>
            </div>
            <div className="stat bg-base-100 border border-primary/20 rounded-lg">
              <div className="stat-figure text-accent">
                <PieChartIcon className="w-8 h-8" />
              </div>
              <div className="stat-title">Remaining</div>
              <div className={`stat-value ${stats.remaining >= 0 ? 'text-success' : 'text-error'}`}>
                ${stats.remaining.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Category Breakdown */}
          {Object.keys(stats.categoryStats).length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Progress Bars */}
              <div className="card bg-base-100 border border-primary/20">
                <div className="card-body">
                  <h2 className="text-xl font-bold mb-4">Category Breakdown</h2>
                  <div className="space-y-3">
                    {Object.entries(stats.categoryStats).map(([category, data]) => (
                      <div key={category} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{category}</span>
                          <span className="text-sm opacity-70">
                            ${data.spent.toFixed(2)} / ${data.budget.toFixed(2)}
                          </span>
                        </div>
                        <div className="w-full bg-base-300 rounded-full h-3">
                          <div
                            className={`h-3 rounded-full transition-all ${
                              data.spent <= data.budget ? 'bg-success' : 'bg-error'
                            }`}
                            style={{
                              width: `${Math.min((data.spent / data.budget) * 100, 100)}%`
                            }}
                          ></div>
                        </div>
                        <div className="text-xs opacity-60">
                          {((data.spent / data.budget) * 100).toFixed(1)}% used
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Pie Chart Simulation */}
              <div className="card bg-base-100 border border-primary/20">
                <div className="card-body">
                  <h2 className="text-xl font-bold mb-4">Spending Distribution</h2>
                  <div className="space-y-4">
                    {Object.entries(stats.categoryStats).map(([category, data], index) => {
                      const percentage = (data.spent / stats.totalExpenses) * 100;
                      const colors = ['bg-primary', 'bg-secondary', 'bg-accent', 'bg-info', 'bg-success', 'bg-warning', 'bg-error'];
                      const color = colors[index % colors.length];
                      
                      return (
                        <div key={category} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-4 h-4 rounded ${color}`}></div>
                            <span className="text-sm font-medium">{category}</span>
                          </div>
                          <div className="text-right">
                            <div className="font-bold">${data.spent.toFixed(2)}</div>
                            <div className="text-xs opacity-60">{percentage.toFixed(1)}%</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Visual Pie Chart Representation */}
                  <div className="mt-6">
                    <div className="relative w-32 h-32 mx-auto">
                      <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 32 32">
                        {Object.entries(stats.categoryStats).map(([category, data], index) => {
                          const percentage = (data.spent / stats.totalExpenses) * 100;
                          const colors = ['#1fb2a6', '#7c3aed', '#f59e0b', '#3b82f6', '#10b981', '#f97316', '#ef4444'];
                          const color = colors[index % colors.length];
                          
                          // Calculate stroke-dasharray for pie slice
                          const circumference = 2 * Math.PI * 15.915;
                          const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;
                          
                          // Calculate rotation for each slice
                          const rotation = Object.entries(stats.categoryStats)
                            .slice(0, index)
                            .reduce((acc, [, prevData]) => acc + ((prevData.spent / stats.totalExpenses) * 100), 0);
                          
                          return (
                            <circle
                              key={category}
                              cx="16"
                              cy="16"
                              r="15.915"
                              fill="transparent"
                              stroke={color}
                              strokeWidth="1"
                              strokeDasharray={strokeDasharray}
                              strokeDashoffset="0"
                              style={{
                                transform: `rotate(${rotation * 3.6}deg)`,
                                transformOrigin: '16px 16px'
                              }}
                            />
                          );
                        })}
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Recent Expenses */}
          <div className="card bg-base-100 border border-primary/20">
            <div className="card-body">
              <h2 className="text-xl font-bold mb-4">Recent Expenses</h2>
              {filteredExpenses.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="table table-zebra">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Trip</th>
                        <th>Category</th>
                        <th>Description</th>
                        <th>Amount</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredExpenses
                        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                        .slice(0, 10)
                        .map(expense => (
                          <tr key={expense.id}>
                            <td>{expense.date || 'N/A'}</td>
                            <td>{getTripName(expense.tripId)}</td>
                            <td>
                              <div className="badge badge-outline">{expense.category}</div>
                            </td>
                            <td>{expense.description || 'N/A'}</td>
                            <td className="font-mono">
                              {expense.currency} {expense.amount.toFixed(2)}
                            </td>
                            <td>
                              <button
                                onClick={() => deleteExpense(expense.id)}
                                className="btn btn-ghost btn-sm text-error"
                              >
                                <TrashIcon className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-lg opacity-70">No expenses recorded yet</p>
                  <button 
                    onClick={() => setIsAddExpenseOpen(true)}
                    className="btn btn-primary mt-4"
                  >
                    Add Your First Expense
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Add Expense Modal */}
          {isAddExpenseOpen && (
            <div className="modal modal-open">
              <div className="modal-box">
                <h3 className="font-bold text-lg mb-4">Add New Expense</h3>
                
                <div className="space-y-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Trip *</span>
                    </label>
                    <select
                      className="select select-bordered"
                      value={newExpense.tripId}
                      onChange={(e) => setNewExpense({...newExpense, tripId: e.target.value})}
                    >
                      <option value="">Select a trip</option>
                      {savedTrips.map(trip => (
                        <option key={trip.id} value={trip.id.toString()}>
                          {trip.tripName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Category *</span>
                      </label>
                      <select
                        className="select select-bordered"
                        value={newExpense.category}
                        onChange={(e) => setNewExpense({...newExpense, category: e.target.value})}
                      >
                        <option value="">Select category</option>
                        {categories.map(category => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Date</span>
                      </label>
                      <input
                        type="date"
                        className="input input-bordered"
                        value={newExpense.date}
                        onChange={(e) => setNewExpense({...newExpense, date: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Amount *</span>
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        className="input input-bordered"
                        value={newExpense.amount}
                        onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})}
                        placeholder="0.00"
                      />
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Currency</span>
                      </label>
                      <select
                        className="select select-bordered"
                        value={newExpense.currency}
                        onChange={(e) => setNewExpense({...newExpense, currency: e.target.value})}
                      >
                        {currencies.map(currency => (
                          <option key={currency} value={currency}>
                            {currency}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Description</span>
                    </label>
                    <input
                      type="text"
                      className="input input-bordered"
                      value={newExpense.description}
                      onChange={(e) => setNewExpense({...newExpense, description: e.target.value})}
                      placeholder="What was this expense for?"
                    />
                  </div>
                </div>

                <div className="modal-action">
                  <button className="btn btn-primary" onClick={addExpense}>
                    Add Expense
                  </button>
                  <button className="btn" onClick={() => setIsAddExpenseOpen(false)}>
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Add Budget Modal */}
          {isAddBudgetOpen && (
            <div className="modal modal-open">
              <div className="modal-box">
                <h3 className="font-bold text-lg mb-4">Set Budget</h3>
                
                <div className="space-y-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Trip *</span>
                    </label>
                    <select
                      className="select select-bordered"
                      value={newBudget.tripId}
                      onChange={(e) => setNewBudget({...newBudget, tripId: e.target.value})}
                    >
                      <option value="">Select a trip</option>
                      {savedTrips.map(trip => (
                        <option key={trip.id} value={trip.id.toString()}>
                          {trip.tripName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Category *</span>
                    </label>
                    <select
                      className="select select-bordered"
                      value={newBudget.category}
                      onChange={(e) => setNewBudget({...newBudget, category: e.target.value})}
                    >
                      <option value="">Select category</option>
                      {categories.map(category => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Budget Amount *</span>
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        className="input input-bordered"
                        value={newBudget.amount}
                        onChange={(e) => setNewBudget({...newBudget, amount: e.target.value})}
                        placeholder="0.00"
                      />
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Currency</span>
                      </label>
                      <select
                        className="select select-bordered"
                        value={newBudget.currency}
                        onChange={(e) => setNewBudget({...newBudget, currency: e.target.value})}
                      >
                        {currencies.map(currency => (
                          <option key={currency} value={currency}>
                            {currency}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="modal-action">
                  <button className="btn btn-primary" onClick={addBudget}>
                    Set Budget
                  </button>
                  <button className="btn" onClick={() => setIsAddBudgetOpen(false)}>
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default ExpensePage;
