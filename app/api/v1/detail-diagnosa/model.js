const mongoose = require("mongoose");

const detailDiagnosaSchema = mongoose.Schema(
  {
    hamaPenyakit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "HamaPenyakit",
    },
    cfCombine: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("DetailDiagnosa", detailDiagnosaSchema);
