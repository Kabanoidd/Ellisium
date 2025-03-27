const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, default: 'user' },
  status_sub: { type: String, default: "Гость" },
  confirmationCode: { type: String },
  confirmationCodeExpires: { type: Date },
  // Добавляем поле для фото профиля
  profilePicture: { type: String, default: "" },
  // Поле collection – массив ObjectId, ссылающихся на модель Block
  collection: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "Block",
    default: []
  }
});

const User = mongoose.model('User', userSchema);
module.exports = User;
