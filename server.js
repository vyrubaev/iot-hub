const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const multer = require('multer');
const path = require('path');
const { Pool } = require('pg'); // Перенес наверх для порядка

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// --- НАСТРОЙКИ MIDDLEWARE ---
app.use(express.json()); // Теперь JSON доступен во всех запросах
app.use(express.static('public')); 
app.use('/firmware', express.static('uploads'));

// --- НАСТРОЙКИ POSTGRES ---
const pool = new Pool({
  user: 'postgres',           
  host: 'localhost',          
  database: 'iot_hub_db',     
  password: '2310819', 
  port: 5432,
});

// --- ЗАГРУЗКА ПРОШИВОК ---
const storage = multer.diskStorage({
    destination: './uploads/',
    filename: (req, file, cb) => cb(null, 'firmware.bin')
});
const upload = multer({ storage });

app.post('/upload-firmware', upload.single('file'), (req, res) => {
    console.log('Новая прошивка загружена!');
    io.emit('update_available', { version: Date.now() });
    res.sendStatus(200);
});

// --- ПРИЕМ ЛОГОВ И ЗАПИСЬ В БД ---
app.post('/log', async (req, res) => {
    const { device, message, temp, uptime } = req.body; // Добавил temp и uptime из прошлых шагов
    const now = new Date().toLocaleString();
    console.log(`[${device}]: ${message || 'Данные получены'}`);

    try {
        // Записываем в таблицу 
        const result = await pool.query(
            'INSERT INTO measurements (temp, uptime) VALUES ($1, $2) RETURNING id',
            [temp || 0, uptime || 0]
        );
        
        // Теперь result существует, и мы можем взять ID новой строки
        const newId = result.rows[0].id;
        console.log(`[${now}] ✅ Данные от ${device} сохранены. ID в базе: ${newId}`);
        
        // Отправляем в React через сокеты для "живого" обновления
        io.emit('device_log', { 
            device, 
            message, 
            temp, 
            uptime, 
            time: new Date() 
        });
        
        res.sendStatus(200);
    } catch (err) {
        console.error('❌ ОШИБКА БАЗЫ ДАННЫХ:', err.message);
        res.status(500).send('Database Error');
    }
});

// --- SOCKET.IO ---
io.on('connection', (socket) => {
    console.log('Клиент (React или ESP32) подключился');
});

const PORT = 3000;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`Сервер запущен на : http://0.0.0.0:${PORT}`);
});