const mongoose = require("mongoose");

const gejalaSchema = mongoose.Schema(
  {
    kode: {
      type: String,
      required: [true, "Kode tidak boleh kosong!"],
    },
    deskripsi: {
      type: String,
      required: [true, "Deskripsi tidak boleh kosong!"],
    },
    foto: {
      type: String,
    },
    cfPakar: {
      type: Number,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Gejala", gejalaSchema);
