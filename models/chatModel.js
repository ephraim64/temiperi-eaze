import mongoose from 'mongoose';

const chatSchema = new mongoose.Schema({
  name: {  //For Group Chat names, direct chats can use participant ids
    type: String,
    trim: true,
  },
  isGroupChat: {
    type: Boolean,
    default: false
  },
  users: [{ // Participants in the chat
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  latestMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
  },
  groupAdmin: {  //For group chats
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
},
{
  timestamps: true,  //Adds createdAt and updatedAt fields
});

const Chat = mongoose.model('Chat', chatSchema);

export default Chat;