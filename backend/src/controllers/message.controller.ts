import { Request, Response } from "express";
import Message from "../models/message.model.js";
import cloudinary from "../lib/cloudinary.js";

/**
 * Retrieves all messages belonging to a specific chat.
 * 
 * This is used to populate the message thread when a user clicks into a chat.
 * 
 * @param {Request} req - The request object, containing the chat ID in params.
 * @param {Response} res - The response object used to send back the list of messages.
 * @returns {any} - Sends a list of messages with status 200 if successful, otherwise an error message.
 */
export const getChatMessages = async (req: Request, res: Response): Promise<any> => {
    try {
        // Extract the chat ID from the URL params
        const { chatId } = req.params;

        // Find all messages that belong to the chat with the given chatId
        const messages = await Message.find({ chatId });

        // Send the list of messages back to the client in JSON, with 200 OK status
        return res.status(200).json(messages);

    } catch (error: unknown) {
        // Type guard to check if the error is an instance of Error
        if (error instanceof Error) {
            console.log("Error in getChatMessages controller", error.message);
        } else {
            console.log("Unexpected error in getChatMessages controller", error);
        }
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

/**
 * Sends a new message in a specific chat.
 *
 * This function creates a new message in a specific chat, with text and/or an image, and 
 * saves the message to the database
 *
 * @param {Request} req - The request object, containing the message content and chatId.
 * @param {Response} res - The response object used to send back the new message.
 * @returns {any} - Sends back the sent message with a status 201 if successful, otherwise an error message.
 */
export const sendChatMessage = async (req: Request, res: Response): Promise<any> => {
    try {
        // Extract the message content and/or image from the request body
        const { text, image } = req.body;
        // Extract the chat ID from the URL params
        const { chatId } = req.params;
        // Get the sender's user ID (i.e. the currently logged-in user)
        const senderId = req.user._id;

        // Check that the message contains text and/or an image
        if (!text && !image) {
            return res.status(400).json({ message: "Message must include text or image." });
        }

        let imageUrl;
        // If an image is provided, upload it to Cloudinary, and get back the response
        if (image) {
            const uploadResponse = await cloudinary.uploader.upload(image);
            // get the url to the image from the response
            imageUrl = uploadResponse.secure_url;
        }

        // Create a new message instance with the provided data
        const newMessage = new Message({
            senderId,
            chatId,
            text,
            image: imageUrl, // will be undefined if no image provided
        });

        // Save the message to the database
        await newMessage.save();

        // TODO: Need to show the message to everyone in real time

        // Send the message back to the client with status 201 Created
        return res.status(201).json(newMessage);

    } catch (error: unknown) {
        if (error instanceof Error) {
            console.log("Error in sendChatMessage controller:", error.message);
        } else {
            console.log("Unexpected error in sendChatMessage controller:", error);
        }
        return res.status(500).json({ error: "Internal server error" });
    }
};

/**
 * Edits the text of an existing message.
 *
 * Only the original sender of the message can edit it, and only the text can be changed — 
 * attached images cannot be updated (this is standard for almost all modern messaging apps).
 * 
 * @param {Request} req - The request object, containing the message ID in params and new text in body.
 * @param {Response} res - The response object used to send back the updated message or error.
 * @returns {any} - Sends the updated message with status 200 OK if successful, otherwise an error message.
 */
export const editMessage = async (req: Request, res: Response): Promise<any> => {
    try {
        // Get the ID of the message to edit, the text to update to, and the current user's ID.
        const { messageId } = req.params;
        const { text } = req.body;
        const userId = req.user._id;

        // Find the message by ID
        const message = await Message.findById(messageId);

        // Check if the message exists
        if (!message) {
            return res.status(404).json({ message: "Message not found." });
        }

        // Only the original sender can edit the message
        if (message.senderId.toString() !== userId.toString()) {
            return res.status(403).json({ message: "You can only edit your own messages." });
        }

        // Ensure text is defined (not undefined or null)
        if (text === undefined || text === null) {
            return res.status(400).json({ message: "Text must be provided, even if empty." });
        }

        // Check that the message still contains text and/or an image (it cannot have neither)
        if (text.trim().length === 0 && !message.image) {
            return res.status(400).json({ message: "Message must have text and/or an image." });
        }

        // Update the text
        message.text = text.trim();
        
        // Could have a flag showing that the message has been edited?

        // Save the edited message to the database
        await message.save();

        // Return 200 OK status with the updated message
        return res.status(200).json(message);

    } catch (error: unknown) {
        if (error instanceof Error) {
            console.log("Error in editMessage controller:", error.message);
        } else {
            console.log("Unexpected error in editMessage controller:", error);
        }
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

/**
 * Deletes a specific message sent by the user.
 * 
 * Only the user who sent the message can delete it.
 * 
 * @param {Request} req - The request object containing the message ID in params and user ID from auth.
 * @param {Response} res - The response object used to return status or error.
 * @returns {Promise<any>} - Sends status 200 if the deletion was successful, otherwise an error message.
 */
export const deleteMessage = async (req: Request, res: Response): Promise<any> => {
    try {
        // Get the id of the message to delete and the id of the current user from the request
        const { messageId } = req.params;
        const userId = req.user._id;

        // Find the message with the given ID
        const message = await Message.findById(messageId);

        // Verify that the message exists
        if (!message) {
            return res.status(404).json({ message: "Message not found." });
        }

        // Check that the currently authenticated user is the one who sent the message
        if (message.senderId.toString() !== userId.toString()) {
            return res.status(403).json({ message: "You can only delete your own messages." });
        }

        // If all checks passed, delete the message from the database
        await Message.findByIdAndDelete(messageId);

        // Return 200 OK status with success message
        return res.status(200).json({ message: "Message deleted successfully." });

    } catch (error: unknown) {
        if (error instanceof Error) {
            console.log("Error in deleteMessage controller:", error.message);
        } else {
            console.log("Unexpected error in deleteMessage controller:", error);
        }
        return res.status(500).json({ message: "Internal Server Error" });
    }
};