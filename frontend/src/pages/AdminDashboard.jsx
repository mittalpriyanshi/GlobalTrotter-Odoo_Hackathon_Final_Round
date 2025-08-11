import { useState, useEffect } from "react";
import useAuthUser from "../hooks/useAuthUser";
import Navbar from "../components/Navbar";
import { 
  BarChart3Icon,
  UsersIcon,
  MapPinIcon,
  TrendingUpIcon,
  CalendarIcon,
  DollarSignIcon,
  ActivityIcon,
  GlobeIcon,
  SearchIcon,
  FilterIcon,
  DownloadIcon
} from "lucide-react";

const AdminDashboard = () => {
  const { authUser } = useAuthUser();
  const [analytics, setAnalytics] = useState({});
  const [selectedTab, setSelectedTab] = useState("overview");
  const [timeRange, setTimeRange] = useState("30d");
  
  useEffect(() => {
    generateAnalytics();
  }, [timeRange]);

  const generateAnalytics = () => {
    // Simulate analytics data from localStorage
    const trips = JSON.parse(localStorage.getItem("gt_trips") || "[]");
    const expenses = JSON.parse(localStorage.getItem("gt_expenses") || "[]");
    const journalEntries = JSON.parse(localStorage.getItem("gt_journal_entries") || "[]");
    const itineraries = JSON.parse(localStorage.getItem("gt_itineraries") || "[]");
    
    // Simulate user data
    const totalUsers = 1247; // Simulated
    const activeUsers = 892;
    const newUsersThisMonth = 156;
    
    // Trip analytics
    const totalTrips = trips.length + Math.floor(Math.random() * 500) + 300;
    const completedTrips = Math.floor(totalTrips * 0.3);
    const upcomingTrips = Math.floor(totalTrips * 0.4);
    
    // Popular destinations
    const destinations = {};
    trips.forEach(trip => {
      if (trip.place) {
        destinations[trip.place] = (destinations[trip.place] || 0) + 1;
      }
    });
    
    // Add some popular simulated destinations
    const simulatedDestinations = {
      "Paris, France": 45,
      "Tokyo, Japan": 38,
      "New York, USA": 42,
      "London, UK": 36,
      "Barcelona, Spain": 29,
      "Rome, Italy": 33,
      "Dubai, UAE": 27,
      "Amsterdam, Netherlands": 24
    };
    
    Object.entries(simulatedDestinations).forEach(([dest, count]) => {
      destinations[dest] = (destinations[dest] || 0) + count;
    });
    
    const popularDestinations = Object.entries(destinations)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10);
    
    // Popular activities
    const activities = {
      "Sightseeing": 156,
      "Food Tours": 89,
      "Museums": 76,
      "Adventure Sports": 45,
      "Cultural Events": 67,
      "Shopping": 34,
      "Photography": 56,
      "Nightlife": 28
    };
    
    // Monthly growth data
    const monthlyData = [
      { month: "Jan", users: 98, trips: 45, revenue: 2340 },
      { month: "Feb", users: 112, trips: 52, revenue: 2678 },
      { month: "Mar", users: 134, trips: 67, revenue: 3456 },
      { month: "Apr", users: 156, trips: 78, revenue: 4123 },
      { month: "May", users: 189, trips: 89, revenue: 4890 },
      { month: "Jun", users: 223, trips: 102, revenue: 5234 }
    ];
    
    setAnalytics({
      totalUsers,
      activeUsers,
      newUsersThisMonth,
      totalTrips,
      completedTrips,
      upcomingTrips,
      popularDestinations,
      activities,
      monthlyData,
      totalRevenue: expenses.reduce((sum, exp) => sum + (parseFloat(exp.amount) || 0), 0) + 45678,
      avgTripDuration: 7.2,
      userRetention: 78.5
    });
  };

  const StatCard = ({ title, value, change, icon: Icon, color = "primary" }) => (
    <div className="stat bg-base-100 border border-primary/20 rounded-lg">
      <div className={`stat-figure text-${color}`}>
        <Icon className="w-8 h-8" />
      </div>
      <div className="stat-title">{title}</div>
      <div className={`stat-value text-${color}`}>{value}</div>
      {change && (
        <div className={`stat-desc ${change > 0 ? 'text-success' : 'text-error'}`}>
          {change > 0 ? '↗︎' : '↘︎'} {Math.abs(change)}% from last month
        </div>
      )}
    </div>
  );

  // Check if user is admin (simple check - in real app would be server-side)
  const isAdmin = authUser?.email === "admin@globetrotter.com" || authUser?.role === "admin";

  if (!authUser) {
    return (
      <div className="min-h-screen" data-theme="retro">
        <Navbar />
        <div className="flex items-center justify-center h-64">
          <p className="text-lg opacity-70">Please log in to access the admin dashboard.</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen" data-theme="retro">
        <Navbar />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
            <p className="text-lg opacity-70">You don't have permission to access the admin dashboard.</p>
          </div>
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
                <BarChart3Icon className="w-8 h-8" />
                Admin Dashboard
              </h1>
              <p className="text-lg opacity-70">Platform analytics and user management</p>
            </div>
            <div className="flex gap-2">
              <select 
                className="select select-bordered"
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </select>
              <button className="btn btn-outline">
                <DownloadIcon className="w-4 h-4 mr-2" />
                Export
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="tabs tabs-boxed">
            <button 
              className={`tab ${selectedTab === "overview" ? "tab-active" : ""}`}
              onClick={() => setSelectedTab("overview")}
            >
              Overview
            </button>
            <button 
              className={`tab ${selectedTab === "users" ? "tab-active" : ""}`}
              onClick={() => setSelectedTab("users")}
            >
              Users
            </button>
            <button 
              className={`tab ${selectedTab === "trips" ? "tab-active" : ""}`}
              onClick={() => setSelectedTab("trips")}
            >
              Trips
            </button>
            <button 
              className={`tab ${selectedTab === "analytics" ? "tab-active" : ""}`}
              onClick={() => setSelectedTab("analytics")}
            >
              Analytics
            </button>
          </div>

          {/* Overview Tab */}
          {selectedTab === "overview" && (
            <div className="space-y-6">
              
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  title="Total Users"
                  value={analytics.totalUsers?.toLocaleString()}
                  change={12.5}
                  icon={UsersIcon}
                  color="primary"
                />
                <StatCard
                  title="Active Users"
                  value={analytics.activeUsers?.toLocaleString()}
                  change={8.2}
                  icon={TrendingUpIcon}
                  color="success"
                />
                <StatCard
                  title="Total Trips"
                  value={analytics.totalTrips?.toLocaleString()}
                  change={15.7}
                  icon={GlobeIcon}
                  color="secondary"
                />
                <StatCard
                  title="Revenue"
                  value={`$${analytics.totalRevenue?.toLocaleString()}`}
                  change={22.1}
                  icon={DollarSignIcon}
                  color="accent"
                />
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="card bg-base-100 border border-primary/20">
                  <div className="card-body">
                    <h3 className="text-lg font-bold mb-4">Trip Status Distribution</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span>Completed Trips</span>
                        <div className="flex items-center gap-2">
                          <progress className="progress progress-success w-20" value={analytics.completedTrips} max={analytics.totalTrips}></progress>
                          <span className="text-sm">{analytics.completedTrips}</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Upcoming Trips</span>
                        <div className="flex items-center gap-2">
                          <progress className="progress progress-primary w-20" value={analytics.upcomingTrips} max={analytics.totalTrips}></progress>
                          <span className="text-sm">{analytics.upcomingTrips}</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Draft Trips</span>
                        <div className="flex items-center gap-2">
                          <progress className="progress progress-warning w-20" value={analytics.totalTrips - analytics.completedTrips - analytics.upcomingTrips} max={analytics.totalTrips}></progress>
                          <span className="text-sm">{analytics.totalTrips - analytics.completedTrips - analytics.upcomingTrips}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card bg-base-100 border border-primary/20">
                  <div className="card-body">
                    <h3 className="text-lg font-bold mb-4">Platform Health</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span>User Retention Rate</span>
                        <span className="font-bold text-success">{analytics.userRetention}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Avg Trip Duration</span>
                        <span className="font-bold">{analytics.avgTripDuration} days</span>
                      </div>
                      <div className="flex justify-between">
                        <span>New Users This Month</span>
                        <span className="font-bold text-primary">{analytics.newUsersThisMonth}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Active Sessions</span>
                        <span className="font-bold text-secondary">1,234</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Popular Destinations & Activities */}
          {selectedTab === "analytics" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="card bg-base-100 border border-primary/20">
                <div className="card-body">
                  <h3 className="text-lg font-bold mb-4">Popular Destinations</h3>
                  <div className="space-y-3">
                    {analytics.popularDestinations?.slice(0, 8).map(([destination, count], index) => (
                      <div key={destination} className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span className="badge badge-primary badge-sm">{index + 1}</span>
                          <span className="text-sm">{destination}</span>
                        </div>
                        <span className="font-bold">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="card bg-base-100 border border-primary/20">
                <div className="card-body">
                  <h3 className="text-lg font-bold mb-4">Popular Activities</h3>
                  <div className="space-y-3">
                    {Object.entries(analytics.activities || {}).map(([activity, count], index) => (
                      <div key={activity} className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span className="badge badge-secondary badge-sm">{index + 1}</span>
                          <span className="text-sm">{activity}</span>
                        </div>
                        <span className="font-bold">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Monthly Growth Chart */}
          {selectedTab === "analytics" && (
            <div className="card bg-base-100 border border-primary/20">
              <div className="card-body">
                <h3 className="text-lg font-bold mb-4">Monthly Growth Trends</h3>
                <div className="overflow-x-auto">
                  <table className="table table-zebra">
                    <thead>
                      <tr>
                        <th>Month</th>
                        <th>New Users</th>
                        <th>New Trips</th>
                        <th>Revenue</th>
                        <th>Growth Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analytics.monthlyData?.map((data, index) => {
                        const prevData = analytics.monthlyData[index - 1];
                        const userGrowth = prevData ? ((data.users - prevData.users) / prevData.users * 100).toFixed(1) : 0;
                        
                        return (
                          <tr key={data.month}>
                            <td className="font-medium">{data.month}</td>
                            <td>{data.users}</td>
                            <td>{data.trips}</td>
                            <td>${data.revenue.toLocaleString()}</td>
                            <td>
                              <span className={`badge ${userGrowth > 0 ? 'badge-success' : 'badge-error'}`}>
                                {userGrowth > 0 ? '+' : ''}{userGrowth}%
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* User Management */}
          {selectedTab === "users" && (
            <div className="card bg-base-100 border border-primary/20">
              <div className="card-body">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold">User Management</h3>
                  <div className="flex gap-2">
                    <div className="form-control">
                      <div className="input-group">
                        <input type="text" placeholder="Search users..." className="input input-bordered" />
                        <button className="btn btn-square">
                          <SearchIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <button className="btn btn-outline">
                      <FilterIcon className="w-4 h-4 mr-2" />
                      Filter
                    </button>
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="table table-zebra">
                    <thead>
                      <tr>
                        <th>User</th>
                        <th>Email</th>
                        <th>Join Date</th>
                        <th>Trips</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>
                          <div className="flex items-center gap-3">
                            <div className="avatar placeholder">
                              <div className="bg-neutral-focus text-neutral-content rounded-full w-8">
                                <span className="text-xs">JD</span>
                              </div>
                            </div>
                            <span>John Doe</span>
                          </div>
                        </td>
                        <td>john@example.com</td>
                        <td>2024-01-15</td>
                        <td>5</td>
                        <td><span className="badge badge-success">Active</span></td>
                        <td>
                          <button className="btn btn-ghost btn-xs">View</button>
                          <button className="btn btn-ghost btn-xs">Edit</button>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <div className="flex items-center gap-3">
                            <div className="avatar placeholder">
                              <div className="bg-neutral-focus text-neutral-content rounded-full w-8">
                                <span className="text-xs">JS</span>
                              </div>
                            </div>
                            <span>Jane Smith</span>
                          </div>
                        </td>
                        <td>jane@example.com</td>
                        <td>2024-02-20</td>
                        <td>3</td>
                        <td><span className="badge badge-success">Active</span></td>
                        <td>
                          <button className="btn btn-ghost btn-xs">View</button>
                          <button className="btn btn-ghost btn-xs">Edit</button>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <div className="flex items-center gap-3">
                            <div className="avatar placeholder">
                              <div className="bg-neutral-focus text-neutral-content rounded-full w-8">
                                <span className="text-xs">MB</span>
                              </div>
                            </div>
                            <span>Mike Brown</span>
                          </div>
                        </td>
                        <td>mike@example.com</td>
                        <td>2024-03-10</td>
                        <td>7</td>
                        <td><span className="badge badge-warning">Inactive</span></td>
                        <td>
                          <button className="btn btn-ghost btn-xs">View</button>
                          <button className="btn btn-ghost btn-xs">Edit</button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
