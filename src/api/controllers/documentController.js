const express = require("express");
const { handleResponseAPI } = require("./baseController");
const { auth } = require("../../utils/middlewareService");
const DocumentService = require("../services/documentService");
const { upload } = require("../../utils/fileHandler");

const router = express.Router();

const _service = new DocumentService();

router.get("/", auth, (req, res) => {
    let params = req.query;
    handleResponseAPI(req, res, _service.list(params));
});

router.post("/create", auth, upload.single("file"), (req, res) => {
    const file = req.file; // Lấy thông tin file
    const params = {
        ...req.body,
        document_file: file,
    };

    handleResponseAPI(req, res, _service.create(req, params, req.userData));
});

router.put("/update/:id", upload.single("file"), auth, (req, res) => {
    const file = req.file; // Lấy thông tin file
    const params = {
        ...req.body,
        document_file: file,
    };
    
    handleResponseAPI(
        req,
        res,
        _service.update(params, Number(req.params.id), req.userData)
    );
});

router.delete("/delete/:id", auth, (req, res) => {
    handleResponseAPI(req, res, _service.delete(req.params.id));
});

router.delete("/deleted-permanently/:id", auth, (req, res) => {
    handleResponseAPI(req, res, _service.deletedPermanently(req.params.id));
});

module.exports = router;
