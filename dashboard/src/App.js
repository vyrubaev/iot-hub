import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

// Подключаемся к твоему серверу на LMDE
const socket = io('http://192.168.88.33:3000'); 

function App() {
  const [logs, setLogs] = useState([]);
  const [status, setStatus] = useState("Подключение...");

  useEffect(() => {
    // 1. Первичная загрузка последних 10 записей из базы
    fetch('http://192.168.88.33:3000/api/status')
      .then(res => res.json())
      .then(data => {
        setLogs(data);
        setStatus("Данные получены из БД");
      })
      .catch(err => setStatus("Ошибка связи с сервером"));

    // 2. Слушаем "живые" логи через сокеты
    socket.on('device_log', (newLog) => {
      setLogs(prevLogs => [newLog, ...prevLogs.slice(0, 9)]); // Добавляем новый лог в начало
    });

    return () => socket.off('device_log');
  }, []);

  return (
    <div style={{ textAlign: 'center', marginTop: '30px', fontFamily: 'sans-serif' }}>
      <h1>🛰️ Панель управления ESP32-C6</h1>
      <p style={{ color: status.includes('Ошибка') ? 'red' : 'green' }}>{status}</p>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
        {logs.length > 0 ? (
          logs.map((log, index) => (
            <div key={index} style={{
              border: '1px solid #ccc',
              borderRadius: '8px',
              padding: '15px',
              minWidth: '200px',
              backgroundColor: index === 0 ? '#f0f9ff' : 'white', // Подсветим самый новый
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <h3 style={{ margin: '0 0 10px 0' }}>🌡 {log.temp}°C</h3>
              <p style={{ fontSize: '14px', color: '#666' }}>Uptime: {log.uptime} сек</p>
              <small style={{ color: '#999' }}>{new Date(log.created_at || log.time).toLocaleTimeString()}</small>
            </div>
          ))
        ) : (
          <p>Логи пока не поступили...</p>
        )}
      </div>
    </div>
  );
}

export default App;