import { Request, Response } from "express";
import Chat from "../models/chat.model.js";
import Message from "../models/message.model.js";

/**
 * Creates a new chat with the specified members.
 * Can be created as either a group chat, or a direct message (DM) chat between two users.
 *
 * @param {Request} req - The request object, containing the authenticated user and body with chat details.
 * @param {Response} res - The response object used to send data back to the client.
 * @returns {any} - Sends the newly created chat with status 201 if successful, otherwise an error message.
 */
export const createChat = async (req: Request, res: Response): Promise<any> => {
    try {
        // Get chat details from the request body:
        // - memberIds: array of user IDs to include in the chat
        // - isGroup: boolean indicating if this is a group chat (true) or a DM (false)
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
            name: isGroup ? name : "", // If group chat, use the provided name, otherwise set to ""
            isGroup,
            members: allMembers,
        });

        // Save the chat to the database
        await newChat.save();

        // Replace the member IDs with full user details (excluding passwords)
        const populatedChat = await newChat.populate("members", "-password");

        // Send the chat back to the client in json with 201 Created status
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
 * Retrieves details of a specific chat by ID.
 *
 * @param {Request} req - The request object containing the authenticated user and chat ID in params.
 * @param {Response} res - The response object used to send chat data back to the client.
 * @returns {any} - Sends the chat if found and user is authorised, otherwise an error message.
 */
export const getChat = async (req: Request, res: Response): Promise<any> => {
    try {
        // Get the id of the chat to retrieve, as well as the id of the current user
        const chatId = req.params.chatId;
        const userId = req.user._id;

        // Retrieve the chat by id, and replace member IDs with full user details (excl. passwords)
        const chat = await Chat.findById(chatId).populate("members", "-password");

        // Check that a chat was found
        if (!chat) {
            return res.status(404).json({ message: "Chat not found." });
        }

        // Ensure the user is a member of the chat, otherwise they are not allowed to view it
        if (!chat.members.some((member: any) => member._id.toString() === userId.toString())) {
            return res.status(403).json({ message: "You are not authorised to view this chat." });
        }

        // Send the chat back to the client in json with 200 OK status
        res.status(200).json(chat);

    } catch (error: unknown) {
        if (error instanceof Error) {
            console.log("Error in getChat controller:", error.message);
        } else {
            console.log("Unexpected error in getChat controller:", error);
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
 * @returns {any} - Sends a list of chats with status 200 if successful, otherwise an error message.
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
        if (error instanceof Error) {
            console.log("Error in getChatsList controller", error.message);
        } else {
            console.log("Unexpected error in getChatsList controller:", error);
        }
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

/**
 * Adds new members to a group chat.
 * The authenticated user must be a member of the group chat to add new members.
 *
 * @param {Request} req - The request object containing the authenticated user, chatId param, and memberIds in body.
 * @param {Response} res - The response object used to send updated chat back to client.
 * @returns {any} - Sends back the updated chat in JSOn with a status 200 if successful, otherwise an error message.
 */
export const addMembersToGroupChat = async (req: Request, res: Response): Promise<any> => {
    try {
        const { chatId } = req.params; // ID of the chat to add to
        const { memberIds } = req.body; // the IDs of the users to add as members
        const userId = req.user._id; // ID of the currently authenticated user

        // Check that at least one member ID was passed in 
        if (!Array.isArray(memberIds) || memberIds.length === 0) {
            return res.status(400).json({ message: "You must include at least one user to add as a member." });
        }

        const chat = await Chat.findById(chatId);
        if (!chat) {
            return res.status(404).json({ message: "Chat not found." });
        }

        // Check that the chat is a group chat (i.e. is not a Direct Message (DM))
        if (!chat.isGroup) {
            return res.status(400).json({ message: "You can only add members to group chats." });
        }

        // Check that currently authenticated user is a member themselves
        if (!chat.members.includes(userId)) {
            return res.status(403).json({ message: "You are not a member of this chat." });
        }

        // Add the new members to the chat's members array
        const updatedChat = await Chat.findByIdAndUpdate(
            chatId,
            { $addToSet: { members: { $each: memberIds } } }, // add each memberId to the members array
            { new: true } // Returns the updated document instead of the original one
        ).populate("members", "-password"); // populate the members field with user details (excl. passwords)

        // Send the updated chat back to the client in json, with 200 OK status
        res.status(200).json(updatedChat);

    } catch (error: unknown) {
        if (error instanceof Error) {
            console.log("Error in addMembersToGroupChat controller:", error.message);
        } else {
            console.log("Unexpected error in addMembersToGroupChat controller:", error);
        }
        res.status(500).json({ message: "Internal Server Error" });
    }
};

/**
 * Allows a user to leave a group chat they are a member of.
 * Only works for group chats as Direct messages (DMs) cannot be left.
 *
 * @param {Request} req - The request object containing the user and chat ID.
 * @param {Response} res - The response object used to send back status.
 * @returns {any} - Sends status 200 with a message if successful, otherwise an error message.
 */
export const leaveGroupChat = async (req: Request, res: Response): Promise<any> => {
    try {
        const userId = req.user._id;
        const { chatId } = req.params;

        // First, find the chat
        const chat = await Chat.findById(chatId);

        if (!chat) {
            return res.status(404).json({ message: "Chat not found." });
        }

        if (!chat.isGroup) {
            return res.status(400).json({ message: "Cannot leave a direct message chat." });
        }

        // Make sure the user is in the chat before removing them
        if (!chat.members.includes(userId)) {
            return res.status(403).json({ message: "You are not a member of this chat." });
        }

        // Remove the user from the members array
        chat.members = chat.members.filter(
            // Go through each member ID and remove any members with the matching user ID
            // To compare them, we also need to convert both from mongoose ObjectIds to strings
            // (even though they refer to the same user, they are separate objects and would be counted as such)
            (memberId) => memberId.toString() !== userId.toString()
        );
        await chat.save();

        res.status(200).json({ message: "Successfully left the group chat." });

    } catch (error: unknown) {
        if (error instanceof Error) {
            console.log("Error in leaveGroupChat controller:", error.message);
        } else {
            console.log("Unexpected error in leaveGroupChat controller:", error);
        }
        res.status(500).json({ message: "Internal Server Error" });
    }
};

/**
 * Renames a group chat.
 *
 * @param {Request} req - The request object with chatId param and new name in body.
 * @param {Response} res - The response object used to return updated chat or errors.
 * @returns {any} - Sends back the chat in JSON with a status 200 if successful, otherwise an error message.
 */
export const renameGroupChat = async (req: Request, res: Response): Promise<any> => {
    try {
        const { chatId } = req.params;
        const { name } = req.body;
        const userId = req.user._id;

        if (!name || name.trim().length === 0) {
            return res.status(400).json({ message: "Name cannot be empty." });
        }

        const chat = await Chat.findById(chatId);
        if (!chat) {
            return res.status(404).json({ message: "Chat not found." });
        }

        if (!chat.isGroup) {
            return res.status(400).json({ message: "Only group chats can be renamed." });
        }

        if (!chat.members.includes(userId)) {
            return res.status(403).json({ message: "You are not a member of this chat." });
        }

        chat.name = name;
        await chat.save();
        const populatedChat = await chat.populate("members", "-password");

        res.status(200).json(populatedChat);

    } catch (error: unknown) {
        if (error instanceof Error) {
            console.log("Error in renameGroupChat controller:", error.message);
        } else {
            console.log("Unexpected error in renameGroupChat controller:", error);
        }
        res.status(500).json({ message: "Internal Server Error" });
    }
};