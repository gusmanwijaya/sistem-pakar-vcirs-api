const express = require("express");
const router = express.Router();

const { getAll } = require("./controller");
const {
  authenticationUsers,
  authorizeRoles,
} = require("../../../middleware/auth");

router.use(authenticationUsers);
router.use(authorizeRoles("admin", "pengguna"));

router.get("/get-all", getAll);

module.exports = router;
