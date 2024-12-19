const express = require('express');
// middlewareService trung gian xử lý token
const {auth} = require("../../utils/middlewareService");
const {handleResponseAPI} = require("./baseController");
const UserService = require('../services/userService');

const router = express.Router();

const _service = new UserService();

router.get('/', auth, (req, res) => {
    let params = req.query;
    handleResponseAPI(req, res, _service.listUser(params));
});

router.get('/department', auth, (req, res) => {
    let params = req.query;
    handleResponseAPI(req, res, _service.listUserDepartment(params));
});

router.post('/login', (req, res) => {
    let params = req.body;
    handleResponseAPI(req, res, _service.signIn(params));
});

router.post('/create', auth, (req, res) => {
    let params = req.body;
    handleResponseAPI(req, res, _service.create(params));
});

router.put('/update/:id', auth, (req, res) => {
    let params = req.body;
    handleResponseAPI(req, res, _service.update(params,Number(req.params.id)));
});

router.put('/update-password/:id', auth, (req, res) => {
    let params = req.body;
    handleResponseAPI(req, res, _service.updatePass(params,Number(req.params.id)));
});

router.delete('/delete/:id', auth, (req, res) => {
    handleResponseAPI(req, res, _service.delete(req.params.id));
});

router.delete('/deleted-permanently/:id', auth, (req, res) => {
    handleResponseAPI(req, res, _service.deletedPermanently(req.params.id));
});


module.exports = router;