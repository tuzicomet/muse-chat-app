import express from "express";
import { signup, login, logout } from "../controllers/auth.controller.js"

// Express router instance
const router = express.Router();

// Signup page route
router.post("/signup", signup);

// Login page route
router.post("/login", login);

// Logout route
router.post("/logout", logout);

// Export router to be usable in other files
export default router;