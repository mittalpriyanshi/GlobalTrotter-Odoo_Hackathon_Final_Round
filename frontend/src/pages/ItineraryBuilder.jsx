import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import useAuthUser from "../hooks/useAuthUser";
import Navbar from "../components/Navbar";
import { 
  PlusIcon, 
  TrashIcon, 
  EditIcon, 
  MapPinIcon, 
  CalendarIcon, 
  DollarSignIcon, 
  ClockIcon, 
  SaveIcon, 
  DownloadIcon,
  CopyIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  StarIcon,
  CheckIcon,
  XIcon
} from "lucide-react";
import toast from "react-hot-toast";

const defaultStop = () => ({ 
  id: crypto.randomUUID(), 
  city: "", 
  start: "", 
  end: "", 
  activities: [],
  accommodation: "",
  budget: "",
  notes: "",
  dayPlans: []
});

const defaultActivity = () => ({
  id: crypto.randomUUID(),
  name: "",
  time: "",
  duration: "",
  cost: "",
  priority: "medium",
  completed: false,
  notes: "",
  category: ""
});

const activityCategories = [
  "Sightseeing", "Food & Dining", "Adventure", "Cultural", "Shopping", 
  "Entertainment", "Transportation", "Accommodation", "Relaxation", "Other"
];

const activityTemplates = {
  "Sightseeing": [
    "Visit famous landmarks", "City walking tour", "Museum visit", "Historical sites", "Viewpoint/Observatory"
  ],
  "Food & Dining": [
    "Local breakfast", "Street food tour", "Fine dining dinner", "Local market visit", "Cooking class"
  ],
  "Adventure": [
    "Hiking/Trekking", "Water sports", "Adventure park", "Rock climbing", "Safari/Wildlife tour"
  ],
  "Cultural": [
    "Traditional show/performance", "Local festival", "Art gallery visit", "Cultural workshop", "Religious site visit"
  ],
  "Transportation": [
    "Airport/Station transfer", "Local transport", "Car rental pickup", "Train journey", "Flight"
  ]
};

const ItineraryBuilder = () => {
  const { authUser } = useAuthUser();
  const [stops, setStops] = useState([defaultStop()]);
  const [itineraryName, setItineraryName] = useState("");
  const [totalBudget, setTotalBudget] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [selectedStopForTemplate, setSelectedStopForTemplate] = useState(null);
  const [expandedStops, setExpandedStops] = useState(new Set());
  const [savedItineraries, setSavedItineraries] = useState([]);

  const currencies = ["USD", "EUR", "GBP", "JPY", "AUD", "CAD", "CHF", "CNY", "INR"];

  useEffect(() => {
    loadSavedItineraries();
  }, []);

  const loadSavedItineraries = () => {
    const saved = JSON.parse(localStorage.getItem("gt_itineraries") || "[]");
    setSavedItineraries(saved);
  };

  const addStop = () => setStops((s) => [...s, defaultStop()]);
  
  const removeStop = (id) => {
    if (stops.length === 1) {
      toast.error("You need at least one stop in your itinerary");
      return;
    }
    setStops((s) => s.filter((x) => x.id !== id));
  };
  
  const updateStop = (id, patch) => setStops((s) => s.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  
  const move = (idx, dir) => {
    setStops((s) => {
      const a = [...s];
      const j = idx + dir;
      if (j < 0 || j >= a.length) return a;
      const tmp = a[idx];
      a[idx] = a[j];
      a[j] = tmp;
      return a;
    });
  };

  const addActivity = (stopId, activity = defaultActivity()) => {
    updateStop(stopId, {
      activities: [...(stops.find(s => s.id === stopId)?.activities || []), activity]
    });
  };

  const updateActivity = (stopId, activityId, patch) => {
    const stop = stops.find(s => s.id === stopId);
    if (!stop) return;
    
    const updatedActivities = stop.activities.map(activity => 
      activity.id === activityId ? { ...activity, ...patch } : activity
    );
    updateStop(stopId, { activities: updatedActivities });
  };

  const removeActivity = (stopId, activityId) => {
    const stop = stops.find(s => s.id === stopId);
    if (!stop) return;
    
    const updatedActivities = stop.activities.filter(activity => activity.id !== activityId);
    updateStop(stopId, { activities: updatedActivities });
  };

  const addTemplateActivities = (stopId, category) => {
    const templates = activityTemplates[category] || [];
    const activities = templates.map(name => ({
      ...defaultActivity(),
      name,
      category
    }));
    
    const stop = stops.find(s => s.id === stopId);
    if (stop) {
      updateStop(stopId, {
        activities: [...stop.activities, ...activities]
      });
    }
    
    setIsTemplateModalOpen(false);
    toast.success(`Added ${templates.length} ${category} activities`);
  };

  const calculateTotalCost = () => {
    return stops.reduce((total, stop) => {
      const stopBudget = parseFloat(stop.budget) || 0;
      const activitiesCost = stop.activities.reduce((sum, activity) => 
        sum + (parseFloat(activity.cost) || 0), 0
      );
      return total + stopBudget + activitiesCost;
    }, 0);
  };

  const generateDayPlans = (stopId) => {
    const stop = stops.find(s => s.id === stopId);
    if (!stop || !stop.start || !stop.end) return;

    const startDate = new Date(stop.start);
    const endDate = new Date(stop.end);
    const dayPlans = [];

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      dayPlans.push({
        id: crypto.randomUUID(),
        date: d.toISOString().split('T')[0],
        activities: []
      });
    }

    updateStop(stopId, { dayPlans });
    toast.success("Day plans generated!");
  };

  const saveItinerary = () => {
    if (!itineraryName.trim()) {
      toast.error("Please enter an itinerary name");
      return;
    }

    const itinerary = {
      id: Date.now(),
      name: itineraryName,
      stops,
      totalBudget,
      currency,
      totalCost: calculateTotalCost(),
      createdAt: new Date().toISOString(),
      createdBy: authUser?.fullName || "Anonymous"
    };

    const existing = JSON.parse(localStorage.getItem("gt_itineraries") || "[]");
    const updated = [itinerary, ...existing];
    localStorage.setItem("gt_itineraries", JSON.stringify(updated));
    
    loadSavedItineraries();
    toast.success("Itinerary saved successfully!");
  };

  const exportItinerary = () => {
    const data = {
      name: itineraryName,
      stops,
      totalBudget,
      currency,
      totalCost: calculateTotalCost(),
      exportedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${itineraryName || 'itinerary'}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success("Itinerary exported!");
  };

  const duplicateStop = (stop) => {
    const duplicated = {
      ...stop,
      id: crypto.randomUUID(),
      city: `${stop.city} (Copy)`,
      activities: stop.activities.map(activity => ({
        ...activity,
        id: crypto.randomUUID()
      }))
    };
    setStops(s => [...s, duplicated]);
    toast.success("Stop duplicated!");
  };

  const toggleStopExpansion = (stopId) => {
    const newExpanded = new Set(expandedStops);
    if (newExpanded.has(stopId)) {
      newExpanded.delete(stopId);
    } else {
      newExpanded.add(stopId);
    }
    setExpandedStops(newExpanded);
  };

  const calculateStopDuration = (start, end) => {
    if (!start || !end) return "Not set";
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return `${diffDays} day${diffDays > 1 ? 's' : ''}`;
  };

  return (
    <div className="min-h-screen" data-theme="retro">
      <Navbar />
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-6xl mx-auto space-y-6">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold">Build Itinerary</h1>
              <p className="text-lg opacity-70">Create detailed day-wise travel plans</p>
            </div>
            <div className="flex gap-2">
              <button onClick={exportItinerary} className="btn btn-outline" disabled={!itineraryName}>
                <DownloadIcon className="w-4 h-4 mr-2" />
                Export
              </button>
              <button onClick={saveItinerary} className="btn btn-primary">
                <SaveIcon className="w-4 h-4 mr-2" />
                Save Itinerary
              </button>
            </div>
          </div>

          {/* Itinerary Header */}
          <div className="card bg-base-100 border border-primary/20">
            <div className="card-body">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Itinerary Name *</span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered"
                    value={itineraryName}
                    onChange={(e) => setItineraryName(e.target.value)}
                    placeholder="e.g., Europe Adventure 2024"
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Total Budget</span>
                  </label>
                  <input
                    type="number"
                    className="input input-bordered"
                    value={totalBudget}
                    onChange={(e) => setTotalBudget(e.target.value)}
                    placeholder="0.00"
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Currency</span>
                  </label>
                  <select
                    className="select select-bordered"
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                  >
                    {currencies.map(curr => (
                      <option key={curr} value={curr}>{curr}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Budget Summary */}
              <div className="divider"></div>
              <div className="stats stats-horizontal">
                <div className="stat">
                  <div className="stat-title">Planned Budget</div>
                  <div className="stat-value text-primary">{currency} {totalBudget || '0'}</div>
                </div>
                <div className="stat">
                  <div className="stat-title">Estimated Cost</div>
                  <div className="stat-value text-secondary">{currency} {calculateTotalCost().toFixed(2)}</div>
                </div>
                <div className="stat">
                  <div className="stat-title">Difference</div>
                  <div className={`stat-value ${(parseFloat(totalBudget) || 0) >= calculateTotalCost() ? 'text-success' : 'text-error'}`}>
                    {currency} {((parseFloat(totalBudget) || 0) - calculateTotalCost()).toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stops/Sections */}
          {stops.map((stop, idx) => (
            <div key={stop.id} className="card bg-base-100 border border-primary/20">
              <div className="card-body">
                
                {/* Stop Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="badge badge-primary badge-lg">Stop {idx + 1}</div>
                    <h2 className="text-xl font-semibold">
                      {stop.city || "New Destination"}
                    </h2>
                    {stop.start && stop.end && (
                      <div className="badge badge-outline">
                        <ClockIcon className="w-3 h-3 mr-1" />
                        {calculateStopDuration(stop.start, stop.end)}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleStopExpansion(stop.id)}
                      className="btn btn-ghost btn-sm"
                    >
                      {expandedStops.has(stop.id) ? "Collapse" : "Expand"}
                    </button>
                    <button
                      onClick={() => move(idx, -1)}
                      disabled={idx === 0}
                      className="btn btn-ghost btn-sm"
                      title="Move Up"
                    >
                      <ArrowUpIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => move(idx, 1)}
                      disabled={idx === stops.length - 1}
                      className="btn btn-ghost btn-sm"
                      title="Move Down"
                    >
                      <ArrowDownIcon className="w-4 h-4" />
                    </button>
                    <div className="dropdown dropdown-end">
                      <label tabIndex={0} className="btn btn-ghost btn-sm">⋮</label>
                      <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
                        <li><button onClick={() => duplicateStop(stop)}>
                          <CopyIcon className="w-4 h-4" />
                          Duplicate Stop
                        </button></li>
                        <li><button onClick={() => generateDayPlans(stop.id)}>
                          <CalendarIcon className="w-4 h-4" />
                          Generate Day Plans
                        </button></li>
                        <li><button
                          onClick={() => removeStop(stop.id)}
                          className="text-error"
                          disabled={stops.length === 1}
                        >
                          <TrashIcon className="w-4 h-4" />
                          Remove Stop
                        </button></li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Basic Stop Info */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">City/Destination *</span>
                    </label>
                    <div className="relative">
                      <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 opacity-50" />
                      <input
                        type="text"
                        className="input input-bordered pl-10"
                        value={stop.city}
                        onChange={(e) => updateStop(stop.id, { city: e.target.value })}
                        placeholder="e.g., Paris, France"
                      />
                    </div>
                  </div>
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Start Date</span>
                    </label>
                    <input
                      type="date"
                      className="input input-bordered"
                      value={stop.start}
                      onChange={(e) => updateStop(stop.id, { start: e.target.value })}
                    />
                  </div>
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">End Date</span>
                    </label>
                    <input
                      type="date"
                      className="input input-bordered"
                      value={stop.end}
                      onChange={(e) => updateStop(stop.id, { end: e.target.value })}
                    />
                  </div>
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Budget ({currency})</span>
                    </label>
                    <div className="relative">
                      <DollarSignIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 opacity-50" />
                      <input
                        type="number"
                        className="input input-bordered pl-10"
                        value={stop.budget}
                        onChange={(e) => updateStop(stop.id, { budget: e.target.value })}
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          <button className="btn btn-outline" onClick={addStop}>+ Add another Section</button>
        </div>
      </div>
    </div>
  );
};

export default ItineraryBuilder;


