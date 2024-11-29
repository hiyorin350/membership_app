const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// 静的ファイルの配信設定
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// CORSの設定
app.use(cors({
    origin: 'http://localhost:3000', // ReactアプリのURLを指定
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // 許可するHTTPメソッド
    credentials: true // クッキーなどの情報を許可
}));

// MySQL接続設定
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'hiyori0305',
    database: 'membership_db',
});

db.connect((err) => {
    if (err) {
        console.error('DB connection error:', err);
        return;
    }
    console.log('Connected to MySQL');
});

// 画像アップロードの設定
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});

const upload = multer({ storage });

// 会員登録エンドポイント
app.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        db.query(
            'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
            [username, email, hashedPassword],
            (err, result) => {
                if (err) {
                    console.error("Database error:", err);
                    return res.status(500).json({ message: 'Database error' });
                }
                res.status(201).json({ message: 'User registered successfully!' });
            }
        );
    } catch (error) {
        console.error("Server error:", error);
        res.status(500).json({ message: 'Server error' });
    }
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ message: 'Database error' });
        }

        if (results.length === 0) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const user = results[0];
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // ログイン成功時にユーザー情報を返す
        res.status(200).json({
            message: 'Login successful',
            user: { id: user.id, username: user.username },
        });
    });
});

// 画像アップロードエンドポイント
app.post('/upload', upload.single('image'), (req, res) => {
    const { userId } = req.body; // リクエストボディからuserIdを取得

    // ファイルがアップロードされていない場合
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }

    // userIdが提供されていない場合
    if (!userId) {
        return res.status(400).json({ message: 'User ID is required' });
    }

    // データベースに画像情報を保存
    db.query(
        'INSERT INTO images (user_id, file_path) VALUES (?, ?)',
        [userId, `/uploads/${req.file.filename}`], // ファイルパスを保存
        (err, result) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ message: 'Database error' });
            }

            // 成功レスポンス
            res.status(200).json({
                message: 'File uploaded successfully',
                filePath: `/uploads/${req.file.filename}`,
            });
        }
    );
});


// 自分がアップロードした画像を取得するエンドポイント
app.get('/my-images/:userId', (req, res) => {
    const { userId } = req.params;

    db.query(
        'SELECT file_path FROM images WHERE user_id = ?',
        [userId],
        (err, results) => {
            if (err) {
                console.error("Database error:", err);
                return res.status(500).json({ message: 'Database error' });
            }
            if (results.length === 0) {
                return res.status(404).json({ message: 'No images found for this user' });
            }
            res.status(200).json(results);
        }
    );
});

// サーバー起動
app.listen(5000, () => {
    console.log('Server running on port 5000');
});
