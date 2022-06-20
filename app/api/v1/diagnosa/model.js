const mongoose = require("mongoose");

const diagnosaSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  tanggal: {
    type: String,
  },
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
});

module.exports = mongoose.model("Diagnosa", diagnosaSchema);
