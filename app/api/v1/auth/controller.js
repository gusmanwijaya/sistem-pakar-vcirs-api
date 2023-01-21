const User = require("./model");
const { StatusCodes } = require("http-status-codes");
const CustomError = require("../../../../app/error");
const bcrypt = require("bcryptjs");
const createPayloadJwt = require("../../../utils/createPayloadJwt");
const createJwt = require("../../../utils/createJwt");

module.exports = {
  register: async (req, res, next) => {
    try {
      const { name, username, password, role } = req.body;

      if (!name) throw new CustomError.BadRequest("Nama tidak boleh kosong!");
      if (!username)
        throw new CustomError.BadRequest("Username tidak boleh kosong!");
      if (!password)
        throw new CustomError.BadRequest("Password tidak boleh kosong!");
      if (password.length < 6)
        throw new CustomError.BadRequest(
          "Password tidak boleh kurang dari 6 karakter!"
        );

      const user = await User.findOne({ username });
      if (user) throw new CustomError.Forbidden("Username sudah terdaftar");

      const data = new User({ name, username, password, role });
      await data.save();
      delete data._doc.password;

      res.status(StatusCodes.CREATED).json({
        statusCode: StatusCodes.CREATED,
        message: "Register user berhasil!",
        data,
      });
    } catch (error) {
      next(error);
    }
  },
  login: async (req, res, next) => {
    try {
      const { username, password } = req.body;

      if (!username || !password)
        throw new CustomError.BadRequest(
          "Username atau password tidak boleh kosong!"
        );

      const data = await User.findOne({ username });
      if (!data) throw new CustomError.Unauthorized("User tidak ditemukan!");

      const isMatch = await bcrypt.compare(password, data?.password);
      if (!isMatch) throw new CustomError.Unauthorized("Password salah!");

      const payload = createPayloadJwt(data);
      const token = createJwt(payload);

      res.status(StatusCodes.OK).json({
        statusCode: StatusCodes.OK,
        message: "Login user berhasil!",
        data: {
          token,
        },
      });
    } catch (error) {
      next(error);
    }
  },
};
