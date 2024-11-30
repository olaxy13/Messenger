const express = require("express");
const chatController = require("../controllers/chatController");

const router = express.Router();

router.post("/", chatController.createChat)
router.get("/:userId", chatController.findUserChats) //All chats for a user
router.get("/find/:firstId/:secondId", chatController.findChat) //Chat between two users


module.exports = router; 