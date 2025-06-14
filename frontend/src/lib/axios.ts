import axios from "axios";

// Create an axios instance that we can use throughout the application
// this will be used to make HTTP requests to the backend server
export const axiosInstance = axios.create({
    // Use the backend server port as the base URL so we don't have to repeat it
    baseURL: "http://localhost:5000/api",
    // include the cookies in every request
    withCredentials: true,
});