import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";

// NOTE: when importing .ts files, they'll compile to .js, so we must use the .js extension
import { connectDB } from "./lib/db.js";
import authRoutes from "./routes/auth.route.js";
import chatRoutes from "./routes/chat.route.js";
import messageRoutes from "./routes/message.route.js";

// Load environment variables from the .env file
dotenv.config();

// Create instance of an Express app
const app = express();
// Get the port which the server will run on from the .env file, default to 5000 if not set
const PORT = process.env.PORT || 5000;

// Middleware to parse incoming JSON requests, and makes the data available in req.body
app.use(express.json());
// Middleware to parse cookies, so that we can extract their values
app.use(cookieParser());
// Middleware to enable Cross-Origin Resource Sharing (CORS)
app.use(cors({
  // Allow requests from http://localhost:3000 (frontend server)
  origin: "http://localhost:3000",
  // allow cookies and auth headers to be sent with requests
  credentials: true
}));

// Any request to /api/auth/... will be handled by authRoutes
app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes)

// Start the server and listen on the specified port
app.listen(PORT, () => {
  // Reminder: to use template strings (${}), you must use `` instead of ''
  console.log(`The server is running on port ${PORT}`);

  // Connect to the MongoDB database
  connectDB();
});