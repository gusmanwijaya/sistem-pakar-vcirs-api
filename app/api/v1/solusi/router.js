const express = require("express");
const router = express.Router();

const { getAll, create, update, destroy, getOne } = require("./controller");
const {
  authenticationUsers,
  authorizeRoles,
} = require("../../../middleware/auth");

router.use(authenticationUsers);
router.use(authorizeRoles("admin"));

router.get("/get-all", getAll);
router.get("/get-one/:id", getOne);
router.post("/create", create);
router.put("/update/:id", update);
router.delete("/destroy/:id", destroy);

module.exports = router;
