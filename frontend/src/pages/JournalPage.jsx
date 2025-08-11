import { useState, useEffect } from "react";
import { Link } from "react-router";
import useAuthUser from "../hooks/useAuthUser";
import Navbar from "../components/Navbar";
import { PlusIcon, EditIcon, TrashIcon, ImageIcon, CalendarIcon, MapPinIcon, BookOpenIcon, SearchIcon } from "lucide-react";
import toast from "react-hot-toast";

const JournalPage = () => {
  const { authUser } = useAuthUser();
  const [journalEntries, setJournalEntries] = useState([]);
  const [savedTrips, setSavedTrips] = useState([]);
  const [isAddEntryOpen, setIsAddEntryOpen] = useState(false);
  const [isEditEntryOpen, setIsEditEntryOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTrip, setSelectedTrip] = useState("");
  
  const [newEntry, setNewEntry] = useState({
    tripId: "",
    title: "",
    content: "",
    date: "",
    location: "",
    mood: "",
    photos: [],
    weather: "",
    highlights: []
  });

  const moods = [
    { value: "excited", emoji: "😄", label: "Excited" },
    { value: "happy", emoji: "😊", label: "Happy" },
    { value: "content", emoji: "😌", label: "Content" },
    { value: "tired", emoji: "😴", label: "Tired" },
    { value: "amazed", emoji: "🤩", label: "Amazed" },
    { value: "peaceful", emoji: "😇", label: "Peaceful" },
    { value: "adventurous", emoji: "🤠", label: "Adventurous" },
    { value: "nostalgic", emoji: "🥺", label: "Nostalgic" }
  ];

  const weatherOptions = [
    "Sunny ☀️", "Cloudy ☁️", "Rainy 🌧️", "Snowy ❄️", 
    "Windy 💨", "Stormy ⛈️", "Foggy 🌫️", "Hot 🔥", "Cold 🥶"
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const trips = JSON.parse(localStorage.getItem("gt_trips") || "[]");
    const entries = JSON.parse(localStorage.getItem("gt_journal_entries") || "[]");
    
    setSavedTrips(trips);
    setJournalEntries(entries);
  };

  const addEntry = () => {
    if (!newEntry.title || !newEntry.content) {
      toast.error("Please fill in the title and content");
      return;
    }

    const entry = {
      id: Date.now(),
      ...newEntry,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const updatedEntries = [entry, ...journalEntries];
    localStorage.setItem("gt_journal_entries", JSON.stringify(updatedEntries));
    setJournalEntries(updatedEntries);
    
    setNewEntry({
      tripId: "",
      title: "",
      content: "",
      date: "",
      location: "",
      mood: "",
      photos: [],
      weather: "",
      highlights: []
    });
    
    setIsAddEntryOpen(false);
    toast.success("Journal entry added successfully");
  };

  const updateEntry = () => {
    if (!editingEntry.title || !editingEntry.content) {
      toast.error("Please fill in the title and content");
      return;
    }

    const updatedEntries = journalEntries.map(entry => 
      entry.id === editingEntry.id 
        ? { ...editingEntry, updatedAt: new Date().toISOString() }
        : entry
    );
    
    localStorage.setItem("gt_journal_entries", JSON.stringify(updatedEntries));
    setJournalEntries(updatedEntries);
    setIsEditEntryOpen(false);
    setEditingEntry(null);
    toast.success("Journal entry updated successfully");
  };

  const deleteEntry = (entryId) => {
    if (confirm("Are you sure you want to delete this journal entry?")) {
      const updatedEntries = journalEntries.filter(entry => entry.id !== entryId);
      localStorage.setItem("gt_journal_entries", JSON.stringify(updatedEntries));
      setJournalEntries(updatedEntries);
      toast.success("Journal entry deleted");
    }
  };

  const addHighlight = (entry, highlight) => {
    if (highlight.trim()) {
      const updatedEntry = {
        ...entry,
        highlights: [...(entry.highlights || []), highlight.trim()]
      };
      
      if (entry === newEntry) {
        setNewEntry(updatedEntry);
      } else {
        setEditingEntry(updatedEntry);
      }
    }
  };

  const removeHighlight = (entry, index) => {
    const updatedEntry = {
      ...entry,
      highlights: entry.highlights.filter((_, i) => i !== index)
    };
    
    if (entry === newEntry) {
      setNewEntry(updatedEntry);
    } else {
      setEditingEntry(updatedEntry);
    }
  };

  const getFilteredEntries = () => {
    let filtered = journalEntries;

    if (selectedTrip) {
      filtered = filtered.filter(entry => entry.tripId === selectedTrip);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(entry => 
        entry.title.toLowerCase().includes(query) ||
        entry.content.toLowerCase().includes(query) ||
        entry.location.toLowerCase().includes(query)
      );
    }

    return filtered;
  };

  const getTripName = (tripId) => {
    const trip = savedTrips.find(trip => trip.id.toString() === tripId);
    return trip ? trip.tripName : "Personal Entry";
  };

  const getMoodDisplay = (mood) => {
    const moodObj = moods.find(m => m.value === mood);
    return moodObj ? `${moodObj.emoji} ${moodObj.label}` : mood;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "No date";
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const filteredEntries = getFilteredEntries();

  if (!authUser) {
    return (
      <div className="min-h-screen" data-theme="retro">
        <Navbar />
        <div className="flex items-center justify-center h-64">
          <p className="text-lg opacity-70">Please log in to access your travel journal.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" data-theme="retro">
      <Navbar />
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <BookOpenIcon className="w-8 h-8" />
                Travel Journal
              </h1>
              <p className="text-lg opacity-70">Document your travel memories and experiences</p>
            </div>
            <button 
              onClick={() => setIsAddEntryOpen(true)}
              className="btn btn-primary"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              New Entry
            </button>
          </div>

          {/* Search and Filters */}
          <div className="card bg-base-100 border border-primary/20">
            <div className="card-body">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="form-control flex-1">
                  <div className="relative">
                    <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 opacity-40" />
                    <input
                      type="text"
                      className="input input-bordered w-full pl-10"
                      placeholder="Search journal entries..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
                <div className="form-control">
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
          </div>

          {/* Journal Entries */}
          {filteredEntries.length > 0 ? (
            <div className="space-y-6">
              {filteredEntries.map((entry) => (
                <div key={entry.id} className="card bg-base-100 border border-primary/20">
                  <div className="card-body">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h2 className="card-title text-xl">{entry.title}</h2>
                        <div className="flex flex-wrap gap-2 mt-2 text-sm opacity-70">
                          {entry.tripId && (
                            <span className="flex items-center gap-1">
                              <MapPinIcon className="w-4 h-4" />
                              {getTripName(entry.tripId)}
                            </span>
                          )}
                          {entry.date && (
                            <span className="flex items-center gap-1">
                              <CalendarIcon className="w-4 h-4" />
                              {formatDate(entry.date)}
                            </span>
                          )}
                          {entry.location && (
                            <span className="badge badge-outline">{entry.location}</span>
                          )}
                          {entry.weather && (
                            <span className="badge badge-secondary">{entry.weather}</span>
                          )}
                          {entry.mood && (
                            <span className="badge badge-accent">{getMoodDisplay(entry.mood)}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditingEntry({...entry});
                            setIsEditEntryOpen(true);
                          }}
                          className="btn btn-ghost btn-sm"
                        >
                          <EditIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteEntry(entry.id)}
                          className="btn btn-ghost btn-sm text-error"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="prose prose-sm max-w-none">
                      <p className="whitespace-pre-wrap">{entry.content}</p>
                    </div>

                    {entry.highlights && entry.highlights.length > 0 && (
                      <div className="mt-4">
                        <h4 className="font-semibold mb-2">Highlights:</h4>
                        <div className="flex flex-wrap gap-2">
                          {entry.highlights.map((highlight, index) => (
                            <span key={index} className="badge badge-primary">
                              {highlight}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="text-xs opacity-50 mt-4">
                      Created {new Date(entry.createdAt).toLocaleDateString()}
                      {entry.updatedAt !== entry.createdAt && (
                        <span> • Updated {new Date(entry.updatedAt).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <BookOpenIcon className="w-16 h-16 mx-auto opacity-30 mb-4" />
              <p className="text-xl opacity-70 mb-4">
                {searchQuery || selectedTrip ? "No entries match your search" : "No journal entries yet"}
              </p>
              <button 
                onClick={() => setIsAddEntryOpen(true)}
                className="btn btn-primary"
              >
                <PlusIcon className="w-4 h-4 mr-2" />
                Write Your First Entry
              </button>
            </div>
          )}

          {/* Add Entry Modal */}
          {isAddEntryOpen && (
            <div className="modal modal-open">
              <div className="modal-box max-w-4xl">
                <h3 className="font-bold text-lg mb-4">New Journal Entry</h3>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Title *</span>
                      </label>
                      <input
                        type="text"
                        className="input input-bordered"
                        value={newEntry.title}
                        onChange={(e) => setNewEntry({...newEntry, title: e.target.value})}
                        placeholder="Give your entry a title..."
                      />
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Date</span>
                      </label>
                      <input
                        type="date"
                        className="input input-bordered"
                        value={newEntry.date}
                        onChange={(e) => setNewEntry({...newEntry, date: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Trip</span>
                      </label>
                      <select
                        className="select select-bordered"
                        value={newEntry.tripId}
                        onChange={(e) => setNewEntry({...newEntry, tripId: e.target.value})}
                      >
                        <option value="">Personal Entry</option>
                        {savedTrips.map(trip => (
                          <option key={trip.id} value={trip.id.toString()}>
                            {trip.tripName}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Location</span>
                      </label>
                      <input
                        type="text"
                        className="input input-bordered"
                        value={newEntry.location}
                        onChange={(e) => setNewEntry({...newEntry, location: e.target.value})}
                        placeholder="Where are you?"
                      />
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Weather</span>
                      </label>
                      <select
                        className="select select-bordered"
                        value={newEntry.weather}
                        onChange={(e) => setNewEntry({...newEntry, weather: e.target.value})}
                      >
                        <option value="">Select weather</option>
                        {weatherOptions.map(weather => (
                          <option key={weather} value={weather}>
                            {weather}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Mood</span>
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {moods.map(mood => (
                        <label key={mood.value} className="cursor-pointer">
                          <input
                            type="radio"
                            name="mood"
                            value={mood.value}
                            checked={newEntry.mood === mood.value}
                            onChange={(e) => setNewEntry({...newEntry, mood: e.target.value})}
                            className="radio radio-sm mr-1"
                          />
                          <span className="text-sm">{mood.emoji} {mood.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Content *</span>
                    </label>
                    <textarea
                      className="textarea textarea-bordered h-32"
                      value={newEntry.content}
                      onChange={(e) => setNewEntry({...newEntry, content: e.target.value})}
                      placeholder="Write about your experience..."
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Highlights</span>
                    </label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {newEntry.highlights.map((highlight, index) => (
                        <span key={index} className="badge badge-primary gap-2">
                          {highlight}
                          <button
                            onClick={() => removeHighlight(newEntry, index)}
                            className="text-xs"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        id="new-highlight"
                        type="text"
                        className="input input-bordered flex-1"
                        placeholder="Add a highlight..."
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            addHighlight(newEntry, e.target.value);
                            e.target.value = '';
                          }
                        }}
                      />
                      <button
                        onClick={() => {
                          const input = document.getElementById('new-highlight');
                          addHighlight(newEntry, input.value);
                          input.value = '';
                        }}
                        className="btn btn-outline"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>

                <div className="modal-action">
                  <button className="btn btn-primary" onClick={addEntry}>
                    Save Entry
                  </button>
                  <button className="btn" onClick={() => setIsAddEntryOpen(false)}>
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Edit Entry Modal */}
          {isEditEntryOpen && editingEntry && (
            <div className="modal modal-open">
              <div className="modal-box max-w-4xl">
                <h3 className="font-bold text-lg mb-4">Edit Journal Entry</h3>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Title *</span>
                      </label>
                      <input
                        type="text"
                        className="input input-bordered"
                        value={editingEntry.title}
                        onChange={(e) => setEditingEntry({...editingEntry, title: e.target.value})}
                      />
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Date</span>
                      </label>
                      <input
                        type="date"
                        className="input input-bordered"
                        value={editingEntry.date}
                        onChange={(e) => setEditingEntry({...editingEntry, date: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Content *</span>
                    </label>
                    <textarea
                      className="textarea textarea-bordered h-32"
                      value={editingEntry.content}
                      onChange={(e) => setEditingEntry({...editingEntry, content: e.target.value})}
                    />
                  </div>
                </div>

                <div className="modal-action">
                  <button className="btn btn-primary" onClick={updateEntry}>
                    Update Entry
                  </button>
                  <button className="btn" onClick={() => setIsEditEntryOpen(false)}>
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

export default JournalPage;

