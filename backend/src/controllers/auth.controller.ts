import { Request, Response } from "express";
import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";

/**
 * Handles user signup.
 * Validates the provided user data, checks if the email is already taken, 
 * hashes the password, and creates a new user in the database.
 * 
 * @param {Request} req - The request object containing data from the form.
 * @param {Response} res - The response object used to send back a response to the client.
 * @returns {void} - Sends a 201 Created status if successful, otherwise sends a response with an error message.
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
        };

        // Check that the provided password is valid
        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters long" });
        };

        // Check to see if a user with the provided email already exists in the database
        const user = await User.findOne({email});
        // If we found a user, send an error message with status 400 (Bad Request)
        // NOTE: (user) is true if the user variable is not null or undefined, false otherwise.
        if (user) return res.status(400).json({ message: "Email already exists" });

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
        };

    } catch (error: unknown) { // catch block defaults to unknown for the error type in TypeScript
        // Type guard to check if the error is an instance of Error
        if (error instanceof Error) {
            console.log("Error in signup controller", error.message);
        } else {
            console.log("Unexpected error in signup controller", error);
        }
        res.status(500).json({ message: "Internal Server Error" });
    };
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
 * @returns {void} - Sends a 200 OK status if successful, otherwise sends a response with an error message.
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
        };

        // Check if the provided password corresponds with the user's hashed password in the db
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        // If the password verification fails, send an error message
        if (!isPasswordCorrect) {
            // NOTE: want the email and password checks to have the same error message
            // so that attackers cannot tell which one failed
            return res.status(400).json({ message: "Invalid credentials" });
        };

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
        // Type guard to check if the error is an instance of Error
        if (error instanceof Error) {
            console.log("Error in login controller", error.message);
        } else {
            console.log("Unexpected error in login controller", error);
        }
        res.status(500).json({ message: "Internal Server Error" });
    };
};

/**
 * Handles user logout requests.
 * Logs out the user by clearing the jwt authentication cookie
 * 
 * @param {Request} req - The request object containing data from the form.
 * @param {Response} res - The response object used to send back a response to the client.
 * @returns {void} - Sends a 200 OK status if successful, otherwise sends a response with an error message.
 */
export const logout = async (req: Request, res: Response): Promise<any> => {
    try {
        // To log out the user, all we need to do is clear their jwt authentication cookie
        // (will also work if the user is not already logged in, but thats fine)

        // Update the jwt cookie to empty string value, with maxAge: 0 so it expires immediately
        res.cookie("jwt", "", { maxAge:0 });

        res.status(200).json({ message: "Logged out successfully" });

    } catch (error: unknown) {
        // Type guard to check if the error is an instance of Error
        if (error instanceof Error) {
            console.log("Error in logout controller", error.message);
        } else {
            console.log("Unexpected error in logout controller", error);
        }
        res.status(500).json({ message: "Internal Server Error" });
    };
};

export const updateProfile = async (req: Request, res: Response): Promise<any> => {
    try {
        // User must be able to update their name, password, profile picture, about description
    } catch (error: unknown) {
        // Type guard to check if the error is an instance of Error
        if (error instanceof Error) {
            console.log("Error in updateProfile controller", error.message);
        } else {
            console.log("Unexpected error in updateProfile controller", error);
        }
        res.status(500).json({ message: "Internal Server Error" });
    };
};