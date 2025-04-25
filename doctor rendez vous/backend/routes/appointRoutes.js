const express = require("express");
const auth = require("../middleware/auth");
const appointmentController = require("../controllers/appointmentController");

const appointRouter = express.Router();

appointRouter.get(
  "/getallappointments",
  auth,
  appointmentController.getallappointments
);

appointRouter.get("/getbookedslots", appointmentController.getBookedSlots);

appointRouter.post(
  "/bookappointment",
  auth,
  appointmentController.bookappointment
);

appointRouter.put("/completed", auth, appointmentController.completed);
appointRouter.put("/cancel", auth, appointmentController.cancelAppointment);

module.exports = appointRouter;
