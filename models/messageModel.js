import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  content: {
    type: String,
    trim: true,
  },
  chat: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chat',
  },
  files: [{   //Array of file URLs (after upload)
    type: String
  }],
  readBy: [{   //Users who have read the message.  Helpful for read receipts in groups.
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
},
{
  timestamps: true, //Adds createdAt and updatedAt fields
});

const Message = mongoose.model('Message', messageSchema);

export default Message;