const express = require("express");
const { handleResponseAPI } = require("./baseController");
const { auth } = require("../../utils/middlewareService");
const KeywordService = require("../services/keywordService");

const router = express.Router();

const _service = new KeywordService();

router.get("/", auth, (req, res) => {
    let params = req.query;
    handleResponseAPI(req, res, _service.list(params));
});

router.post("/create", auth, (req, res) => {
    let params = req.body;
    handleResponseAPI(req, res, _service.create(params));
});

module.exports = router;
