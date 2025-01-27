const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// Загрузка переменных окружения
dotenv.config();

// Подключение к базе данных
connectDB();

const app = express();

// Middleware
app.use(express.json()); // Парсинг JSON
app.use(cors()); // Разрешить CORS

// Пример маршрута
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Импорт маршрутов
const exampleRoutes = require('./routes/example');
app.use('/api/example', exampleRoutes);

// Настройка порта
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
