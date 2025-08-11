import { useState, useEffect } from "react";
import { SearchIcon, FilterIcon, CalendarIcon, DollarSignIcon, UsersIcon, MapIcon } from "lucide-react";

const SearchWithFilters = ({ onSearch, onFilterChange }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    budget: "",
    duration: "",
    travelerType: "",
    interests: [],
    season: "",
    region: ""
  });

  const budgetOptions = [
    { value: "budget", label: "Budget (Under $500)" },
    { value: "mid-range", label: "Mid-range ($500-$1500)" },
    { value: "luxury", label: "Luxury ($1500+)" }
  ];

  const durationOptions = [
    { value: "weekend", label: "Weekend (2-3 days)" },
    { value: "week", label: "1 Week" },
    { value: "two-weeks", label: "2 Weeks" },
    { value: "month", label: "1 Month+" }
  ];

  const travelerTypeOptions = [
    { value: "solo", label: "Solo Travel" },
    { value: "couple", label: "Couple" },
    { value: "family", label: "Family" },
    { value: "friends", label: "Friends" },
    { value: "business", label: "Business" }
  ];

  const interestOptions = [
    "Adventure", "Culture", "Food", "History", "Nature", "Beach", 
    "Mountains", "Cities", "Wildlife", "Photography", "Art", "Museums"
  ];

  const seasonOptions = [
    { value: "spring", label: "Spring" },
    { value: "summer", label: "Summer" },
    { value: "autumn", label: "Autumn" },
    { value: "winter", label: "Winter" }
  ];

  const regionOptions = [
    { value: "asia", label: "Asia" },
    { value: "europe", label: "Europe" },
    { value: "americas", label: "Americas" },
    { value: "africa", label: "Africa" },
    { value: "oceania", label: "Oceania" }
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchQuery, filters);
    }
  };

  const updateFilter = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    if (onFilterChange) {
      onFilterChange(newFilters);
    }
  };

  const toggleInterest = (interest) => {
    const newInterests = filters.interests.includes(interest)
      ? filters.interests.filter(i => i !== interest)
      : [...filters.interests, interest];
    updateFilter("interests", newInterests);
  };

  const clearFilters = () => {
    const clearedFilters = {
      budget: "",
      duration: "",
      travelerType: "",
      interests: [],
      season: "",
      region: ""
    };
    setFilters(clearedFilters);
    if (onFilterChange) {
      onFilterChange(clearedFilters);
    }
  };

  const hasActiveFilters = Object.values(filters).some(value => 
    Array.isArray(value) ? value.length > 0 : value !== ""
  );

  return (
    <div className="space-y-4">
      {/* Main Search Bar */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-base-content opacity-40" />
          <input
            type="text"
            className="input input-bordered w-full pl-10"
            placeholder="Search destinations, cities, or countries..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button
          type="button"
          onClick={() => setShowFilters(!showFilters)}
          className={`btn btn-outline ${hasActiveFilters ? 'btn-primary' : ''}`}
        >
          <FilterIcon className="w-4 h-4" />
          Filters
          {hasActiveFilters && (
            <div className="badge badge-primary badge-sm ml-1">
              {Object.values(filters).reduce((count, value) => 
                count + (Array.isArray(value) ? value.length : value ? 1 : 0), 0
              )}
            </div>
          )}
        </button>
        <button type="submit" className="btn btn-primary">
          Search
        </button>
      </form>

      {/* Filters Panel */}
      {showFilters && (
        <div className="card bg-base-100 border border-primary/20">
          <div className="card-body space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Search Filters</h3>
              {hasActiveFilters && (
                <button onClick={clearFilters} className="btn btn-sm btn-ghost">
                  Clear All
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              {/* Budget */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text flex items-center gap-2">
                    <DollarSignIcon className="w-4 h-4" />
                    Budget Range
                  </span>
                </label>
                <select
                  className="select select-bordered"
                  value={filters.budget}
                  onChange={(e) => updateFilter("budget", e.target.value)}
                >
                  <option value="">Any budget</option>
                  {budgetOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Duration */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4" />
                    Trip Duration
                  </span>
                </label>
                <select
                  className="select select-bordered"
                  value={filters.duration}
                  onChange={(e) => updateFilter("duration", e.target.value)}
                >
                  <option value="">Any duration</option>
                  {durationOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Traveler Type */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text flex items-center gap-2">
                    <UsersIcon className="w-4 h-4" />
                    Traveler Type
                  </span>
                </label>
                <select
                  className="select select-bordered"
                  value={filters.travelerType}
                  onChange={(e) => updateFilter("travelerType", e.target.value)}
                >
                  <option value="">Any type</option>
                  {travelerTypeOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Season */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Best Season</span>
                </label>
                <select
                  className="select select-bordered"
                  value={filters.season}
                  onChange={(e) => updateFilter("season", e.target.value)}
                >
                  <option value="">Any season</option>
                  {seasonOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Region */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text flex items-center gap-2">
                    <MapIcon className="w-4 h-4" />
                    Region
                  </span>
                </label>
                <select
                  className="select select-bordered"
                  value={filters.region}
                  onChange={(e) => updateFilter("region", e.target.value)}
                >
                  <option value="">Any region</option>
                  {regionOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Interests */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Interests</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {interestOptions.map(interest => (
                  <label key={interest} className="cursor-pointer">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-sm"
                      checked={filters.interests.includes(interest)}
                      onChange={() => toggleInterest(interest)}
                    />
                    <span className="ml-2 text-sm">{interest}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Active Filters Summary */}
            {hasActiveFilters && (
              <div className="border-t pt-4">
                <h4 className="text-sm font-medium mb-2">Active Filters:</h4>
                <div className="flex flex-wrap gap-2">
                  {filters.budget && (
                    <div className="badge badge-primary">
                      Budget: {budgetOptions.find(o => o.value === filters.budget)?.label}
                    </div>
                  )}
                  {filters.duration && (
                    <div className="badge badge-primary">
                      Duration: {durationOptions.find(o => o.value === filters.duration)?.label}
                    </div>
                  )}
                  {filters.travelerType && (
                    <div className="badge badge-primary">
                      Type: {travelerTypeOptions.find(o => o.value === filters.travelerType)?.label}
                    </div>
                  )}
                  {filters.season && (
                    <div className="badge badge-primary">
                      Season: {seasonOptions.find(o => o.value === filters.season)?.label}
                    </div>
                  )}
                  {filters.region && (
                    <div className="badge badge-primary">
                      Region: {regionOptions.find(o => o.value === filters.region)?.label}
                    </div>
                  )}
                  {filters.interests.map(interest => (
                    <div key={interest} className="badge badge-secondary">
                      {interest}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchWithFilters;

