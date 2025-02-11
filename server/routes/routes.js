const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Block = require("../models/Block");
const nodemailer = require("nodemailer");
const multer = require("multer");
const path = require("path");
const router = express.Router();

// Объявляем временное хранилище для регистрации до подтверждения
const pendingRegistrations = {};
const pendingEmailChanges = {};
const pendingPasswordChanges = {};

// Настройка транспорта для отправки почты
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "hshxhsyhs@gmail.com", // замените на ваш email
    pass: "mihr qnfw rpbx zqxl", // замените на ваш пароль или пароль приложения
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

// Настройка multer для загрузки файлов
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

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
    const confirmationCodeExpires = new Date(Date.now() + 10  * 60 * 1000);

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

router.post("/change-email", async (req, res) => {
  const { userId, newEmail } = req.body;

  try {
    // Находим пользователя по ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({ message: "Пользователь не найден" });
    }

    // Генерируем 6-значный код
    const confirmationCode = generateCode();
    const confirmationCodeExpires = new Date(Date.now() + 10 * 60 * 1000);

    // Сохраняем данные изменения почты во временное хранилище
    pendingEmailChanges[user.email] = {
      userId,
      newEmail,
      confirmationCode,
      confirmationCodeExpires,
    };

    // Отправляем код подтверждения на старый email
    await sendConfirmationEmail(user.email, confirmationCode);

    res.status(201).json({ message: "Код подтверждения отправлен на ваш старый email" });
  } catch (error) {
    console.error("Ошибка при изменении email:", error);
    res.status(500).json({ message: "Ошибка при изменении email" });
  }
});

router.post("/verify-email-change", async (req, res) => {
  const { oldEmail, code } = req.body;

  try {
    // Проверяем, есть ли данные изменения почты для данного email
    const pendingData = pendingEmailChanges[oldEmail];
    if (!pendingData) {
      return res.status(400).json({ message: "Нет ожидаемого изменения почты для данного email" });
    }

    // Проверяем корректность кода и его актуальность
    if (pendingData.confirmationCode !== code) {
      return res.status(400).json({ message: "Неверный код подтверждения" });
    }

    if (pendingData.confirmationCodeExpires < new Date()) {
      // Если время истекло, удаляем временные данные
      delete pendingEmailChanges[oldEmail];
      return res.status(400).json({ message: "Срок действия кода истёк" });
    }

    // Если код верный, обновляем email в базе
    const user = await User.findById(pendingData.userId);
    if (!user) {
      return res.status(400).json({ message: "Пользователь не найден" });
    }

    user.email = pendingData.newEmail;
    await user.save();

    // Удаляем временные данные изменения почты
    delete pendingEmailChanges[oldEmail];

    res.status(200).json({ message: "Email успешно изменён" });
  } catch (error) {
    console.error("Ошибка при проверке кода:", error);
    res.status(500).json({ message: "Ошибка при проверке кода" });
  }
});

router.post("/change-password", async (req, res) => {
  const { userId, currentPassword, newPassword } = req.body;

  try {
    // Находим пользователя по ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({ message: "Пользователь не найден" });
    }

    // Проверяем текущий пароль
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Неверный текущий пароль" });
    }

    // Генерируем 6-значный код
    const confirmationCode = generateCode();
    const confirmationCodeExpires = new Date(Date.now() + 10 * 60 * 1000);

    // Сохраняем данные изменения пароля во временное хранилище
    pendingPasswordChanges[user.email] = {
      userId,
      newPassword,
      confirmationCode,
      confirmationCodeExpires,
    };

    // Отправляем код подтверждения на email
    await sendConfirmationEmail(user.email, confirmationCode);

    res.status(201).json({ message: "Код подтверждения отправлен на ваш email" });
  } catch (error) {
    console.error("Ошибка при изменении пароля:", error);
    res.status(500).json({ message: "Ошибка при изменении пароля" });
  }
});

router.post("/verify-password-change", async (req, res) => {
  const { email, code } = req.body;

  try {
    // Проверяем, есть ли данные изменения пароля для данного email
    const pendingData = pendingPasswordChanges[email];
    if (!pendingData) {
      return res.status(400).json({ message: "Нет ожидаемого изменения пароля для данного email" });
    }

    // Проверяем корректность кода и его актуальность
    if (pendingData.confirmationCode !== code) {
      return res.status(400).json({ message: "Неверный код подтверждения" });
    }

    if (pendingData.confirmationCodeExpires < new Date()) {
      // Если время истекло, удаляем временные данные
      delete pendingPasswordChanges[email];
      return res.status(400).json({ message: "Срок действия кода истёк" });
    }

    // Если код верный, обновляем пароль в базе
    const user = await User.findById(pendingData.userId);
    if (!user) {
      return res.status(400).json({ message: "Пользователь не найден" });
    }

    user.password = await bcrypt.hash(pendingData.newPassword, 10);
    await user.save();

    // Удаляем временные данные изменения пароля
    delete pendingPasswordChanges[email];

    res.status(200).json({ message: "Пароль успешно изменён" });
  } catch (error) {
    console.error("Ошибка при проверке кода:", error);
    res.status(500).json({ message: "Ошибка при проверке кода" });
  }
});

router.post("/change-name", async (req, res) => {
  const { userId, newName } = req.body;

  try {
    // Проверяем, существует ли уже пользователь с таким именем
    const existingUser = await User.findOne({ name: newName });
    if (existingUser) {
      return res.status(400).json({ message: "Пользователь с таким именем уже существует" });
    }

    // Находим пользователя по ID и обновляем имя
    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({ message: "Пользователь не найден" });
    }

    user.name = newName;
    await user.save();

    res.status(200).json({ message: "Имя успешно изменено" });
  } catch (error) {
    console.error("Ошибка при изменении имени:", error);
    res.status(500).json({ message: "Ошибка при изменении имени" });
  }
});

router.post("/upload-profile-picture", upload.single("profilePicture"), async (req, res) => {
  const { userId } = req.body;
  const profilePicture = req.file.path;

  try {
    // Находим пользователя по ID и обновляем путь к фотографии профиля
    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({ message: "Пользователь не найден" });
    }

    user.profilePicture = profilePicture;
    await user.save();

    res.status(200).json({ message: "Фотография профиля успешно обновлена", profilePicture });
  } catch (error) {
    console.error("Ошибка при обновлении фотографии профиля:", error);
    res.status(500).json({ message: "Ошибка при обновлении фотографии профиля" });
  }
});

router.get("/check-session", (req, res) => {
  console.log("Сессия:", req.session);
  if (req.session.user) {
    res.json({ user: req.session.user });
  } else {
    res.status(401).json({ message: "Сессия отсутствует" });
  }
});


// 📌 Сохранение блока в БД
router.post("/save-block", async (req, res) => {
  try {
    const { name, structure, styles, script } = req.body;

    const newBlock = new Block({ name, structure, styles, script });
    await newBlock.save();

    res.json({ message: "Блок успешно сохранён!", block: newBlock });
  } catch (error) {
    console.error("Ошибка сохранения блока:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

// 📌 Получение всех блоков
router.get("/blocks", async (req, res) => {
  try {
    const blocks = await Block.find();
    res.json(blocks);
  } catch (error) {
    console.error("Ошибка получения блоков:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});
module.exports = router;
