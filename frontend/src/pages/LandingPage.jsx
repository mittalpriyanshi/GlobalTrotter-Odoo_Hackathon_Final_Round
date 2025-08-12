import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import useAuthUser from "../hooks/useAuthUser";
import Navbar from "../components/Navbar";
import SearchWithFilters from "../components/SearchWithFilters";

const Card = ({ title, subtitle }) => (
  <div className="card bg-base-100 border border-primary/20 shadow-sm h-44">
    <div className="card-body p-4">
      <h3 className="font-semibold line-clamp-1">{title}</h3>
      {subtitle ? <p className="opacity-70 text-sm line-clamp-2">{subtitle}</p> : null}
    </div>
  </div>
);

const TransportationSlideshow = ({ authUser }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  // Transportation images from Unsplash
  const transportationImages = [
    {
      url: "https://images.unsplash.com/photo-1540962351504-03099e0a754b?w=1200&h=400&fit=crop&crop=center",
      alt: "Airplane in flight"
    },
    {
      url: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=1200&h=400&fit=crop&crop=center",
      alt: "Train on tracks"
    },
    {
      url: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=1200&h=400&fit=crop&crop=center",
      alt: "Car on scenic road"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % transportationImages.length);
    }, 4000); // Change slide every 4 seconds

    return () => clearInterval(timer);
  }, [transportationImages.length]);

  const firstName = authUser?.fullName?.split(' ')[0] || "Traveler";

  return (
    <div className="relative w-full h-full">
      {/* Background Images */}
      {transportationImages.map((image, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentSlide ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <img
            src={image.url}
            alt={image.alt}
            className="w-full h-full object-cover"
          />
          {/* Overlay for better text readability */}
          <div className="absolute inset-0 bg-black/40"></div>
        </div>
      ))}

      {/* Centered Text Content */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="text-center max-w-4xl">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-pacifico text-white mb-2 sm:mb-4 drop-shadow-lg">
            Welcome to GlobalTrotter
          </h1>
          {!authUser && (
            <p className="text-base sm:text-lg text-white/90 px-2 drop-shadow-lg">
              Discover amazing destinations and plan your next adventure
            </p>
          )}
          {authUser && (
            <p className="text-base sm:text-lg text-white/90 drop-shadow-lg">
              Welcome back, {firstName}! Ready for your next adventure?
            </p>
          )}
        </div>
      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {transportationImages.map((_, index) => (
          <button
            key={index}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentSlide ? 'bg-white' : 'bg-white/50'
            }`}
            onClick={() => setCurrentSlide(index)}
          />
        ))}
      </div>
    </div>
  );
};

const LandingPage = () => {
  const { authUser } = useAuthUser();
  const fullName = authUser?.fullName || "Traveler";
  const avatar = authUser?.profilePic || "/icon1.png";
  return (
    <div className="min-h-screen" data-theme="retro">
      <Navbar />
      <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Slideshow Banner */}
        <div className="w-full h-48 sm:h-56 lg:h-72 rounded-xl border border-primary/20 bg-base-200 relative overflow-hidden">
          <TransportationSlideshow authUser={authUser} />
        </div>

        {/* Enhanced Search with Filters */}
        <SearchWithFilters 
          onSearch={(query, filters) => {
            console.log("Search:", query, "Filters:", filters);
            // In a real app, this would trigger a search API call
          }}
          onFilterChange={(filters) => {
            console.log("Filters changed:", filters);
            // In a real app, this would update the displayed results
          }}
        />


        {/* Previous Trips / Featured Destinations */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="text-xl lg:text-2xl font-semibold">{authUser ? "Recent Trips" : "Featured Destinations"}</h2>
            {authUser ? (
              <div className="flex flex-col xs:flex-row gap-2">
                <Link to="/plan" className="btn btn-primary btn-sm">+ Plan a trip</Link>
                <Link to="/itinerary-enhanced" className="btn btn-outline btn-sm">Build itinerary</Link>
              </div>
            ) : (
              <div className="flex flex-col xs:flex-row gap-2">
                {/* <Link to="/signup" className="btn btn-primary btn-sm">Get Started</Link>
                <Link to="/login" className="btn btn-outline btn-sm">Login</Link> */}
              </div>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => {
              const destinations = [
                // Mix of Indian and International destinations
                { name: "Varanasi, India", description: "Spiritual capital on the Ganges", rating: 4.6, budget: "₹2,500/day", highlights: "Ganga Aarti, Ancient Temples" },
                { name: "Paris, France", description: "City of Light and Romance", rating: 4.8, budget: "$120/day", highlights: "Eiffel Tower, Art Museums" },
                { name: "Rishikesh, India", description: "Yoga capital of the world", rating: 4.5, budget: "₹2,000/day", highlights: "River Rafting, Meditation" },
                { name: "Tokyo, Japan", description: "Modern meets traditional", rating: 4.7, budget: "$110/day", highlights: "Technology, Cuisine" },
                { name: "Delhi, India", description: "Heart of incredible India", rating: 4.3, budget: "₹3,000/day", highlights: "Red Fort, Street Food" },
                { name: "Ahmedabad, India", description: "UNESCO World Heritage city", rating: 4.4, budget: "₹2,800/day", highlights: "Gandhi Ashram, Heritage" }
              ];
              const images = [
                "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=400&h=300&fit=crop",
                "https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?w=400&h=300&fit=crop",
                "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop", 
                "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&h=300&fit=crop",
                "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=400&h=300&fit=crop",
                "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop"
              ];
              
              const destination = destinations[i];
              
              return (
                <div key={`prev-${i}`} className="card bg-base-100 border border-primary/20 hover:shadow-lg transition-shadow">
                  <figure className="h-40 sm:h-48 relative">
                    <img 
                      src={images[i]} 
                      alt={destination.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2 flex gap-1">
                      <span className="badge badge-primary badge-sm">⭐ {destination.rating}</span>
                    </div>
                  </figure>
                  <div className="card-body p-4">
                    <h3 className="font-semibold text-base sm:text-lg">{authUser ? `Trip to ${destination.name}` : destination.name}</h3>
                    <p className="opacity-70 text-sm mb-2">
                      {authUser 
                        ? "Amazing journey with unforgettable memories and experiences." 
                        : destination.description
                      }
                    </p>
                    {!authUser && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="opacity-60">Budget:</span>
                          <span className="font-medium">{destination.budget}</span>
                        </div>
                        <div className="text-xs opacity-70">
                          <span className="font-medium">Highlights:</span> {destination.highlights}
                        </div>
                      </div>
                    )}
                    <div className="card-actions justify-end mt-3">
                      {authUser ? (
                        <button className="btn btn-primary btn-sm">View Details</button>
                      ) : (
                        <Link to="/signup" className="btn btn-primary btn-sm">Start Planning</Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
      </div>
    </div>
  );
};

export default LandingPage;


