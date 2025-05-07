import Message from "../models/messageModel.js";
import User from "../models/userModel.js";
import Chat from "../models/chatModel.js";

//@description     Get all Messages
//@route           GET /api/Message/:chatId
//@access          Protected
const allMessages = async (req, res) => {
  try {
    const messages = await Message.find({ chat: req.params.chatId })
      .populate("sender", "name pic email")
      .populate("chat");
    res.json(messages);
  } catch (error) {
    res.status(400).send({message: error.message});
  }
};

//@description     Create New Message
//@route           POST /api/Message
//@access          Protected
const sendMessage = async (req, res) => {
  const { content, chatId, files } = req.body; // Include files in the request

  if (!content || !chatId) {
    console.log("Invalid data passed into request");
    return res.sendStatus(400);
  }

  var newMessage = {
    sender: req.user._id,
    content: content,
    chat: chatId,
    files: files || [], // Store the array of file URLs
  };

  try {
    var message = await Message.create(newMessage);

    message = await message.populate("sender", "name pic");
    message = await message.populate("chat");
    message = await User.populate(message, {
      path: "chat.users",
      select: "name pic email",
    });

    await Chat.findByIdAndUpdate(req.body.chatId, { latestMessage: message });

    res.json(message);
  } catch (error) {
    res.status(400).send({message: error.message});
  }
};


const markAsRead = async (req, res) => {
    const { conversationType, conversationId } = req.params;
    const userId = req.user._id; // Assuming user is authenticated

    try {
        // Find the chat (either group or direct)
        const chat = await Chat.findById(conversationId);
        if (!chat) {
            return res.status(404).send({ message: "Chat not found" });
        }

        // Update messages to mark them as read
        const result = await Message.updateMany(
            { chat: conversationId, readBy: { $ne: userId } }, // Find unread messages
            { $addToSet: { readBy: userId } } // Add user to readBy array
        );

        res.status(200).send({ message: `${result.modifiedCount} messages marked as read` });

    } catch (error) {
        console.error("Error marking messages as read:", error);
        res.status(500).send({ message: "Failed to mark messages as read", error: error.message });
    }
};

export { allMessages, sendMessage, markAsRead };