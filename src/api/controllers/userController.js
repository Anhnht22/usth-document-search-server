const express = require('express');
const {auth} = require("../../utils/middlewareService")
const {handleResponseAPI} = require("./baseController");
const UserService = require('../services/userService');

const router = express.Router();

const _service = new UserService();

router.get('/', auth, (req, res) => {
    let params = req.body;
    handleResponseAPI(req, res, _service.list(params));
});

router.post('/login', (req, res) => {
    let params = req.body;
    handleResponseAPI(req, res, _service.signIn(params));
});

module.exports = router;