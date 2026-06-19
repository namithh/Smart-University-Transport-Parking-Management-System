const express = require("express");
const chatWithBot = require("../controller/chatbotController");

const router = express.Router();

router.post("/chat", chatWithBot);

module.exports = router;


