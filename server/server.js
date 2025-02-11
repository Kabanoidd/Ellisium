const express = require("express");
const session = require("express-session");
const mongoose = require("mongoose");
const cors = require("cors"); // Импортируем пакет cors
const routes = require("./routes/routes.js"); // Подключаем все маршруты из routes.js

const app = express();

// Middleware для обработки JSON
app.use(express.json());

// Настройка CORS
app.use(cors({
  origin: "http://localhost:5173", // Разрешаем запросы с этого домена
  credentials: true, // Разрешаем отправку куки
}));

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

// Подключение к MongoDB
mongoose.connect("mongodb://localhost:27017/Ellisium", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log("Connected to MongoDB");
  app.listen(3002, () => {
    console.log("Server is running on port 3002");
  });
}).catch((error) => {
  console.error("Error connecting to MongoDB:", error);
});
