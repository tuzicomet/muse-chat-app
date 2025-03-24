import mongoose from "mongoose"; // Package for interacting with our MongoDB database

// Method to connect to the MongoDB database
export const connectDB = async () => {
    try {
        // Check that MONGODB_URI is defined in .env before attempting to connect
        if (!process.env.MONGODB_URI) {
            throw new Error("MONGODB_URI is not set in environment variables.");
        }

        // Attempt to connect to MongoDB
        const conn = await mongoose.connect(process.env.MONGODB_URI)
        // If connection was successful, log the database host
        console.log(`MongoDB connected: ${conn.connection.host}`)
    } catch (error) {
        // If there was an error with connecting to MongoDB
        console.log('MongoDB connection error')
    }
}