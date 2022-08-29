const mongoose = require("mongoose");

const hamaPenyakitSchema = mongoose.Schema(
  {
    kode: {
      type: String,
      required: [true, "Kode tidak boleh kosong!"],
    },
    nama: {
      type: String,
      required: [true, "Nama tidak boleh kosong!"],
    },
    foto: {
      type: String,
    },
    deskripsi: {
      type: String,
    },
    solusi: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Solusi",
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("HamaPenyakit", hamaPenyakitSchema);
