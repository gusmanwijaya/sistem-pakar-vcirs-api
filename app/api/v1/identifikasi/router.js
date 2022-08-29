const express = require("express");
const router = express.Router();

const { create, destroy, get, getGejala, getOne } = require("./controller");
const {
  authenticationUsers,
  authorizeRoles,
} = require("../../../middleware/auth");

router.use(authenticationUsers);
router.use(authorizeRoles("admin", "pengguna"));

router.post("/create", create);
router.get("/get", get);
router.get("/get-one/:id", getOne);
router.get("/get-gejala", getGejala);
router.delete("/destroy/:id", destroy);

module.exports = router;
