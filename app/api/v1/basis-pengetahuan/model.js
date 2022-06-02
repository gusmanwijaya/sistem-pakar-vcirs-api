const mongoose = require("mongoose");

const basisPengetahuanSchema = mongoose.Schema(
  {
    hamaPenyakit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "HamaPenyakit",
    },
    gejala: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Gejala",
    },
    cfPakar: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("BasisPengetahuan", basisPengetahuanSchema);
