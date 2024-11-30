const { Server } = require("socket.io");

const io = new Server({ cors: "http://localhost:5173" }); //we passed this because or client and socket server are on different domain..  the server communicate with the url passed there

let onlineUsers = [];
io.on("connection", (socket) => {
   console.log("User connected", socket.id)
  // ...listeen to a custom connection that'd we'd be able to pass our userId through it
  socket.on("addNewUser", (userId)=> {
    //check for an existing user already= if not online user i.e if the user coming online isnt already online u add them to the online list else dont execute the code
    if(!onlineUsers.some((user)=> user.userId === userId)) {
//then u exccute this if this is true
onlineUsers.push({
  userId,
  socketId: socket.id
})
//console.log("Online USERS", onlineUsers) 
    }

 
    io.emit("getOnlineUsers", onlineUsers)
  });

  //add message
  socket.on("sendMessage", (message) => {
   console.log("Message received", message)
    const user = onlineUsers.find(
      (user) => user.userId === message.recipientId
    ); 
    if(user) {
      io.to(user.socketId).emit("getMessage", message)
      io.to(user.socketId).emit("getNotification", {
        senderId: message.senderId,
        isRead: false,
        date: new Date(),
      })
    }
    
  });

  //...listen to a custom disconnection event that'd we'd be able to pass our userId through it
  socket.on("disconnect", ()=> {
 
    onlineUsers = onlineUsers.filter(user => user.socketId !== socket.id)
    
    console.log("Online USERS", onlineUsers) 
 
    io.emit("getOnlineUsers", onlineUsers)
  })

});

io.listen(3000)     