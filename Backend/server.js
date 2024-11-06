const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const fs = require('fs').promises;
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(cors());
app.use(express.json());

// Kullanıcı verilerini saklamak için JSON dosyası
const usersFilePath = './users.json';

// Kullanıcı kaydı
app.post('/api/register', async (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        // Kullanıcı verilerini dosyadan okuma
        const data = await fs.readFile(usersFilePath, 'utf8');
        const users = JSON.parse(data || '[]');

        // Kullanıcı adı kontrolü
        if (users.find(user => user.username === username)) {
            return res.status(400).send('Kullanıcı adı zaten mevcut');
        }

        // Yeni kullanıcıyı ekleme
        users.push({ username, password: hashedPassword });
        await fs.writeFile(usersFilePath, JSON.stringify(users));
        res.status(201).send('Kullanıcı kaydedildi');
    } catch (err) {
        res.status(500).send('Kullanıcı kaydedilemedi');
    }
});

// Kullanıcı girişi
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        // Kullanıcı verilerini dosyadan okuma
        const data = await fs.readFile(usersFilePath, 'utf8');
        const users = JSON.parse(data || '[]');
        const user = users.find(user => user.username === username);

        if (user && await bcrypt.compare(password, user.password)) {
            const token = jwt.sign({ username: user.username }, process.env.JWT_SECRET, { expiresIn: '1h' });
            res.json({ token });
        } else {
            res.status(401).send('Geçersiz kullanıcı adı veya şifre');
        }
    } catch (err) {
        res.status(500).send('Giriş başarısız');
    }
});

// Socket.io bağlantısı
io.on('connection', (socket) => {
    console.log('Yeni bir kullanıcı bağlandı');

    socket.on('user-joined', (userId) => {
        socket.broadcast.emit('user-joined', userId);
    });

    socket.on('sending-signal', (data) => {
        socket.broadcast.emit('receiving-signal', data);
    });

    socket.on('disconnect', () => {
        console.log('Kullanıcı ayrıldı');
        socket.broadcast.emit('user-left', socket.id); // Kullanıcı ayrıldığında bildirim gönder
    });
});

// Sunucuyu başlatma
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Sunucu ${PORT} portunda çalışıyor`);
});
