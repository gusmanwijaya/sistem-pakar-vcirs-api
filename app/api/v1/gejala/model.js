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
    credit: {
      type: Number,
      default: 1,
    },
    numOfNode: {
      type: Number,
      required: [true, "Num of node tidak boleh kosong!"],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Gejala", gejalaSchema);
