const { StatusCodes } = require("http-status-codes");
const CustomError = require("../../../error");
const Identifikasi = require("./model");
const BasisPengetahuan = require("../basis-pengetahuan/model");
const Gejala = require("../gejala/model");
const HamaPenyakit = require("../hama-penyakit/model");
const moment = require("moment");

module.exports = {
  getGejala: async (req, res, next) => {
    try {
      const data = await Gejala.find().select(
        "_id kode deskripsi foto cfPakar"
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
  get: async (req, res, next) => {
    try {
      const role = req?.user?.role;
      let data;

      if (role === "admin") {
        data = await Identifikasi.find().populate(
          "user",
          "_id name username role"
        );
      } else if (role === "pengguna") {
        data = await Identifikasi.find({ user: req?.user?._id }).populate(
          "user",
          "_id name username role"
        );
      }

      res.status(StatusCodes.OK).json({
        statusCode: StatusCodes.OK,
        message: "Berhasil mendapatkan data history identifikasi",
        data,
      });
    } catch (error) {
      next(error);
    }
  },
  getOne: async (req, res, next) => {
    try {
      const { id: identifikasiId } = req.params;

      const data = await Identifikasi.findOne({ _id: identifikasiId }).populate(
        "user",
        "_id name username role"
      );

      res.status(StatusCodes.OK).json({
        statusCode: StatusCodes.OK,
        message: "Berhasil mendapatkan data detail history identifikasi",
        data,
      });
    } catch (error) {
      next(error);
    }
  },
  create: async (req, res, next) => {
    try {
      // START: Mengambil request yang dikirimkan oleh users
      const { idSelectedGejala } = req.body;
      const parseIdSelectedGejala = JSON.parse(idSelectedGejala);
      // END: Mengambil request yang dikirimkan oleh users

      // START: Mengambil data gejala yang dipilih oleh users
      const gejalaYangDipilih = await Gejala.find({
        _id: { $in: parseIdSelectedGejala },
      }).select("_id kode deskripsi foto cfPakar");
      // END: Mengambil data gejala yang dipilih oleh users

      // START: Mengambil semua basis pengetahuan yang tersimpan di database
      const basisPengetahuan = await BasisPengetahuan.find()
        .select("_id hamaPenyakit gejala")
        .populate({
          path: "hamaPenyakit",
          select: "_id kode nama foto deskripsi solusi",
          model: "HamaPenyakit",
          populate: {
            path: "solusi",
            select: "_id deskripsi",
            model: "Solusi",
          },
        })
        .populate({
          path: "gejala",
          select: "_id kode deskripsi foto cfPakar",
          model: "Gejala",
        });
      // END: Mengambil semua basis pengetahuan yang tersimpan di database

      // START: Menghitung num of node setiap variable / gejala
      let numOfNode = {};
      basisPengetahuan?.forEach((valueBasis) =>
        valueBasis?.gejala?.forEach((valueGejala) => {
          numOfNode[valueGejala?._id] = (numOfNode[valueGejala?._id] || 0) + 1;
        })
      );
      // END: Menghitung num of node setiap variable / gejala

      // START: Membuat rule untuk diproses
      let rule = [];
      basisPengetahuan?.forEach((valueBasisPengetahuan) =>
        rule.push({
          hamaPenyakit: valueBasisPengetahuan?.hamaPenyakit?.nama,
          data: valueBasisPengetahuan?.gejala
            ?.map(
              (valueBasisGejala) =>
                parseIdSelectedGejala
                  ?.map(
                    (valueParseId) =>
                      valueBasisGejala?._id.toString() ===
                        valueParseId.toString() && {
                        gejala: valueBasisGejala?.deskripsi,
                        cfPakar: valueBasisGejala?.cfPakar,
                        numOfNode: numOfNode[valueBasisGejala?._id],
                      }
                  )
                  ?.filter((result) => result !== false)[0]
            )
            ?.filter((result) => result != null)
            ?.sort((a, b) => a?.numOfNode - b?.numOfNode),
        })
      );

      rule?.forEach((value) =>
        value?.data
          ?.filter(() => true)
          ?.forEach((valueData, index) => (valueData.variableOrder = index + 1))
      );
      // END: Membuat rule untuk diproses

      // START: Melakukan proses perhitungan menggunakan metode VCIRS
      const credit = 1;

      // VUR
      let VUR = [];
      rule?.forEach((valueRule) =>
        VUR.push({
          hamaPenyakit: valueRule?.hamaPenyakit,
          data: valueRule?.data?.map((valueRuleData) => ({
            gejala: valueRuleData?.gejala,
            cfPakar: valueRuleData?.cfPakar,
            numOfNode: valueRuleData?.numOfNode,
            variableOrder: valueRuleData?.variableOrder,
            VUR: parseFloat(
              (
                credit *
                ((valueRuleData?.numOfNode * valueRuleData?.variableOrder) /
                  valueRule?.data?.length)
              ).toFixed(2)
            ),
          })),
        })
      );

      for (const elementRule of rule) {
        for (let elementDataRule of elementRule?.data) {
          elementDataRule.VUR = parseFloat(
            (
              credit *
              ((elementDataRule?.numOfNode * elementDataRule?.variableOrder) /
                elementRule?.data?.length)
            ).toFixed(2)
          );
        }
      }

      // NUR
      let NUR = [];
      VUR?.forEach((valueVUR) =>
        NUR.push({
          hamaPenyakit: valueVUR?.hamaPenyakit,
          cfPakar: valueVUR?.data?.map((valueVURData) => valueVURData?.cfPakar),
          VUR: valueVUR?.data?.map((valueVURData) => valueVURData?.VUR),
          NUR:
            valueVUR?.data
              ?.map((valueVURData) => valueVURData?.VUR)
              ?.reduce((a, b) => a + b, 0) /
            valueVUR?.data?.map((valueVURData) => valueVURData?.VUR)?.length,
        })
      );

      // RUR
      let RUR = [];
      NUR?.forEach((valueNUR) =>
        RUR.push({
          hamaPenyakit: valueNUR?.hamaPenyakit,
          cfPakar: valueNUR?.cfPakar,
          VUR: valueNUR?.VUR,
          NUR: valueNUR?.NUR,
          RUR: valueNUR?.NUR / valueNUR?.VUR?.length,
        })
      );

      // CFR
      for (let elementRule of rule) {
        for (const elementRUR of RUR) {
          if (elementRule?.hamaPenyakit === elementRUR?.hamaPenyakit) {
            elementRule.VUR = elementRUR?.VUR;
            elementRule.NUR = parseFloat((elementRUR?.NUR).toFixed(2));
            elementRule.RUR = parseFloat((elementRUR?.RUR).toFixed(2));
            elementRule.cfPakar = elementRUR?.cfPakar;
            elementRule.CFR = elementRUR?.cfPakar?.map((valueCFPakar) =>
              parseFloat((valueCFPakar * elementRUR?.RUR).toFixed(2))
            );
          }
        }
      }

      // CF Kombinasi
      for (let elementRule of rule) {
        let CFKombinasi = [];

        for (let index = 0; index < elementRule?.CFR?.length - 1; index++) {
          if (index === 0) {
            CFKombinasi.push(
              parseFloat(
                (
                  elementRule?.CFR[index] +
                  elementRule?.CFR[index + 1] * (1 - elementRule?.CFR[index])
                ).toFixed(2)
              )
            );
          } else {
            CFKombinasi.push(
              parseFloat(
                (
                  CFKombinasi[CFKombinasi?.length - 1] +
                  elementRule?.CFR[index + 1] *
                    (1 - CFKombinasi[CFKombinasi?.length - 1])
                ).toFixed(2)
              )
            );
          }
        }

        elementRule.CFKombinasi = CFKombinasi;
        elementRule.persenCFKombinasi = `${
          CFKombinasi[CFKombinasi?.length - 1] * 100
        }%`;
      }
      // END: Melakukan proses perhitungan menggunakan metode VCIRS

      let data = {
        user: req?.user?._id,
        tanggal: moment().format("MMMM DD YYYY, hh:mm:ss A"),
        gejalaYangDipilih,
        basisPengetahuan,
        rule: rule
          ?.filter((result) => result?.CFKombinasi?.length > 0)
          ?.sort(
            (a, b) =>
              a?.CFKombinasi[a?.CFKombinasi?.length - 1] -
              b?.CFKombinasi[b?.CFKombinasi?.length - 1]
          ),
      };

      let hasilIdentifikasiHamaPenyakit;
      if (
        data?.rule[data?.rule?.length - 1]?.CFKombinasi[
          data?.rule[data?.rule?.length - 1]?.CFKombinasi?.length - 1
        ] ===
        data?.rule[data?.rule?.length - 2]?.CFKombinasi[
          data?.rule[data?.rule?.length - 2]?.CFKombinasi?.length - 1
        ]
      ) {
        hasilIdentifikasiHamaPenyakit = await HamaPenyakit.find({
          nama: {
            $in: [
              data?.rule[data?.rule?.length - 1]?.hamaPenyakit,
              data?.rule[data?.rule?.length - 2]?.hamaPenyakit,
            ],
          },
        })
          .select("_id kode nama foto deskripsi solusi")
          .populate({
            path: "solusi",
            select: "_id deskripsi",
            model: "Solusi",
          });
      } else {
        hasilIdentifikasiHamaPenyakit = await HamaPenyakit.find({
          nama: data?.rule[data?.rule?.length - 1]?.hamaPenyakit,
        })
          .select("_id kode nama foto deskripsi solusi")
          .populate({
            path: "solusi",
            select: "_id deskripsi",
            model: "Solusi",
          });
      }

      data = {
        ...data,
        hasilIdentifikasiHamaPenyakit,
      };

      await Identifikasi.create({
        user: data?.user,
        tanggal: data?.tanggal,
        gejalaYangDipilih: data?.gejalaYangDipilih,
        basisPengetahuan: data?.basisPengetahuan?.map(
          (valueBasisPengetahuan) => ({
            _id: valueBasisPengetahuan?._id,
            hamaPenyakit: {
              _id: valueBasisPengetahuan?.hamaPenyakit?._id,
              kode: valueBasisPengetahuan?.hamaPenyakit?.kode,
              nama: valueBasisPengetahuan?.hamaPenyakit?.nama,
              foto: valueBasisPengetahuan?.hamaPenyakit?.foto,
              deskripsi: valueBasisPengetahuan?.hamaPenyakit?.deskripsi,
              solusi: valueBasisPengetahuan?.hamaPenyakit?.solusi?.map(
                (valueSolusi) => ({
                  _id: valueSolusi?._id,
                  deskripsi: valueSolusi?.deskripsi,
                })
              ),
            },
            gejala: valueBasisPengetahuan?.gejala?.map((valueGejala) => ({
              _id: valueGejala?._id,
              kode: valueGejala?.kode,
              deskripsi: valueGejala?.deskripsi,
              cfPakar: valueGejala?.cfPakar,
            })),
          })
        ),
        rule: data?.rule,
        hasilIdentifikasiHamaPenyakit: hasilIdentifikasiHamaPenyakit?.map(
          (valueHasilIdentifikasi) => ({
            _id: valueHasilIdentifikasi?._id,
            kode: valueHasilIdentifikasi?.kode,
            nama: valueHasilIdentifikasi?.nama,
            foto: valueHasilIdentifikasi?.foto,
            deskripsi: valueHasilIdentifikasi?.deskripsi,
            solusi: valueHasilIdentifikasi?.solusi?.map((valueSolusi) => ({
              _id: valueSolusi?._id,
              deskripsi: valueSolusi?.deskripsi,
            })),
          })
        ),
      });

      res.status(StatusCodes.CREATED).json({
        statusCode: StatusCodes.CREATED,
        message: "Berhasil mengidentifikasi",
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
