const express = require('express');
const {handleResponseAPI} = require("./baseController");
const {auth} = require("../../utils/middlewareService");
const RoleService = require('../services/roleService');

const router = express.Router();

const _service = new RoleService();

router.get('/', auth, (req, res) => {
    let params = req.query;
    handleResponseAPI(req, res, _service.list(params));
});

module.exports = router;