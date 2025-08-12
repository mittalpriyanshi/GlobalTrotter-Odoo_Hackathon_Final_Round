// LocalStorage utilities for trip management

const TRIPS_KEY = 'globaltrotter_trips';

// Get all trips from localStorage
export const getTripsFromStorage = () => {
  try {
    const trips = localStorage.getItem(TRIPS_KEY);
    return trips ? JSON.parse(trips) : [];
  } catch (error) {
    console.error('Error reading trips from localStorage:', error);
    return [];
  }
};

// Save a new trip to localStorage
export const saveTripToStorage = (tripData) => {
  try {
    const existingTrips = getTripsFromStorage();
    const newTrip = {
      ...tripData,
      id: tripData.id || `trip_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: tripData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    existingTrips.push(newTrip);
    localStorage.setItem(TRIPS_KEY, JSON.stringify(existingTrips));
    return newTrip;
  } catch (error) {
    console.error('Error saving trip to localStorage:', error);
    throw error;
  }
};

// Update an existing trip in localStorage
export const updateTripInStorage = (tripId, updatedData) => {
  try {
    const trips = getTripsFromStorage();
    const tripIndex = trips.findIndex(trip => trip.id === tripId);
    
    if (tripIndex === -1) {
      throw new Error('Trip not found');
    }
    
    trips[tripIndex] = {
      ...trips[tripIndex],
      ...updatedData,
      updatedAt: new Date().toISOString()
    };
    
    localStorage.setItem(TRIPS_KEY, JSON.stringify(trips));
    return trips[tripIndex];
  } catch (error) {
    console.error('Error updating trip in localStorage:', error);
    throw error;
  }
};

// Delete a trip from localStorage
export const deleteTripFromStorage = (tripId) => {
  try {
    const trips = getTripsFromStorage();
    const filteredTrips = trips.filter(trip => trip.id !== tripId);
    localStorage.setItem(TRIPS_KEY, JSON.stringify(filteredTrips));
    return true;
  } catch (error) {
    console.error('Error deleting trip from localStorage:', error);
    throw error;
  }
};

// Get a specific trip by ID
export const getTripById = (tripId) => {
  try {
    const trips = getTripsFromStorage();
    return trips.find(trip => trip.id === tripId) || null;
  } catch (error) {
    console.error('Error getting trip by ID:', error);
    return null;
  }
};

// Get trips by user (if you want to filter by user in the future)
export const getTripsByUser = (userEmail) => {
  try {
    const trips = getTripsFromStorage();
    return trips.filter(trip => trip.owner === userEmail);
  } catch (error) {
    console.error('Error getting trips by user:', error);
    return [];
  }
};

// Clear all trips (useful for testing)
export const clearAllTrips = () => {
  try {
    localStorage.removeItem(TRIPS_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing trips:', error);
    return false;
  }
};

// Export trip data (for backup/sharing)
export const exportTripsData = () => {
  try {
    const trips = getTripsFromStorage();
    const dataStr = JSON.stringify(trips, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `globaltrotter_trips_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
    return true;
  } catch (error) {
    console.error('Error exporting trips:', error);
    return false;
  }
};

// Import trip data (for restore/sharing)
export const importTripsData = (jsonData) => {
  try {
    const trips = JSON.parse(jsonData);
    if (!Array.isArray(trips)) {
      throw new Error('Invalid trip data format');
    }
    
    localStorage.setItem(TRIPS_KEY, JSON.stringify(trips));
    return true;
  } catch (error) {
    console.error('Error importing trips:', error);
    throw error;
  }
};
