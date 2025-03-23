import express from "express";
import { signup, login, logout } from "../controllers/auth.controller.js"

// Express router instance
const router = express.Router();

// Signup page route
router.get("/signup", signup);

// Login page route
router.get("/login", login);

// Logout route
router.get("/logout", logout);

// Export router to be usable in other files
export default router;