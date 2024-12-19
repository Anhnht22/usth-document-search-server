const express = require("express");
const config = require("config");
const cors = require("cors");
const helmet = require("helmet");
const bodyParser = require("body-parser");
const multer = require("multer");
const path = require("path");
const compression = require("compression");
const { isValidFolder } = require("./utils/fileHandler");
const fs = require("fs");

const app = express();

const { port, version } = config.get("api");

function logErrors(err, req, res, next) {
    next(err);
}

function clientErrorHandler(err, req, res, next) {
    req.xhr
        ? res.status(500).send({ error: "Something went wrong." })
        : next(err);
}

app.use(helmet());
app.use(cors());
app.use(bodyParser.json({ limit: "1024MB", extended: true }));
app.use(bodyParser.urlencoded({ limit: "1024MB", extended: true }));
app.use(compression());

app.use(logErrors);
app.use(clientErrorHandler);

// app.use(`/${version}/static/`, express.static("public"));
// app.use(`/public`, express.static("public"));
// app.use(`/public`, express.static("./public/document"));

app.use(
    `${version}/static`,
    express.static(path.join(__dirname, "public"), {
        setHeaders: (res, path) => {
            res.setHeader("Cache-Control", "public, max-age=31536000"); // Cache 1 năm
        },
    })
);

app.get(`${version}/static/download`, (req, res) => {
    if (!isValidFolder(path.dirname(req.query.file))) {
        return res.status(400).send("Invalid file path."); // Dùng return để dừng xử lý
    }

    const filePath = path.join(__dirname, "public", req.query.file);

    const fileRoot = req.query.file.split('/').pop();
    const extension = fileRoot.split(".").pop();
    const fileName = req.query.name
        ? `${req.query.name}.${extension}`
        : fileRoot; // Tên file gốc nếu không có tên mới

    // Kiểm tra sự tồn tại của file trước khi tải xuống
    if (!fs.existsSync(filePath)) {
        return res.status(404).send("File not found."); // Đảm bảo chỉ gửi một phản hồi
    }

    // Tải xuống file
    res.download(filePath, fileName, (err) => {
        if (err) {
            console.error("Error during file download:", err);

            // Kiểm tra lỗi đã gửi phản hồi hay chưa
            if (!res.headersSent) {
                res.status(500).send("File not found or error occurred.");
            }
        }
    });
});


require("./routes")(app, version);

app.use((err, req, res, next) => {
    if (!res.headersSent) {
        console.error("Unhandled Error:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// Endpoint cơ bản
app.get("/", (req, res) => {
    res.send("Hello World!");
});

// Khởi động server
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});

module.exports = app;
