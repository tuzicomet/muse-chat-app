import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { getChatsList } from "../controllers/chat.controller.js";

const router = express.Router();

// Get the logged in user's list of available chats. 
router.get("/chats", protectRoute, getChatsList);

export default router;