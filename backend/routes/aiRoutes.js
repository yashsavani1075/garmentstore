const express = require("express");
const router = express.Router();

const {
  askAI,
  getChatSuggestions,
} = require("../controllers/aiController");

router.post("/ask", askAI);
router.get("/suggestions", getChatSuggestions);

module.exports = router;