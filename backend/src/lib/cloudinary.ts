/**
 * Configures and exports the Cloudinary service for image uploads.
 * 
 * This file sets up Cloudinary using environment variables for secure access.
 * The configured instance can be imported and used throughout the application
 * to upload, manage, or delete images.
 */

import { v2 as cloudinary } from "cloudinary"; // Cloudinary v2 SDK for interacting with Cloudinary services
import { config } from 'dotenv'; // used to load environment variables from a .env file

// Load environment variables into process.env so we can access them
config();

// Configure the Cloudinary SDK using credentials from .env
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Export the configured Cloudinary instance for use in other parts of the app
export default cloudinary;