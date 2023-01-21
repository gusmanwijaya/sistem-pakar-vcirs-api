const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name tidak boleh kosong!"],
      minLength: 3,
      maxLength: 50,
    },
    username: {
      type: String,
      required: [true, "Username tidak boleh kosong!"],
      unique: true,
    },
    password: {
      type: String,
      required: [true, "Password tidak boleh kosong!"],
      minLength: 6,
    },
    role: {
      type: String,
      enum: ["admin", "pengguna"],
      default: "pengguna",
    },
  },
  { timestamps: true }
);

// UserSchema.path("username").validate(
//   async function (value) {
//     try {
//       const count = await this.model("User").countDocuments({
//         username: value,
//       });
//       return !count;
//     } catch (error) {
//       throw error;
//     }
//   },
//   (attr) => `Username : ${attr.value} sudah terdaftar!`
// );

UserSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

module.exports = mongoose.model("User", UserSchema);
