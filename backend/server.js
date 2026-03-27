import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { createClient } from '@libsql/client';
import { v2 as cloudinary } from 'cloudinary';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// --- CLOUDINARY CONFIG ---
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Multer now holds files in memory instead of saving them to your hard drive
const storage = multer.memoryStorage();
const upload = multer({ storage });

// --- TURSO DB SETUP ---
// If you leave the URL blank in your .env, it brilliantly falls back to a local file!
const db = createClient({
    url: process.env.TURSO_DATABASE_URL || 'file:portfolio.db',
    authToken: process.env.TURSO_AUTH_TOKEN
});

// Initialize DB Tables
async function initDB() {
    await db.execute(`
    CREATE TABLE IF NOT EXISTS images (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      image_url TEXT NOT NULL,
      public_id TEXT NOT NULL,
      shoot_name TEXT NOT NULL,
      shoot_date TEXT NOT NULL,
      likes INTEGER DEFAULT 0,
      shares INTEGER DEFAULT 0
    )
  `);

    await db.execute(`
    CREATE TABLE IF NOT EXISTS admin (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      password TEXT NOT NULL
    )
  `);

    const adminExists = await db.execute('SELECT * FROM admin LIMIT 1');
    if (adminExists.rows.length === 0) {
        const defaultPass = process.env.ADMIN_PASS || 'admin123';
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(defaultPass, salt);
        await db.execute({ sql: 'INSERT INTO admin (password) VALUES (?)', args: [hash] });
        console.log('Admin account securely initialized.');
    }
}
initDB();

// Helper Function: Stream Buffer to Cloudinary
const uploadToCloudinary = (buffer) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            { folder: 'portfolio_shoots' },
            (error, result) => {
                if (error) reject(error);
                else resolve(result);
            }
        );
        uploadStream.end(buffer);
    });
};

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) return res.status(401).json({ error: 'Unauthorized access' });

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Session expired or invalid' });
        req.user = user;
        next();
    });
};

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
});

// --- API ENDPOINTS ---

app.post('/api/login', async (req, res) => {
    const { password } = req.body;
    const adminResult = await db.execute('SELECT * FROM admin LIMIT 1');
    const admin = adminResult.rows[0];

    if (!admin) return res.status(500).json({ error: 'Admin not configured' });

    const validPassword = bcrypt.compareSync(password, admin.password);
    if (!validPassword) return res.status(401).json({ error: 'Incorrect password' });

    const token = jwt.sign({ role: 'manager' }, process.env.JWT_SECRET, { expiresIn: '24h' });
    res.json({ token });
});

app.get('/api/images', async (req, res) => {
    const result = await db.execute('SELECT * FROM images ORDER BY shoot_date DESC');
    res.json(result.rows);
});

app.post('/api/images/:id/like', async (req, res) => {
    await db.execute({ sql: 'UPDATE images SET likes = likes + 1 WHERE id = ?', args: [req.params.id] });
    res.json({ message: 'Like added' });
});

app.post('/api/images/:id/share', async (req, res) => {
    await db.execute({ sql: 'UPDATE images SET shares = shares + 1 WHERE id = ?', args: [req.params.id] });
    res.json({ message: 'Share logged' });
});

app.post('/api/contact', async (req, res) => {
    const { name, email, message } = req.body;
    if (!name || !email || !message) return res.status(400).json({ error: 'Please fill out all fields.' });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_USER,
        replyTo: email,
        subject: `New Portfolio Inquiry from ${name}`,
        text: `You have a new message from your portfolio website:\n\nName: ${name}\nEmail: ${email}\n\nMessage:\n${message}`
    };

    try {
        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: 'Email sent successfully!' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to send email.' });
    }
});

// Cloudinary Batch Upload Route
app.post('/api/upload', authenticateToken, upload.array('images', 50), async (req, res) => {
    const { shoot_name, shoot_date } = req.body;
    const files = req.files;

    if (!files || files.length === 0) return res.status(400).json({ error: 'No files uploaded' });

    try {
        // 1. Upload all buffers to Cloudinary in parallel
        const uploadPromises = files.map(file => uploadToCloudinary(file.buffer));
        const cloudinaryResults = await Promise.all(uploadPromises);

        // 2. Save the Cloudinary URLs and Public IDs to Turso Database
        const insertPromises = cloudinaryResults.map(result => {
            return db.execute({
                sql: 'INSERT INTO images (image_url, public_id, shoot_name, shoot_date) VALUES (?, ?, ?, ?)',
                args: [result.secure_url, result.public_id, shoot_name, shoot_date]
            });
        });

        await Promise.all(insertPromises);

        res.status(201).json({ message: `${files.length} images uploaded to cloud successfully!` });
    } catch (err) {
        console.error("Cloud upload error:", err);
        res.status(500).json({ error: 'Failed to process images.' });
    }
});

// Cloudinary Deletion Route
app.delete('/api/images/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
        const imageResult = await db.execute({ sql: 'SELECT public_id FROM images WHERE id = ?', args: [id] });
        const image = imageResult.rows[0];

        if (image) {
            // Destroy from Cloudinary storage
            await cloudinary.uploader.destroy(image.public_id);
            // Remove from Database
            await db.execute({ sql: 'DELETE FROM images WHERE id = ?', args: [id] });
            res.json({ message: 'Image deleted from cloud successfully' });
        } else {
            res.status(404).json({ error: 'Image not found' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to delete image.' });
    }
});

// --- VERCEL SERVERLESS EXPORT ---
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Local backend running on http://localhost:${PORT}`);
    });
}

export default app;