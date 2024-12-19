const multer = require("multer");
const path = require("path");
const fs = require("fs");

const DIR = "public";

// Danh sách thư mục được phép
const allowedFolders = ["document"];

// Hàm loại bỏ ký tự nguy hiểm khỏi folder
const sanitizePath = (folder) => {
    return folder.replace(/(\.\.\/|\.\/|\/)/g, ""); // Loại bỏ các ký tự ../, ./, /
};

// Kiểm tra thư mục có hợp lệ hay không
const isValidFolder = (folder) => {
    const sanitizedFolder = sanitizePath(folder);
    return allowedFolders.includes(sanitizedFolder); // Chỉ cho phép các thư mục trong danh sách
};

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const sanitizedFolder = sanitizePath(req.body.folder || "");

        if (!isValidFolder(sanitizedFolder))
            return cb(new Error("Invalid or unauthorized folder path."));

        const uploadPath = path.join(__dirname, "..", DIR, sanitizedFolder);

        // Tạo thư mục nếu chưa tồn tại
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }

        cb(null, uploadPath); // Đặt thư mục lưu file
    },
    filename: (req, file, cb) => {
        const fileName = file.originalname
            .toLowerCase()
            .split(" ")
            .join("-")
            .split("_")
            .join("-")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/đ/g, "d")
            .replace(/[^\x00-\x7F]/g, "");

        cb(null, Date.now() + "-" + fileName);
    },
});

// Bộ lọc loại file
const fileFilter = (req, file, cb) => {
    const allowedMimeTypes = [
        "image/jpeg",
        "image/png",
        "application/pdf",
        "application/msword", // .doc
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
        "application/vnd.ms-excel", // .xls
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
        "text/plain", // .txt
    ];

    if (!allowedMimeTypes.includes(file.mimetype)) {
        const allowedTypes = allowedMimeTypes.join(", "); // Ghép các loại file được phép thành chuỗi
        return cb(
            new Error(`File type not allowed. Allowed types: ${allowedTypes}`),
            false
        );
    }

    cb(null, true);
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 }, // Giới hạn 10MB
});

module.exports = { DIR, upload, sanitizePath, isValidFolder };
