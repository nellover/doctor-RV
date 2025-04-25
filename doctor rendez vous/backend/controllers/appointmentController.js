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
    console.error("Error fetching appointments:", error);
    res.status(500).send("Unable to get appointments");
  }
};

const getBookedSlots = async (req, res) => {
  try {
    const { doctorId, date } = req.query;

    if (!doctorId || !date) {
      return res.status(400).send("Doctor ID and date are required");
    }

    const bookedSlots = await Appointment.find({
      doctorId,
      date,
      status: { $nin: ["Cancelled"] },
    }).select("time -_id");

    const bookedTimes = bookedSlots.map((slot) => slot.time);
    return res.json(bookedTimes);
  } catch (error) {
    console.error("Error fetching booked slots:", error);
    res.status(500).send("Unable to get booked slots");
  }
};

const bookappointment = async (req, res) => {
  try {
    // Validation des données
    const { date, time, age, gender, number, doctorId } = req.body;
    if (!date || !time || !age || !gender || !number || !doctorId) {
      return res.status(400).send("All fields are required");
    }

    // Vérification des conflits d'horaire
    const existingAppointment = await Appointment.findOne({
      doctorId,
      date,
      time,
      status: { $nin: ["Cancelled"] },
    });

    if (existingAppointment) {
      return res.status(400).send("This time slot is already booked");
    }

    const appointment = new Appointment({
      date,
      time,
      age,
      gender,
      number,
      doctorId,
      userId: req.locals,
    });

    const result = await appointment.save();

    // Créer une notification pour le médecin
    const user = await User.findById(req.locals);
    const notification = new Notification({
      userId: doctorId,
      content: `Nouveau rendez-vous avec ${user.firstname} ${user.lastname} le ${date} à ${time}`,
    });
    await notification.save();

    return res.status(201).send(result);
  } catch (error) {
    console.error("Error booking appointment:", error);
    res
      .status(500)
      .send("Une erreur est survenue lors de la prise de rendez-vous");
  }
};

const completed = async (req, res) => {
  try {
    const { appointid, doctorId, doctorname } = req.body;

    const appointment = await Appointment.findById(appointid);
    if (!appointment) {
      return res.status(404).send("Appointment not found");
    }

    appointment.status = "Completed";
    await appointment.save();

    // Notifications
    const userNotification = new Notification({
      userId: req.locals,
      content: `Your appointment with ${doctorname} has been completed`,
    });
    await userNotification.save();

    const doctorNotification = new Notification({
      userId: doctorId,
      content: `Appointment with patient completed successfully`,
    });
    await doctorNotification.save();

    return res.status(200).send("Appointment completed successfully");
  } catch (error) {
    console.error("Error completing appointment:", error);
    res.status(500).send("Unable to complete appointment");
  }
};

const cancelAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.body;
    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) {
      return res.status(404).send("Appointment not found");
    }

    if (
      appointment.status === "Completed" ||
      appointment.status === "Cancelled"
    ) {
      return res
        .status(400)
        .send("Cannot cancel a completed or already cancelled appointment");
    }

    appointment.status = "Cancelled";
    await appointment.save();

    // Notifications pour le patient et le médecin
    const doctor = await User.findById(appointment.doctorId);
    const patient = await User.findById(appointment.userId);

    const userNotification = new Notification({
      userId: appointment.userId,
      content: `Your appointment with Dr. ${doctor.firstname} ${doctor.lastname} on ${appointment.date} at ${appointment.time} has been cancelled.`,
    });
    await userNotification.save();

    const doctorNotification = new Notification({
      userId: appointment.doctorId,
      content: `Appointment with ${patient.firstname} ${patient.lastname} on ${appointment.date} at ${appointment.time} has been cancelled.`,
    });
    await doctorNotification.save();

    return res.status(200).send("Appointment cancelled successfully");
  } catch (error) {
    console.error("Error cancelling appointment:", error);
    return res.status(500).send("Unable to cancel appointment");
  }
};

module.exports = {
  getallappointments,
  getBookedSlots,
  bookappointment,
  completed,
  cancelAppointment,
};
