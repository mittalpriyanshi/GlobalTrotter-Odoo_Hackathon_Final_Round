import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import useAuthUser from "../hooks/useAuthUser";
import Navbar from "../components/Navbar";
import { 
  SearchIcon,
  FilterIcon,
  MapPinIcon,
  ThermometerIcon,
  DollarSignIcon,
  StarIcon,
  UsersIcon,
  PlusIcon,
  TrendingUpIcon,
  GlobeIcon,
  InfoIcon,
  ImageIcon,
  CameraIcon
} from "lucide-react";
import toast from "react-hot-toast";

const CitySearchPage = () => {
  const { authUser } = useAuthUser();
  const [searchQuery, setSearchQuery] = useState("");
  const [cities, setCities] = useState([]);
  const [filteredCities, setFilteredCities] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedBudget, setSelectedBudget] = useState("");
  const [selectedClimate, setSelectedClimate] = useState("");
  const [sortBy, setSortBy] = useState("popularity");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCities();
  }, []);

  useEffect(() => {
    filterCities();
  }, [searchQuery, selectedRegion, selectedBudget, selectedClimate, sortBy, cities]);

  const loadCities = () => {
    // Generate sample cities data
    const sampleCities = [
      // Indian Destinations
      {
        id: 1,
        name: "Gandhinagar",
        country: "India",
        region: "Asia",
        description: "The planned capital city of Gujarat, known for its greenery, architecture, and peaceful environment.",
        image: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=600",
        population: "292K",
        costIndex: 25,
        budgetCategory: "Budget",
        climate: "Semi-arid",
        averageTemp: "27°C",
        rating: 4.2,
        reviews: 2840,
        topAttractions: ["Akshardham Temple", "Sarita Udyan", "Gandhi Ashram", "Trimandir"],
        bestTimeToVisit: "October-March",
        currency: "INR",
        language: "Gujarati, Hindi",
        timeZone: "IST",
        isPopular: false,
        highlights: ["Architecture", "Gardens", "Spiritual Sites", "Planned City"],
        activities: 145,
        avgDailyBudget: 35
      },
      {
        id: 2,
        name: "Ahmedabad",
        country: "India",
        region: "Asia",
        description: "UNESCO World Heritage city known for its rich textile heritage, historic architecture, and vibrant culture.",
        image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600",
        population: "7.6M",
        costIndex: 30,
        budgetCategory: "Budget",
        climate: "Semi-arid",
        averageTemp: "26°C",
        rating: 4.4,
        reviews: 5670,
        topAttractions: ["Sabarmati Ashram", "Adalaj Stepwell", "Sidi Saiyyed Mosque", "Calico Museum"],
        bestTimeToVisit: "October-March",
        currency: "INR",
        language: "Gujarati, Hindi",
        timeZone: "IST",
        isPopular: true,
        highlights: ["Heritage", "Textiles", "Architecture", "Street Food"],
        activities: 234,
        avgDailyBudget: 40
      },
      {
        id: 3,
        name: "Delhi",
        country: "India",
        region: "Asia",
        description: "India's capital, a perfect blend of ancient history and modern development with magnificent monuments.",
        image: "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=600",
        population: "32.9M",
        costIndex: 35,
        budgetCategory: "Budget",
        climate: "Semi-arid",
        averageTemp: "24°C",
        rating: 4.3,
        reviews: 18920,
        topAttractions: ["Red Fort", "India Gate", "Lotus Temple", "Qutub Minar"],
        bestTimeToVisit: "October-March",
        currency: "INR",
        language: "Hindi, English",
        timeZone: "IST",
        isPopular: true,
        highlights: ["History", "Monuments", "Street Food", "Culture"],
        activities: 567,
        avgDailyBudget: 45
      },
      {
        id: 4,
        name: "Lucknow",
        country: "India",
        region: "Asia",
        description: "The City of Nawabs, famous for its Mughal architecture, rich culture, and exquisite cuisine.",
        image: "https://images.unsplash.com/photo-1605640840605-14ac1855827b?w=600",
        population: "3.6M",
        costIndex: 28,
        budgetCategory: "Budget",
        climate: "Subtropical",
        averageTemp: "25°C",
        rating: 4.1,
        reviews: 4560,
        topAttractions: ["Bara Imambara", "Chota Imambara", "Rumi Darwaza", "British Residency"],
        bestTimeToVisit: "October-March",
        currency: "INR",
        language: "Hindi, Urdu",
        timeZone: "IST",
        isPopular: false,
        highlights: ["Mughal Architecture", "Cuisine", "Culture", "History"],
        activities: 178,
        avgDailyBudget: 38
      },
      {
        id: 5,
        name: "Varanasi",
        country: "India",
        region: "Asia",
        description: "One of the world's oldest cities, the spiritual capital of India on the banks of River Ganges.",
        image: "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=600",
        population: "1.4M",
        costIndex: 25,
        budgetCategory: "Budget",
        climate: "Subtropical",
        averageTemp: "26°C",
        rating: 4.6,
        reviews: 8920,
        topAttractions: ["Dashashwamedh Ghat", "Kashi Vishwanath Temple", "Sarnath", "Ganga Aarti"],
        bestTimeToVisit: "October-March",
        currency: "INR",
        language: "Hindi, Sanskrit",
        timeZone: "IST",
        isPopular: true,
        highlights: ["Spirituality", "River Ganges", "Ancient Culture", "Temples"],
        activities: 289,
        avgDailyBudget: 32
      },
      {
        id: 6,
        name: "Rishikesh",
        country: "India",
        region: "Asia",
        description: "Yoga capital of the world, nestled in the Himalayas, known for adventure sports and spirituality.",
        image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600",
        population: "102K",
        costIndex: 22,
        budgetCategory: "Budget",
        climate: "Subtropical highland",
        averageTemp: "23°C",
        rating: 4.5,
        reviews: 7840,
        topAttractions: ["Laxman Jhula", "Ram Jhula", "Triveni Ghat", "Beatles Ashram"],
        bestTimeToVisit: "September-November, February-May",
        currency: "INR",
        language: "Hindi, English",
        timeZone: "IST",
        isPopular: true,
        highlights: ["Adventure Sports", "Yoga", "River Rafting", "Spirituality"],
        activities: 195,
        avgDailyBudget: 28
      },
      // International Destinations
      {
        id: 7,
        name: "Paris",
        country: "France",
        region: "Europe",
        description: "The City of Light, famous for its art, fashion, gastronomy, and culture.",
        image: "https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?w=600",
        population: "2.2M",
        costIndex: 85,
        budgetCategory: "Expensive",
        climate: "Temperate",
        averageTemp: "12°C",
        rating: 4.8,
        reviews: 15420,
        topAttractions: ["Eiffel Tower", "Louvre Museum", "Notre-Dame", "Arc de Triomphe"],
        bestTimeToVisit: "April-June, September-October",
        currency: "EUR",
        language: "French",
        timeZone: "CET",
        isPopular: true,
        highlights: ["Art & Culture", "Fine Dining", "Architecture", "Museums"],
        activities: 847,
        avgDailyBudget: 120
      },
      {
        id: 8,
        name: "Tokyo",
        country: "Japan",
        region: "Asia",
        description: "A vibrant metropolis blending traditional culture with cutting-edge technology.",
        image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600",
        population: "14M",
        costIndex: 78,
        budgetCategory: "Expensive",
        climate: "Humid subtropical",
        averageTemp: "16°C",
        rating: 4.7,
        reviews: 12890,
        topAttractions: ["Tokyo Tower", "Senso-ji Temple", "Shibuya Crossing", "Imperial Palace"],
        bestTimeToVisit: "March-May, September-November",
        currency: "JPY",
        language: "Japanese",
        timeZone: "JST",
        isPopular: true,
        highlights: ["Technology", "Cuisine", "Traditional Culture", "Shopping"],
        activities: 1205,
        avgDailyBudget: 110
      },
      {
        id: 3,
        name: "Bali",
        country: "Indonesia",
        region: "Asia",
        description: "Tropical paradise known for beaches, temples, and vibrant culture.",
        image: "https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?w=600",
        population: "4.3M",
        costIndex: 35,
        budgetCategory: "Budget",
        climate: "Tropical",
        averageTemp: "27°C",
        rating: 4.6,
        reviews: 8967,
        topAttractions: ["Tanah Lot Temple", "Rice Terraces", "Mount Batur", "Uluwatu Temple"],
        bestTimeToVisit: "April-October",
        currency: "IDR",
        language: "Indonesian",
        timeZone: "WITA",
        isPopular: true,
        highlights: ["Beaches", "Temples", "Nature", "Wellness"],
        activities: 623,
        avgDailyBudget: 45
      },
      {
        id: 4,
        name: "New York",
        country: "United States",
        region: "North America",
        description: "The city that never sleeps, famous for its skyline, culture, and energy.",
        image: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=600",
        population: "8.4M",
        costIndex: 92,
        budgetCategory: "Expensive",
        climate: "Continental",
        averageTemp: "13°C",
        rating: 4.5,
        reviews: 18740,
        topAttractions: ["Statue of Liberty", "Central Park", "Times Square", "9/11 Memorial"],
        bestTimeToVisit: "April-June, September-November",
        currency: "USD",
        language: "English",
        timeZone: "EST",
        isPopular: true,
        highlights: ["Broadway", "Museums", "Food Scene", "Architecture"],
        activities: 1456,
        avgDailyBudget: 150
      },
      {
        id: 5,
        name: "Barcelona",
        country: "Spain",
        region: "Europe",
        description: "Mediterranean charm with stunning architecture and vibrant nightlife.",
        image: "https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=600",
        population: "1.6M",
        costIndex: 65,
        budgetCategory: "Moderate",
        climate: "Mediterranean",
        averageTemp: "16°C",
        rating: 4.7,
        reviews: 11250,
        topAttractions: ["Sagrada Familia", "Park Güell", "Gothic Quarter", "Casa Batlló"],
        bestTimeToVisit: "May-June, September-October",
        currency: "EUR",
        language: "Spanish, Catalan",
        timeZone: "CET",
        isPopular: true,
        highlights: ["Architecture", "Beaches", "Art", "Nightlife"],
        activities: 734,
        avgDailyBudget: 85
      },
      {
        id: 6,
        name: "Bangkok",
        country: "Thailand",
        region: "Asia",
        description: "Bustling capital known for ornate temples, vibrant street life, and food scene.",
        image: "https://images.unsplash.com/photo-1562602833-0f4ab2fc46e3?w=600",
        population: "10.7M",
        costIndex: 30,
        budgetCategory: "Budget",
        climate: "Tropical",
        averageTemp: "29°C",
        rating: 4.4,
        reviews: 9876,
        topAttractions: ["Grand Palace", "Wat Pho", "Chatuchak Market", "Wat Arun"],
        bestTimeToVisit: "November-March",
        currency: "THB",
        language: "Thai",
        timeZone: "ICT",
        isPopular: true,
        highlights: ["Street Food", "Temples", "Markets", "Culture"],
        activities: 856,
        avgDailyBudget: 40
      },
      {
        id: 7,
        name: "Cape Town",
        country: "South Africa",
        region: "Africa",
        description: "Stunning coastal city with mountains, beaches, and rich history.",
        image: "https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=600",
        population: "4.6M",
        costIndex: 45,
        budgetCategory: "Budget",
        climate: "Mediterranean",
        averageTemp: "17°C",
        rating: 4.6,
        reviews: 5234,
        topAttractions: ["Table Mountain", "Robben Island", "V&A Waterfront", "Cape Point"],
        bestTimeToVisit: "December-March",
        currency: "ZAR",
        language: "English, Afrikaans",
        timeZone: "SAST",
        isPopular: false,
        highlights: ["Nature", "History", "Wine", "Adventure"],
        activities: 423,
        avgDailyBudget: 55
      },
      {
        id: 8,
        name: "Dubai",
        country: "United Arab Emirates",
        region: "Middle East",
        description: "Modern metropolis with luxury shopping, ultramodern architecture, and nightlife.",
        image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600",
        population: "3.4M",
        costIndex: 75,
        budgetCategory: "Expensive",
        climate: "Desert",
        averageTemp: "27°C",
        rating: 4.5,
        reviews: 7891,
        topAttractions: ["Burj Khalifa", "Dubai Mall", "Palm Jumeirah", "Desert Safari"],
        bestTimeToVisit: "November-March",
        currency: "AED",
        language: "Arabic, English",
        timeZone: "GST",
        isPopular: true,
        highlights: ["Luxury", "Shopping", "Modern Architecture", "Desert"],
        activities: 567,
        avgDailyBudget: 125
      }
    ];
    
    setCities(sampleCities);
    setFilteredCities(sampleCities);
  };

  const filterCities = () => {
    let filtered = [...cities];

    // Text search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(city => 
        city.name.toLowerCase().includes(query) ||
        city.country.toLowerCase().includes(query) ||
        city.description.toLowerCase().includes(query) ||
        city.highlights.some(highlight => highlight.toLowerCase().includes(query))
      );
    }

    // Region filter
    if (selectedRegion) {
      filtered = filtered.filter(city => city.region === selectedRegion);
    }

    // Budget filter
    if (selectedBudget) {
      filtered = filtered.filter(city => city.budgetCategory === selectedBudget);
    }

    // Climate filter
    if (selectedClimate) {
      filtered = filtered.filter(city => city.climate === selectedClimate);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'budget-low':
          return a.avgDailyBudget - b.avgDailyBudget;
        case 'budget-high':
          return b.avgDailyBudget - a.avgDailyBudget;
        case 'rating':
          return b.rating - a.rating;
        case 'name':
          return a.name.localeCompare(b.name);
        case 'popularity':
        default:
          return b.reviews - a.reviews;
      }
    });

    setFilteredCities(filtered);
  };

  const addToTrip = (city) => {
    toast.success(`${city.name} added to your trip planning list!`);
  };

  const getUniqueValues = (key) => {
    return [...new Set(cities.map(city => city[key]))].sort();
  };

  const getBudgetColor = (budget) => {
    switch (budget) {
      case 'Budget': return 'badge-success';
      case 'Moderate': return 'badge-warning';
      case 'Expensive': return 'badge-error';
      default: return 'badge-ghost';
    }
  };

  if (!authUser) {
    return (
      <div className="min-h-screen" data-theme="retro">
        <Navbar />
        <div className="flex items-center justify-center h-64">
          <p className="text-lg opacity-70">Please log in to search destinations.</p>
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
                <GlobeIcon className="w-8 h-8" />
                Destination Search
              </h1>
              <p className="text-lg opacity-70">Discover your next travel destination</p>
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
                      placeholder="Search destinations..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>

                  {/* Region */}
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Region</span>
                    </label>
                    <select 
                      className="select select-bordered select-sm"
                      value={selectedRegion}
                      onChange={(e) => setSelectedRegion(e.target.value)}
                    >
                      <option value="">All Regions</option>
                      {getUniqueValues('region').map(region => (
                        <option key={region} value={region}>{region}</option>
                      ))}
                    </select>
                  </div>

                  {/* Budget */}
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Budget</span>
                    </label>
                    <select 
                      className="select select-bordered select-sm"
                      value={selectedBudget}
                      onChange={(e) => setSelectedBudget(e.target.value)}
                    >
                      <option value="">All Budgets</option>
                      <option value="Budget">Budget-Friendly</option>
                      <option value="Moderate">Moderate</option>
                      <option value="Expensive">Luxury</option>
                    </select>
                  </div>

                  {/* Climate */}
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Climate</span>
                    </label>
                    <select 
                      className="select select-bordered select-sm"
                      value={selectedClimate}
                      onChange={(e) => setSelectedClimate(e.target.value)}
                    >
                      <option value="">All Climates</option>
                      {getUniqueValues('climate').map(climate => (
                        <option key={climate} value={climate}>{climate}</option>
                      ))}
                    </select>
                  </div>

                  {/* Clear Filters */}
                  <button 
                    className="btn btn-outline btn-sm mt-4"
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedRegion("");
                      setSelectedBudget("");
                      setSelectedClimate("");
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
                  {filteredCities.length} destinations found
                </p>
                <div className="form-control">
                  <select 
                    className="select select-bordered select-sm"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="popularity">Most Popular</option>
                    <option value="rating">Highest Rated</option>
                    <option value="budget-low">Budget: Low to High</option>
                    <option value="budget-high">Budget: High to Low</option>
                    <option value="name">Name: A to Z</option>
                  </select>
                </div>
              </div>

              {/* City Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredCities.map((city) => (
                  <div key={city.id} className="card bg-base-100 border border-primary/20 hover:shadow-lg transition-shadow">
                    
                    {/* Image */}
                    <figure className="relative h-64">
                      <img 
                        src={city.image} 
                        alt={city.name}
                        className="w-full h-full object-cover"
                      />
                      {city.isPopular && (
                        <div className="absolute top-3 left-3">
                          <span className="badge badge-error">
                            <TrendingUpIcon className="w-3 h-3 mr-1" />
                            Popular
                          </span>
                        </div>
                      )}
                      <div className="absolute top-3 right-3">
                        <span className={`badge ${getBudgetColor(city.budgetCategory)}`}>
                          {city.budgetCategory}
                        </span>
                      </div>
                      <div className="absolute bottom-3 left-3 right-3">
                        <div className="bg-black/60 backdrop-blur-sm rounded-lg p-3 text-white">
                          <h3 className="text-xl font-bold">{city.name}</h3>
                          <p className="text-sm opacity-90">{city.country}</p>
                        </div>
                      </div>
                    </figure>

                    <div className="card-body">
                      
                      {/* Rating & Reviews */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            <StarIcon className="w-4 h-4 fill-current text-warning" />
                            <span className="font-medium">{city.rating}</span>
                          </div>
                          <span className="text-sm opacity-70">({city.reviews.toLocaleString()} reviews)</span>
                        </div>
                        <div className="text-sm opacity-70 flex items-center gap-1">
                          <UsersIcon className="w-3 h-3" />
                          {city.population}
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-sm opacity-80 mb-4 line-clamp-2">
                        {city.description}
                      </p>

                      {/* Key Info */}
                      <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                        <div className="flex items-center gap-2">
                          <ThermometerIcon className="w-4 h-4 text-orange-500" />
                          <span>{city.averageTemp}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSignIcon className="w-4 h-4 text-green-500" />
                          <span>${city.avgDailyBudget}/day</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPinIcon className="w-4 h-4 text-blue-500" />
                          <span>{city.region}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CameraIcon className="w-4 h-4 text-purple-500" />
                          <span>{city.activities} activities</span>
                        </div>
                      </div>

                      {/* Highlights */}
                      <div className="mb-4">
                        <div className="flex flex-wrap gap-1">
                          {city.highlights.slice(0, 3).map((highlight, index) => (
                            <span key={index} className="badge badge-primary badge-xs">
                              {highlight}
                            </span>
                          ))}
                          {city.highlights.length > 3 && (
                            <span className="badge badge-ghost badge-xs">
                              +{city.highlights.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Top Attractions */}
                      <div className="mb-4">
                        <h4 className="font-medium text-sm mb-2">Top Attractions:</h4>
                        <div className="text-xs opacity-70">
                          {city.topAttractions.slice(0, 3).join(", ")}
                          {city.topAttractions.length > 3 && "..."}
                        </div>
                      </div>

                      {/* Best Time & Actions */}
                      <div className="flex items-center justify-between">
                        <div className="text-xs">
                          <span className="opacity-60">Best time: </span>
                          <span className="font-medium">{city.bestTimeToVisit}</span>
                        </div>
                        <button
                          onClick={() => addToTrip(city)}
                          className="btn btn-primary btn-sm"
                        >
                          <PlusIcon className="w-3 h-3 mr-1" />
                          Add to Trip
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* No Results */}
              {filteredCities.length === 0 && (
                <div className="text-center py-12">
                  <GlobeIcon className="w-16 h-16 mx-auto opacity-30 mb-4" />
                  <p className="text-xl opacity-70 mb-4">No destinations found</p>
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

export default CitySearchPage;
