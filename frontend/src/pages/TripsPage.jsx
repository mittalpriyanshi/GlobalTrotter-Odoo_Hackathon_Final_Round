import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getUserTrips, deleteTrip as deleteTripAPI, updateTrip } from "../lib/api";
import useAuthUser from "../hooks/useAuthUser";
import Navbar from "../components/Navbar";
import { CalendarIcon, MapPinIcon, EditIcon, TrashIcon, EyeIcon, ShareIcon, PlusIcon } from "lucide-react";
import toast from "react-hot-toast";

const TripsPage = () => {
  const { authUser } = useAuthUser();
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTrip, setEditingTrip] = useState(null);
  const [filter, setFilter] = useState("all"); // all, upcoming, past
  const queryClient = useQueryClient();

  // Fetch trips from backend API
  const { data: tripsData, isLoading, error } = useQuery({
    queryKey: ["userTrips"],
    queryFn: getUserTrips,
    enabled: !!authUser,
    staleTime: 30000, // Consider data fresh for 30 seconds
  });

  const trips = tripsData?.trips || [];

  // Delete trip mutation
  const deleteTripMutation = useMutation({
    mutationFn: deleteTripAPI,
    onSuccess: () => {
      queryClient.invalidateQueries(["userTrips"]);
      toast.success("Trip deleted successfully");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to delete trip");
    }
  });

  // Update trip mutation
  const updateTripMutation = useMutation({
    mutationFn: ({ tripId, tripData }) => updateTrip(tripId, tripData),
    onSuccess: () => {
      queryClient.invalidateQueries(["userTrips"]);
      toast.success("Trip updated successfully");
      setIsEditModalOpen(false);
      setEditingTrip(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to update trip");
    }
  });

  const handleDeleteTrip = (tripId) => {
    if (confirm("Are you sure you want to delete this trip?")) {
      deleteTripMutation.mutate(tripId);
    }
  };

  const duplicateTrip = (trip) => {
    const newTripData = {
      tripName: `${trip.tripName} (Copy)`,
      place: trip.place,
      startDate: trip.startDate,
      endDate: trip.endDate,
      budget: trip.budget,
      description: trip.description,
      suggestions: trip.suggestions || []
    };
    
    // Create new trip via API (we'll need to add createTrip API call)
    // For now, we'll use the existing updateTrip mutation with a new trip
    toast.info("Trip duplication feature will be available soon!");
  };

  const saveEditedTrip = () => {
    if (!editingTrip || !editingTrip.tripName) {
      toast.error("Please fill in the trip name");
      return;
    }
    
    updateTripMutation.mutate({
      tripId: editingTrip._id || editingTrip.id,
      tripData: {
        tripName: editingTrip.tripName,
        place: editingTrip.place,
        startDate: editingTrip.startDate,
        endDate: editingTrip.endDate,
        budget: editingTrip.budget,
        description: editingTrip.description
      }
    });
  };

  const shareTrip = (trip) => {
    // Create public itinerary
    const publicItinerary = {
      id: `public_${trip.id}_${Date.now()}`,
      name: trip.tripName,
      author: authUser?.fullName || "Anonymous",
      authorAvatar: authUser?.profilePic || `https://avatar.iran.liara.run/public/${Math.floor(Math.random() * 100)}.png`,
      description: trip.description || "Shared travel itinerary",
      totalBudget: trip.budget || 0,
      currency: "USD",
      duration: trip.endDate && trip.startDate ? 
        `${Math.ceil((new Date(trip.endDate) - new Date(trip.startDate)) / (1000 * 60 * 60 * 24))} days` : 
        "Multiple days",
      createdAt: new Date().toISOString().split('T')[0],
      isPublic: true,
      likes: 0,
      views: 0,
      tags: ["Shared Trip"],
      stops: trip.suggestions ? [
        {
          id: 1,
          city: trip.place,
          startDate: trip.startDate,
          endDate: trip.endDate,
          budget: trip.budget || 0,
          activities: trip.suggestions.map((suggestion, index) => ({
            id: index + 1,
            name: suggestion.name,
            time: "09:00",
            duration: suggestion.duration || 120,
            cost: suggestion.cost || 0,
            category: suggestion.category || "General",
            priority: "Medium",
            notes: suggestion.notes || "",
            completed: false
          }))
        }
      ] : []
    };

    // Save to public itineraries
    const publicItineraries = JSON.parse(localStorage.getItem("gt_public_itineraries") || "[]");
    publicItineraries.push(publicItinerary);
    localStorage.setItem("gt_public_itineraries", JSON.stringify(publicItineraries));

    // Create share URL
    const shareUrl = `${window.location.origin}/public/${publicItinerary.id}`;
    
    // Copy to clipboard
    navigator.clipboard.writeText(shareUrl).then(() => {
      toast.success("Public link copied to clipboard! Your trip is now shareable.");
    }).catch(() => {
      toast.error("Failed to copy link");
    });
  };

  const getFilteredTrips = () => {
    const now = new Date();
    return trips.filter(trip => {
      if (filter === "upcoming") {
        return trip.startDate && new Date(trip.startDate) > now;
      }
      if (filter === "past") {
        return trip.endDate && new Date(trip.endDate) < now;
      }
      return true; // all
    });
  };

  const getTripStatus = (trip) => {
    if (!trip.startDate || !trip.endDate) return "draft";
    const now = new Date();
    const start = new Date(trip.startDate);
    const end = new Date(trip.endDate);
    
    if (start > now) return "upcoming";
    if (end < now) return "completed";
    return "ongoing";
  };

  const getStatusBadge = (status) => {
    const badges = {
      draft: "badge-outline",
      upcoming: "badge-primary",
      ongoing: "badge-success",
      completed: "badge-secondary"
    };
    return `badge ${badges[status]}`;
  };

  const filteredTrips = getFilteredTrips();

  if (!authUser) {
    return (
      <div className="min-h-screen" data-theme="retro">
        <Navbar />
        <div className="flex items-center justify-center h-64">
          <p className="text-lg opacity-70">Please log in to view your trips.</p>
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
              <h1 className="text-3xl font-bold">My Trips</h1>
              <p className="text-lg opacity-70">Manage your travel plans and memories</p>
            </div>
            <Link to="/plan" className="btn btn-primary">
              <PlusIcon className="w-4 h-4 mr-2" />
              Plan New Trip
            </Link>
          </div>

          {/* Filters */}
          <div className="flex gap-2">
            <button 
              onClick={() => setFilter("all")}
              className={`btn btn-sm ${filter === "all" ? "btn-primary" : "btn-outline"}`}
            >
              All ({trips.length})
            </button>
            <button 
              onClick={() => setFilter("upcoming")}
              className={`btn btn-sm ${filter === "upcoming" ? "btn-primary" : "btn-outline"}`}
            >
              Upcoming
            </button>
            <button 
              onClick={() => setFilter("past")}
              className={`btn btn-sm ${filter === "past" ? "btn-primary" : "btn-outline"}`}
            >
              Past
            </button>
          </div>

          {/* Loading State */}
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="loading loading-spinner loading-lg"></div>
              <p className="ml-4 text-lg opacity-70">Loading your trips...</p>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-64">
              <div className="alert alert-error max-w-md">
                <span>Failed to load trips. Please try again.</span>
              </div>
            </div>
          ) : filteredTrips.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTrips.map((trip) => {
                const status = getTripStatus(trip);
                return (
                  <div key={trip._id || trip.id} className="card bg-base-100 border border-primary/20 hover:shadow-lg transition-shadow">
                    <div className="card-body">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h3 className="card-title text-lg">{trip.tripName}</h3>
                          <div className="flex items-center gap-1 text-sm opacity-70 mt-1">
                            <MapPinIcon className="w-4 h-4" />
                            {trip.place}
                          </div>
                        </div>
                        <div className={getStatusBadge(status)}>
                          {status}
                        </div>
                      </div>

                      {(trip.startDate || trip.endDate) && (
                        <div className="flex items-center gap-1 text-sm opacity-70">
                          <CalendarIcon className="w-4 h-4" />
                          {trip.startDate && trip.endDate 
                            ? `${trip.startDate} to ${trip.endDate}`
                            : trip.startDate || trip.endDate
                          }
                        </div>
                      )}

                      {trip.suggestions && trip.suggestions.length > 0 && (
                        <div className="text-sm opacity-70">
                          {trip.suggestions.length} attractions planned
                        </div>
                      )}

                      <div className="card-actions justify-end mt-4 gap-2">
                        <button
                          onClick={() => {
                            setSelectedTrip(trip);
                            setIsViewModalOpen(true);
                          }}
                          className="btn btn-sm btn-ghost"
                          title="View Details"
                        >
                          <EyeIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setEditingTrip({...trip});
                            setIsEditModalOpen(true);
                          }}
                          className="btn btn-sm btn-ghost"
                          title="Edit Trip"
                        >
                          <EditIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => shareTrip(trip)}
                          className="btn btn-sm btn-ghost"
                          title="Share Trip"
                        >
                          <ShareIcon className="w-4 h-4" />
                        </button>
                        <div className="dropdown dropdown-end">
                          <label tabIndex={0} className="btn btn-sm btn-ghost">⋮</label>
                          <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
                            <li><button onClick={() => duplicateTrip(trip)}>Duplicate</button></li>
                            <li><button onClick={() => handleDeleteTrip(trip._id || trip.id)} className="text-error">Delete</button></li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-xl opacity-70 mb-4">
                {filter === "all" ? "No trips found" : `No ${filter} trips found`}
              </p>
              <Link to="/plan" className="btn btn-primary">
                <PlusIcon className="w-4 h-4 mr-2" />
                Plan Your First Trip
              </Link>
            </div>
          )}

          {/* View Trip Modal */}
          {isViewModalOpen && selectedTrip && (
            <div className="modal modal-open">
              <div className="modal-box max-w-4xl">
                <h3 className="font-bold text-lg mb-4">{selectedTrip.tripName}</h3>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold">Destination</h4>
                      <p className="opacity-70">{selectedTrip.place}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold">Dates</h4>
                      <p className="opacity-70">
                        {selectedTrip.startDate && selectedTrip.endDate 
                          ? `${selectedTrip.startDate} to ${selectedTrip.endDate}`
                          : "Dates not set"
                        }
                      </p>
                    </div>
                  </div>

                  {selectedTrip.suggestions && selectedTrip.suggestions.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">Planned Attractions</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {selectedTrip.suggestions.map((suggestion) => (
                          <div key={suggestion.id} className="card bg-base-200 border border-primary/10">
                            <div className="card-body p-3">
                              <h5 className="font-medium text-sm">{suggestion.name}</h5>
                              {suggestion.kinds && (
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {suggestion.kinds.split(",").slice(0, 3).map((kind, i) => (
                                    <span key={i} className="badge badge-outline badge-xs">
                                      {kind.trim()}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="modal-action">
                  <button className="btn" onClick={() => setIsViewModalOpen(false)}>Close</button>
                </div>
              </div>
            </div>
          )}

          {/* Edit Trip Modal */}
          {isEditModalOpen && editingTrip && (
            <div className="modal modal-open">
              <div className="modal-box">
                <h3 className="font-bold text-lg mb-4">Edit Trip</h3>
                
                <div className="space-y-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Trip Name</span>
                    </label>
                    <input
                      type="text"
                      className="input input-bordered"
                      value={editingTrip.tripName}
                      onChange={(e) => setEditingTrip({...editingTrip, tripName: e.target.value})}
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Destination</span>
                    </label>
                    <input
                      type="text"
                      className="input input-bordered"
                      value={editingTrip.place}
                      onChange={(e) => setEditingTrip({...editingTrip, place: e.target.value})}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Start Date</span>
                      </label>
                      <input
                        type="date"
                        className="input input-bordered"
                        value={editingTrip.startDate}
                        onChange={(e) => setEditingTrip({...editingTrip, startDate: e.target.value})}
                      />
                    </div>
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">End Date</span>
                      </label>
                      <input
                        type="date"
                        className="input input-bordered"
                        value={editingTrip.endDate}
                        onChange={(e) => setEditingTrip({...editingTrip, endDate: e.target.value})}
                      />
                    </div>
                  </div>
                </div>

                <div className="modal-action">
                  <button className="btn btn-primary" onClick={saveEditedTrip}>Save Changes</button>
                  <button className="btn" onClick={() => setIsEditModalOpen(false)}>Cancel</button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default TripsPage;
