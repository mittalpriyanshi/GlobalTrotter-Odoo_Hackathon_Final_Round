import { Navigate, Route, Routes, useLocation } from "react-router-dom";

import SignUpPage from "./pages/SignUpPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import OnboardingPage from "./pages/OnboardingPage.jsx";
import LandingPage from "./pages/LandingPage.jsx";
import PlanPage from "./pages/PlanPage.jsx";
import ItineraryBuilder from "./pages/ItineraryBuilder.jsx";
import ItineraryBuilderEnhanced from "./pages/ItineraryBuilderEnhanced.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import TripsPage from "./pages/TripsPage.jsx";
import ExpensePage from "./pages/ExpensePage.jsx";
import JournalPage from "./pages/JournalPage.jsx";
import CalendarPage from "./pages/CalendarPage.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import CommunityPage from "./pages/CommunityPage.jsx";
import PublicItineraryPage from "./pages/PublicItineraryPage.jsx";
import ActivitySearchPage from "./pages/ActivitySearchPage.jsx";
import CitySearchPage from "./pages/CitySearchPage.jsx";
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
        <Route path="/" element={<LandingPage />} />
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
        
        <Route path="/itinerary-enhanced" element={<ItineraryBuilderEnhanced />} />

        <Route
          path="/profile"
          element={
            isAuthenticated ? (isOnboarded ? <ProfilePage /> : <Navigate to="/onboarding" />) : <Navigate to="/login" />
          }
        />

        <Route
          path="/trips"
          element={
            isAuthenticated ? (isOnboarded ? <TripsPage /> : <Navigate to="/onboarding" />) : <Navigate to="/login" />
          }
        />

        <Route
          path="/expenses"
          element={
            isAuthenticated ? (isOnboarded ? <ExpensePage /> : <Navigate to="/onboarding" />) : <Navigate to="/login" />
          }
        />

        <Route
          path="/journal"
          element={
            isAuthenticated ? (isOnboarded ? <JournalPage /> : <Navigate to="/onboarding" />) : <Navigate to="/login" />
          }
        />

        <Route
          path="/calendar"
          element={
            isAuthenticated ? (isOnboarded ? <CalendarPage /> : <Navigate to="/onboarding" />) : <Navigate to="/login" />
          }
        />

        <Route
          path="/community"
          element={
            isAuthenticated ? (isOnboarded ? <CommunityPage /> : <Navigate to="/onboarding" />) : <Navigate to="/login" />
          }
        />

        <Route
          path="/admin"
          element={
            isAuthenticated ? (isOnboarded ? <AdminDashboard /> : <Navigate to="/onboarding" />) : <Navigate to="/login" />
          }
        />

        <Route
          path="/activities"
          element={
            isAuthenticated ? (isOnboarded ? <ActivitySearchPage /> : <Navigate to="/onboarding" />) : <Navigate to="/login" />
          }
        />

        <Route
          path="/destinations"
          element={
            isAuthenticated ? (isOnboarded ? <CitySearchPage /> : <Navigate to="/onboarding" />) : <Navigate to="/login" />
          }
        />

        <Route path="/public/:itineraryId" element={<PublicItineraryPage />} />

      </Routes>

      <Toaster />
    </div>
  );
};
export default App;
