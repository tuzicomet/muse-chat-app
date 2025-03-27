import { Request, Response } from "express";
import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";

/**
 * Handles user signup.
 * Validates the provided user data, checks if the email is already taken, 
 * hashes the password, and creates a new user in the database.
 * 
 * @param req - The request object containing user data from the signup form.
 * @param res - The response object used to send back a response to the client.
 * @returns Sends a response with an error message if validation fails or user already exists.
 */
export const signup = async (req: Request, res: Response): Promise<any> => {
    // NOTE: f(): Promise<any> explicitly defines the function will return some kind of Promise, but keeps it unspecific
    res.send("Signup route")

    // Get the provided data from the signup form request
    const { name, email, password } = req.body;

    try {
        // Check that the provided password is valid
        if (password.length < 6) {
            // if password is not valid, send an error message with status 400 (Bad Request)
            return res.status(400).json({ message: "Password must be at least 6 characters long" });
        }

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
        })

        // Check if the new user instance was successfully created
        if (newUser) {
            // Generates a JWT token for the given userId, and set it as a cookie in the user's browser.
            generateToken(newUser._id, res);

            // save the new user to the database
            await newUser.save();

            res.status(201).json({
                _id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                profilePic: newUser.profilePic,
                aboutMe: newUser.aboutMe || "", // aboutMe should be empty for new users
            });

        } else { // If there was a problem with creating the new user instance
            res.status(400).json({ message: "Invalid user data" })
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
}

// Handle user login requests
export const login = (req: Request, res: Response) => {
    res.send("login route")
}

// Handle user logout requests
export const logout = (req: Request, res: Response) => {
    res.send("logout route")
}