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
 * @returns {any}
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