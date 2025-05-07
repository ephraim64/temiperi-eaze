import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { allMessages, sendMessage, markAsRead } from "../controllers/messageController.js";

const router = express.Router();

router.route("/:chatId").get(protect, allMessages);
router.route("/").post(protect, sendMessage);
router.route("/:conversationType/:conversationId/read").post(protect, markAsRead);


export default router;