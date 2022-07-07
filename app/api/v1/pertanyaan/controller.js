const { StatusCodes } = require("http-status-codes");
const CustomError = require("../../../error");
const HamaPenyakit = require("../hama-penyakit/model");

module.exports = {
  getAll: async (req, res, next) => {
    try {
      const { page = 1, limit = 1 } = req.query;

      const data = await HamaPenyakit.find()
        .select("_id kode nama foto deskripsi gejala solusi")
        .limit(limit)
        .skip(limit * (page - 1))
        .populate({
          path: "gejala",
          select: "_id kode deskripsi foto pertanyaan",
          model: "Gejala",
        })
        .populate({
          path: "solusi",
          select: "_id deskripsi",
          model: "Solusi",
        });

      const count = await HamaPenyakit.countDocuments();

      res.status(StatusCodes.OK).json({
        statusCode: StatusCodes.OK,
        message: "Berhasil mendapatkan data pertanyaan",
        current_page: parseInt(page),
        total_page: Math.ceil(count / limit),
        total_data: count,
        data,
      });
    } catch (error) {
      next(error);
    }
  },
};
