import { Request, Response } from "express";
import Message from "../models/message.model.js";

/**
 * Retrieves all messages belonging to a specific chat.
 * 
 * This is used to populate the message thread when a user clicks into a chat.
 * 
 * @param {Request} req - The request object, containing the chat ID in params.
 * @param {Response} res - The response object used to send back the list of messages.
 * @returns {void} - Sends a list of messages with status 200 if successful, otherwise an error message.
 */
export const getChatMessages = async (req: Request, res: Response): Promise<void> => {
    try {
        // Extract the chat ID from the URL params
        const { chatId } = req.params;

        // Find all messages that belong to the chat with the given chatId
        const messages = await Message.find({ chatId });

        // Send the list of messages back to the client in JSON, with 200 OK status
        res.status(200).json(messages);

    } catch (error: unknown) {
        // Type guard to check if the error is an instance of Error
        if (error instanceof Error) {
            console.log("Error in getChatMessages controller", error.message);
        } else {
            console.log("Unexpected error in getChatMessages controller", error);
        }
        res.status(500).json({ message: "Internal Server Error" });
    }
};