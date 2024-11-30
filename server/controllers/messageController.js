const Message = require('../models/messageModel');

//createMessage

exports.createMessage = async (req, res) => {
    const { chatId, senderId, text } = req.body;
    const message = new Message({ chatId, senderId, text }); 
  try {
    message.isDelivered = true;
   const  response = await message.save();

   res.status(200).json(response);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
};

//getMessages

exports.getMessages = async (req, res) => {
    const { chatId } = req.params;
  try {
    const messages = await Message.find({ chatId })
    if(messages){

      res.status(200).json(messages);
    }
    
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
};