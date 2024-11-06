const express = require('express');
const AWS = require('aws-sdk');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
app.use(express.json());

// DynamoDB client
const dynamoDB = new AWS.DynamoDB.DocumentClient({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: 'eu-central-1',
});

// JWT doğrulama middleware
function verifyToken(req, res, next) {
    const token = req.headers['authorization'];

    if (!token) {
        return res.status(403).send('Token gerekli');
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).send('Geçersiz token');
        }

        req.userId = decoded.userId;
        next();
    });
}

// Kullanıcı kaydı
app.post('/api/register', async (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const params = {
        TableName: 'users',
        Item: {
            userId: AWS.util.uuid.v4(),
            username: username,
            password: hashedPassword
        }
    };

    try {
        await dynamoDB.put(params).promise();
        res.status(201).send('Kullanıcı kaydedildi');
    } catch (err) {
        res.status(500).send('Kullanıcı kaydedilemedi');
    }
});

// Kullanıcı girişi ve JWT üretme
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;

    const params = {
        TableName: 'users',
        Key: { username: username }
    };

    try {
        const data = await dynamoDB.get(params).promise();
        const user = data.Item;

        if (user && await bcrypt.compare(password, user.password)) {
            const token = jwt.sign({ userId: user.userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
            res.json({ token });
        } else {
            res.status(401).send('Geçersiz kullanıcı adı veya şifre');
        }
    } catch (err) {
        res.status(500).send('Giriş başarısız');
    }
});

// Korunan rota (JWT ile doğrulama)
app.get('/api/protected', verifyToken, (req, res) => {
    res.send(`Merhaba, kullanıcı ${req.userId}`);
});

// Uygulamayı dinle
app.listen(3000, () => {
    console.log('Sunucu 3000 portunda çalışıyor...');
});
