const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema({
  name: { type: String, required: true }, // 🆕 Название проекта (теперь обязательное)
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  userName: { type: String, required: true },
  blocks: [
    {
      id: { type: String, required: true },
      html: { type: Object, required: true }, // Храним HTML как объект
      css: { type: Object, required: true },  // Храним CSS как объект
      js: { type: String, required: false },  // JS храним как строку
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Project", projectSchema);
