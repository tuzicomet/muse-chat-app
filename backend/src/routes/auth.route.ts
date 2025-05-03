import express from "express";
import { signup, login, logout, updateProfile } from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

// Express router instance
const router = express.Router();

// Signup page route
router.post("/signup", signup);

// Login page route
router.post("/login", login);

// Logout route
router.post("/logout", logout);

// All routes below require authentication via the protectRoute middleware.

// Route for updating profile
router.put("/update-profile", protectRoute, updateProfile);

// Export router to be usable in other files
export default router;