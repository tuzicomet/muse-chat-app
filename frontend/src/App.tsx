import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import SettingsPage from "./pages/SettingsPage";
import ProfilePage from "./pages/ProfilePage";

import { Routes, Route } from "react-router-dom";
import { useAuthStore } from "./store/useAuthStore";
import { useEffect } from "react";

// Root component for the app, responsible for rendering layout, routing, and managing global app logic
const App = () => {
  // Get the current authenticated user and the checkAuth function from Zustand store
  const { authUser, checkAuth } = useAuthStore();

  // On component mount, call checkAuth to verify if user is logged in
  useEffect(() => {
    checkAuth()
  }, [checkAuth]);

  console.log("Current authenticated user:", authUser);

  return (
    <div>
      {/* Navigation bar shown on every page */}
      <Navbar />

      {/* Application routes for different pages */}
      <Routes>
        <Route path = "/" element = {<HomePage />} />
        <Route path = "/signup" element = {<SignUpPage />} />
        <Route path = "/login" element = {<LoginPage />} />
        <Route path = "/settings" element = {<SettingsPage />} />
        <Route path = "/profile" element = {<ProfilePage />} />
      </Routes>

    </div>
  );
};

export default App;
