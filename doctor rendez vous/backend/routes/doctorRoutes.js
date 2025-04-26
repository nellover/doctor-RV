const { Router } = require("express");
const auth = require("../middleware/auth");
const {
  getalldoctors,
  getnotdoctors,
  deletedoctor,
  applyfordoctor,
  acceptdoctor,
  rejectdoctor,
  updateDoctor,
} = require("../controllers/doctorController");

const router = Router();

router.get("/getalldoctors", auth, getalldoctors);
router.get("/getnotdoctors", auth, getnotdoctors);
router.post("/applyfordoctor", auth, applyfordoctor);
router.put("/deletedoctor", auth, deletedoctor);
router.put("/acceptdoctor", auth, acceptdoctor);
router.put("/rejectdoctor", auth, rejectdoctor);
router.put("/updatedoctor", auth, updateDoctor);

module.exports = router;
