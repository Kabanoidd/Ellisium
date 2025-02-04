const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const nodemailer = require("nodemailer");
const router = express.Router();

// Объявляем временное хранилище для регистрации до подтверждения
const pendingRegistrations = {};

// Настройка транспорта для отправки почты
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "hshxhsyhs@gmail.com", // замените на ваш email
    pass: "NMH44D43",         // замените на ваш пароль или пароль приложения
  },
});

const generateCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const sendConfirmationEmail = async (email, code) => {
  const mailOptions = {
    from: "hshxhsyhs@gmail.com", // или ваш email, который используется для отправки
    to: email, // письмо отправится на ту почту, которую ввёл пользователь
    subject: "Код подтверждения",
    text: `Ваш код подтверждения: ${code}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Код подтверждения отправлен на email:", email);
  } catch (error) {
    console.error("Ошибка при отправке email:", error);
  }
};

router.post("/register", async (req, res) => {
  const { name, email, phone, password } = req.body;

  try {
    // Проверяем, существует ли уже пользователь в БД
    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
    if (existingUser) {
      return res.status(400).json({ message: "Пользователь с таким email или телефоном уже существует" });
    }

    // Генерируем 6-значный код
    const confirmationCode = generateCode();
    const confirmationCodeExpires = new Date(Date.now() + 10 * 60 * 1000);

    // Захешируем пароль
    const hashedPassword = await bcrypt.hash(password, 10);

    // Сохраняем данные регистрации во временное хранилище
    pendingRegistrations[email] = {
      name,
      email,
      phone,
      password: hashedPassword,
      confirmationCode,
      confirmationCodeExpires,
    };

    // Отправляем код подтверждения на email
    await sendConfirmationEmail(email, confirmationCode);

    res.status(201).json({ message: "Код подтверждения отправлен на ваш email" });
  } catch (error) {
    console.error("Ошибка при регистрации:", error);
    res.status(500).json({ message: "Ошибка при регистрации пользователя" });
  }
});

router.post("/verify-code", async (req, res) => {
  const { email, code } = req.body;

  try {
    // Проверяем, есть ли данные регистрации для данного email
    const pendingData = pendingRegistrations[email];
    if (!pendingData) {
      return res.status(400).json({ message: "Нет ожидаемой регистрации для данного email" });
    }

    // Проверяем корректность кода и его актуальность
    if (pendingData.confirmationCode !== code) {
      return res.status(400).json({ message: "Неверный код подтверждения" });
    }

    if (pendingData.confirmationCodeExpires < new Date()) {
      // Если время истекло, удаляем временные данные
      delete pendingRegistrations[email];
      return res.status(400).json({ message: "Срок действия кода истёк" });
    }

    // Если код верный, сохраняем данные в базу
    const newUser = new User({
      name: pendingData.name,
      email: pendingData.email,
      phone: pendingData.phone,
      password: pendingData.password,
    });
    await newUser.save();

    // Удаляем временные данные регистрации
    delete pendingRegistrations[email];

    res.status(200).json({ message: "Регистрация завершена" });
  } catch (error) {
    console.error("Ошибка при проверке кода:", error);
    res.status(500).json({ message: "Ошибка при проверке кода" });
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
