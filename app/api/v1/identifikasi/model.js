const mongoose = require("mongoose");

const identifikasiSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  tanggal: {
    type: String,
  },
  gejalaYangDipilih: [
    {
      type: Object,
    },
  ],
  basisPengetahuan: [
    {
      type: Object,
    },
  ],
  rule: [
    {
      type: Object,
    },
  ],
  hasilIdentifikasiHamaPenyakit: [
    {
      type: Object,
    },
  ],
});

module.exports = mongoose.model("Identifikasi", identifikasiSchema);
