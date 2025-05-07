import Chat from '../models/chatModel.js';
import User from '../models/userModel.js';  // Assuming you have a user model
import Message from "../models/messageModel.js";

// @desc    Create or fetch One-on-One Chat
// @route   POST /api/chat
// @access  Protected
const accessChat = async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    console.log("UserId param not sent with request");
    return res.status(400).send({message: "UserId param not sent with request"});
  }

  let isChat = await Chat.find({
    isGroupChat: false,
    $and: [
      { users: { $elemMatch: { $eq: req.user._id } } }, // Check current user is in chat
      { users: { $elemMatch: { $eq: userId } } },  // Check target user is in chat
    ],
  })
    .populate("users", "-password") //Populate all user details except password
    .populate("latestMessage");

  isChat = await User.populate(isChat, {  //Further populate sender details within latestMessage
    path: "latestMessage.sender",
    select: "name pic email",  //Choose which sender details to include
  });

  if (isChat.length > 0) {
    res.send(isChat[0]);
  } else {
    let chatData = {
      name: "sender",
      isGroupChat: false,
      users: [req.user._id, userId],
    };

    try {
      const createdChat = await Chat.create(chatData);
      const FullChat = await Chat.findOne({ _id: createdChat._id }).populate(
        "users",
        "-password"
      );
      res.status(200).send(FullChat);
    } catch (error) {
      res.status(400).send({message: error.message});
    }
  }
};


// @desc    Fetch all chats for a user
// @route   GET /api/chat
// @access  Protected
const fetchChats = async (req, res) => {
  try {
    Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
      .populate("users", "-password")
      .populate("groupAdmin", "-password")
      .populate("latestMessage")
      .sort({ updatedAt: -1 }) // Sort by most recent update
      .then(async (results) => {
        results = await User.populate(results, {
          path: "latestMessage.sender",
          select: "name pic email",
        });
        res.status(200).send(results);
      });
  } catch (error) {
    res.status(400).send({message: error.message});
  }
};

// @desc    Create New Group Chat
// @route   POST /api/chat/group
// @access  Protected
const createGroupChat = async (req, res) => {
  if (!req.body.users || !req.body.name) {
    return res.status(400).send({ message: "Please Fill all the feilds" });
  }

  let users = JSON.parse(req.body.users);  // Expects a JSON string array

  if (users.length < 2) {
    return res
      .status(400)
      .send("More than 2 users are required to form a group chat");
  }

  users.push(req.user);  //Add the current user to the group

  try {
    const groupChat = await Chat.create({
      name: req.body.name,
      users: users,
      isGroupChat: true,
      groupAdmin: req.user,
    });

    const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    res.status(200).json(fullGroupChat);
  } catch (error) {
    res.status(400).send({message: error.message});
  }
};

// @desc    Rename Group
// @route   PUT /api/chat/rename
// @access  Protected
const renameGroup = async (req, res) => {
  const { chatId, chatName } = req.body;

  const updatedChat = await Chat.findByIdAndUpdate(
    chatId,
    {
      name: chatName,
    },
    {
      new: true,  //Return the updated document
    }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!updatedChat) {
    res.status(404).send({message: "Chat Not Found"});
  } else {
    res.json(updatedChat);
  }
};

// @desc    Remove user from Group
// @route   PUT /api/chat/groupremove
// @access  Protected
const removeFromGroup = async (req, res) => {
  const { chatId, userId } = req.body;

  // Check if the requester is the admin
  const chat = await Chat.findById(chatId);
    if(chat.groupAdmin.toString() !== req.user._id.toString()){
      return res.status(403).send({message: "Only admin can remove user"});
    }

  const removed = await Chat.findByIdAndUpdate(
    chatId,
    {
      $pull: { users: userId },  //Pull removes the userId from the users array
    },
    { new: true }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!removed) {
    res.status(404).send({message: "Chat Not Found"});
  } else {
    res.json(removed);
  }
};

// @desc    Add user to Group / Leave
// @route   PUT /api/chat/groupadd
// @access  Protected
const addToGroup = async (req, res) => {
  const { chatId, userId } = req.body;

  const added = await Chat.findByIdAndUpdate(
    chatId,
    {
      $push: { users: userId },  //Push adds the userId to the users array
    },
    { new: true }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!added) {
    res.status(404).send({message: "Chat Not Found"});
  } else {
    res.json(added);
  }
};

export { accessChat, fetchChats, createGroupChat, renameGroup, removeFromGroup, addToGroup };