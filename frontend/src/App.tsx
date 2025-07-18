import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import SettingsPage from "./pages/SettingsPage";
import ProfilePage from "./pages/ProfilePage";

import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./store/useAuthStore";
import { useEffect } from "react";

import { Loader } from "lucide-react";

// Root component for the app, responsible for rendering layout, routing, and managing global app logic
const App = () => {
  // Get the current authenticated user and the checkAuth function from Zustand store
  const { authUser, checkAuth, isCheckingAuth } = useAuthStore();

  // On component mount, call checkAuth to verify if user is logged in
  useEffect(() => {
    checkAuth()
  }, [checkAuth]);

  console.log("Current authenticated user:", authUser);

  // If still checking authentication and no user is logged in yet
  // show a loading spinner in the centre of the screen instead of the main app UI
  if (isCheckingAuth && !authUser) 
    return (
      <div className = "flex items-center justify-center h-screen">
        <Loader className = "size-10 animate-spin"/>
      </div>
    );

  return (
    <div>
      {/* Navigation bar shown on every page */}
      <Navbar />

      {/* Application routes for different pages */}
      <Routes>
        <Route path = "/" element = {authUser ? <HomePage /> : <Navigate to="/login"/>} />
        <Route path = "/signup" element = {!authUser ? <SignUpPage /> : <Navigate to="/"/>} />
        <Route path = "/login" element = {!authUser ? <LoginPage /> : <Navigate to="/"/>} />
        <Route path = "/settings" element = {<SettingsPage />} />
        <Route path = "/profile" element = {authUser ? <ProfilePage /> : <Navigate to="/login"/>} />
      </Routes>

    </div>
  );
};

export default App;
