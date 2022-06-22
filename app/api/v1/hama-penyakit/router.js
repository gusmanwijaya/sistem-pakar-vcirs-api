const express = require("express");
const router = express.Router();

const {
  getAll,
  create,
  update,
  destroy,
  getOne,
  getForSelect,
} = require("./controller");
const {
  authenticationUsers,
  authorizeRoles,
} = require("../../../middleware/auth");
const uploadMiddleware = require("../../../middleware/multer");

router.use(authenticationUsers);

router.get("/get-all", authorizeRoles("admin", "pengguna"), getAll);
router.get("/get-for-select", authorizeRoles("admin"), getForSelect);
router.get("/get-one/:id", authorizeRoles("admin", "pengguna"), getOne);
router.post(
  "/create",
  uploadMiddleware.single("foto"),
  authorizeRoles("admin"),
  create
);
router.put(
  "/update/:id",
  uploadMiddleware.single("foto"),
  authorizeRoles("admin"),
  update
);
router.delete("/destroy/:id", destroy);

module.exports = router;
