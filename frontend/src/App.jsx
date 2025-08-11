import { Navigate, Route, Routes, useLocation } from "react-router";

import SignUpPage from "./pages/SignUpPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import OnboardingPage from "./pages/OnboardingPage.jsx";
import LandingPage from "./pages/LandingPage.jsx";
import PlanPage from "./pages/PlanPage.jsx";
import ItineraryBuilder from "./pages/ItineraryBuilder.jsx";
import Navbar from "./components/Navbar.jsx";

import { Toaster } from "react-hot-toast";

import PageLoader from "./components/PageLoader.jsx";
import useAuthUser from "./hooks/useAuthUser.js";


const App = () => {
  const { isLoading, authUser } = useAuthUser();
  const location = useLocation();


  const isAuthenticated = Boolean(authUser);
  const isOnboarded = authUser?.isOnboarded;

  console.log("App render - authUser:", authUser);
  console.log("App render - isAuthenticated:", isAuthenticated);
  console.log("App render - isOnboarded:", isOnboarded);

  if (isLoading) return <PageLoader />;

  return (
    <div className="h-screen" data-theme="retro">
      <Routes>
        <Route path="/" element={isAuthenticated && isOnboarded ? <LandingPage /> : <Navigate to="/login" />} />
        <Route
          path="/signup"
          element={
            !isAuthenticated ? <SignUpPage /> : <Navigate to={isOnboarded ? "/" : "/onboarding"} />
          }
        />
        <Route path="/login" element={!isAuthenticated ? <LoginPage /> : <Navigate to="/" />} />

        <Route path="/onboarding" element={<OnboardingPage />} />

        <Route
          path="/landing"
          element={
            isAuthenticated ? (isOnboarded ? <LandingPage /> : <Navigate to="/onboarding" />) : <Navigate to="/login" />
          }
        />

        <Route
          path="/plan"
          element={
            isAuthenticated ? (isOnboarded ? <PlanPage /> : <Navigate to="/onboarding" />) : <Navigate to="/login" />
          }
        />

        <Route path="/itinerary" element={<ItineraryBuilder />} />

      </Routes>

      <Toaster />
    </div>
  );
};
export default App;
