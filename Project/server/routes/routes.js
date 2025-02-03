const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User"); // Подключаем модель пользователя
const router = express.Router();

// 📌 Регистрация пользователя
  router.post("/register", async (req, res) => {
    const { name, email, phone, password,} = req.body;

    try {
      // Проверка существования пользователя
      const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
      if (existingUser) {
        return res.status(400).json({ message: "Пользователь с таким email или телефоном уже существует" });
      }

      // Хеширование пароля
      const hashedPassword = await bcrypt.hash(password, 10);
      console.log("Хешированный пароль при регистрации:", hashedPassword);  // Логируем хеш пароля

      // Создание нового пользователя
      const newUser = new User({
        name,
        email,
        phone,
        password: hashedPassword,
      });

      // Сохранение пользователя
      await newUser.save();

      // Успешный ответ
      res.status(201).json({ message: "Пользователь успешно зарегистрирован" });

    } catch (error) {
      console.error("Ошибка при регистрации:", error);
      res.status(500).json({ message: "Ошибка при регистрации пользователя" });
    }
  });

// 📌 Авторизация пользователя
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Находим пользователя по email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Неверный email или пароль" });
    }

    // Сравниваем пароль с хешированным
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Неверный email или пароль" });
    }

    // Сохраняем данные в сессии, включая роль
    req.session.user = {
      id: user._id,
      name: user.name,
      role: user.role, // Добавляем роль пользователя в сессию
      email: user.email,
      status_sub: user.status_sub,

    };

    res.json({ message: "Успешный вход" });

  } catch (error) {
    console.error("Ошибка при авторизации:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

// 📌 Проверка сессии
router.get("/me", (req, res) => {
  if (req.session.user) {
    res.json({ user: req.session.user });
  } else {
    res.status(401).json({ message: "Нет активной сессии" });
  }
});

// 📌 Выход из системы
router.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("connect.sid");
    res.json({ message: "Вы вышли из системы" });
  });
});

module.exports = router;
