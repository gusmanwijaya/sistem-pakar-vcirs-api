const mongoose = require("mongoose");

const pertanyaanSchema = mongoose.Schema(
  {
    pertanyaan: {
      type: String,
      required: [true, "Pertanyaan tidak boleh kosong!"],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Pertanyaan", pertanyaanSchema);
