const Gejala = require("./model");
const { StatusCodes } = require("http-status-codes");
const CustomError = require("../../../../app/error");
const fs = require("fs");
const config = require("../../../config");

module.exports = {
  getAll: async (req, res, next) => {
    try {
      const { page = 1, limit = 10 } = req.query;
      const data = await Gejala.find()
        .select("_id kode deskripsi foto credit numOfNode")
        .limit(limit)
        .skip(limit * (page - 1));

      const count = await Gejala.countDocuments();

      res.status(StatusCodes.OK).json({
        statusCode: StatusCodes.OK,
        message: "Berhasil mendapatkan data gejala",
        current_page: parseInt(page),
        total_page: Math.ceil(count / limit),
        total_data: count,
        data,
      });
    } catch (error) {
      next(error);
    }
  },
  getForSelect: async (req, res, next) => {
    try {
      const data = await Gejala.find().select(
        "_id kode deskripsi foto credit numOfNode"
      );

      res.status(StatusCodes.OK).json({
        statusCode: StatusCodes.OK,
        message: "Berhasil mendapatkan data gejala",
        data,
      });
    } catch (error) {
      next(error);
    }
  },
  getOne: async (req, res, next) => {
    try {
      const { id: gejalaId } = req.params;

      const data = await Gejala.findOne({ _id: gejalaId }).select(
        "_id kode deskripsi foto credit numOfNode"
      );

      if (!data)
        throw new CustomError.NotFound(
          `Gejala dengan id ${gejalaId} tidak ditemukan`
        );

      res.status(StatusCodes.OK).json({
        statusCode: StatusCodes.OK,
        message: "Berhasil mendapatkan data gejala",
        data,
      });
    } catch (error) {
      next(error);
    }
  },
  create: async (req, res, next) => {
    try {
      const { kode, deskripsi, credit, numOfNode } = req.body;

      const checkKode = await Gejala.findOne({ kode }).select("kode");
      if (checkKode)
        throw new CustomError.BadRequest(
          `Kode : ${checkKode.kode} sudah terdaftar`
        );

      const checkDeskripsi = await Gejala.findOne({ deskripsi }).select(
        "deskripsi"
      );
      if (checkDeskripsi)
        throw new CustomError.BadRequest(`Deskripsi sudah terdaftar`);

      let data;

      if (!req.file) {
        data = new Gejala({ kode, deskripsi, credit, numOfNode });
      } else {
        data = new Gejala({
          kode,
          deskripsi,
          foto: req.file.filename,
          credit,
          numOfNode,
        });
      }

      await data.save();

      res.status(StatusCodes.CREATED).json({
        statusCode: StatusCodes.CREATED,
        message: "Data gejala berhasil ditambahkan",
        data,
      });
    } catch (error) {
      next(error);
    }
  },
  update: async (req, res, next) => {
    try {
      const { id: gejalaId } = req.params;
      const { kode, deskripsi, credit, numOfNode } = req.body;

      const checkKode = await Gejala.findOne({
        _id: {
          $ne: gejalaId,
        },
        kode,
      }).select("kode");
      if (checkKode)
        throw new CustomError.BadRequest(
          `Kode : ${checkKode.kode} sudah terdaftar`
        );

      const checkDeskripsi = await Gejala.findOne({
        _id: {
          $ne: gejalaId,
        },
        deskripsi,
      }).select("deskripsi");
      if (checkDeskripsi)
        throw new CustomError.BadRequest(`Deskripsi sudah terdaftar`);

      let data = await Gejala.findOne({ _id: gejalaId });

      if (!data)
        throw new CustomError.NotFound(
          `Gejala dengan id ${gejalaId} tidak ditemukan`
        );

      if (!req.file) {
        data.kode = kode;
        data.deskripsi = deskripsi;
        data.credit = credit;
        data.numOfNode = numOfNode;
      } else {
        const currentImage = `${config.rootPath}/public/uploads/gejala/${data.foto}`;

        if (fs.existsSync(currentImage)) {
          fs.unlinkSync(currentImage);
        }

        data.kode = kode;
        data.deskripsi = deskripsi;
        data.foto = req.file.filename;
        data.credit = credit;
        data.numOfNode = numOfNode;
      }

      await data.save();

      res.status(StatusCodes.OK).json({
        statusCode: StatusCodes.OK,
        message: "Data gejala berhasil diubah",
        data,
      });
    } catch (error) {
      next(error);
    }
  },
  destroy: async (req, res, next) => {
    try {
      const { id: gejalaId } = req.params;

      let data = await Gejala.findOne({ _id: gejalaId });

      if (!data)
        throw new CustomError.NotFound(
          `Gejala dengan id ${gejalaId} tidak ditemukan`
        );

      const currentImage = `${config.rootPath}/public/uploads/gejala/${data.foto}`;

      if (fs.existsSync(currentImage)) {
        fs.unlinkSync(currentImage);
      }

      await data.remove();

      res.status(StatusCodes.OK).json({
        statusCode: StatusCodes.OK,
        message: "Data gejala berhasil dihapus",
        data,
      });
    } catch (error) {
      next(error);
    }
  },
};
