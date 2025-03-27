const mongoose = require("mongoose");

const BlockSchema = new mongoose.Schema({
  name: { type: String, required: true },
  structure: { type: Object, required: true, default: {} },
  styles: { type: Object, required: false, default: {} }, // теперь не обязательное
  script: { type: String, default: "" },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  username: { type: String, required: true },
  // Обязательное поле для фото-превью
  preview: {
    data: { type: Buffer, required: true },
    contentType: { type: String, required: true },
  },
  // Поле для остальных изображений, загруженных из архива
  images: [
    {
      data: { type: Buffer },
      contentType: { type: String },
    },
  ],
  // Новое поле для ключевых слов (обязательное)
  keywords: { type: [String], required: true },
  createdAt: { type: Date, default: Date.now },
  published: { type: Boolean, default: false },
});

module.exports = mongoose.model("Block", BlockSchema);
