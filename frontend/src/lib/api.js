import { axiosInstance } from "./axios";

export const signup = async (signupData) => {
  const response = await axiosInstance.post("/auth/signup", signupData);
  return response.data;
};

export const login = async (loginData) => {
  const response = await axiosInstance.post("/auth/login", loginData);
  return response.data;
};

export const logout = async () => {
  const response = await axiosInstance.post("/auth/logout");
  return response.data;
};

export const getAuthUser = async () => {
  try {
    const res = await axiosInstance.get("/auth/me");
    return res.data;
  } catch (error) {
    console.log("Error in getAuthUser:", error);
    return null;
  }
};

export const completeOnboarding = async (userData) => {
  const response = await axiosInstance.post("/auth/onboarding", userData);
  return response.data;
};

// Trip Management APIs
export async function createTrip(tripData) {
  const response = await axiosInstance.post("/trips", tripData);
  return response.data;
}

export async function getUserTrips() {
  const response = await axiosInstance.get("/trips");
  return response.data;
}

export async function getTripById(tripId) {
  const response = await axiosInstance.get(`/trips/${tripId}`);
  return response.data;
}

export async function updateTrip(tripId, tripData) {
  const response = await axiosInstance.put(`/trips/${tripId}`, tripData);
  return response.data;
}

export async function deleteTrip(tripId) {
  const response = await axiosInstance.delete(`/trips/${tripId}`);
  return response.data;
}

// Expense Management APIs
export async function createExpense(expenseData) {
  const response = await axiosInstance.post("/expenses", expenseData);
  return response.data;
}

export async function getUserExpenses(params = {}) {
  const response = await axiosInstance.get("/expenses", { params });
  return response.data;
}

export async function updateExpense(expenseId, expenseData) {
  const response = await axiosInstance.put(`/expenses/${expenseId}`, expenseData);
  return response.data;
}

export async function deleteExpense(expenseId) {
  const response = await axiosInstance.delete(`/expenses/${expenseId}`);
  return response.data;
}

// Budget Management APIs
export async function createBudget(budgetData) {
  const response = await axiosInstance.post("/budgets", budgetData);
  return response.data;
}

export async function getUserBudgets(params = {}) {
  const response = await axiosInstance.get("/budgets", { params });
  return response.data;
}

export async function updateBudget(budgetId, budgetData) {
  const response = await axiosInstance.put(`/budgets/${budgetId}`, budgetData);
  return response.data;
}

export async function deleteBudget(budgetId) {
  const response = await axiosInstance.delete(`/budgets/${budgetId}`);
  return response.data;
}

export async function getBudgetAlerts() {
  const response = await axiosInstance.get("/budgets/alerts");
  return response.data;
}

// Journal APIs
export async function createJournalEntry(entryData) {
  const response = await axiosInstance.post("/journal", entryData);
  return response.data;
}

export async function getUserJournalEntries(params = {}) {
  const response = await axiosInstance.get("/journal", { params });
  return response.data;
}

export async function updateJournalEntry(entryId, entryData) {
  const response = await axiosInstance.put(`/journal/${entryId}`, entryData);
  return response.data;
}

export async function deleteJournalEntry(entryId) {
  const response = await axiosInstance.delete(`/journal/${entryId}`);
  return response.data;
}

// Itinerary APIs
export async function createItinerary(itineraryData) {
  const response = await axiosInstance.post("/itineraries", itineraryData);
  return response.data;
}

export async function getUserItineraries(params = {}) {
  const response = await axiosInstance.get("/itineraries", { params });
  return response.data;
}

export async function getPublicItineraries(params = {}) {
  const response = await axiosInstance.get("/itineraries/public", { params });
  return response.data;
}

// Calendar APIs
export async function createCalendarEvent(eventData) {
  const response = await axiosInstance.post("/calendar", eventData);
  return response.data;
}

export async function getCalendarEvents(params = {}) {
  const response = await axiosInstance.get("/calendar", { params });
  return response.data;
}

export async function getTodayEvents() {
  const response = await axiosInstance.get("/calendar/today");
  return response.data;
}

// Notification APIs
export async function getNotifications(params = {}) {
  const response = await axiosInstance.get("/notifications", { params });
  return response.data;
}

export async function markNotificationAsRead(notificationId) {
  const response = await axiosInstance.put(`/notifications/${notificationId}/read`);
  return response.data;
}

export async function markAllNotificationsAsRead() {
  const response = await axiosInstance.put("/notifications/read-all");
  return response.data;
}

// Search APIs
export async function globalSearch(query, type = 'all') {
  const response = await axiosInstance.get("/search", { params: { q: query, type } });
  return response.data;
}

export async function searchPublicContent(query, type = 'all') {
  const response = await axiosInstance.get("/search/public", { params: { q: query, type } });
  return response.data;
}

// File Upload APIs
export async function uploadProfilePicture(file) {
  const formData = new FormData();
  formData.append('profilePicture', file);
  const response = await axiosInstance.post("/upload/profile-picture", formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
}

export async function uploadTravelPhotos(files, tripId = null, journalEntryId = null, captions = []) {
  const formData = new FormData();
  files.forEach(file => formData.append('photos', file));
  if (tripId) formData.append('tripId', tripId);
  if (journalEntryId) formData.append('journalEntryId', journalEntryId);
  captions.forEach(caption => formData.append('captions', caption));
  
  const response = await axiosInstance.post("/upload/travel-photos", formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
}
