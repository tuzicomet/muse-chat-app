import express from "express"
import { protectRoute } from "../middleware/auth.middleware.js";
import { getChatMessages, sendChatMessage } from "../controllers/message.controller.js";

const router = express.Router();

// Get all messages in the chat with the specified ID.
router.get("/chat/:chatId", protectRoute, getChatMessages);

// Send a message in the chat with the specified ID.
router.post("/chat/:chatId", protectRoute, sendChatMessage);

export default router;