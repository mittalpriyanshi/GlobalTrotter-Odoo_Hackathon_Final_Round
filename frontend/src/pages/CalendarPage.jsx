import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import useAuthUser from "../hooks/useAuthUser";
import Navbar from "../components/Navbar";
import { 
  CalendarIcon, 
  ChevronLeftIcon, 
  ChevronRightIcon, 
  MapPinIcon,
  ClockIcon,
  DollarSignIcon,
  UserIcon,
  PlusIcon
} from "lucide-react";

const CalendarPage = () => {
  const { authUser } = useAuthUser();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [trips, setTrips] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [viewMode, setViewMode] = useState("month"); // month, week
  
  useEffect(() => {
    loadTrips();
  }, []);

  const loadTrips = () => {
    const savedTrips = JSON.parse(localStorage.getItem("gt_trips") || "[]");
    setTrips(savedTrips);
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const getTripsForDate = (date) => {
    if (!date) return [];
    
    const dateStr = date.toISOString().split('T')[0];
    
    return trips.filter(trip => {
      if (!trip.startDate && !trip.endDate) return false;
      
      // Handle both formatted dates and string dates
      const tripStart = trip.startDate ? new Date(trip.startDate) : null;
      const tripEnd = trip.endDate ? new Date(trip.endDate) : tripStart;
      
      if (!tripStart) return false;
      
      // Set time to start of day for proper comparison
      const checkDate = new Date(date);
      checkDate.setHours(0, 0, 0, 0);
      
      const startDate = new Date(tripStart);
      startDate.setHours(0, 0, 0, 0);
      
      const endDate = new Date(tripEnd);
      endDate.setHours(0, 0, 0, 0);
      
      return checkDate >= startDate && checkDate <= endDate;
    });
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const formatMonthYear = (date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const isToday = (date) => {
    if (!date) return false;
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSameDate = (date1, date2) => {
    if (!date1 || !date2) return false;
    return date1.toDateString() === date2.toDateString();
  };

  const getDayEvents = (date) => {
    const tripsForDate = getTripsForDate(date);
    const events = [];

    tripsForDate.forEach(trip => {
      const dateStr = date.toISOString().split('T')[0];
      
      // Check if this is start or end date
      if (trip.startDate === dateStr) {
        events.push({
          type: 'trip-start',
          trip,
          title: `Start: ${trip.tripName}`,
          color: 'bg-success'
        });
      }
      
      if (trip.endDate === dateStr) {
        events.push({
          type: 'trip-end',
          trip,
          title: `End: ${trip.tripName}`,
          color: 'bg-error'
        });
      }
      
      // Check for activities on this date
      if (trip.suggestions) {
        trip.suggestions.forEach((suggestion, idx) => {
          events.push({
            type: 'activity',
            trip,
            activity: suggestion,
            title: suggestion.name,
            color: 'bg-primary'
          });
        });
      }
    });

    return events;
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const days = getDaysInMonth(currentDate);

  if (!authUser) {
    return (
      <div className="min-h-screen" data-theme="retro">
        <Navbar />
        <div className="flex items-center justify-center h-64">
          <p className="text-lg opacity-70">Please log in to view your calendar.</p>
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
          <div className="flex flex-col gap-4">
            <div className="text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl font-bold flex items-center justify-center sm:justify-start gap-2">
                <CalendarIcon className="w-6 h-6 sm:w-8 sm:h-8" />
                Travel Calendar
              </h1>
              <p className="text-base sm:text-lg opacity-70">Visualize your trips and activities</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
              <div className="btn-group justify-center sm:justify-start">
                <button 
                  className={`btn btn-xs sm:btn-sm ${viewMode === 'month' ? 'btn-active' : 'btn-outline'}`}
                  onClick={() => setViewMode('month')}
                >
                  Month
                </button>
                <button 
                  className={`btn btn-xs sm:btn-sm ${viewMode === 'week' ? 'btn-active' : 'btn-outline'}`}
                  onClick={() => setViewMode('week')}
                >
                  Week
                </button>
              </div>
              <Link to="/plan" className="btn btn-primary btn-sm sm:btn-md">
                <PlusIcon className="w-4 h-4 mr-2" />
                Plan Trip
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            
            {/* Calendar */}
            <div className="lg:col-span-3">
              <div className="card bg-base-100 border border-primary/20">
                <div className="card-body">
                  
                  {/* Calendar Header */}
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold">{formatMonthYear(currentDate)}</h2>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => navigateMonth(-1)}
                        className="btn btn-ghost btn-sm"
                      >
                        <ChevronLeftIcon className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => setCurrentDate(new Date())}
                        className="btn btn-outline btn-sm"
                      >
                        Today
                      </button>
                      <button 
                        onClick={() => navigateMonth(1)}
                        className="btn btn-ghost btn-sm"
                      >
                        <ChevronRightIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Calendar Grid */}
                  <div className="grid grid-cols-7 gap-0.5 sm:gap-1 mb-2">
                    {weekDays.map(day => (
                      <div key={day} className="p-1 sm:p-2 text-center font-semibold text-xs sm:text-sm opacity-70">
                        <span className="hidden sm:inline">{day}</span>
                        <span className="sm:hidden">{day.slice(0, 1)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
                    {days.map((day, index) => {
                      if (!day) {
                        return <div key={index} className="p-1 sm:p-2 h-16 sm:h-24"></div>;
                      }

                      const events = getDayEvents(day);
                      const isSelected = selectedDate && isSameDate(day, selectedDate);
                      const todayClass = isToday(day) ? 'bg-primary/10 ring-1 sm:ring-2 ring-primary' : '';
                      const selectedClass = isSelected ? 'bg-secondary/20' : '';

                      return (
                        <div
                          key={day.toISOString()}
                          className={`p-0.5 sm:p-1 h-16 sm:h-24 border border-base-300 cursor-pointer hover:bg-base-200 transition-colors ${todayClass} ${selectedClass}`}
                          onClick={() => setSelectedDate(day)}
                        >
                          <div className="text-xs sm:text-sm font-medium mb-1">
                            {day.getDate()}
                          </div>
                          <div className="space-y-0.5 sm:space-y-1">
                            {events.slice(0, window.innerWidth < 640 ? 1 : 2).map((event, idx) => (
                              <div
                                key={idx}
                                className={`text-xs px-0.5 sm:px-1 py-0.5 rounded truncate text-white ${event.color}`}
                                title={event.title}
                              >
                                <span className="hidden sm:inline">{event.title}</span>
                                <span className="sm:hidden">•</span>
                              </div>
                            ))}
                            {events.length > (window.innerWidth < 640 ? 1 : 2) && (
                              <div className="text-xs opacity-60">
                                <span className="hidden sm:inline">+{events.length - 2} more</span>
                                <span className="sm:hidden">+{events.length - 1}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              
              {/* Selected Date Details */}
              {selectedDate && (
                <div className="card bg-base-100 border border-primary/20">
                  <div className="card-body">
                    <h3 className="font-bold text-lg mb-4">
                      {selectedDate.toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </h3>
                    
                    {getDayEvents(selectedDate).length > 0 ? (
                      <div className="space-y-3">
                        {getDayEvents(selectedDate).map((event, idx) => (
                          <div key={idx} className="border-l-4 border-primary pl-3">
                            <div className="font-medium text-sm">{event.title}</div>
                            <div className="text-xs opacity-70">{event.trip.tripName}</div>
                            {event.trip.place && (
                              <div className="text-xs opacity-60 flex items-center gap-1 mt-1">
                                <MapPinIcon className="w-3 h-3" />
                                {event.trip.place}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm opacity-70">No events scheduled</p>
                    )}
                  </div>
                </div>
              )}

              {/* Upcoming Trips */}
              <div className="card bg-base-100 border border-primary/20">
                <div className="card-body">
                  <h3 className="font-bold text-lg mb-4">Upcoming Trips</h3>
                  
                  {trips.filter(trip => {
                    if (!trip.startDate) return false;
                    return new Date(trip.startDate) >= new Date();
                  }).slice(0, 3).map(trip => (
                    <div key={trip.id} className="mb-4 last:mb-0">
                      <div className="font-medium text-sm">{trip.tripName}</div>
                      <div className="text-xs opacity-70 flex items-center gap-1">
                        <MapPinIcon className="w-3 h-3" />
                        {trip.place}
                      </div>
                      <div className="text-xs opacity-60 flex items-center gap-1 mt-1">
                        <CalendarIcon className="w-3 h-3" />
                        {trip.startDate} to {trip.endDate}
                      </div>
                    </div>
                  ))}
                  
                  {trips.filter(trip => trip.startDate && new Date(trip.startDate) >= new Date()).length === 0 && (
                    <p className="text-sm opacity-70">No upcoming trips</p>
                  )}
                </div>
              </div>

              {/* Calendar Legend */}
              <div className="card bg-base-100 border border-primary/20">
                <div className="card-body">
                  <h3 className="font-bold text-lg mb-4">Legend</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-success rounded"></div>
                      <span className="text-sm">Trip Start</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-error rounded"></div>
                      <span className="text-sm">Trip End</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-primary rounded"></div>
                      <span className="text-sm">Activities</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-primary/20 border-2 border-primary rounded"></div>
                      <span className="text-sm">Today</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarPage;
