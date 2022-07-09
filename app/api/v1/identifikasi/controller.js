const { StatusCodes } = require("http-status-codes");
const CustomError = require("../../../error");
const Identifikasi = require("./model");
const BasisPengetahuan = require("../basis-pengetahuan/model");
const HamaPenyakit = require("../hama-penyakit/model");

module.exports = {
  create: async (req, res, next) => {
    try {
      const { user, tanggal, hamaPenyakit, arrayCfUser } = req.body;
      const cfUser = JSON.parse(arrayCfUser);
      let variable,
        totalVariable,
        variableOrder = [],
        numOfNode = [],
        credit = 1,
        VUR = [],
        NUR,
        RUR,
        cfPakar = [],
        CFR = [],
        cfCombine,
        percentage;

      const _tempHamaPenyakit = await HamaPenyakit.findOne({
        _id: hamaPenyakit,
      })
        .select("_id kode nama gejala solusi deskripsi foto")
        .populate({
          path: "gejala",
          select: "_id kode deskripsi pertanyaan foto",
          model: "Gejala",
        })
        .populate({
          path: "solusi",
          select: "_id deskripsi",
          model: "Solusi",
        });

      if (!_tempHamaPenyakit)
        throw new CustomError.NotFound(
          `Hama/penyakit dengan id : ${hamaPenyakit} tidak ditemukan!`
        );

      variable = _tempHamaPenyakit?.gejala;
      totalVariable = variable.length;

      const _tempVariableOrder = await BasisPengetahuan.find({
        hamaPenyakit,
        gejala: { $in: variable },
      })
        .select("gejala urutan cfPakar")
        .sort({ urutan: "asc" });

      for (let index = 0; index < _tempVariableOrder.length; index++) {
        variableOrder.push({
          gejala: _tempVariableOrder[index]?.gejala,
          urutan: _tempVariableOrder[index]?.urutan,
        });
      }

      for (let index = 0; index < variable.length; index++) {
        let responseCountNumOfNode = await BasisPengetahuan.countDocuments({
          gejala: variable[index]?._id,
        });
        numOfNode.push({
          gejala: variable[index]?._id,
          numOfNode: responseCountNumOfNode,
        });
      }

      variableOrder.sort(function (a, b) {
        return a?.urutan - b?.urutan;
      });
      for (let index = 0; index < variable.length; index++) {
        if (
          numOfNode[index]?.gejala.toString() ===
          variableOrder[index]?.gejala.toString()
        ) {
          VUR.push(
            credit *
              (numOfNode[index]?.numOfNode *
                (variableOrder[index]?.urutan / totalVariable))
          );
        }
      }

      const initialValueSumVUR = 0;
      const sumVUR = VUR.reduce(
        (previousValue, currentValue) => previousValue + currentValue,
        initialValueSumVUR
      );

      NUR = sumVUR / totalVariable;
      RUR = NUR / 1;

      for (let index = 0; index < _tempVariableOrder.length; index++) {
        cfPakar.push({
          gejala: _tempVariableOrder[index]?.gejala,
          cfPakar: _tempVariableOrder[index]?.cfPakar,
        });
      }

      for (let index = 0; index < variable.length; index++) {
        CFR.push(cfPakar[index]?.cfPakar * cfUser[index] * RUR);
      }

      let _tempCfCombine = [];
      for (let index = 0; index < variable.length; index++) {
        if (index === 0) {
          _tempCfCombine.push((CFR[index] + CFR[index + 1]) * (1 - CFR[index]));
        } else {
          _tempCfCombine.push(
            (_tempCfCombine[_tempCfCombine.length - 1] + CFR[index + 1]) *
              (1 - CFR[index])
          );
        }
      }

      _tempCfCombine.pop();
      cfCombine = _tempCfCombine[_tempCfCombine.length - 1] * 100;
      percentage = cfCombine.toFixed(2) + "%";

      let convertVUR = [];
      let convertNUR = NUR.toFixed(5);
      let convertRUR = RUR.toFixed(5);
      let convertCFR = [];
      let convertTempCfCombine = [];
      let convertCfCombine = cfCombine.toFixed(5);

      for (let index = 0; index < VUR.length; index++) {
        const element = VUR[index];
        convertVUR.push(element.toFixed(5));
      }

      for (let index = 0; index < CFR.length; index++) {
        const element = CFR[index];
        convertCFR.push(element.toFixed(5));
      }

      for (let index = 0; index < _tempCfCombine.length; index++) {
        const element = _tempCfCombine[index];
        convertTempCfCombine.push(element.toFixed(5));
      }

      const data = await Identifikasi.create({
        user,
        tanggal,
        hamaPenyakit,
        cfUser,
        variable,
        totalVariable,
        variableOrder,
        numOfNode,
        VUR: convertVUR,
        sumVUR,
        NUR: convertNUR,
        RUR: convertRUR,
        cfPakar,
        CFR: convertCFR,
        _tempCfCombine: convertTempCfCombine,
        cfCombine: convertCfCombine,
        percentage,
      });

      res.status(StatusCodes.CREATED).json({
        statusCode: StatusCodes.CREATED,
        message: "Berhasil mendiagnosa",
        data,
      });
    } catch (error) {
      next(error);
    }
  },
  destroy: async (req, res, next) => {
    try {
      const { id: identifikasiId } = req.params;

      let data = await Identifikasi.findOne({ _id: identifikasiId });

      if (!data)
        throw new CustomError.NotFound(
          `Identifikasi dengan id ${identifikasiId} tidak ditemukan`
        );

      await data.remove();

      res.status(StatusCodes.OK).json({
        statusCode: StatusCodes.OK,
        message: "Data identifikasi berhasil dihapus",
        data,
      });
    } catch (error) {
      next(error);
    }
  },
};
