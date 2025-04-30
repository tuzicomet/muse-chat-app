import { Request, Response } from "express";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

/**
 * Generates a JWT token for the given userId, and sets it as a cookie in their browser.
 * This token and cookie will be used for authenticating user requests.
 * 
 * @param {mongoose.Types.ObjectId} userId - The unique ObjectId of the user from the database.
 * @param {Response} res - The response object to send the cookie.
 * @returns {string} - The generated JWT token.
 */
export const generateToken = (userId: mongoose.Types.ObjectId, res: Response) => {

    // Check that JWT_SECRET_KEY is defined in .env before attempting to generate a token
    if (!process.env.JWT_SECRET_KEY) {
        throw new Error("JWT_SECRET_KEY is not set in environment variables.");
    };

    // Generate a JWT token for the given userId, and sign it with a secret key
    const token = jwt.sign({userId}, process.env.JWT_SECRET_KEY, {
        expiresIn: "7d" // set the token to expire in a number of days
    });

    // Set a cookie with the JWT token to authenticate the user
    // (The user must have a valid cookie in their browser for authentication)
    res.cookie("jwt", token, {
        maxAge: 7 * 24 * 60 * 60 * 1000, // equivalent to 7 days (in miliseconds)
        httpOnly: true, // prevents XSS (cross-site scripting) attacks
        secure: process.env.NODE_ENV != "development" // allow on HTTP if in development, otherwise HTTPS only
    });

    return token;
};