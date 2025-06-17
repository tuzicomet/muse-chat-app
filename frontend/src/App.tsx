import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import SettingsPage from "./pages/SettingsPage";
import ProfilePage from "./pages/ProfilePage";

import { Routes, Route } from "react-router-dom";

// Root component for the app, responsible for rendering layout, routing, and managing global app logic
const App = () => {
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
