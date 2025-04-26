const { Router } = require("express");
const auth = require("../middleware/auth");
const {
  register,
  login,
  deleteuser,
  getallusers,
  updateprofile,
  getuser,
  changepassword,
  forgotpassword,
  resetpassword,
  updateUser,
} = require("../controllers/userController");

const router = Router();

router.get("/getuser/:id", auth, getuser);
router.get("/getallusers", auth, getallusers);
router.post("/register", register);
router.post("/login", login);
router.put("/updateprofile", auth, updateprofile);
router.put("/updateuser", auth, updateUser);
router.put("/changepassword", changepassword);
router.delete("/deleteuser", auth, deleteuser);
router.post("/forgotpassword", forgotpassword);
router.post("/resetpassword/:id/:token", resetpassword);

module.exports = router;
