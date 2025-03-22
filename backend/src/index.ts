import express from "express";
import authRoutes from "./routes/auth.route.js";

// Create instance of an Express app
const app = express();
// Set the port which the server will listen/run on
const PORT = 5000;

// Any request to /api/auth/... will be handled by authRoutes
app.use("/api/auth", authRoutes);

// Start the server and listen on the specified port
app.listen(PORT, () => {
  console.log(`The server is running on port ${PORT}`);
});