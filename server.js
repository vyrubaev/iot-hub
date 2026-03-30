const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const multer = require('multer');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// Настройка хранилища для прошивок
const storage = multer.diskStorage({
    destination: './uploads/',
    filename: (req, file, cb) => cb(null, 'firmware.bin')
});
const upload = multer({ storage });

app.use(express.static('public')); // Для будущего React билда
app.use('/firmware', express.static('uploads')); // Папка, откуда ESP32 заберет файл

// 1. Эндпоинт для загрузки прошивки 
app.post('/upload-firmware', upload.single('file'), (req, res) => {
    console.log('Новая прошивка загружена!');
    // Оповещаем все подключенные ESP32 (через сокеты, если они их поддерживают)
    io.emit('update_available', { version: Date.now() });
    res.sendStatus(200);
});

// 2. Прием логов от ESP32 (через обычный POST)
app.use(express.json());
app.post('/log', (req, res) => {
    const { device, message } = req.body;
    console.log(`[${device}]: ${message}`);
    // Пробрасываем лог сразу в React Dashboard
    io.emit('device_log', { device, message, time: new Date() });
    res.sendStatus(200);
});

// Socket.io для общения с Дашбордом
io.on('connection', (socket) => {
    console.log('Кто-то подключился к дашборду');
});

const PORT = 3000;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`Сервер запущен на http://0.0.0.0:${PORT}`);
});