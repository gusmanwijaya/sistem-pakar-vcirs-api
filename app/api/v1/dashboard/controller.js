const { StatusCodes } = require("http-status-codes");
const CustomError = require("../../../../app/error");
const Gejala = require("../gejala/model");
const BasisPengetahuan = require("../basis-pengetahuan/model");
const HamaPenyakit = require("../hama-penyakit/model");
const Diagnosa = require("../diagnosa/model");
const Pertanyaan = require("../pertanyaan/model");
const Solusi = require("../solusi/model");
const Pengguna = require("../auth/model");

module.exports = {
  getAll: async (req, res, next) => {
    try {
      const { user } = req.query;

      let condition = {};
      if (user) {
        condition = {
          user,
        };
      }

      const basisPengetahuan = await BasisPengetahuan.countDocuments();
      const hasilDiagnosa = await Diagnosa.countDocuments(condition);
      const gejala = await Gejala.countDocuments();
      const hamaPenyakit = await HamaPenyakit.countDocuments();
      const pertanyaan = await Pertanyaan.countDocuments();
      const solusi = await Solusi.countDocuments();
      const pengguna = await Pengguna.countDocuments({ role: "pengguna" });

      res.status(StatusCodes.OK).json({
        statusCode: StatusCodes.OK,
        message: "Berhasil mendapatkan data dashboard",
        data: {
          basisPengetahuan,
          hasilDiagnosa,
          gejala,
          hamaPenyakit,
          pertanyaan,
          solusi,
          pengguna,
        },
      });
    } catch (error) {
      next(error);
    }
  },
};
