const mongoose = require("mongoose");

const diagnosaSchema = mongoose.Schema(
  {
    nilai: {
      type: Number,
      default: 0,
    },
    hasilHamaPenyakit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "HamaPenyakit",
    },
    persentase: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Diagnosa", diagnosaSchema);
