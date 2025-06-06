import { Request, Response } from "express";
import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import cloudinary from "../lib/cloudinary.js";
import mongoose from "mongoose";

/**
 * Handles user signup.
 * Validates the provided user data, checks if the email is already taken, 
 * hashes the password, and creates a new user in the database.
 * 
 * @param {Request} req - The request object containing data from the form.
 * @param {Response} res - The response object used to send back a response to the client.
 * @returns {any} - Sends a 201 Created status if successful, otherwise sends a response with an error message.
 */
export const signup = async (req: Request, res: Response): Promise<any> => {
    // NOTE: f(): Promise<any> explicitly defines the function will return some kind of Promise, but keeps it unspecific

    // NOTE: this doesnt just print in terminal, it sends a response to client and ends the req-res cycle (aka it wont continue past this)
    // res.send("Signup route")

    // Get the provided data from the signup form request
    const { name, email, password } = req.body;

    try {
        // Check that all required fields are provided in the request
        if (!name || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Check that the provided password is valid
        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters long" });
        }

        // Check to see if a user with the provided email already exists in the database
        const user = await User.findOne({email});
        // If we found a user, send an error message with status 400 (Bad Request)
        // NOTE: (user) is true if the user variable is not null or undefined, false otherwise.
        if (user) return res.status(400).json({ message: "Email already exists" })

        // Now hash the password for security (so that we are not storing the raw password anywhere)

        // Generate a salt, a random value added to the password before hashing 
        // to ensure identical passwords get unique hashes.
        const salt = await bcrypt.genSalt(10); // salt using 10 rounds is conventional
        // Generate a hashed password using the provided password and our salt
        const hashedPassword = await bcrypt.hash(password, salt);
        
        // Create a new user instance with the provided data
        const newUser = new User({
            name: name,
            email: email,
            password: hashedPassword, // use the hashedPassword instead of the provided password
            // remaining fields will be generated automatically
        });

        // Check if the new user instance was successfully created
        if (newUser) {
            // Generates a JWT token for the given userId, and set it as a cookie in the user's browser.
            generateToken(newUser._id, res);

            // Save the new user to the database
            await newUser.save();

            // Send the user data back to the client in json, with 201 Created status
            res.status(201).json({
                _id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                profilePic: newUser.profilePic,
                aboutMe: newUser.aboutMe || "", // aboutMe should be empty for new users
            });

        } else { // If there was a problem with creating the new user instance
            res.status(400).json({ message: "Invalid user data" });
        }

    } catch (error: unknown) { // catch block defaults to unknown for the error type in TypeScript
        // Type guard to check if the error is an instance of Error
        if (error instanceof Error) {
            console.log("Error in signup controller", error.message);
        } else {
            console.log("Unexpected error in signup controller", error);
        }
        res.status(500).json({ message: "Internal Server Error" });
    }
};

/**
 * Handles user login requests.
 * Validates the user's login request by checking if there exists a user with the 
 * given email, and then checks if the given password matches with the existing user's
 * hashed password.
 * If successful, generates an authentication token for the user and sets it as a cookie,
 * so that the user will stay logged in.
 * 
 * @param {Request} req - The request object containing data from the form.
 * @param {Response} res - The response object used to send back a response to the client.
 * @returns {any} - Sends a 200 OK status if successful, otherwise sends a response with an error message.
 */
export const login = async (req: Request, res: Response): Promise<any> => {
    // Get the provided data from the signup form request
    const { name, email, password } = req.body;

    try {
        // Check if there exists a user in the database with the provided email
        const user = await User.findOne({email});
        // If no user exists with the provided email, send an error message
        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // Check if the provided password corresponds with the user's hashed password in the db
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        // If the password verification fails, send an error message
        if (!isPasswordCorrect) {
            // NOTE: want the email and password checks to have the same error message
            // so that attackers cannot tell which one failed
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // If validation passed, generate an auth token for the user and set it as a cookie
        generateToken(user._id, res);

        // Send the user data back to the client in json, with 200 OK status
        res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            profilePic: user.profilePic,
            aboutMe: user.aboutMe,
        });

    } catch (error: unknown) {
        if (error instanceof Error) {
            console.log("Error in login controller", error.message);
        } else {
            console.log("Unexpected error in login controller", error);
        }
        res.status(500).json({ message: "Internal Server Error" });
    }
};

/**
 * Handles user logout requests.
 * Logs out the user by clearing the jwt authentication cookie
 * 
 * @param {Request} req - The request object containing data from the form.
 * @param {Response} res - The response object used to send back a response to the client.
 * @returns {any} - Sends a 200 OK status if successful, otherwise sends a response with an error message.
 */
export const logout = async (req: Request, res: Response): Promise<any> => {
    try {
        // To log out the user, all we need to do is clear their jwt authentication cookie
        // (will also work if the user is not already logged in, but thats fine)

        // Update the jwt cookie to empty string value, with maxAge: 0 so it expires immediately
        res.cookie("jwt", "", { maxAge:0 });

        res.status(200).json({ message: "Logged out successfully" });

    } catch (error: unknown) {
        if (error instanceof Error) {
            console.log("Error in logout controller", error.message);
        } else {
            console.log("Unexpected error in logout controller", error);
        }
        res.status(500).json({ message: "Internal Server Error" });
    }
};

/**
 * Controller function to update the authenticated user's profile details.
 * 
 * Allows updating the authenticated user's name, profilePic, and/or aboutMe fields.
 * At least one of these fields must be provided to update.
 * 
 * Profile pictures are updated by retrieving the uploaded image,
 * storing it using Cloudinary, and updating the user's `profilePic` URL in the database.
 * 
 * @param {Request} req - The request object containing updated fields and authenticated user info.
 * @param {Response} res - The response object used to return the updated user or an error.
 * @returns {Promise<any>} - Sends the updated user in JSON if successful, otherwise an error message.
 */
export const updateProfile = async (req: Request, res: Response): Promise<any> => {
    try {
        // Get the updated fields from the request body
        const { name, aboutMe, profilePic } = req.body;
        // the current user should be available from protectRoute middleware as req.user
        const userId = req.user._id;

        // Create an object to hold the fields to update
        const updateData: Record<string, any> = {};

        // Update name if provided and non-empty string
        if (name && typeof name === 'string' && name.trim().length > 0) {
            updateData.name = name.trim(); // trim to remove leading and trailing whitespace
        }

        // Update aboutMe if provided
        // Empty string is allowed, so that users can clear their aboutMe section.
        if (typeof aboutMe === 'string') {
            updateData.aboutMe = aboutMe;
        }

        // If profilePic is provided, upload it to Cloudinary and update the URL
        // (Using cloudinary as a bucket for storing images)
        if (profilePic && typeof profilePic === 'string') {
            // Upload the new profile pic to the cloudinary bucket and get the api response
            const uploadResponse = await cloudinary.uploader.upload(profilePic);
            updateData.profilePic = uploadResponse.secure_url;
        }

        // If no valid fields provided to update, return an error 400 (Bad Request)
        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ message: "No valid profile fields provided to update." });
        }

        // Update the user document with new data, and get back the updated user (excl. password)
        const updatedUser = await User.findByIdAndUpdate(
            userId, // ID of the user to update
            updateData, // The object containing the fields to update
            { new: true } // so the user returned is from after the update is applied rather than before
        ).select("-password"); // Do not select the password for security

        // If successful, send a 200 OK status with the updated user in json
        res.status(200).json(updatedUser);

    } catch (error: unknown) {
        if (error instanceof Error) {
            console.log("Error in updateProfile controller", error.message);
        } else {
            console.log("Unexpected error in updateProfile controller", error);
        }
        res.status(500).json({ message: "Internal Server Error" });
    }
};

/**
 * Controller function to check if the user is currently authenticated.
 * 
 * This should be used primarily on frontend app load or refresh to verify the user's session.
 * 
 * This function should be used together with the `protectRoute` middleware.
 * `protectRoute` performs the actual authentication by verifying the JWT and attaching
 * the authenticated user to `req.user`. If the request reaches this function, it means
 * authentication has already succeeded.
 * 
 * `checkAuth` itself does not handle authentication — it simply responds with the
 * authenticated user's data, confirming that the session is still valid.
 * 
 * @param {Request} req - The request object, which should have the authenticated user attached by the protectRoute middleware.
 * @param {Response} res - The response object used to return user data or an error.
 * @returns {Promise<any>} - Sends a JSON response with user data if authenticated, or an error response if not.
 */
export const checkAuth = async (req: Request, res: Response): Promise<any> => {
    try {
        // If this runs, protectRoute already verified the token and attached the user to req.user
        res.status(200).json(req.user);
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.log("Error in checkAuth controller", error.message);
        } else {
            console.log("Unexpected error in checkAuth controller", error);
        }
        res.status(500).json({ message: "Internal Server Error" });
    }
};