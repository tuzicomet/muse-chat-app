import { Request, Response } from "express";
import Chat from "../models/chat.model.js";
import Message from "../models/message.model.js";

/**
 * Retrieves a list of all chats the logged-in user is a member of.
 *
 * This function is used to populate the chat sidebar so that the logged-in user
 * can see recent chats.
 *
 * @param {Request} req - The request object, containing the authenticated user info.
 * @param {Response} res - The response object used to send data back to the client.
 * @returns {void} - Sends a list of chats with status 200 if successful, otherwise an error message.
 */
export const getChatsList = async (req: Request, res: Response): Promise<any> => {
    try {
        // Get the logged-in user's ID from the authenticated request
        const userId = req.user._id;

        // Find all chats where the members array contains userId
        const chats = await Chat.find({ members: userId })
            .populate("members", "-password") // Replace user IDs in members array with full user details (excl. passwords)
            .sort({ updatedAt: -1 }); // sort chats by last updated first

        // Send the list of chats back to the client in json, with 200 OK status
        return res.status(200).json(chats);

    } catch (error: unknown) {
        // Type guard to check if the error is an instance of Error
        if (error instanceof Error) {
            console.log("Error in getChatsList controller", error.message);
        } else {
            console.log("Unexpected error in getChatsList controller:", error);
        }
        return res.status(500).json({ message: "Internal Server Error" });
    }
};