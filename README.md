# IoT Hub: Remote Control & OTA Firmware Provider

Прагматичная система для управления парком микроконтроллеров (ESP32) с поддержкой удаленной прошивки (OTA) и мониторинга логов в реальном времени.

## 🏗 Архитектура системы

Система разделена на три ключевых узла:
1. **Workstation (MacBook Air M4):** Среда разработки (VS Code + PlatformIO). Отсюда компилируются бинарники и пушится код.
2. **IoT Server (LMDE 6 / Debian):** Домашний сервер на базе старого MacBook. Работает 24/7 в Docker-контейнере. Принимает прошивки и транслирует логи.
3. **Devices (ESP32):** Конечные устройства, которые получают обновления по Wi-Fi и отправляют телеметрию.



## 🚀 Функционал
- **Over-the-Air (OTA) Updates:** Раздача бинарных файлов прошивки (`.bin`) по HTTP.
- **Real-time Logging:** Прием логов от устройств через HTTP POST и мгновенная трансляция в веб-интерфейс через WebSockets (Socket.io).
- **Centralized Dashboard:** React-приложение для мониторинга статуса всех устройств в сети.

## 📂 Структура проекта
```text
.
├── server.js            # Node.js сервер (Express + Socket.io)
├── package.json         # Зависимости бэкенда
├── .gitignore           # Исключения для Git (node_modules, uploads)
├── uploads/             # Папка для хранения firmware.bin (создать вручную!)
├── public/              # Статика для React-дашборда
└── firmware_esp32/      # Исходный код для PlatformIO (C++)