import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import useAuthUser from "../hooks/useAuthUser";
import useLogout from "../hooks/useLogout";
import NotificationCenter from "./NotificationCenter";
import { MenuIcon, XIcon } from "lucide-react";

const NavItem = ({ to, label, onClick, isMobile = false }) => {
  const location = useLocation();
  const active = location.pathname === to;
  return (
    <Link 
      to={to} 
      className={`btn btn-ghost btn-sm ${active ? "btn-active" : ""} ${isMobile ? "justify-start w-full" : ""}`}
      onClick={onClick}
    >
      {label}
    </Link>
  );
};

const Navbar = () => {
  const { authUser } = useAuthUser();
  const { logoutMutation, isPending } = useLogout();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <div className="navbar bg-base-100 border-b border-primary/20 relative z-50" data-theme="retro">
        <div className="container mx-auto px-2">
          
          {/* Logo and Brand */}
          <div className="flex-1 flex items-center gap-2">
            <img src="/icon1.png" alt="logo" className="w-7 h-7 rounded" />
            <Link to="/" className="text-xl font-bold">
              <span className="hidden sm:block">GlobalTrotter</span>
              <span className="block sm:hidden">GT</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="flex-none hidden lg:flex items-center gap-1">
            {authUser ? (
              <>
                <NavItem to="/" label="Home" />
                <NavItem to="/destinations" label="Destinations" />
                <NavItem to="/activities" label="Activities" />
                <NavItem to="/plan" label="Plan" />
                <NavItem to="/trips" label="My Trips" />
                <NavItem to="/calendar" label="Calendar" />
                <NavItem to="/community" label="Community" />
                
                <div className="divider divider-horizontal m-0"></div>
                <NotificationCenter />
                
                {/* User Dropdown */}
                <div className="dropdown dropdown-end">
                  <label tabIndex={0} className="btn btn-ghost btn-circle avatar">
                    <div className="w-8 rounded-full ring ring-primary/40 ring-offset-base-100 ring-offset-2">
                      <img alt="avatar" src={authUser?.profilePic || "/icon1.png"} />
                    </div>
                  </label>
                  <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
                    <li><span className="font-medium text-primary px-4 py-2">{authUser?.fullName}</span></li>
                    <li><Link to="/itinerary-enhanced">Build Itinerary</Link></li>
                    <li><Link to="/expenses">Expenses</Link></li>
                    <li><Link to="/journal">Journal</Link></li>
                    <li><Link to="/profile">Profile Settings</Link></li>
                    <li><button 
                      onClick={() => logoutMutation()} 
                      disabled={isPending}
                      className="text-error"
                    >
                      {isPending ? "Logging out..." : "Logout"}
                    </button></li>
                  </ul>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-primary btn-sm">Login</Link>
                <Link to="/signup" className="btn btn-outline btn-sm">Sign Up</Link>
              </>
            )}
          </div>

          {/* Mobile Navigation */}
          <div className="flex-none lg:hidden flex items-center gap-2">
            {authUser ? (
              <>
                <NotificationCenter />
                <div className="avatar">
                  <div className="w-8 rounded-full ring ring-primary/40 ring-offset-base-100 ring-offset-2">
                    <img alt="avatar" src={authUser?.profilePic || "/icon1.png"} />
                  </div>
                </div>
                <button 
                  className="btn btn-ghost btn-square btn-sm"
                  onClick={toggleMobileMenu}
                >
                  {isMobileMenuOpen ? <XIcon className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-primary btn-xs">Login</Link>
                <Link to="/signup" className="btn btn-outline btn-xs">Sign Up</Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && authUser && (
        <div className="fixed inset-0 z-40 lg:hidden">
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black/50" onClick={closeMobileMenu}></div>
          
          {/* Menu Panel */}
          <div className="fixed top-16 left-0 right-0 bg-base-100 border-b border-primary/20 shadow-xl max-h-[80vh] overflow-y-auto">
            <div className="p-4 space-y-4">
              
              {/* User Info Card */}
              <div className="card bg-primary/5 border border-primary/20">
                <div className="card-body p-4">
                  <div className="flex items-center gap-3">
                    <div className="avatar">
                      <div className="w-12 rounded-full ring ring-primary/40">
                        <img src={authUser?.profilePic || "/icon1.png"} alt="avatar" />
                      </div>
                    </div>
                    <div>
                      <div className="font-bold text-lg">{authUser?.fullName}</div>
                      <div className="text-sm opacity-70">{authUser?.email}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Navigation Grid */}
              <div className="grid grid-cols-2 gap-3">
                <NavItem to="/" label="🏠 Home" onClick={closeMobileMenu} isMobile />
                <NavItem to="/destinations" label="🌍 Destinations" onClick={closeMobileMenu} isMobile />
                <NavItem to="/activities" label="🎯 Activities" onClick={closeMobileMenu} isMobile />
                <NavItem to="/plan" label="📋 Plan Trip" onClick={closeMobileMenu} isMobile />
                <NavItem to="/itinerary-enhanced" label="✈️ Build Itinerary" onClick={closeMobileMenu} isMobile />
                <NavItem to="/trips" label="🗺️ My Trips" onClick={closeMobileMenu} isMobile />
                <NavItem to="/calendar" label="📅 Calendar" onClick={closeMobileMenu} isMobile />
                <NavItem to="/expenses" label="💰 Expenses" onClick={closeMobileMenu} isMobile />
                <NavItem to="/journal" label="📝 Journal" onClick={closeMobileMenu} isMobile />
                <NavItem to="/community" label="👥 Community" onClick={closeMobileMenu} isMobile />
                <NavItem to="/profile" label="👤 Profile" onClick={closeMobileMenu} isMobile />
              </div>

              {/* Logout Section */}
              <div className="pt-4 border-t border-primary/20">
                <button 
                  className="btn btn-outline btn-error btn-sm w-full" 
                  onClick={() => {
                    logoutMutation();
                    closeMobileMenu();
                  }} 
                  disabled={isPending}
                >
                  {isPending ? "Logging out..." : "🚪 Logout"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;