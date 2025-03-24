import express from "express";
import dotenv from "dotenv";
// NOTE: although the actual file is .ts, it'll compile to .js, which we must use
import { connectDB } from "./lib/db.js"
import authRoutes from "./routes/auth.route.js";

// Load environment variables from the .env file
dotenv.config();

// Create instance of an Express app
const app = express();
// Get the port which the server will run on from the .env file, default to 5000 if not set
const PORT = process.env.PORT || 5000;

// Any request to /api/auth/... will be handled by authRoutes
app.use("/api/auth", authRoutes);

// Start the server and listen on the specified port
app.listen(PORT, () => {
  // Reminder: to use template strings (${}), you must use `` instead of ''
  console.log(`The server is running on port ${PORT}`);

  // Connect to the MongoDB database
  connectDB();
});