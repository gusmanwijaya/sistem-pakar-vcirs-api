const express = require("express");
const router = express.Router();

const { create, getAll, destroy, getOne } = require("./controller");
const {
  authenticationUsers,
  authorizeRoles,
} = require("../../../middleware/auth");

router.use(authenticationUsers);
router.use(authorizeRoles("admin", "pengguna"));

router.post("/create", create);
router.get("/get-all", getAll);
router.get("/get-one/:id", getOne);
router.delete("/destroy/:id", destroy);

module.exports = router;
