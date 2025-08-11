import { Link, useLocation } from "react-router";
import useAuthUser from "../hooks/useAuthUser";
import useLogout from "../hooks/useLogout";

const NavItem = ({ to, label }) => {
  const location = useLocation();
  const active = location.pathname === to;
  return (
    <Link to={to} className={`btn btn-ghost btn-sm ${active ? "btn-active" : ""}`}>{label}</Link>
  );
};

const Navbar = () => {
  const { authUser } = useAuthUser();
  const { logoutMutation, isPending } = useLogout();

  return (
    <div className="navbar bg-base-100 border-b border-primary/20" data-theme="retro">
      <div className="container mx-auto px-2">
        <div className="flex-1 flex items-center gap-2">
          <img src="/icon1.png" alt="logo" className="w-7 h-7 rounded" />
          <Link to="/landing" className="text-xl font-bold">GlobalTrotter</Link>
        </div>
        <div className="flex-none flex items-center gap-2">
          <NavItem to="/landing" label="Home" />
          <NavItem to="/plan" label="Plan" />
          <NavItem to="/trips" label="My Trips" />
          <NavItem to="/profile" label="My Profile" />
          <div className="divider divider-horizontal m-0"></div>
          <span className="hidden sm:block opacity-80 mr-1">{authUser?.fullName}</span>
          <div className="avatar">
            <div className="w-8 rounded-full ring ring-primary/40 ring-offset-base-100 ring-offset-2">
              <img alt="avatar" src={authUser?.profilePic || "/icon1.png"} />
            </div>
          </div>
          <button className="btn btn-outline btn-sm" onClick={() => logoutMutation()} disabled={isPending}>
            {isPending ? "Logging out..." : "Logout"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Navbar;


