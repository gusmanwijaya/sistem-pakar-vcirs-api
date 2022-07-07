const express = require("express");
const router = express.Router();

const {
  getHighest,
  getAll,
  getForUser,
  getForDetail,
} = require("./controller");
const {
  authenticationUsers,
  authorizeRoles,
} = require("../../../middleware/auth");

router.get(
  "/get-highest",
  [authenticationUsers, authorizeRoles("admin", "pengguna")],
  getHighest
);
router.get(
  "/get-for-user",
  [authenticationUsers, authorizeRoles("pengguna")],
  getForUser
);
router.get(
  "/get-for-detail/:id",
  [authenticationUsers, authorizeRoles("admin", "pengguna")],
  getForDetail
);
router.get("/get-all", [authenticationUsers, authorizeRoles("admin")], getAll);

module.exports = router;
