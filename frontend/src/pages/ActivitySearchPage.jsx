import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import useAuthUser from "../hooks/useAuthUser";
import Navbar from "../components/Navbar";
import { 
  SearchIcon,
  FilterIcon,
  MapPinIcon,
  ClockIcon,
  DollarSignIcon,
  StarIcon,
  HeartIcon,
  PlusIcon,
  ImageIcon,
  TagIcon,
  TrendingUpIcon,
  UsersIcon
} from "lucide-react";
import toast from "react-hot-toast";

const ActivitySearchPage = () => {
  const { authUser } = useAuthUser();
  const [searchQuery, setSearchQuery] = useState("");
  const [activities, setActivities] = useState([]);
  const [filteredActivities, setFilteredActivities] = useState([]);
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const [duration, setDuration] = useState("");
  const [sortBy, setSortBy] = useState("popularity");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadActivities();
  }, []);

  useEffect(() => {
    filterActivities();
  }, [searchQuery, selectedCity, selectedCategory, priceRange, duration, sortBy, activities]);

  const loadActivities = () => {
    // Generate sample activities data
    const sampleActivities = [
      // Indian Activities
      {
        id: 1,
        name: "Ganga Aarti Ceremony at Dashashwamedh Ghat",
        city: "Varanasi, India",
        category: "Culture",
        price: 0,
        duration: 60,
        rating: 4.9,
        reviews: 2340,
        description: "Witness the spectacular evening Ganga Aarti ceremony with traditional prayers and fire rituals.",
        image: "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=400",
        provider: "Varanasi Cultural Tours",
        highlights: ["Traditional ceremony", "Fire rituals", "Spiritual experience"],
        difficulty: "Easy",
        groupSize: "Open to all",
        isPopular: true,
        isSaved: false
      },
      {
        id: 2,
        name: "White Water Rafting in Rishikesh",
        city: "Rishikesh, India",
        category: "Adventure",
        price: 25,
        duration: 180,
        rating: 4.7,
        reviews: 1890,
        description: "Experience thrilling white water rafting on the sacred Ganges river with professional guides.",
        image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400",
        provider: "Himalayan Adventures",
        highlights: ["Grade II-III rapids", "Professional guides", "Safety equipment included"],
        difficulty: "Medium",
        groupSize: "6-12 people",
        isPopular: true,
        isSaved: false
      },
      {
        id: 3,
        name: "Yoga Session by the Ganges",
        city: "Rishikesh, India",
        category: "Wellness",
        price: 15,
        duration: 90,
        rating: 4.8,
        reviews: 1567,
        description: "Start your day with traditional yoga practice overlooking the sacred Ganges river.",
        image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400",
        provider: "Yoga Niketan",
        highlights: ["Sunrise session", "Qualified instructor", "Meditation included"],
        difficulty: "Easy",
        groupSize: "Up to 20 people",
        isPopular: true,
        isSaved: false
      },
      {
        id: 4,
        name: "Red Fort & Old Delhi Heritage Walk",
        city: "Delhi, India",
        category: "History",
        price: 12,
        duration: 240,
        rating: 4.5,
        reviews: 2145,
        description: "Explore the magnificent Red Fort and narrow lanes of Old Delhi with a local historian.",
        image: "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=400",
        provider: "Delhi Heritage Walks",
        highlights: ["UNESCO World Heritage site", "Local historian guide", "Traditional bazaars"],
        difficulty: "Easy",
        groupSize: "Up to 15 people",
        isPopular: true,
        isSaved: false
      },
      {
        id: 5,
        name: "Street Food Tour in Chandni Chowk",
        city: "Delhi, India",
        category: "Food & Dining",
        price: 18,
        duration: 150,
        rating: 4.6,
        reviews: 1823,
        description: "Discover the flavors of Old Delhi with authentic street food tastings and local insights.",
        image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400",
        provider: "Delhi Food Tours",
        highlights: ["Multiple tastings", "Local guide", "Vegetarian options available"],
        difficulty: "Easy",
        groupSize: "8-12 people",
        isPopular: true,
        isSaved: false
      },
      {
        id: 6,
        name: "Sabarmati Ashram Gandhi Walk",
        city: "Ahmedabad, India",
        category: "History",
        price: 8,
        duration: 120,
        rating: 4.4,
        reviews: 987,
        description: "Walk in the footsteps of Mahatma Gandhi and learn about India's freedom struggle.",
        image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400",
        provider: "Gandhi Heritage Tours",
        highlights: ["Historical significance", "Gandhi's living quarters", "Museum visit"],
        difficulty: "Easy",
        groupSize: "Up to 20 people",
        isPopular: false,
        isSaved: false
      },
      {
        id: 7,
        name: "Adalaj Stepwell Architecture Tour",
        city: "Ahmedabad, India",
        category: "Culture",
        price: 10,
        duration: 90,
        rating: 4.3,
        reviews: 756,
        description: "Marvel at the intricate Indo-Islamic architecture of this 15th-century stepwell.",
        image: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=400",
        provider: "Gujarat Heritage",
        highlights: ["Indo-Islamic architecture", "Historical significance", "Photography opportunities"],
        difficulty: "Easy",
        groupSize: "Up to 25 people",
        isPopular: false,
        isSaved: false
      },
      {
        id: 8,
        name: "Lucknowi Cuisine Cooking Class",
        city: "Lucknow, India",
        category: "Food & Dining",
        price: 22,
        duration: 180,
        rating: 4.7,
        reviews: 634,
        description: "Learn to cook authentic Awadhi cuisine including biryanis and kebabs with a local chef.",
        image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400",
        provider: "Awadhi Culinary School",
        highlights: ["Hands-on cooking", "Traditional recipes", "Local chef instruction"],
        difficulty: "Medium",
        groupSize: "6-10 people",
        isPopular: false,
        isSaved: false
      },
      // International Activities
      {
        id: 9,
        name: "Eiffel Tower Skip-the-Line Tour",
        city: "Paris, France",
        category: "Sightseeing",
        price: 25,
        duration: 120,
        rating: 4.8,
        reviews: 1245,
        description: "Skip the long lines and enjoy breathtaking views from the iconic Eiffel Tower.",
        image: "https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?w=400",
        provider: "Paris Tours",
        highlights: ["Skip-the-line access", "Audio guide included", "Panoramic views"],
        difficulty: "Easy",
        groupSize: "Up to 25 people",
        isPopular: true,
        isSaved: false
      },
      {
        id: 2,
        name: "Seine River Evening Cruise",
        city: "Paris, France",
        category: "Sightseeing",
        price: 35,
        duration: 90,
        rating: 4.6,
        reviews: 892,
        description: "Romantic evening cruise along the Seine with stunning views of Paris landmarks.",
        image: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=400",
        provider: "Seine Cruises",
        highlights: ["Evening departure", "Landmark views", "Audio commentary"],
        difficulty: "Easy",
        groupSize: "Up to 100 people",
        isPopular: true,
        isSaved: false
      },
      {
        id: 3,
        name: "Louvre Museum Guided Tour",
        city: "Paris, France",
        category: "Culture",
        price: 45,
        duration: 180,
        rating: 4.7,
        reviews: 2156,
        description: "Explore the world's largest art museum with an expert guide.",
        image: "https://images.unsplash.com/photo-1566139992265-9f8ced27049d?w=400",
        provider: "Museum Tours",
        highlights: ["Expert guide", "Skip-the-line access", "Mona Lisa viewing"],
        difficulty: "Easy",
        groupSize: "Up to 20 people",
        isPopular: true,
        isSaved: true
      },
      {
        id: 4,
        name: "Cooking Class: Traditional French Cuisine",
        city: "Paris, France",
        category: "Food & Dining",
        price: 120,
        duration: 240,
        rating: 4.9,
        reviews: 567,
        description: "Learn to cook authentic French dishes with a professional chef.",
        image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400",
        provider: "Culinary Adventures",
        highlights: ["Professional chef", "Hands-on experience", "Recipe book included"],
        difficulty: "Medium",
        groupSize: "Up to 12 people",
        isPopular: false,
        isSaved: false
      },
      {
        id: 5,
        name: "Van Gogh Museum Skip-the-Line",
        city: "Amsterdam, Netherlands",
        category: "Culture",
        price: 22,
        duration: 150,
        rating: 4.5,
        reviews: 1876,
        description: "Discover the world's largest collection of Van Gogh's artworks.",
        image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400",
        provider: "Amsterdam Museums",
        highlights: ["Skip-the-line entry", "Audio guide", "Van Gogh masterpieces"],
        difficulty: "Easy",
        groupSize: "Individual entry",
        isPopular: true,
        isSaved: false
      },
      {
        id: 6,
        name: "Canal Cruise with Cheese & Wine",
        city: "Amsterdam, Netherlands",
        category: "Food & Dining",
        price: 45,
        duration: 75,
        rating: 4.4,
        reviews: 623,
        description: "Scenic canal cruise featuring Dutch cheese and wine tasting.",
        image: "https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=400",
        provider: "Amsterdam Cruises",
        highlights: ["Cheese tasting", "Wine selection", "Canal views"],
        difficulty: "Easy",
        groupSize: "Up to 50 people",
        isPopular: false,
        isSaved: false
      },
      {
        id: 7,
        name: "Brandenburg Gate Historical Walk",
        city: "Berlin, Germany",
        category: "History",
        price: 0,
        duration: 60,
        rating: 4.3,
        reviews: 1234,
        description: "Free walking tour exploring Berlin's most iconic landmark and its history.",
        image: "https://images.unsplash.com/photo-1560930950-5cc20e80d392?w=400",
        provider: "Berlin Walking Tours",
        highlights: ["Free tour", "Historical insights", "Photo opportunities"],
        difficulty: "Easy",
        groupSize: "Up to 30 people",
        isPopular: true,
        isSaved: false
      },
      {
        id: 8,
        name: "Berlin Wall Memorial Tour",
        city: "Berlin, Germany",
        category: "History",
        price: 15,
        duration: 120,
        rating: 4.6,
        reviews: 987,
        description: "In-depth tour of the Berlin Wall Memorial and Checkpoint Charlie.",
        image: "https://images.unsplash.com/photo-1599946347371-68eb71b16afc?w=400",
        provider: "History Tours Berlin",
        highlights: ["Memorial visit", "Checkpoint Charlie", "Cold War history"],
        difficulty: "Easy",
        groupSize: "Up to 25 people",
        isPopular: false,
        isSaved: false
      },
      {
        id: 9,
        name: "Tokyo Food Street Tour",
        city: "Tokyo, Japan",
        category: "Food & Dining",
        price: 85,
        duration: 180,
        rating: 4.8,
        reviews: 1567,
        description: "Explore Tokyo's best street food with a local guide.",
        image: "https://images.unsplash.com/photo-1554978991-33ef7f31d658?w=400",
        provider: "Tokyo Food Tours",
        highlights: ["Local guide", "Multiple tastings", "Hidden gems"],
        difficulty: "Easy",
        groupSize: "Up to 15 people",
        isPopular: true,
        isSaved: false
      },
      {
        id: 10,
        name: "Mount Fuji Day Trip",
        city: "Tokyo, Japan",
        category: "Adventure",
        price: 150,
        duration: 600,
        rating: 4.7,
        reviews: 892,
        description: "Full-day excursion to Mount Fuji with scenic views and cultural experiences.",
        image: "https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?w=400",
        provider: "Fuji Adventures",
        highlights: ["Mount Fuji views", "Lake Kawaguchi", "Transportation included"],
        difficulty: "Medium",
        groupSize: "Up to 40 people",
        isPopular: true,
        isSaved: false
      }
    ];
    
    setActivities(sampleActivities);
    setFilteredActivities(sampleActivities);
  };

  const filterActivities = () => {
    let filtered = [...activities];

    // Text search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(activity => 
        activity.name.toLowerCase().includes(query) ||
        activity.description.toLowerCase().includes(query) ||
        activity.city.toLowerCase().includes(query) ||
        activity.category.toLowerCase().includes(query)
      );
    }

    // City filter
    if (selectedCity) {
      filtered = filtered.filter(activity => activity.city === selectedCity);
    }

    // Category filter
    if (selectedCategory) {
      filtered = filtered.filter(activity => activity.category === selectedCategory);
    }

    // Price range filter
    if (priceRange) {
      const [min, max] = priceRange.split('-').map(Number);
      filtered = filtered.filter(activity => {
        if (max) {
          return activity.price >= min && activity.price <= max;
        } else {
          return activity.price >= min;
        }
      });
    }

    // Duration filter
    if (duration) {
      const [min, max] = duration.split('-').map(Number);
      filtered = filtered.filter(activity => {
        if (max) {
          return activity.duration >= min && activity.duration <= max;
        } else {
          return activity.duration >= min;
        }
      });
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'rating':
          return b.rating - a.rating;
        case 'duration':
          return a.duration - b.duration;
        case 'popularity':
        default:
          return b.reviews - a.reviews;
      }
    });

    setFilteredActivities(filtered);
  };

  const toggleSaveActivity = (activityId) => {
    const updatedActivities = activities.map(activity =>
      activity.id === activityId
        ? { ...activity, isSaved: !activity.isSaved }
        : activity
    );
    setActivities(updatedActivities);
    
    const activity = activities.find(a => a.id === activityId);
    toast.success(activity?.isSaved ? "Removed from saved activities" : "Added to saved activities");
  };

  const addToTrip = (activity) => {
    // Add to current trip or show trip selection modal
    toast.success(`"${activity.name}" added to your itinerary!`);
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const getUniqueValues = (key) => {
    return [...new Set(activities.map(activity => activity[key]))].sort();
  };

  if (!authUser) {
    return (
      <div className="min-h-screen" data-theme="retro">
        <Navbar />
        <div className="flex items-center justify-center h-64">
          <p className="text-lg opacity-70">Please log in to search activities.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" data-theme="retro">
      <Navbar />
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <SearchIcon className="w-8 h-8" />
                Activity Search
              </h1>
              <p className="text-lg opacity-70">Discover amazing experiences for your trip</p>
            </div>
            <div className="flex gap-2">
              <Link to="/plan" className="btn btn-primary">
                <PlusIcon className="w-4 h-4 mr-2" />
                Plan Trip
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            
            {/* Filters Sidebar */}
            <div className="lg:col-span-1 space-y-4">
              <div className="card bg-base-100 border border-primary/20">
                <div className="card-body">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <FilterIcon className="w-5 h-5" />
                    Filters
                  </h3>
                  
                  {/* Search */}
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Search</span>
                    </label>
                    <input
                      type="text"
                      className="input input-bordered input-sm"
                      placeholder="Search activities..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>

                  {/* City */}
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">City</span>
                    </label>
                    <select 
                      className="select select-bordered select-sm"
                      value={selectedCity}
                      onChange={(e) => setSelectedCity(e.target.value)}
                    >
                      <option value="">All Cities</option>
                      {getUniqueValues('city').map(city => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>
                  </div>

                  {/* Category */}
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Category</span>
                    </label>
                    <select 
                      className="select select-bordered select-sm"
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                    >
                      <option value="">All Categories</option>
                      {getUniqueValues('category').map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>

                  {/* Price Range */}
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Price Range</span>
                    </label>
                    <select 
                      className="select select-bordered select-sm"
                      value={priceRange}
                      onChange={(e) => setPriceRange(e.target.value)}
                    >
                      <option value="">All Prices</option>
                      <option value="0-0">Free</option>
                      <option value="1-25">$1 - $25</option>
                      <option value="26-50">$26 - $50</option>
                      <option value="51-100">$51 - $100</option>
                      <option value="101">$100+</option>
                    </select>
                  </div>

                  {/* Duration */}
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Duration</span>
                    </label>
                    <select 
                      className="select select-bordered select-sm"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                    >
                      <option value="">All Durations</option>
                      <option value="0-60">Under 1 hour</option>
                      <option value="61-120">1-2 hours</option>
                      <option value="121-240">2-4 hours</option>
                      <option value="241-480">4-8 hours</option>
                      <option value="481">Full day (8+ hours)</option>
                    </select>
                  </div>

                  {/* Clear Filters */}
                  <button 
                    className="btn btn-outline btn-sm mt-4"
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedCity("");
                      setSelectedCategory("");
                      setPriceRange("");
                      setDuration("");
                    }}
                  >
                    Clear All Filters
                  </button>
                </div>
              </div>
            </div>

            {/* Results */}
            <div className="lg:col-span-3 space-y-4">
              
              {/* Results Header */}
              <div className="flex justify-between items-center">
                <p className="text-lg">
                  {filteredActivities.length} activities found
                </p>
                <div className="form-control">
                  <select 
                    className="select select-bordered select-sm"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="popularity">Most Popular</option>
                    <option value="rating">Highest Rated</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="duration">Duration: Short to Long</option>
                  </select>
                </div>
              </div>

              {/* Activity Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredActivities.map((activity) => (
                  <div key={activity.id} className="card bg-base-100 border border-primary/20 hover:shadow-lg transition-shadow">
                    
                    {/* Image */}
                    <figure className="relative h-48">
                      <img 
                        src={activity.image} 
                        alt={activity.name}
                        className="w-full h-full object-cover"
                      />
                      {activity.isPopular && (
                        <div className="absolute top-2 left-2">
                          <span className="badge badge-error badge-sm">
                            <TrendingUpIcon className="w-3 h-3 mr-1" />
                            Popular
                          </span>
                        </div>
                      )}
                      <button
                        onClick={() => toggleSaveActivity(activity.id)}
                        className={`absolute top-2 right-2 btn btn-circle btn-sm ${
                          activity.isSaved ? 'btn-error' : 'btn-ghost bg-black/20'
                        }`}
                      >
                        <HeartIcon className={`w-4 h-4 ${activity.isSaved ? 'fill-current' : ''}`} />
                      </button>
                    </figure>

                    <div className="card-body p-4">
                      
                      {/* Header */}
                      <div className="mb-2">
                        <h3 className="font-bold text-lg mb-1">{activity.name}</h3>
                        <div className="flex items-center gap-2 text-sm opacity-70">
                          <MapPinIcon className="w-3 h-3" />
                          <span>{activity.city}</span>
                          <span className="badge badge-outline badge-xs">
                            {activity.category}
                          </span>
                        </div>
                      </div>

                      {/* Rating & Reviews */}
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex items-center gap-1">
                          <StarIcon className="w-4 h-4 fill-current text-warning" />
                          <span className="font-medium">{activity.rating}</span>
                        </div>
                        <span className="text-sm opacity-70">({activity.reviews} reviews)</span>
                      </div>

                      {/* Description */}
                      <p className="text-sm opacity-80 mb-3 line-clamp-2">
                        {activity.description}
                      </p>

                      {/* Details */}
                      <div className="flex items-center justify-between text-sm mb-3">
                        <div className="flex items-center gap-1">
                          <ClockIcon className="w-3 h-3" />
                          <span>{formatDuration(activity.duration)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <UsersIcon className="w-3 h-3" />
                          <span>{activity.groupSize}</span>
                        </div>
                      </div>

                      {/* Highlights */}
                      <div className="mb-3">
                        <div className="flex flex-wrap gap-1">
                          {activity.highlights.slice(0, 2).map((highlight, index) => (
                            <span key={index} className="badge badge-info badge-xs">
                              {highlight}
                            </span>
                          ))}
                          {activity.highlights.length > 2 && (
                            <span className="badge badge-ghost badge-xs">
                              +{activity.highlights.length - 2} more
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Price & Actions */}
                      <div className="flex items-center justify-between">
                        <div className="text-xl font-bold text-primary">
                          {activity.price === 0 ? 'Free' : `$${activity.price}`}
                        </div>
                        <button
                          onClick={() => addToTrip(activity)}
                          className="btn btn-primary btn-sm"
                        >
                          <PlusIcon className="w-3 h-3 mr-1" />
                          Add
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* No Results */}
              {filteredActivities.length === 0 && (
                <div className="text-center py-12">
                  <SearchIcon className="w-16 h-16 mx-auto opacity-30 mb-4" />
                  <p className="text-xl opacity-70 mb-4">No activities found</p>
                  <p className="opacity-60">Try adjusting your search filters</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivitySearchPage;
