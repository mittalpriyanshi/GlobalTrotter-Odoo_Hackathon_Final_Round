import { Link } from "react-router";
import useAuthUser from "../hooks/useAuthUser";
import Navbar from "../components/Navbar";

const Card = ({ title, subtitle }) => (
  <div className="card bg-base-100 border border-primary/20 shadow-sm h-44">
    <div className="card-body p-4">
      <h3 className="font-semibold line-clamp-1">{title}</h3>
      {subtitle ? <p className="opacity-70 text-sm line-clamp-2">{subtitle}</p> : null}
    </div>
  </div>
);

const LandingPage = () => {
  const { authUser } = useAuthUser();
  const fullName = authUser?.fullName || "Traveler";
  const avatar = authUser?.profilePic || "/icon1.png";
  return (
    <div className="min-h-screen" data-theme="retro">
      <Navbar />
      <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Banner */}
        <div className="w-full h-56 sm:h-72 rounded-xl border border-primary/20 bg-base-200 flex items-center justify-center">
          <span className="text-3xl sm:text-4xl font-pacifico opacity-80">Banner Image</span>
        </div>

        {/* Search + filters */}
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_auto] gap-3">
          <input className="input input-bordered w-full" placeholder="Search bar ..." />
          <select className="select select-bordered w-full sm:w-44">
            <option>Group by</option>
            <option>Region</option>
            <option>Month</option>
          </select>
          <select className="select select-bordered w-full sm:w-44">
            <option>Sort by</option>
            <option>Popular</option>
            <option>Price</option>
          </select>
        </div>

        {/* Top Regional Selections */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Top Regional Selections</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Card key={`top-${i}`} title={`Destination ${i + 1}`} />
            ))}
          </div>
        </section>

        {/* Previous Trips */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Previous Trips</h2>
            <div className="flex gap-2">
              <Link to="/plan" className="btn btn-primary btn-sm">+ Plan a trip</Link>
              <Link to="/itinerary" className="btn btn-outline btn-sm">Build itinerary</Link>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={`prev-${i}`} className="card bg-base-100 border border-primary/20 h-64">
                <div className="card-body p-4">
                  <h3 className="font-semibold">Trip {i + 1}</h3>
                  <p className="opacity-70 text-sm">Short highlight of your previous trip.</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
      </div>
    </div>
  );
};

export default LandingPage;


