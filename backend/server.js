// Backend server for File Share App
// Handles large file uploads, generates download links, and serves files

const express = require('express');
const multer  = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// Directory to store uploaded files
const UPLOAD_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR);
}

// Multer storage config for large files
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, UPLOAD_DIR);
    },
    filename: function (req, file, cb) {
        const uniqueName = uuidv4() + path.extname(file.originalname);
        cb(null, uniqueName);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 * 1024 } // 10GB
});

// Store mapping of download links to files
const fileMap = {};

// Upload endpoint
app.post('/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    if (!req.file.originalname.endsWith('.zip')) {
        // Remove the uploaded file if it's not a zip
        fs.unlinkSync(req.file.path);
        return res.status(400).json({ error: 'Only ZIP files are allowed.' });
    }
    const downloadId = uuidv4();
    fileMap[downloadId] = req.file.filename;
    res.json({ downloadLink: `/download/${downloadId}` });
});

// Download endpoint
app.get('/download/:id', (req, res) => {
    const fileId = req.params.id;
    const filename = fileMap[fileId];
    if (!filename) {
        return res.status(404).send('File not found');
    }
    const filePath = path.join(UPLOAD_DIR, filename);
    res.download(filePath);
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
});