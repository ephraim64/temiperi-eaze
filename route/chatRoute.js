import express from 'express';
import {
  accessChat,
  fetchChats,
  createGroupChat,
  renameGroup,
  removeFromGroup,
  addToGroup,
} from '../controllers/chatController.js';
import { protect } from '../middleware/authMiddleware.js';  //Assuming you have auth middleware

const router = express.Router();

router.route('/').post(protect, accessChat).get(protect, fetchChats); // api/chat
router.route('/group').post(createGroupChat);  //api/chat/group
router.route('/rename').put(protect, renameGroup);      //api/chat/rename
router.route('/groupremove').put(protect, removeFromGroup); //api/chat/groupremove
router.route('/groupadd').put(protect, addToGroup);     //api/chat/groupadd


export default router;