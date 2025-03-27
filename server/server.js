const express = require("express");
const session = require("express-session");
const cors = require("cors");
const path = require("path");
const cookieParser = require("cookie-parser");
const routes = require("./routes/routes.js");
const connectDB = require("./config/db.js"); // Импорт подключения к БД

const app = express();

// Парсинг cookies
app.use(cookieParser());

// Middleware для обработки JSON и URL-кодированных данных
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Настройка CORS
app.use(cors({
  origin: "http://localhost:5173", // Разрешаем запросы с указанного домена
  credentials: true,               // Разрешаем отправку куки
}));

// Настройка сессий
app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: false,                // Для разработки, на продакшене рекомендуется использовать true (HTTPS)
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24,    // 24 часа
  },
}));

// Middleware для установки req.user из сессии
app.use((req, res, next) => {
  if (req.session && req.session.user) {
    req.user = req.session.user;
  }
  next();
});

// Подключение маршрутов (все маршруты будут начинаться с /api)
app.use("/api", routes);

// Пример дополнительных маршрутов
app.post("/api/save-block", (req, res) => {
  console.log("SESSION:", req.session);
  console.log("USER:", req.session.user);

  if (!req.session.user) {
    return res.status(401).json({ message: "Unauthorized: No user session" });
  }

  res.json({ message: "Block saved successfully!" });
});

app.get("/api/me", (req, res) => {
  console.log("CHECK SESSION:", req.session);
  if (req.session.user) {
    res.json({ user: req.session.user });
  } else {
    res.status(401).json({ message: "Unauthorized" });
  }
});

// Раздаём файлы из папки uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Подключаемся к базе данных и запускаем сервер
connectDB().then(() => {
  app.listen(3002, () => {
    console.log("Server is running on port 3002");
  });
});

