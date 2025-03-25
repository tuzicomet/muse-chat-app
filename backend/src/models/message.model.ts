import mongoose from "mongoose";

// Mongoose schema for the Message collection
// Represents a message sent by a user in a specific chat
const messageSchema = new mongoose.Schema(
    {
        // References the User who sent the message
        senderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        // References the Chat which the message belongs in
        chatId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Chat",
            required: true,
        },
        // text & image are optional, as a message can have either one, or both
        text: {
            type: String,
        },
        image: {
            type: String,
        },
    },
    { timestamps: true } // Automatically creates `createdAt` & `updatedAt` fields
);

// Creates a Mongoose model named "Chat" based on the chatSchema
const Message = mongoose.model("Message", messageSchema);

// Export Chat to be usable in other files
export default Message;