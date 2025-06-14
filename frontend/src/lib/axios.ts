import axios from "axios";

// Create an axios instance that we can use throughout the application
// this will be used to make HTTP requests to the backend server
export const axiosInstance = axios.create({
    baseURL: "http://localhost:5000/api", // Backend server port
    withCredentials: true, // include the cookies in every request
});