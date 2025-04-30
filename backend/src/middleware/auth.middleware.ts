import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../models/user.model.js";

/**
 * Middleware function to protect routes by verifying the user's authentication before proceeding.
 * Does this by checking the presence and validity of their JWT token.
 * If the token is valid, it attaches the authenticated user to the request object and proceeds to the next middleware.
 * If the token is missing or invalid, it returns an unauthorized error response.
 * 
 * @param {Request} req - The request object containing data from the form and the JWT token in the cookies.
 * @param {Response} res - The response object used to send back a response to the client.
 * @param {NextFunction} next - The function to proceed to the next middleware or route handler if authentication is successful.
 * @returns {void} - Sends a response to the client, either proceeding to the next middleware or returning an error response.
 */
export const protectRoute = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
        // Attempt to find a cookie named "jwt" from the request
        const token = req.cookies.jwt;

        // If no jwt token was found, return an error
        if (!token) {
            return res.status(401).json({ message: "Unauthorised - No Token Provided" });
        }

        // Verify the JWT token using the same secret key it was created with, and decode the payload
        // If the token is valid, 'decoded' will contain the payload (e.g. the userId)
        // NOTE: in TS, environment variables have type string | undefined by default, so we need 'as string'
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY as string) as { userId: string };

        // If decodedToken does not exist, then the token is invalid
        if (!decodedToken) {
            return res.status(401).json({ message: "Unauthorised - Invalid Token" });
        }

        // Get the user in the database with the userId from the decoded token
        // except for their password, for security
        const user = await User.findById(decodedToken.userId).select("password");

        // In the case that a user was not found with the userId from the decoded token, send an error
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // If all checks are passed, that means the user is authenticated
        // Attach the authenticated user object to the request so we can access them in the next function
        req.user = user;

        // Proceed to the next function
        next()

    } catch (error: unknown) {
        // Type guard to check if the error is an instance of Error
        if (error instanceof Error) {
            console.log("Error in protectRoute middleware", error.message);
        } else {
            console.log("Unexpected error in protectRoute middleware", error);
        }
        res.status(500).json({ message: "Internal Server Error" });
    };
}