const Pertanyaan = require("./model");
const { StatusCodes } = require("http-status-codes");
const CustomError = require("../../../../app/error");

module.exports = {
  getAll: async (req, res, next) => {
    try {
      const { page = 1, limit = 10 } = req.query;

      const data = await Pertanyaan.find()
        .select("_id pertanyaan")
        .limit(limit)
        .skip(limit * (page - 1));

      const count = await Pertanyaan.countDocuments();

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
  getOne: async (req, res, next) => {
    try {
      const { id: pertanyaanId } = req.params;

      const data = await Pertanyaan.findOne({ _id: pertanyaanId }).select(
        "_id pertanyaan"
      );

      if (!data)
        throw new CustomError.NotFound(
          `Pertanyaan dengan id ${pertanyaanId} tidak ditemukan`
        );

      res.status(StatusCodes.OK).json({
        statusCode: StatusCodes.OK,
        message: "Berhasil mendapatkan data pertanyaan",
        data,
      });
    } catch (error) {
      next(error);
    }
  },
  create: async (req, res, next) => {
    try {
      const { pertanyaan } = req.body;

      const checkPertanyaan = await Pertanyaan.findOne({ pertanyaan }).select(
        "pertanyaan"
      );
      if (checkPertanyaan)
        throw new CustomError.BadRequest(`Pertanyaan sudah terdaftar`);

      const data = new Pertanyaan({ pertanyaan });
      await data.save();

      res.status(StatusCodes.CREATED).json({
        statusCode: StatusCodes.CREATED,
        message: "Data pertanyaan berhasil ditambahkan",
        data,
      });
    } catch (error) {
      next(error);
    }
  },
  update: async (req, res, next) => {
    try {
      const { id: pertanyaanId } = req.params;
      const { pertanyaan } = req.body;

      const checkPertanyaan = await Pertanyaan.findOne({
        _id: {
          $ne: pertanyaanId,
        },
        pertanyaan,
      }).select("pertanyaan");
      if (checkPertanyaan)
        throw new CustomError.BadRequest(`Pertanyaan sudah terdaftar`);

      let data = await Pertanyaan.findOne({ _id: pertanyaanId });

      if (!data)
        throw new CustomError.NotFound(
          `Pertanyaan dengan id ${pertanyaanId} tidak ditemukan`
        );

      data.pertanyaan = pertanyaan;
      await data.save();

      res.status(StatusCodes.OK).json({
        statusCode: StatusCodes.OK,
        message: "Data pertanyaan berhasil diubah",
        data,
      });
    } catch (error) {
      next(error);
    }
  },
  destroy: async (req, res, next) => {
    try {
      const { id: pertanyaanId } = req.params;

      let data = await Pertanyaan.findOne({ _id: pertanyaanId });

      if (!data)
        throw new CustomError.NotFound(
          `Pertanyaan dengan id ${pertanyaanId} tidak ditemukan`
        );

      await data.remove();

      res.status(StatusCodes.OK).json({
        statusCode: StatusCodes.OK,
        message: "Data pertanyaan berhasil dihapus",
        data,
      });
    } catch (error) {
      next(error);
    }
  },
};
