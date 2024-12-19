const express = require('express');
const {handleResponseAPI} = require("./baseController");
const {auth} = require("../../utils/middlewareService");
const SubjectDepartmentService = require('../services/subjectDepartmentService');

const router = express.Router();

const _service = new SubjectDepartmentService();

router.post('/create', auth, (req, res) => {
    let params = req.body;
    handleResponseAPI(req, res, _service.create(params));
});

router.put('/update/:id', auth, (req, res) => {
    let params = req.body;
    handleResponseAPI(req, res, _service.update(params, Number(req.params.id)));
});

router.delete('/delete/:id', auth, (req, res) => {
    handleResponseAPI(req, res, _service.delete(req.params.id));
});

router.delete('/deleted-permanently/:id', auth, (req, res) => {
    handleResponseAPI(req, res, _service.deletedPermanently(req.params.id));
});

module.exports = router;