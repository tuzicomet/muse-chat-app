import { Request, Response } from "express";
import Chat from "../models/chat.model.js";
import Message from "../models/message.model.js";

/**
 * Creates a new chat with the specified members.
 * Can be created as either a group chat, or direct messages between two users.
 *
 * @param {Request} req - The request object, containing the authenticated user and body with chat details.
 * @param {Response} res - The response object used to send data back to the client.
 * @returns {void} - Sends the newly created chat with status 201 if successful, otherwise an error message.
 */
export const createChat = async (req: Request, res: Response): Promise<any> => {
    try {
        // Get chat details from the request body:
        // - memberIds: array of user IDs to include in the chat
        // - isGroup: boolean indicating if this is a group chat
        // - name: optional name for the chat (used only for group chats)
        const { memberIds, isGroup, name } = req.body;
        // Also get the id of the currently logged in user
        const userId = req.user._id;

        // Add current user to the members array if not already included
        const allMembers = Array.from(new Set([...memberIds, userId]));

        // Validate members and name depending on chat type
        if (isGroup) {
            if (!name || name.trim().length === 0) {
                return res.status(400).json({ message: "Group chats must have a name." });
            }
            if (allMembers.length < 3) {
                // 3 = at least two others + logged in user
                return res.status(400).json({ message: "Group chats must have at least 3 members." });
            }
        } else {
            // Direct message must have exactly 2 members, and cannot have a name
            if (allMembers.length !== 2) {
                return res.status(400).json({ message: "Direct messages must have exactly 2 members." });
            }
            if (name && name.trim().length > 0) {
                return res.status(400).json({ message: "Direct messages cannot have a name." });
            }
        }

        // Create a new chat document with the given information
        const newChat = new Chat({
            name: isGroup ? name : "", // Optional for DM
            isGroup,
            members: allMembers,
        });

        // Save the chat to the database
        await newChat.save();

        // Replace the member IDs with full user details (excluding passwords)
        const populatedChat = await newChat.populate("members", "-password");

        // send the populated chat back to the client in json with 201 Created status
        res.status(201).json(populatedChat);

    } catch (error: unknown) {
        // Type guard to check if the error is an instance of Error
        if (error instanceof Error) {
            console.log("Error in createChat controller:", error.message);
        } else {
            console.log("Unexpected error in createChat controller:", error);
        }
        res.status(500).json({ message: "Internal Server Error" });
    }
};

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