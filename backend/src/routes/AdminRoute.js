const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { uploadFile, getAllStore } = require("../controllers/AuthControllers.js");

const filerouter = express.Router();

// Ensure uploads directory exists
const uploadsPath = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsPath)) {
    fs.mkdirSync(uploadsPath, { recursive: true });
    console.log('Created uploads directory at:', uploadsPath);
}

// Configure multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        console.log('Multer destination - uploadsPath:', uploadsPath);
        cb(null, uploadsPath);
    },
    filename: function (req, file, cb) {
        const filename = Date.now() + '-' + file.originalname;
        console.log('Multer generated filename:', filename);
        cb(null, filename);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: function (req, file, cb) {
        console.log('Multer fileFilter - file received:', file.originalname);
        const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
            console.log('File type allowed');
            return cb(null, true);
        } else {
            console.log('File type NOT allowed');
            cb(new Error('Invalid file type. Only images and documents are allowed.'));
        }
    }
});

// Test route
filerouter.post('/test-upload', (req, res) => {
    console.log('=== TEST ROUTE (before multer) ===');
    console.log('Content-Type:', req.headers['content-type']);
    console.log('==================================');
    res.json({ message: 'Test route works, multer not applied yet' });
});

// Test with multer
filerouter.post('/test-multer', upload.single("file"), (req, res) => {
    console.log('=== TEST MULTER ===');
    console.log('Body:', req.body);
    console.log('File:', req.file);
    console.log('===================');
    
    if (req.file) {
        res.json({ 
            success: true, 
            message: 'File received!',
            filename: req.file.filename,
            user_id: req.body.user_id
        });
    } else {
        res.json({ 
            success: false, 
            message: 'No file received',
            body: req.body 
        });
    }
});

filerouter.post('/upload-file', upload.single("file"), uploadFile);
filerouter.get("/get-file", getAllStore);

module.exports = filerouter;
