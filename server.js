const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const multer = require('multer');
const fs = require('fs');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const AWS = require('aws-sdk');

dotenv.config();

const app = express();
app.use(express.json());

// DynamoDB client
const dynamoDB = new AWS.DynamoDB.DocumentClient({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: 'eu-central-1',
});

// S3 client (v3)
const s3 = new S3Client({
    region: 'eu-central-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

// Multer dosya yükleme ayarları
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

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

// Dosya yükleme işlemi (AWS S3 ile)
const uploadFileToS3 = async (file) => {
    const fileStream = fs.createReadStream(file.path);

    const uploadParams = {
        Bucket: 'myapp-profile-images', // S3 bucket adınızı buraya yazın
        Key: `profile-images/${file.filename}`,
        Body: fileStream
    };

    try {
        const data = await s3.send(new PutObjectCommand(uploadParams));
        console.log('Dosya başarıyla yüklendi:', data);
        return `https://${uploadParams.Bucket}.s3.${s3.config.region}.amazonaws.com/${uploadParams.Key}`;
    } catch (err) {
        console.error('Dosya yükleme hatası:', err);
        throw err;
    }
};

// Dosya yükleme API'si
app.post('/api/upload', verifyToken, upload.single('profileImage'), async (req, res) => {
    if (!req.file) {
        return res.status(400).send('Lütfen bir dosya yükleyin.');
    }

    try {
        const fileUrl = await uploadFileToS3(req.file);
        res.status(200).send({ message: 'Dosya başarıyla yüklendi', fileUrl });
    } catch (err) {
        res.status(500).send('Dosya yüklenirken bir hata oluştu.');
    }
});

// Korunan rota (JWT ile doğrulama)
app.get('/api/protected', verifyToken, (req, res) => {
    res.send(`Merhaba, kullanıcı ${req.userId}`);
});

// Sunucu dinlemeye başla
app.listen(3000, () => {
    console.log('Sunucu 3000 portunda çalışıyor...');
});
