import express from "express";

// Create instance of an Express app
const app = express();
// Set the port which the server will listen/run on
const PORT = 5000;

// Start the server and listen on the specified port
app.listen(PORT, () => {
  console.log(`The server is running on port ${PORT}`);
});