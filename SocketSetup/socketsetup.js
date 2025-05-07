import { Server } from 'socket.io';

const socketSetup = (server) => {
  const io = new Server(server, {
    pingTimeout: 60000, //Close connection after 60 seconds of inactivity.  Good for saving resources.
    cors: {
      origin: process.env.NODE_ENV === "production" ? "your-production-url" : "http://localhost:3000",  //Replace with your client URL
    },
  });

  io.on("connection", (socket) => {
    console.log("Connected to socket.io");

    socket.on("setup", (userData) => {
      socket.join(userData._id); //User joins a room with their own ID
      socket.emit("connected");
    });

    socket.on("join chat", (room) => {
      socket.join(room);  //User joins a chat room (group or direct)
      console.log("User Joined Room: " + room);
    });

    socket.on("typing", (room) => socket.in(room).emit("typing"));
    socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

    socket.on("new message", (newMessageReceived) => {
      var chat = newMessageReceived.chat;

      if (!chat.users) return console.log("chat.users not defined");

      chat.users.forEach((user) => {
        if (user._id == newMessageReceived.sender._id) return;  //Don't send to the sender

        socket.in(user._id).emit("message received", newMessageReceived);  //Send to each other user's room (their user ID)
      });
    });

    socket.on("read all messages", ({conversationId, userId}) => {
      socket.in(conversationId).emit("messages read", {conversationId, userId}); // Notify everyone in the chat that user has read the messages
    })

    socket.on("user status change", ({userId, status}) => {
      socket.broadcast.emit("user status changed", {userId, status}); // Notify all clients about user status change
    })

    socket.off("setup", () => {
      console.log("USER DISCONNECTED");
      socket.leave(userData._id);
    });
  });
};

export default socketSetup;