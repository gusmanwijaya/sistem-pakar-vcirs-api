const { StatusCodes } = require("http-status-codes");
const CustomError = require("../../../error");
const Identifikasi = require("../identifikasi/model");

module.exports = {
  getHighest: async (req, res, next) => {
    try {
      const { user, tanggal } = req.query;

      const _temp = await Identifikasi.find({ user, tanggal })
        .select("_id user tanggal cfCombine")
        .sort({
          cfCombine: "asc",
        });

      if (_temp.length < 0)
        throw new CustomError.NotFound("Data identifikasi tidak tersedia!");

      let _tempIdIdentifikasi = [];
      for (let index = 0; index < _temp.length; index++) {
        _tempIdIdentifikasi.push(_temp[index]?._id);
      }

      const popId = _tempIdIdentifikasi.pop();

      await Identifikasi.deleteMany({
        _id: {
          $in: _tempIdIdentifikasi,
        },
      });

      const data = await Identifikasi.findOne({
        _id: popId,
        user,
        tanggal,
      })
        .populate({
          path: "user",
          select: "_id name username role",
          model: "User",
        })
        .populate({
          path: "hamaPenyakit",
          select: "_id kode nama gejala solusi deskripsi foto",
          model: "HamaPenyakit",
          populate: [
            {
              path: "gejala",
              select: "_id kode deskripsi pertanyaan foto",
              model: "Gejala",
            },
            {
              path: "solusi",
              select: "_id deskripsi",
              model: "Solusi",
            },
          ],
        });

      res.status(StatusCodes.OK).json({
        statusCode: StatusCodes.OK,
        message: "Berhasil mendapatkan data identifikasi tertinggi",
        data,
      });
    } catch (error) {
      next(error);
    }
  },
  getForUser: async (req, res, next) => {
    try {
      const data = await Identifikasi.find({ user: req.user._id })
        .populate({
          path: "user",
          select: "_id name username role",
          model: "User",
        })
        .populate({
          path: "hamaPenyakit",
          select: "_id kode nama gejala solusi deskripsi foto",
          model: "HamaPenyakit",
          populate: [
            {
              path: "gejala",
              select: "_id kode deskripsi pertanyaan foto",
              model: "Gejala",
            },
            {
              path: "solusi",
              select: "_id deskripsi",
              model: "Solusi",
            },
          ],
        });

      res.status(StatusCodes.OK).json({
        statusCode: StatusCodes.OK,
        message: "Berhasil mendapatkan data identifikasi user",
        data,
      });
    } catch (error) {
      next(error);
    }
  },
  getForDetail: async (req, res, next) => {
    try {
      const { id: identifikasiId } = req.params;

      const data = await Identifikasi.findOne({ _id: identifikasiId })
        .populate({
          path: "user",
          select: "_id name username role",
          model: "User",
        })
        .populate({
          path: "hamaPenyakit",
          select: "_id kode nama gejala solusi deskripsi foto",
          model: "HamaPenyakit",
          populate: [
            {
              path: "gejala",
              select: "_id kode deskripsi pertanyaan foto",
              model: "Gejala",
            },
            {
              path: "solusi",
              select: "_id deskripsi",
              model: "Solusi",
            },
          ],
        });

      res.status(StatusCodes.OK).json({
        statusCode: StatusCodes.OK,
        message: "Berhasil mendapatkan data detail identifikasi",
        data,
      });
    } catch (error) {
      next(error);
    }
  },
  getAll: async (req, res, next) => {
    try {
      const data = await Identifikasi.find()
        .populate({
          path: "user",
          select: "_id name username role",
          model: "User",
        })
        .populate({
          path: "hamaPenyakit",
          select: "_id kode nama gejala solusi deskripsi foto",
          model: "HamaPenyakit",
          populate: [
            {
              path: "gejala",
              select: "_id kode deskripsi pertanyaan foto",
              model: "Gejala",
            },
            {
              path: "solusi",
              select: "_id deskripsi",
              model: "Solusi",
            },
          ],
        });

      res.status(StatusCodes.OK).json({
        statusCode: StatusCodes.OK,
        message: "Berhasil mendapatkan data identifikasi",
        data,
      });
    } catch (error) {
      next(error);
    }
  },
};
