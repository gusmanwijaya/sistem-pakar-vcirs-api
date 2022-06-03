const mongoose = require("mongoose");

const diagnosaSchema = mongoose.Schema(
  {
    cfCombine: {
      type: Number,
      default: 0,
    },
    percentage: {
      type: String,
    },
    hamaPenyakit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "HamaPenyakit",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Diagnosa", diagnosaSchema);
