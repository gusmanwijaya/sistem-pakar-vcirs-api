const BasisPengetahuan = require("./model");
const { StatusCodes } = require("http-status-codes");
const CustomError = require("../../../../app/error");

module.exports = {
  getAll: async (req, res, next) => {
    try {
      const { page = 1, limit = 10 } = req.query;

      const data = await BasisPengetahuan.find()
        .select("_id hamaPenyakit gejala cfPakar urutan")
        .limit(limit)
        .skip(limit * (page - 1))
        .populate({
          path: "hamaPenyakit",
          select: "_id kode nama gejala solusi foto",
          model: "HamaPenyakit",
          populate: [
            {
              path: "gejala",
              select: "_id kode deskripsi foto pertanyaan",
              model: "Gejala",
            },
            {
              path: "solusi",
              select: "_id deskripsi",
              model: "Solusi",
            },
          ],
        })
        .populate({
          path: "gejala",
          select: "_id kode deskripsi foto pertanyaan",
          model: "Gejala",
        });

      const count = await BasisPengetahuan.countDocuments();

      res.status(StatusCodes.OK).json({
        statusCode: StatusCodes.OK,
        message: "Berhasil mendapatkan data basis pengetahuan",
        current_page: parseInt(page),
        total_page: Math.ceil(count / limit),
        total_data: count,
        data,
      });
    } catch (error) {
      next(error);
    }
  },
  getOne: async (req, res, next) => {
    try {
      const { id: basisPengetahuanId } = req.params;

      const data = await BasisPengetahuan.findOne({ _id: basisPengetahuanId })
        .select("_id hamaPenyakit gejala cfPakar urutan")
        .populate({
          path: "hamaPenyakit",
          select: "_id kode nama gejala solusi foto",
          model: "HamaPenyakit",
          populate: [
            {
              path: "gejala",
              select: "_id kode deskripsi foto pertanyaan",
              model: "Gejala",
            },
            {
              path: "solusi",
              select: "_id deskripsi",
              model: "Solusi",
            },
          ],
        })
        .populate({
          path: "gejala",
          select: "_id kode deskripsi foto pertanyaan",
          model: "Gejala",
        });

      if (!data)
        throw new CustomError.NotFound(
          `Basis pengetahuan dengan id ${basisPengetahuanId} tidak ditemukan`
        );

      res.status(StatusCodes.OK).json({
        statusCode: StatusCodes.OK,
        message: "Berhasil mendapatkan data basis pengetahuan",
        data,
      });
    } catch (error) {
      next(error);
    }
  },
  create: async (req, res, next) => {
    try {
      const { hamaPenyakit, gejala, cfPakar } = req.body;

      let data;

      const checkUrutan = await BasisPengetahuan.find({ hamaPenyakit }).sort({
        urutan: "asc",
      });
      if (checkUrutan[checkUrutan.length - 1].urutan > 0) {
        data = new BasisPengetahuan({
          hamaPenyakit,
          gejala,
          cfPakar,
          urutan: checkUrutan[checkUrutan.length - 1].urutan + 1,
        });
      } else {
        data = new BasisPengetahuan({
          hamaPenyakit,
          gejala,
          cfPakar,
          urutan: 1,
        });
      }

      await data.save();

      res.status(StatusCodes.CREATED).json({
        statusCode: StatusCodes.CREATED,
        message: "Data basis pengetahuan berhasil ditambahkan",
        data,
      });
    } catch (error) {
      next(error);
    }
  },
  update: async (req, res, next) => {
    try {
      const { id: basisPengetahuanId } = req.params;
      const { hamaPenyakit, gejala, cfPakar } = req.body;

      let data = await BasisPengetahuan.findOne({ _id: basisPengetahuanId });

      if (!data)
        throw new CustomError.NotFound(
          `Basis pengetahuan dengan id ${basisPengetahuanId} tidak ditemukan`
        );

      data.hamaPenyakit = hamaPenyakit;
      data.gejala = gejala;
      data.cfPakar = cfPakar;
      await data.save();

      res.status(StatusCodes.OK).json({
        statusCode: StatusCodes.OK,
        message: "Data basis pengetahuan berhasil diubah",
        data,
      });
    } catch (error) {
      next(error);
    }
  },
  destroy: async (req, res, next) => {
    try {
      const { id: basisPengetahuanId } = req.params;

      let data = await BasisPengetahuan.findOne({ _id: basisPengetahuanId });

      if (!data)
        throw new CustomError.NotFound(
          `Basis pengetahuan dengan id ${basisPengetahuanId} tidak ditemukan`
        );

      await data.remove();

      res.status(StatusCodes.OK).json({
        statusCode: StatusCodes.OK,
        message: "Data basis pengetahuan berhasil dihapus",
        data,
      });
    } catch (error) {
      next(error);
    }
  },
};
