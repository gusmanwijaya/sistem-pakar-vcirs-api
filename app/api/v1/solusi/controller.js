const Solusi = require("./model");
const { StatusCodes } = require("http-status-codes");
const CustomError = require("../../../../app/error");

module.exports = {
  getAll: async (req, res, next) => {
    try {
      const { page = 1, limit = 10 } = req.query;

      const data = await Solusi.find()
        .select("_id deskripsi")
        .limit(limit)
        .skip(limit * (page - 1));

      const count = await Solusi.countDocuments();

      res.status(StatusCodes.OK).json({
        statusCode: StatusCodes.OK,
        message: "Berhasil mendapatkan data solusi",
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
      const { id: solusiId } = req.params;

      const data = await Solusi.findOne({ _id: solusiId }).select(
        "_id deskripsi"
      );

      if (!data)
        throw new CustomError.NotFound(
          `Solusi dengan id ${solusiId} tidak ditemukan`
        );

      res.status(StatusCodes.OK).json({
        statusCode: StatusCodes.OK,
        message: "Berhasil mendapatkan data solusi",
        data,
      });
    } catch (error) {
      next(error);
    }
  },
  create: async (req, res, next) => {
    try {
      const { deskripsi } = req.body;

      const checkDeskripsi = await Solusi.findOne({ deskripsi }).select(
        "deskripsi"
      );
      if (checkDeskripsi)
        throw new CustomError.BadRequest(`Deskripsi sudah terdaftar`);

      const data = new Solusi({ deskripsi });
      await data.save();

      res.status(StatusCodes.CREATED).json({
        statusCode: StatusCodes.CREATED,
        message: "Data solusi berhasil ditambahkan",
        data,
      });
    } catch (error) {
      next(error);
    }
  },
  update: async (req, res, next) => {
    try {
      const { id: solusiId } = req.params;
      const { deskripsi } = req.body;

      const checkDeskripsi = await Solusi.findOne({
        _id: {
          $ne: solusiId,
        },
        deskripsi,
      }).select("deskripsi");
      if (checkDeskripsi)
        throw new CustomError.BadRequest(`Deskripsi sudah terdaftar`);

      let data = await Solusi.findOne({ _id: solusiId });

      if (!data)
        throw new CustomError.NotFound(
          `Solusi dengan id ${solusiId} tidak ditemukan`
        );

      data.deskripsi = deskripsi;
      await data.save();

      res.status(StatusCodes.OK).json({
        statusCode: StatusCodes.OK,
        message: "Data solusi berhasil diubah",
        data,
      });
    } catch (error) {
      next(error);
    }
  },
  destroy: async (req, res, next) => {
    try {
      const { id: solusiId } = req.params;

      let data = await Solusi.findOne({ _id: solusiId });

      if (!data)
        throw new CustomError.NotFound(
          `Solusi dengan id ${solusiId} tidak ditemukan`
        );

      await data.remove();

      res.status(StatusCodes.OK).json({
        statusCode: StatusCodes.OK,
        message: "Data solusi berhasil dihapus",
        data,
      });
    } catch (error) {
      next(error);
    }
  },
};
