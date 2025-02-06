const express = require("express");
const connectDB = require("./config/db.js"); // Подключение к базе данных
const cors = require("cors");
const session = require("express-session");
const routes = require("./routes/routes.js"); // Подключаем все маршруты из routes.js

const app = express();

// Подключение к базе данных
connectDB();

// Настройка CORS для поддержки сессий
app.use(cors({
  origin: "http://localhost:5173", // URL фронтенда
  credentials: true, // Включаем поддержку кук
}));

// Middleware для обработки JSON
app.use(express.json());

// Настройка сессий
app.use(session({
  secret: 'your_secret_key',  
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: false,  
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24,  
  },
}));

// Используем маршруты
app.use("/api", routes); // Теперь все маршруты будут начинаться с /api

// Запуск сервера
app.listen(3002, () => {
  console.log("Server running on port 3002");
});
