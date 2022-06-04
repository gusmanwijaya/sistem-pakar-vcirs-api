const { StatusCodes } = require("http-status-codes");
const CustomError = require("../../../../app/error");
const Diagnosa = require("./model");
const Gejala = require("../gejala/model");
const BasisPengetahuan = require("../basis-pengetahuan/model");
const HamaPenyakit = require("../hama-penyakit/model");

module.exports = {
  create: async (req, res, next) => {
    try {
      const { urutanAnswer, nilaiAnswer } = req.body;

      const variable = await Gejala.find().select(
        "_id kode deskripsi foto credit numOfNode"
      );
      const totalVariable = variable.length;
      const variableOrder = JSON.parse(urutanAnswer);

      let credit = [];
      variable.forEach((element) => {
        credit.push(element?.credit);
      });

      let numOfNode = [];
      variable.forEach((element) => {
        numOfNode.push(element?.numOfNode);
      });

      let VUR = [];
      for (let index = 0; index < variable.length; index++) {
        VUR.push(
          (credit[index] * numOfNode[index] * variableOrder[index]) /
            totalVariable
        );
      }

      const initialValueSumVUR = 0;
      const sumVUR = VUR.reduce(
        (previousValue, currentValue) => previousValue + currentValue,
        initialValueSumVUR
      );

      const NUR = sumVUR / totalVariable;

      const RUR = NUR / 1;

      let _idVariable = [];
      variable.forEach((element) => {
        _idVariable.push(element?._id);
      });

      const cfPakarInBasisPengetahuan = await BasisPengetahuan.find({
        gejala: { $in: _idVariable },
      }).select("cfPakar");

      let cfPakar = [];
      cfPakarInBasisPengetahuan.forEach((element) => {
        cfPakar.push(element.cfPakar);
      });

      const cfUser = JSON.parse(nilaiAnswer);

      let CFR = [];
      for (let index = 0; index < variable.length; index++) {
        CFR.push(cfPakar[index] * cfUser[index] * RUR);
      }

      let countCfCombine = [];
      for (let index = 0; index < CFR.length; index++) {
        if (index === 0) {
          countCfCombine.push((CFR[index] + CFR[index + 1]) * (1 - CFR[index]));
        } else {
          countCfCombine.push(
            (countCfCombine[countCfCombine.length - 1] + CFR[index + 1]) *
              (1 - CFR[index])
          );
        }
      }

      let cfCombine;
      let percentage;
      if (countCfCombine.length > 0) {
        countCfCombine.pop();
        cfCombine = countCfCombine[countCfCombine.length - 1] * 100;
        percentage = `${cfCombine.toFixed(2)}%`;
      }

      const hamaPenyakit = await HamaPenyakit.find({
        gejala: { $in: _idVariable },
      })
        .select("_id kode nama foto gejala solusi")
        .populate({
          path: "gejala",
          select: "_id kode deskripsi foto credit numOfNode",
          model: "Gejala",
        })
        .populate({
          path: "solusi",
          select: "_id deskripsi",
          model: "Solusi",
        });
      await Diagnosa.create({
        cfCombine,
        percentage,
        hamaPenyakit: hamaPenyakit._id,
      });

      res.status(StatusCodes.OK).json({
        statusCode: StatusCodes.OK,
        message: "Berhasil mendiagnosa",
        data: {
          variable,
          totalVariable,
          variableOrder,
          credit,
          numOfNode,
          VUR,
          NUR,
          RUR,
          cfPakar,
          cfUser,
          CFR,
          cfCombine,
          percentage,
          hamaPenyakit,
        },
      });
    } catch (error) {
      next(error);
    }
  },
};
