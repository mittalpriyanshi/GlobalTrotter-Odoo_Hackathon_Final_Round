import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { 
  ShareIcon,
  CopyIcon,
  DownloadIcon,
  HeartIcon,
  MapPinIcon,
  CalendarIcon,
  ClockIcon,
  DollarSignIcon,
  UserIcon,
  StarIcon,
  ExternalLinkIcon,
  CheckIcon
} from "lucide-react";
import toast from "react-hot-toast";

const PublicItineraryPage = () => {
  const { itineraryId } = useParams();
  const [itinerary, setItinerary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(0);

  useEffect(() => {
    loadItinerary();
  }, [itineraryId]);

  const loadItinerary = () => {
    // Load public itinerary from localStorage
    const publicItineraries = JSON.parse(localStorage.getItem("gt_public_itineraries") || "[]");
    const found = publicItineraries.find(item => item.id === itineraryId);
    
    if (found) {
      setItinerary(found);
      setLikes(found.likes || 0);
      setLiked(found.userLiked || false);
    } else {
      // Generate a sample public itinerary if none found
      const sampleItinerary = {
        id: itineraryId,
        name: "Amazing 10-Day European Adventure",
        author: "Travel Enthusiast",
        authorAvatar: "https://avatar.iran.liara.run/public/45.png",
        description: "Explore the best of Western Europe with this carefully crafted itinerary covering iconic cities and hidden gems.",
        totalBudget: 2500,
        currency: "USD",
        estimatedCost: 2340,
        duration: "10 days",
        createdAt: "2024-01-15",
        isPublic: true,
        likes: 156,
        views: 1200,
        tags: ["Europe", "Culture", "History", "Food"],
        stops: [
          {
            id: 1,
            city: "Paris, France",
            startDate: "2024-03-15",
            endDate: "2024-03-18",
            budget: 800,
            activities: [
              {
                id: 1,
                name: "Visit Eiffel Tower",
                time: "09:00",
                duration: 120,
                cost: 25,
                category: "Sightseeing",
                priority: "High",
                notes: "Book tickets in advance to skip lines",
                completed: false
              },
              {
                id: 2,
                name: "Louvre Museum Tour",
                time: "14:00",
                duration: 180,
                cost: 45,
                category: "Culture",
                priority: "High",
                notes: "Focus on Mona Lisa and Venus de Milo",
                completed: false
              },
              {
                id: 3,
                name: "Seine River Cruise",
                time: "19:00",
                duration: 90,
                cost: 35,
                category: "Sightseeing",
                priority: "Medium",
                notes: "Perfect for sunset views",
                completed: false
              }
            ]
          },
          {
            id: 2,
            city: "Amsterdam, Netherlands",
            startDate: "2024-03-19",
            endDate: "2024-03-21",
            budget: 600,
            activities: [
              {
                id: 4,
                name: "Van Gogh Museum",
                time: "10:00",
                duration: 150,
                cost: 22,
                category: "Culture",
                priority: "High",
                notes: "Pre-book tickets online",
                completed: false
              },
              {
                id: 5,
                name: "Canal Cruise",
                time: "15:00",
                duration: 75,
                cost: 18,
                category: "Sightseeing",
                priority: "Medium",
                notes: "Best way to see the city",
                completed: false
              }
            ]
          },
          {
            id: 3,
            city: "Berlin, Germany",
            startDate: "2024-03-22",
            endDate: "2024-03-24",
            budget: 550,
            activities: [
              {
                id: 6,
                name: "Brandenburg Gate",
                time: "09:00",
                duration: 60,
                cost: 0,
                category: "Sightseeing",
                priority: "High",
                notes: "Iconic symbol of Berlin",
                completed: false
              },
              {
                id: 7,
                name: "Berlin Wall Memorial",
                time: "11:00",
                duration: 90,
                cost: 0,
                category: "History",
                priority: "High",
                notes: "Learn about Cold War history",
                completed: false
              }
            ]
          }
        ]
      };
      setItinerary(sampleItinerary);
      setLikes(sampleItinerary.likes);
    }
    setLoading(false);
  };

  const copyToMyTrips = () => {
    if (!itinerary) return;
    
    const myTrips = JSON.parse(localStorage.getItem("gt_trips") || "[]");
    const copiedTrip = {
      id: Date.now(),
      tripName: `${itinerary.name} (Copy)`,
      place: itinerary.stops.map(stop => stop.city).join(", "),
      startDate: itinerary.stops[0]?.startDate,
      endDate: itinerary.stops[itinerary.stops.length - 1]?.endDate,
      description: itinerary.description,
      budget: itinerary.totalBudget,
      status: "planning",
      suggestions: itinerary.stops.flatMap(stop => 
        stop.activities.map(activity => ({
          name: activity.name,
          category: activity.category,
          cost: activity.cost,
          duration: activity.duration,
          notes: activity.notes
        }))
      ),
      createdAt: new Date().toISOString()
    };
    
    myTrips.push(copiedTrip);
    localStorage.setItem("gt_trips", JSON.stringify(myTrips));
    toast.success("Itinerary copied to your trips!");
  };

  const shareItinerary = async () => {
    const shareUrl = window.location.href;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success("Link copied to clipboard!");
    } catch (err) {
      toast.error("Failed to copy link");
    }
  };

  const toggleLike = () => {
    const newLiked = !liked;
    const newLikes = newLiked ? likes + 1 : likes - 1;
    
    setLiked(newLiked);
    setLikes(newLikes);
    
    // Update in localStorage
    const publicItineraries = JSON.parse(localStorage.getItem("gt_public_itineraries") || "[]");
    const updatedItineraries = publicItineraries.map(item => 
      item.id === itineraryId 
        ? { ...item, likes: newLikes, userLiked: newLiked }
        : item
    );
    localStorage.setItem("gt_public_itineraries", JSON.stringify(updatedItineraries));
    
    toast.success(newLiked ? "Added to favorites!" : "Removed from favorites");
  };

  const exportItinerary = () => {
    if (!itinerary) return;
    
    const dataStr = JSON.stringify(itinerary, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `${itinerary.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_itinerary.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    toast.success("Itinerary exported successfully!");
  };

  const calculateTotalCost = () => {
    return itinerary?.stops.reduce((total, stop) => 
      total + stop.activities.reduce((stopTotal, activity) => stopTotal + (activity.cost || 0), 0), 0
    ) || 0;
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  if (loading) {
    return (
      <div className="min-h-screen" data-theme="retro">
        <Navbar />
        <div className="flex items-center justify-center h-64">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      </div>
    );
  }

  if (!itinerary) {
    return (
      <div className="min-h-screen" data-theme="retro">
        <Navbar />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Itinerary Not Found</h2>
            <p className="text-lg opacity-70">The requested itinerary could not be found.</p>
            <Link to="/" className="btn btn-primary mt-4">Go Home</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" data-theme="retro">
      <Navbar />
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-5xl mx-auto space-y-6">
          
          {/* Header */}
          <div className="card bg-base-100 border border-primary/20">
            <div className="card-body">
              <div className="flex flex-col lg:flex-row gap-6">
                
                {/* Itinerary Info */}
                <div className="flex-1">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="avatar">
                      <div className="w-12 h-12 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                        <img src={itinerary.authorAvatar} alt={itinerary.author} />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-bold">{itinerary.author}</h3>
                      <div className="text-sm opacity-70 flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <CalendarIcon className="w-3 h-3" />
                          {new Date(itinerary.createdAt).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <StarIcon className="w-3 h-3" />
                          {itinerary.views} views
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <h1 className="text-3xl font-bold mb-3">{itinerary.name}</h1>
                  <p className="text-lg opacity-80 mb-4">{itinerary.description}</p>
                  
                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {itinerary.tags?.map((tag, index) => (
                      <span key={index} className="badge badge-primary">
                        {tag}
                      </span>
                    ))}
                  </div>
                  
                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-center">
                    <div className="stat">
                      <div className="stat-figure text-primary">
                        <CalendarIcon className="w-6 h-6" />
                      </div>
                      <div className="stat-title text-xs">Duration</div>
                      <div className="stat-value text-lg">{itinerary.duration}</div>
                    </div>
                    <div className="stat">
                      <div className="stat-figure text-secondary">
                        <MapPinIcon className="w-6 h-6" />
                      </div>
                      <div className="stat-title text-xs">Cities</div>
                      <div className="stat-value text-lg">{itinerary.stops?.length}</div>
                    </div>
                    <div className="stat">
                      <div className="stat-figure text-accent">
                        <DollarSignIcon className="w-6 h-6" />
                      </div>
                      <div className="stat-title text-xs">Budget</div>
                      <div className="stat-value text-lg">${itinerary.totalBudget}</div>
                    </div>
                    <div className="stat">
                      <div className="stat-figure text-success">
                        <HeartIcon className="w-6 h-6" />
                      </div>
                      <div className="stat-title text-xs">Likes</div>
                      <div className="stat-value text-lg">{likes}</div>
                    </div>
                  </div>
                </div>
                
                {/* Actions */}
                <div className="flex flex-col gap-3 lg:w-48">
                  <button 
                    onClick={copyToMyTrips}
                    className="btn btn-primary"
                  >
                    <CopyIcon className="w-4 h-4 mr-2" />
                    Copy Trip
                  </button>
                  
                  <button 
                    onClick={toggleLike}
                    className={`btn ${liked ? 'btn-error' : 'btn-outline'}`}
                  >
                    <HeartIcon className={`w-4 h-4 mr-2 ${liked ? 'fill-current' : ''}`} />
                    {liked ? 'Liked' : 'Like'}
                  </button>
                  
                  <button 
                    onClick={shareItinerary}
                    className="btn btn-outline"
                  >
                    {copied ? <CheckIcon className="w-4 h-4 mr-2" /> : <ShareIcon className="w-4 h-4 mr-2" />}
                    {copied ? 'Copied!' : 'Share'}
                  </button>
                  
                  <button 
                    onClick={exportItinerary}
                    className="btn btn-ghost"
                  >
                    <DownloadIcon className="w-4 h-4 mr-2" />
                    Export
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Budget Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="stat bg-base-100 border border-primary/20 rounded-lg">
              <div className="stat-title">Total Budget</div>
              <div className="stat-value text-primary">${itinerary.totalBudget}</div>
              <div className="stat-desc">{itinerary.currency}</div>
            </div>
            <div className="stat bg-base-100 border border-primary/20 rounded-lg">
              <div className="stat-title">Estimated Cost</div>
              <div className="stat-value text-secondary">${calculateTotalCost()}</div>
              <div className="stat-desc">From activities</div>
            </div>
            <div className="stat bg-base-100 border border-primary/20 rounded-lg">
              <div className="stat-title">Remaining</div>
              <div className="stat-value text-success">${itinerary.totalBudget - calculateTotalCost()}</div>
              <div className="stat-desc">Budget buffer</div>
            </div>
          </div>

          {/* Itinerary Details */}
          <div className="space-y-6">
            {itinerary.stops?.map((stop, index) => (
              <div key={stop.id} className="card bg-base-100 border border-primary/20">
                <div className="card-body">
                  
                  {/* Stop Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-2xl font-bold flex items-center gap-2">
                        <span className="badge badge-primary">{index + 1}</span>
                        {stop.city}
                      </h2>
                      <div className="text-sm opacity-70 flex items-center gap-4 mt-1">
                        <span className="flex items-center gap-1">
                          <CalendarIcon className="w-4 h-4" />
                          {stop.startDate} to {stop.endDate}
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSignIcon className="w-4 h-4" />
                          Budget: ${stop.budget}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Activities */}
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold">Activities</h3>
                    {stop.activities?.map((activity, actIndex) => (
                      <div key={activity.id} className="border border-base-300 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="font-medium">{activity.name}</h4>
                              <span className={`badge badge-sm ${
                                activity.priority === 'High' ? 'badge-error' :
                                activity.priority === 'Medium' ? 'badge-warning' : 'badge-info'
                              }`}>
                                {activity.priority}
                              </span>
                              <span className="badge badge-outline badge-sm">
                                {activity.category}
                              </span>
                            </div>
                            
                            <div className="text-sm opacity-70 flex items-center gap-4 mb-2">
                              <span className="flex items-center gap-1">
                                <ClockIcon className="w-3 h-3" />
                                {activity.time} ({formatDuration(activity.duration)})
                              </span>
                              <span className="flex items-center gap-1">
                                <DollarSignIcon className="w-3 h-3" />
                                ${activity.cost || 0}
                              </span>
                            </div>
                            
                            {activity.notes && (
                              <p className="text-sm bg-base-200 p-2 rounded mt-2">
                                💡 {activity.notes}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Call to Action */}
          <div className="card bg-gradient-to-r from-primary to-secondary text-primary-content">
            <div className="card-body text-center">
              <h2 className="card-title justify-center text-2xl mb-2">
                Love this itinerary?
              </h2>
              <p className="mb-4">
                Copy it to your account and customize it for your own adventure!
              </p>
              <div className="flex justify-center gap-4">
                <button 
                  onClick={copyToMyTrips}
                  className="btn btn-neutral"
                >
                  <CopyIcon className="w-4 h-4 mr-2" />
                  Copy to My Trips
                </button>
                <Link to="/signup" className="btn btn-outline btn-neutral">
                  Sign Up to Create Your Own
                </Link>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default PublicItineraryPage;
