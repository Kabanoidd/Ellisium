const mongoose = require("mongoose");

const BlockSchema = new mongoose.Schema({
  name: { type: String, required: true },
  structure: { type: Object, required: true },
  styles: { type: Object, required: true },
  script: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Block", BlockSchema);