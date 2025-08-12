import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import useAuthUser from "../hooks/useAuthUser";
import useLogout from "../hooks/useLogout";
import Navbar from "../components/Navbar";
import { CameraIcon, EditIcon, MapPinIcon, PhoneIcon, MailIcon, UserIcon, CalendarIcon, HeartIcon } from "lucide-react";
import toast from "react-hot-toast";

const ProfilePage = () => {
  const { authUser } = useAuthUser();
  const { logoutMutation, isPending: isLoggingOut } = useLogout();
  const [savedTrips, setSavedTrips] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    fullName: "",
    email: "",
    phone: "",
    location: "",
    interests: "",
    language: "",
    profilePic: "",
  });

  useEffect(() => {
    if (authUser) {
      setProfileData({
        fullName: authUser.fullName || "",
        email: authUser.email || "",
        phone: authUser.phone || "",
        location: authUser.location || "",
        interests: authUser.interests || "",
        language: authUser.language || "",
        profilePic: authUser.profilePic || "",
      });
    }
  }, [authUser]);

  useEffect(() => {
    // Load saved trips from localStorage
    const trips = JSON.parse(localStorage.getItem("gt_trips") || "[]");
    setSavedTrips(trips);
  }, []);

  const handleSaveProfile = () => {
    // In a real app, this would make an API call to update the user profile
    toast.success("Profile updated successfully!");
    setIsEditing(false);
  };

  const handleRandomAvatar = () => {
    const idx = Math.floor(Math.random() * 100) + 1;
    const randomAvatar = `https://avatar.iran.liara.run/public/${idx}.png`;
    setProfileData({ ...profileData, profilePic: randomAvatar });
    toast.success("Profile picture updated!");
  };

  const getJoinedDate = () => {
    // Simulated join date - in real app would come from backend
    return new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toLocaleDateString();
  };

  const getTripStats = () => {
    const totalTrips = savedTrips.length;
    const countries = new Set();
    const cities = new Set();
    
    savedTrips.forEach(trip => {
      if (trip.place) {
        cities.add(trip.place);
        // Extract country if possible (simplified logic)
        const parts = trip.place.split(',');
        if (parts.length > 1) {
          countries.add(parts[parts.length - 1].trim());
        }
      }
    });

    return {
      totalTrips,
      countries: countries.size,
      cities: cities.size,
    };
  };

  const stats = getTripStats();

  if (!authUser) {
    return (
      <div className="min-h-screen" data-theme="retro">
        <Navbar />
        <div className="flex items-center justify-center h-64">
          <p className="text-lg opacity-70">Please log in to view your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" data-theme="retro">
      <Navbar />
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          
          {/* Profile Header */}
          <div className="card bg-base-100 border border-primary/20">
            <div className="card-body">
              <div className="flex flex-col md:flex-row gap-6 items-start">
                
                {/* Profile Picture */}
                <div className="flex flex-col items-center space-y-3">
                  <div className="avatar">
                    <div className="w-32 h-32 rounded-full ring ring-primary ring-offset-base-100 ring-offset-4">
                      {profileData.profilePic ? (
                        <img src={profileData.profilePic} alt="Profile" className="object-cover" />
                      ) : (
                        <div className="flex items-center justify-center w-full h-full bg-base-200">
                          <CameraIcon className="w-8 h-8 opacity-50" />
                        </div>
                      )}
                    </div>
                  </div>
                  {isEditing && (
                    <button onClick={handleRandomAvatar} className="btn btn-sm btn-outline">
                      <CameraIcon className="w-4 h-4 mr-1" />
                      New Avatar
                    </button>
                  )}
                </div>

                {/* Profile Info */}
                <div className="flex-1 space-y-4">
                  {isEditing ? (
                    <div className="space-y-3">
                      <div className="form-control">
                        <label className="label">
                          <span className="label-text">Full Name</span>
                        </label>
                        <input
                          type="text"
                          className="input input-bordered"
                          value={profileData.fullName}
                          onChange={(e) => setProfileData({...profileData, fullName: e.target.value})}
                        />
                      </div>
                      <div className="form-control">
                        <label className="label">
                          <span className="label-text">Location</span>
                        </label>
                        <input
                          type="text"
                          className="input input-bordered"
                          value={profileData.location}
                          onChange={(e) => setProfileData({...profileData, location: e.target.value})}
                        />
                      </div>
                      <div className="form-control">
                        <label className="label">
                          <span className="label-text">Interests</span>
                        </label>
                        <textarea
                          className="textarea textarea-bordered"
                          value={profileData.interests}
                          onChange={(e) => setProfileData({...profileData, interests: e.target.value})}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <h1 className="text-3xl font-bold">{profileData.fullName}</h1>
                      <div className="flex flex-wrap gap-4 text-sm opacity-70">
                        <span className="flex items-center gap-1">
                          <MailIcon className="w-4 h-4" />
                          {profileData.email}
                        </span>
                        {profileData.location && (
                          <span className="flex items-center gap-1">
                            <MapPinIcon className="w-4 h-4" />
                            {profileData.location}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <CalendarIcon className="w-4 h-4" />
                          Joined {getJoinedDate()}
                        </span>
                      </div>
                      {profileData.interests && (
                        <div className="space-y-2">
                          <span className="flex items-center gap-1 text-sm font-medium">
                            <HeartIcon className="w-4 h-4" />
                            Interests
                          </span>
                          <p className="text-sm opacity-80">{profileData.interests}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    {isEditing ? (
                      <>
                        <button onClick={handleSaveProfile} className="btn btn-primary">
                          Save Changes
                        </button>
                        <button onClick={() => setIsEditing(false)} className="btn btn-outline">
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button onClick={() => setIsEditing(true)} className="btn btn-primary">
                        <EditIcon className="w-4 h-4 mr-2" />
                        Edit Profile
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Travel Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="stat bg-base-100 border border-primary/20 rounded-lg">
              <div className="stat-title">Total Trips</div>
              <div className="stat-value text-primary">{stats.totalTrips}</div>
            </div>
            <div className="stat bg-base-100 border border-primary/20 rounded-lg">
              <div className="stat-title">Cities Visited</div>
              <div className="stat-value text-secondary">{stats.cities}</div>
            </div>
            <div className="stat bg-base-100 border border-primary/20 rounded-lg">
              <div className="stat-title">Countries</div>
              <div className="stat-value text-accent">{stats.countries}</div>
            </div>
          </div>

          {/* Recent Trips */}
          <div className="card bg-base-100 border border-primary/20">
            <div className="card-body">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Recent Trips</h2>
                <Link to="/trips" className="btn btn-outline btn-sm">
                  View All
                </Link>
              </div>
              
              {savedTrips.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {savedTrips.slice(0, 4).map((trip) => (
                    <div key={trip.id} className="card bg-base-200 border border-primary/10">
                      <div className="card-body p-4">
                        <h3 className="font-semibold">{trip.tripName}</h3>
                        <p className="text-sm opacity-70">{trip.place}</p>
                        <div className="text-xs opacity-60">
                          {trip.startDate && trip.endDate 
                            ? `${trip.startDate} to ${trip.endDate}`
                            : 'Dates not set'
                          }
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-lg opacity-70">No trips planned yet</p>
                  <Link to="/plan" className="btn btn-primary mt-4">
                    Plan Your First Trip
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Account Actions */}
          <div className="card bg-base-100 border border-primary/20">
            <div className="card-body">
              <h2 className="text-xl font-bold mb-4">Account Settings</h2>
              <div className="space-y-3">
                <Link to="/onboarding" className="btn btn-outline btn-block justify-start">
                  <EditIcon className="w-4 h-4 mr-2" />
                  Update Profile Details
                </Link>
                <button 
                  onClick={() => logoutMutation()} 
                  disabled={isLoggingOut}
                  className="btn btn-error btn-outline btn-block justify-start"
                >
                  {isLoggingOut ? (
                    <>
                      <span className="loading loading-spinner loading-sm mr-2"></span>
                      Logging out...
                    </>
                  ) : (
                    <>
                      <UserIcon className="w-4 h-4 mr-2" />
                      Logout
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProfilePage;

