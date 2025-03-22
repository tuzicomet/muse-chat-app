import express from "express";

// Express router instance
const router = express.Router();

// Signup page route
router.get("/signup", (req,res) => {
    res.send("signup route")
})

// Login page route
router.get("/login", (req,res) => {
    res.send("login route")
})

// Logout route
router.get("/logout", (req,res) => {
    res.send("logout route")
})

// Export router to be usable in other files
export default router;