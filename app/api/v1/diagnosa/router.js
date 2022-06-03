const express = require("express");
const router = express.Router();

const { create } = require("./controller");
const {
  authenticationUsers,
  authorizeRoles,
} = require("../../../middleware/auth");

router.use(authenticationUsers);
router.use(authorizeRoles("admin", "pengguna"));

router.post("/create", create);

module.exports = router;
