// server.js
const AWS = require('aws-sdk');
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const bcrypt = require('bcrypt');
const multer = require('multer');
const path = require('path');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(cors());
app.use(express.json());

// Yükleme ayarları
const storage = multer.diskStorage({
    destination: 'uploads/',
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});
const upload = multer({ storage });

// Çevrimiçi kullanıcı verisi
const onlineUsers = {}; // Çevrimiçi kullanıcılar listesi

// Profil fotoğrafı yükleme ve çevrimiçi kullanıcıya avatar URL'sini ekleme
app.post('/api/upload-avatar', upload.single('avatar'), (req, res) => {
    const avatarUrl = `http://localhost:5000/uploads/${req.file.filename}`;
    const username = req.body.username;

    // Çevrimiçi kullanıcıya avatar URL'sini ekleyin
    onlineUsers[username] = { ...onlineUsers[username], avatarUrl };
    res.json({ avatarUrl });
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// DynamoDB yapılandırması
AWS.config.update({
    region: "eu-central-1", // Bölgenizi buraya yazın
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

const docClient = new AWS.DynamoDB.DocumentClient();
const usersTable = "Users"; // DynamoDB tablonuzun adı

// Kullanıcı kaydı
app.post('/api/register', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).send('Kullanıcı adı ve şifre gereklidir.');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const params = {
        TableName: usersTable,
        Item: {
            username: username,
            password: hashedPassword
        }
    };

    try {
        await docClient.put(params).promise();
        res.status(201).send('Kullanıcı kaydedildi');
    } catch (error) {
        console.error('Kullanıcı kaydedilemedi:', error);
        res.status(500).send('Kullanıcı kaydedilemedi');
    }
});

// Kullanıcı girişi
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;

    const params = {
        TableName: usersTable,
        Key: {
            username: username
        }
    };

    try {
        const data = await docClient.get(params).promise();
        const user = data.Item;

        if (user && await bcrypt.compare(password, user.password)) {
            res.status(200).send('Giriş başarılı');
        } else {
            res.status(401).send('Geçersiz kullanıcı adı veya şifre');
        }
    } catch (error) {
        console.error('Giriş başarısız:', error);
        res.status(500).send('Giriş başarısız');
    }
});

// Socket.io bağlantısı
io.on('connection', (socket) => {
    console.log('Yeni bir kullanıcı bağlandı');

    // Kullanıcı bağlandığında çevrimiçi kullanıcıyı ekleyin
    socket.on('userConnected', (username) => {
        socket.username = username; // Kullanıcı adını saklayın
        onlineUsers[username] = { avatarUrl: null }; // Kullanıcıyı çevrimiçi kullanıcılar listesine ekleyin
        io.emit('updateOnlineUsers', Object.keys(onlineUsers));
    });

    // Kullanıcı ayrıldığında çevrimiçi listesinden çıkarın
    socket.on('disconnect', () => {
        delete onlineUsers[socket.username];
        io.emit('updateOnlineUsers', Object.keys(onlineUsers));
        console.log('Kullanıcı ayrıldı');
    });

    // Sesli iletişim kanalı
    socket.on('join-voice-channel', () => {
        socket.broadcast.emit('user-joined', socket.id);
    });

    socket.on('sending-signal', (payload) => {
        io.to(payload.userId).emit('receiving-signal', {
            signal: payload.signal,
            callerId: socket.id,
        });
    });

    socket.on('disconnect', () => {
        console.log('Kullanıcı ayrıldı');
    });
});

// Sunucuyu başlatma
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Sunucu ${PORT} portunda çalışıyor`);
});