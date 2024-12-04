const express = require('express');
const {handleResponseAPI} = require("./baseController");
const {auth} = require("../../utils/middlewareService");
const DepartmentService = require('../services/departmentService');

const router = express.Router();

const _service = new DepartmentService();

// get danh sách department
router.get('/', auth, (req, res) => {
    let params = req.query;
    handleResponseAPI(req, res, _service.list(params));
});


// tạo mới department
router.post('/create', auth, (req, res) => {
    let params = req.body;
    handleResponseAPI(req, res, _service.create(params));
});

// chỉnh sủa department
router.put('/update/:id', auth, (req, res) => {
    let params = req.body;
    handleResponseAPI(req, res, _service.update(params, Number(req.params.id)));
});

// bỏ sử dụng department
router.delete('/delete/:id', auth, (req, res) => {
    handleResponseAPI(req, res, _service.delete(req.params.id));
});

// xóa hoàn toàn departmen
router.delete('/deleted-permanently/:id', auth, (req, res) => {
    handleResponseAPI(req, res, _service.deletedPermanently(req.params.id));
});

module.exports = router;