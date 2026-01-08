const router = require("express").Router();
const controller = require("./suggestion.controller");

router.post("/", controller.sendSuggestion);

module.exports = router;
