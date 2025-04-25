const Appointment = require("../models/appointmentModel");
const Notification = require("../models/notificationModel");
const User = require("../models/userModel");

const getallappointments = async (req, res) => {
  try {
    const keyword = req.query.search
      ? {
          $or: [{ userId: req.query.search }, { doctorId: req.query.search }],
        }
      : {};

    const appointments = await Appointment.find(keyword)
      .populate("doctorId")
      .populate("userId");
    return res.send(appointments);
  } catch (error) {
    res.status(500).send("Unable to get apponintments");
  }
};

// controllers/appointmentController.js
const bookappointment = async (req, res) => {
  try {
    const appointment = new Appointment({
      date: req.body.date,
      time: req.body.time,
      age: req.body.age,
      gender: req.body.gender,
      number: req.body.number,
      doctorId: req.body.doctorId,
      userId: req.locals,
    });

    const result = await appointment.save();
    io.emit("newAppointment", result); // Emit the new appointment event
    return res.status(201).send(result);
  } catch (error) {
    console.log("error", error);
    res.status(500).send("Unable to book appointment");
  }
};

const completed = async (req, res) => {
  try {
    const alreadyFound = await Appointment.findOneAndUpdate(
      { _id: req.body.appointid },
      { status: "Completed" }
    );

    const usernotification = Notification({
      userId: req.locals,
      content: `Your appointment with ${req.body.doctorname} has been completed`,
    });

    await usernotification.save();

    const user = await User.findById(req.locals);

    const doctornotification = Notification({
      userId: req.body.doctorId,
      content: `Your appointment with ${user.firstname} ${user.lastname} has been completed`,
    });

    await doctornotification.save();

    return res.status(201).send("Appointment completed");
  } catch (error) {
    res.status(500).send("Unable to complete appointment");
  }
};
// const cancelAppointment = async (req, res) => {
//   try {
//     const { appointmentId } = req.body;
//     const appointment = await Appointment.findById(appointmentId);

//     if (!appointment) {
//       return res.status(404).send("Appointment not found");
//     }

//     if (appointment.status === "Completed") {
//       return res.status(400).send("Cannot cancel a completed appointment");
//     }

//     appointment.status = "Cancelled";
//     await appointment.save();

//     // Send notifications to the user and the specialist
//     const userNotification = new Notification({
//       userId: appointment.userId,
//       content: `Your appointment with Dr. ${appointment.doctorId.firstname} on ${appointment.date} at ${appointment.time} has been cancelled.`,
//     });
//     await userNotification.save();

//     const doctorNotification = new Notification({
//       userId: appointment.doctorId,
//       content: `Your appointment with ${appointment.userId.firstname} ${appointment.userId.lastname} on ${appointment.date} at ${appointment.time} has been cancelled.`,
//     });
//     await doctorNotification.save();

//     return res.status(200).send("Appointment cancelled successfully");
//   } catch (error) {
//     console.error("Error cancelling appointment:", error);
//     return res.status(500).send("Unable to cancel appointment");
//   }
// };
// appointmentController.js
// appointmentController.js
// appointmentController.js
const cancelAppointment = async (req, res) => {
  try {
    console.log("Received cancel request for appointment ID:", req.body.appointmentId);
    const { appointmentId } = req.body;
    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) {
      return res.status(404).send("Appointment not found");
    }

    if (appointment.status === "Completed" || appointment.status === "Cancelled") {
      return res.status(400).send("Cannot cancel a completed or already cancelled appointment");
    }

    if (appointment.doctorId.toString() !== req.locals.toString()) {
      return res.status(403).send("You are not authorized to cancel this appointment");
    }

    appointment.status = "Cancelled";
    await appointment.save();

    // Send notifications to the user
    const userNotification = new Notification({
      userId: appointment.userId,
      content: `Your appointment with Dr. ${appointment.doctorId.firstname} on ${appointment.date} at ${appointment.time} has been cancelled.`,
    });
    await userNotification.save();

    return res.status(200).send("Appointment cancelled successfully");
  } catch (error) {
    console.error("Error cancelling appointment:", error);
    return res.status(500).send("Unable to cancel appointment");
  }
};



module.exports = {
  getallappointments,
  bookappointment,
  completed,
  cancelAppointment,
};
