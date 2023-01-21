const express = require("express");
const router = express.Router();

const { ubahPassword } = require("./controller");
const { authenticationUsers } = require("../../../middleware/auth");

router.use(authenticationUsers);

router.patch("/ubah-password/:id", ubahPassword);

module.exports = router;
