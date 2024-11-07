const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const bcrypt = require('bcrypt');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand, PutCommand } = require('@aws-sdk/lib-dynamodb');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(cors());
app.use(express.json());

const client = new DynamoDBClient({ region: 'us-east-1' });
const docClient = DynamoDBDocumentClient.from(client);
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
        await docClient.send(new PutCommand(params));
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
        const data = await docClient.send(new GetCommand(params));
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

    socket.on('channel-message', (msg) => {
        console.log('Mesaj alındı:', msg);
        io.to(`message-${msg.channelId}`).emit(`message-${msg.channelId}`, msg);
    });

    socket.on('join-channel', (channelId) => {
        socket.join(`message-${channelId}`);
    });

    socket.on('leave-channel', (channelId) => {
        socket.leave(`message-${channelId}`);
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
