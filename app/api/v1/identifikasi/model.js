const mongoose = require("mongoose");

const identifikasiSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  tanggal: {
    type: String,
  },
  hamaPenyakit: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "HamaPenyakit",
  },
  cfUser: [
    {
      type: Number,
    },
  ],
  variable: [
    {
      _id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Gejala",
      },
      kode: {
        type: String,
      },
      deskripsi: {
        type: String,
      },
      pertanyaan: {
        type: String,
      },
    },
  ],
  totalVariable: {
    type: Number,
  },
  variableOrder: [
    {
      gejala: {
        type: String,
      },
      urutan: {
        type: Number,
      },
    },
  ],
  numOfNode: [
    {
      gejala: {
        type: String,
      },
      numOfNode: {
        type: Number,
      },
    },
  ],
  VUR: [
    {
      type: Number,
    },
  ],
  sumVUR: {
    type: Number,
  },
  NUR: {
    type: Number,
  },
  RUR: {
    type: Number,
  },
  cfPakar: [
    {
      gejala: {
        type: String,
      },
      cfPakar: {
        type: Number,
      },
    },
  ],
  CFR: [
    {
      type: Number,
    },
  ],
  _tempCfCombine: [
    {
      type: Number,
    },
  ],
  cfCombine: {
    type: Number,
  },
  percentage: {
    type: String,
  },
});

module.exports = mongoose.model("Identifikasi", identifikasiSchema);
