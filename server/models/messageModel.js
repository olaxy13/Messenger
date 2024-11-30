const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({ 
    chatId: String,
    senderId: String,
    text: String,
    isDelivered: { type: Boolean, default: false },
    isRead: { type: Boolean, default: false },
    
}, {
    timestamps: true
})

const Message = mongoose.model('Message', messageSchema);
module.exports = Message;