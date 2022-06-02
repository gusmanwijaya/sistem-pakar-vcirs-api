const express = require("express");
const router = express.Router();

const { getAll, create, update, destroy, getOne } = require("./controller");
const {
  authenticationUsers,
  authorizeRoles,
} = require("../../../middleware/auth");
const uploadMiddleware = require("../../../middleware/multer");

router.use(authenticationUsers);
router.use(authorizeRoles("admin"));

router.get("/get-all", getAll);
router.get("/get-one/:id", getOne);
router.post("/create", uploadMiddleware.single("foto"), create);
router.put("/update/:id", uploadMiddleware.single("foto"), update);
router.delete("/destroy/:id", destroy);

module.exports = router;
