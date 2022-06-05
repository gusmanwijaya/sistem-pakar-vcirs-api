const mongoose = require("mongoose");

const pertanyaanSchema = mongoose.Schema(
  {
    pertanyaan: {
      type: String,
      required: [true, "Pertanyaan tidak boleh kosong!"],
    },
    gejala: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Gejala",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Pertanyaan", pertanyaanSchema);
