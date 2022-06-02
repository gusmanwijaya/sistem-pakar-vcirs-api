const { StatusCodes } = require("http-status-codes");
const CustomError = require("../../../../app/error");
const Diagnosa = require("./model");
const Gejala = require("../gejala/model");
const BasisPengetahuan = require("../basis-pengetahuan/model");

module.exports = {
  create: async (req, res, next) => {
    try {
      const variable = await Gejala.find().select("_id kode deskripsi");
      const totalVariable = variable.length;

      let variableOrder = [];
      for (let index = 0; index < variable.length; index++) {
        variableOrder.push(index + 1);
      }

      let credit = [];
      for (let index = 0; index < variable.length; index++) {
        credit.push(1);
      }

      let numOfNode = [];
      for (let index = 0; index < variable.length; index++) {
        numOfNode.push(1);
      }

      let VUR = [];
      for (let index = 0; index < variable.length; index++) {
        VUR.push(
          credit[index] *
            ((numOfNode[index] * variableOrder[index]) / totalVariable)
        );
      }

      const initialValueSumVUR = 0;
      const sumVUR = VUR.reduce(
        (previousValue, currentValue) => previousValue + currentValue,
        initialValueSumVUR
      );

      const NUR = sumVUR / totalVariable;

      const RUR = NUR / totalVariable;

      const basisPengetahuan = await BasisPengetahuan.find()
        .select("_id hamaPenyakit gejala cfPakar")
        .populate({
          path: "hamaPenyakit",
          select: "_id kode nama gejala solusi foto",
          model: "HamaPenyakit",
          populate: [
            {
              path: "gejala",
              select: "_id kode deskripsi foto",
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
          select: "_id kode deskripsi foto",
          model: "Gejala",
        });

      // START: Hitung CF
      let arrayBasisPengetahuan = [];
      for (let index = 0; index < basisPengetahuan.length; index++) {
        arrayBasisPengetahuan.push({
          kodeHamaPenyakit: basisPengetahuan[index]?.hamaPenyakit?.kode,
          hamaPenyakit: basisPengetahuan[index]?.hamaPenyakit?.nama,
          kodeGejala: basisPengetahuan[index]?.gejala?.kode,
          gejala: basisPengetahuan[index]?.gejala?.deskripsi,
          cfPakar: basisPengetahuan[index]?.cfPakar,
        });
      }

      let arrayForFilterDuplicate = [];
      for (let index = 0; index < arrayBasisPengetahuan.length; index++) {
        arrayForFilterDuplicate.push({
          kodeGejala: arrayBasisPengetahuan[index]?.kodeGejala,
          gejala: arrayBasisPengetahuan[index]?.gejala,
          cfPakar: arrayBasisPengetahuan[index]?.cfPakar,
        });
      }

      const jsonObject = arrayForFilterDuplicate.map(JSON.stringify);
      const uniqueSet = new Set(jsonObject);
      const arrayCfPakar = Array.from(uniqueSet).map(JSON.parse);

      const { answer } = req.body;
      const arrayAnswer = JSON.parse(answer);

      if (arrayAnswer.length > 0) {
        let arrayCFR = [];
        for (let index = 0; index < variable.length; index++) {
          const CF =
            arrayCfPakar[index]?.cfPakar * parseFloat(arrayAnswer[index]);
          arrayCFR.push({
            iteration: `CFR${index + 1}`,
            value: CF * RUR,
          });
        }
        // END: Hitung CF

        // START: Hitung CF Kombinasi
        let arrayValueCfCombine = [];
        for (let index = 0; index < arrayCFR.length; index++) {
          if (index === 0) {
            arrayValueCfCombine.push(
              arrayCFR[index]?.value +
                arrayCFR[index + 1]?.value * (1 - arrayCFR[index]?.value)
            );
          } else {
            if (index === arrayCFR.length - 1) {
              arrayValueCfCombine.push(
                arrayValueCfCombine[index - 1] +
                  arrayCFR[index]?.value * (1 - arrayValueCfCombine[index - 1])
              );
            } else {
              arrayValueCfCombine.push(
                arrayValueCfCombine[index - 1] +
                  arrayCFR[index + 1]?.value *
                    (1 - arrayValueCfCombine[index - 1])
              );
            }
          }
        }

        const cfCombine =
          (arrayValueCfCombine[arrayValueCfCombine.length - 1] * 100) / 100;
        // END: Hitung CF Kombinasi

        res.status(StatusCodes.OK).json({
          statusCode: StatusCodes.OK,
          message: "Berhasil mendapatkan data diagnosa",
          data: {
            variable,
            variableOrder,
            credit,
            numOfNode,
            totalVariable,
            VUR,
            NUR,
            RUR,
            arrayBasisPengetahuan,
            arrayCfPakar,
            arrayCFR,
            cfCombine: `${cfCombine.toFixed(3)}%`,
          },
        });
      }
    } catch (error) {
      next(error);
    }
  },
};
