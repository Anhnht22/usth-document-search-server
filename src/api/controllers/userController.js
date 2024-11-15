const express = require('express');
const {auth} = require("../../utils/middlewareService")
const {handleResponseAPI} = require("./baseController");
const UserService = require('../services/userService');

const router = express.Router();

const _service = new UserService();

router.get('/', auth, (req, res) => {
    handleResponseAPI(req, res, _service.list());
});

module.exports = router;