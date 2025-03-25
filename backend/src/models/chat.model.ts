import mongoose from "mongoose";

// Mongoose schema for the Chat collection
// Represents a conversation (either a Direct Message (DM) or group chat) between users.
const chatSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            default: "", // Optional, only relevant for group chats
        },
        // Boolean which is true if the chat is a group chat, false if it's a DM
        isGroup: {
            type: Boolean,
            default: false, // set to DM by default
        },
        // Stores multiple User IDs, representing all members of the chat
        // NOTE: The array [] syntax allows us to store multiple User ObjectIds in the "members" field
        members: [
            {
                // each item in the array is an ObjectId referencing a User from the User model/table
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],
    },
    { timestamps: true } // Automatically creates `createdAt` & `updatedAt` fields
);

// Creates a Mongoose model named "Chat" based on the chatSchema
const Chat = mongoose.model("Chat", chatSchema);

// Export Chat to be usable in other files
export default Chat;
