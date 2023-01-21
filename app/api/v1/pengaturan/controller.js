const User = require("../auth/model");
const { StatusCodes } = require("http-status-codes");
const CustomError = require("../../../../app/error");
const bcrypt = require("bcryptjs");

module.exports = {
  ubahPassword: async (req, res, next) => {
    try {
      const { id: userId } = req.params;
      const { currentPassword, newPassword, confirmNewPassword } = req.body;

      if (!currentPassword)
        throw new CustomError.BadRequest(
          "Password saat ini tidak boleh kosong!"
        );

      if (!newPassword)
        throw new CustomError.BadRequest("Password baru tidak boleh kosong!");

      let user = await User.findOne({
        _id: userId,
      });

      if (!user) throw new CustomError.NotFound("User tidak ditemukan!");

      const isCurrentPasswordCorrect = bcrypt.compareSync(
        currentPassword,
        user.password
      );
      if (!isCurrentPasswordCorrect)
        throw new CustomError.Unauthorized("Password anda saat ini salah!");

      if (newPassword.length < 6)
        throw new CustomError.BadRequest(
          "Password baru tidak boleh kurang dari 6 karakter!"
        );

      if (newPassword !== confirmNewPassword)
        throw new CustomError.Unauthorized(
          "Password baru & konfirmasi password anda tidak sama!"
        );

      user.password = newPassword;
      await user.save();

      res.status(StatusCodes.OK).json({
        statusCode: StatusCodes.OK,
        message: "Berhasil mengubah password!",
        data: {
          user,
        },
      });
    } catch (error) {
      next(error);
    }
  },
};
