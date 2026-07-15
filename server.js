const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const cors = require('cors');
const puppeteer = require('puppeteer');

const app = express();
const PORT = 3000;

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Database connection
const dbPath = path.join(__dirname, 'resume_builder.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Database connection error:', err.message);
    } else {
        console.log('Connected to SQLite database.');
        // Ensure table exists (same schema as PHP)
        db.run(`CREATE TABLE IF NOT EXISTS resumes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            resume_data TEXT NOT NULL,
            profile_image TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);
    }
});

// Configure Multer for profile image uploads
const publicDir = path.join(__dirname, 'public');
const uploadsDir = path.join(publicDir, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Seed default profile.jpg from original project root if not already in uploads
if (fs.existsSync(path.join(__dirname, 'profile.jpg')) && !fs.existsSync(path.join(uploadsDir, 'default_profile.jpg'))) {
    fs.copyFileSync(path.join(__dirname, 'profile.jpg'), path.join(uploadsDir, 'default_profile.jpg'));
}
if (fs.existsSync(path.join(__dirname, 'uploads')) && fs.statSync(path.join(__dirname, 'uploads')).isDirectory()) {
    // Copy existing uploads if they exist in root
    const rootUploads = fs.readdirSync(path.join(__dirname, 'uploads'));
    rootUploads.forEach(f => {
        const src = path.join(__dirname, 'uploads', f);
        const dest = path.join(uploadsDir, f);
        if (fs.statSync(src).isFile() && !fs.existsSync(dest)) {
            fs.copyFileSync(src, dest);
        }
    });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname) || '.jpg';
        cb(null, 'profile_' + Date.now() + ext);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const mimeType = allowedTypes.test(file.mimetype);
        const extName = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        if (mimeType && extName) {
            return cb(null, true);
        }
        cb(new Error('Invalid image type. Allowed: JPG, PNG, GIF, WEBP'));
    }
});

// Static directories
app.use(express.static(publicDir));
app.use('/uploads', express.static(uploadsDir));

// API Endpoints
// List resumes
app.get('/api/resumes', (req, res) => {
    db.all("SELECT id, title, profile_image, updated_at FROM resumes ORDER BY updated_at DESC", [], (err, rows) => {
        if (err) {
            return res.status(500).json({ status: 'error', message: err.message });
        }
        res.json({ status: 'success', data: rows });
    });
});

// Get resume by ID
app.get('/api/resumes/:id', (req, res) => {
    const id = parseInt(req.params.id);
    db.get("SELECT * FROM resumes WHERE id = ?", [id], (err, row) => {
        if (err) {
            return res.status(500).json({ status: 'error', message: err.message });
        }
        if (!row) {
            return res.status(404).json({ status: 'error', message: 'Resume not found' });
        }
        try {
            row.resume_data = JSON.parse(row.resume_data);
        } catch (e) {
            // Already an object or malformed JSON
        }
        res.json({ status: 'success', data: row });
    });
});

// Save or Update resume
app.post('/api/resumes', (req, res) => {
    const id = req.body.id ? parseInt(req.body.id) : null;
    const title = (req.body.title || 'Untitled Resume').trim();
    const resumeData = req.body.resume_data;
    const profileImage = req.body.profile_image || null;

    if (!resumeData) {
        return res.status(400).json({ status: 'error', message: 'Missing resume data' });
    }

    const resumeDataStr = typeof resumeData === 'string' ? resumeData : JSON.stringify(resumeData);

    if (id) {
        // Update
        db.run(
            "UPDATE resumes SET title = ?, resume_data = ?, profile_image = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
            [title, resumeDataStr, profileImage, id],
            function(err) {
                if (err) {
                    return res.status(500).json({ status: 'error', message: err.message });
                }
                res.json({ status: 'success', id: id, message: 'Resume saved successfully' });
            }
        );
    } else {
        // Insert new
        db.run(
            "INSERT INTO resumes (title, resume_data, profile_image) VALUES (?, ?, ?)",
            [title, resumeDataStr, profileImage],
            function(err) {
                if (err) {
                    return res.status(500).json({ status: 'error', message: err.message });
                }
                res.json({ status: 'success', id: this.lastID, message: 'Resume created successfully' });
            }
        );
    }
});

// Upload profile image
app.post('/api/resumes/upload-image', upload.single('profile_image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ status: 'error', message: 'No file uploaded' });
    }
    res.json({ status: 'success', filename: req.file.filename });
});

// Delete resume
app.delete('/api/resumes/:id', (req, res) => {
    const id = parseInt(req.params.id);
    db.run("DELETE FROM resumes WHERE id = ?", [id], function(err) {
        if (err) {
            return res.status(500).json({ status: 'error', message: err.message });
        }
        res.json({ status: 'success', message: 'Resume deleted successfully' });
    });
});

// Duplicate resume
app.post('/api/resumes/:id/duplicate', (req, res) => {
    const id = parseInt(req.params.id);
    db.get("SELECT * FROM resumes WHERE id = ?", [id], (err, row) => {
        if (err) {
            return res.status(500).json({ status: 'error', message: err.message });
        }
        if (!row) {
            return res.status(404).json({ status: 'error', message: 'Resume not found' });
        }

        const newTitle = 'Copy of ' + row.title;
        let newImage = row.profile_image;

        if (newImage && fs.existsSync(path.join(uploadsDir, newImage))) {
            const ext = path.extname(newImage);
            const newFilename = 'profile_copy_' + Date.now() + ext;
            fs.copyFileSync(path.join(uploadsDir, newImage), path.join(uploadsDir, newFilename));
            newImage = newFilename;
        }

        db.run(
            "INSERT INTO resumes (title, resume_data, profile_image) VALUES (?, ?, ?)",
            [newTitle, row.resume_data, newImage],
            function(err) {
                if (err) {
                    return res.status(500).json({ status: 'error', message: err.message });
                }
                res.json({ status: 'success', id: this.lastID, message: 'Resume duplicated successfully' });
            }
        );
    });
});

// Export resume (Puppeteer Rendering)
app.get('/api/resumes/:id/export', async (req, res) => {
    const id = parseInt(req.params.id);
    const format = (req.query.format || 'png').toLowerCase();

    db.get("SELECT title FROM resumes WHERE id = ?", [id], async (err, row) => {
        if (err || !row) {
            return res.status(404).send('Resume not found');
        }

        const title = row.title || 'resume';
        const filename = `${title.toLowerCase().replace(/\s+/g, '_')}.${format}`;

        let browser;
        try {
            // Check for installed Google Chrome to avoid downloading chromium binary if needed
            const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
            const launchOptions = {
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            };
            if (fs.existsSync(chromePath)) {
                launchOptions.executablePath = chromePath;
            }

            browser = await puppeteer.launch(launchOptions);
            const page = await browser.newPage();

            // Set viewport size for A4 (794x1123 px at standard 96 DPI)
            // Render at 2x DPI scale for super sharp image
            await page.setViewport({
                width: 794,
                height: 1123,
                deviceScaleFactor: 2
            });
            await page.emulateMediaType('screen');

            // Navigate to the preview page
            const previewUrl = `http://localhost:${PORT}/export-preview.html?id=${id}`;
            await page.goto(previewUrl, { waitUntil: 'networkidle0' });

            // Wait until rendering is finished
            await page.waitForFunction(() => window.resumeReady === true, { timeout: 10000 });

            if (format === 'pdf') {
                const pdfBuffer = await page.pdf({
                    format: 'A4',
                    printBackground: true,
                    margin: { top: '0px', right: '0px', bottom: '0px', left: '0px' }
                });
                res.setHeader('Content-Type', 'application/pdf');
                res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
                res.send(Buffer.from(pdfBuffer));
            } else {
                const imgBuffer = await page.screenshot({
                    type: 'png',
                    fullPage: false
                });
                res.setHeader('Content-Type', 'image/png');
                res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
                res.send(Buffer.from(imgBuffer));
            }
        } catch (error) {
            console.error('Export error:', error);
            res.status(500).send('Export failed: ' + error.message);
        } finally {
            if (browser) {
                await browser.close();
            }
        }
    });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
