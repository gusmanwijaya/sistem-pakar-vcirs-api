const mongoose = require("mongoose");

const solusiSchema = mongoose.Schema(
  {
    deskripsi: {
      type: String,
      required: [true, "Deskripsi tidak boleh kosong!"],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Solusi", solusiSchema);
