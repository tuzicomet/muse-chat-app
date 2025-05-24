import express from "express"
import { protectRoute } from "../middleware/auth.middleware.js";
import { getChatMessages } from "../controllers/message.controller.js";

const router = express.Router();

// Get all messages in the chat with the specified ID.
router.get("/chat/:chatId", protectRoute, getChatMessages);

export default router;