const { StatusCodes } = require("http-status-codes");
const CustomError = require("../../../../app/error");
const Gejala = require("../gejala/model");
const BasisPengetahuan = require("../basis-pengetahuan/model");
const HamaPenyakit = require("../hama-penyakit/model");
const Solusi = require("../solusi/model");
const Pengguna = require("../auth/model");

module.exports = {
  getAll: async (req, res, next) => {
    try {
      const basisPengetahuan = await BasisPengetahuan.countDocuments();
      const gejala = await Gejala.countDocuments();
      const hamaPenyakit = await HamaPenyakit.countDocuments();
      const solusi = await Solusi.countDocuments();
      const pengguna = await Pengguna.countDocuments({ role: "pengguna" });

      res.status(StatusCodes.OK).json({
        statusCode: StatusCodes.OK,
        message: "Berhasil mendapatkan data dashboard",
        data: {
          basisPengetahuan,
          gejala,
          hamaPenyakit,
          solusi,
          pengguna,
        },
      });
    } catch (error) {
      next(error);
    }
  },
};
