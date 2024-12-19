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

router.get("/search", auth, (req, res) => {
    let params = req.query;
    handleResponseAPI(req, res, _service.listSearch(params, req.userData));
});

router.post(
    "/create",
    auth,
    upload.single("file"),
    (req, res) => {
        const file = req.file; // Lấy thông tin file
        const params = {
            ...req.body,
            document_file: file,
        };
        handleResponseAPI(req, res, _service.create(req, params, req.userData));
    },
    async (err, req, res, next) => {
        console.log("Middleware lỗi bắt đầu");
        try {
            if (res.headersSent) {
                console.error("Headers đã được gửi, không thể gửi phản hồi");
                return;
            }
            const errorResponse = await _service.processErr(err);
            console.log("Kết quả xử lý lỗi:", errorResponse);
            res.status(errorResponse.statusCode).json(errorResponse.resp);
        } catch (processErr) {
            if (res.headersSent) {
                console.error("Headers đã được gửi trong khi xử lý lỗi");
                return;
            }
            console.error("Lỗi trong xử lý lỗi:", processErr);
            res.status(500).json({
                returnCode: 500,
                returnMessage: processErr.message || "Internal server error",
                trace: processErr.stack || processErr,
            });
        }
    }
);

router.put(
    "/update/:id",
    upload.single("file"),
    auth,
    (req, res) => {
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
    },
    async (err, req, res, next) => {
        console.log("Middleware lỗi bắt đầu");
        try {
            if (res.headersSent) {
                console.error("Headers đã được gửi, không thể gửi phản hồi");
                return;
            }
            const errorResponse = await _service.processErr(err);
            console.log("Kết quả xử lý lỗi:", errorResponse);
            res.status(errorResponse.statusCode).json(errorResponse.resp);
        } catch (processErr) {
            if (res.headersSent) {
                console.error("Headers đã được gửi trong khi xử lý lỗi");
                return;
            }
            console.error("Lỗi trong xử lý lỗi:", processErr);
            res.status(500).json({
                returnCode: 500,
                returnMessage: processErr.message || "Internal server error",
                trace: processErr.stack || processErr,
            });
        }
    }
);

router.delete("/delete/:id", auth, (req, res) => {
    handleResponseAPI(req, res, _service.delete(req.params.id));
});

router.delete("/deleted-permanently/:id", auth, (req, res) => {
    handleResponseAPI(req, res, _service.deletedPermanently(req.params.id));
});

module.exports = router;
