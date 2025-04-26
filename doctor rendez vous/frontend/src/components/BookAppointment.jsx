import React, { useState, useEffect, useCallback } from "react";
import { IoMdClose } from "react-icons/io";
import {
  FaCalendarAlt,
  FaClock,
  FaUser,
  FaVenusMars,
  FaPhone,
} from "react-icons/fa";
import axios from "axios";
import toast from "react-hot-toast";
import "../styles/bookappointment.css";

const BookAppointment = ({ setModalOpen, ele }) => {
  const [formDetails, setFormDetails] = useState({
    date: "",
    time: "",
    doctorId: "",
    userId: "",
    description: "",
    number: "",
  });
  const [bookedSlots, setBookedSlots] = useState([]);

  const fetchBookedSlots = useCallback(
    async (selectedDate) => {
      try {
        const response = await axios.get("/appointment/getbookedslots", {
          params: {
            doctorId: ele?.userId?._id,
            date: selectedDate,
          },
        });
        setBookedSlots(response.data);
      } catch (error) {
        console.error(
          "Erreur lors de la récupération des créneaux réservés:",
          error
        );
      }
    },
    [ele?.userId?._id]
  );

  const isWorkingDay = (date) => {
    const dayOfWeek = new Date(date).toLocaleString("en-US", {
      weekday: "long",
    });
    return ele?.workingDays?.includes(dayOfWeek);
  };

  const inputChange = (e) => {
    const { name, value } = e.target;

    // Reset time if date changes
    if (name === "date" && !isWorkingDay(value)) {
      toast.error("Doctor is not available on this day");
      return setFormDetails({
        ...formDetails,
        date: value,
        time: "",
      });
    }

    setFormDetails({
      ...formDetails,
      [name]: value,
    });
  };

  const bookAppointment = async (e) => {
    e.preventDefault();
    try {
      await toast.promise(
        axios.post(
          "/appointment/bookappointment",
          {
            doctorId: ele?.userId?._id,
            date: formDetails.date,
            time: formDetails.time,
            age: formDetails.age,
            gender: formDetails.gender,
            number: formDetails.number,
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        ),
        {
          success: "Rendez-vous réservé avec succès",
          loading: "Réservation en cours...",
          error: "Erreur lors de la réservation. Veuillez réessayer.",
        }
      );
      setModalOpen(false);
    } catch (error) {
      console.error("Erreur de réservation:", error);
    }
  };

  const generateTimeOptions = () => {
    const startHour = 8;
    const endHour = 18;
    const timeOptions = [];

    for (let hour = startHour; hour <= endHour; hour++) {
      const fullHour = `${hour}:00`;
      const halfHour = `${hour}:30`;

      if (!bookedSlots.includes(fullHour)) {
        timeOptions.push(fullHour);
      }

      if (hour !== endHour && !bookedSlots.includes(halfHour)) {
        timeOptions.push(halfHour);
      }
    }

    return timeOptions;
  };

  // Réinitialiser le créneau horaire si la date change
  useEffect(() => {
    setFormDetails((prev) => ({ ...prev, time: "" }));
  }, [bookedSlots]);

  useEffect(() => {
    if (formDetails.date) {
      fetchBookedSlots(formDetails.date);
    }
  }, [formDetails.date, fetchBookedSlots]);

  return (
    <div className="modal-overlay">
      <div className="appointment-modal">
        <div className="modal-header">
          <h2>Book Appointment</h2>
          <button className="close-btn" onClick={() => setModalOpen(false)}>
            <IoMdClose />
          </button>
        </div>

        <div className="doctor-info">
          <img
            src={
              ele?.userId?.pic ||
              "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg"
            }
            alt="Doctor"
          />
          <div>
            <h3>
              Dr. {ele?.userId?.firstname} {ele?.userId?.lastname}
            </h3>
            <p>{ele?.specialization}</p>
            <p className="consultation-fee">Consultation Fee: ${ele?.fees}</p>
          </div>
        </div>

        <form className="appointment-form" onSubmit={bookAppointment}>
          <div className="form-grid">
            <div className="form-group">
              <label>
                <FaCalendarAlt className="input-icon" />
                Date
              </label>
              <input
                type="date"
                name="date"
                value={formDetails.date}
                onChange={inputChange}
                min={new Date().toISOString().split("T")[0]}
                required
              />
              {formDetails.date && !isWorkingDay(formDetails.date) && (
                <p className="error-text">
                  Doctor is not available on this day
                </p>
              )}
            </div>

            <div className="form-group">
              <label>
                <FaClock className="input-icon" />
                Time
              </label>
              <select
                name="time"
                value={formDetails.time}
                onChange={inputChange}
                required
                disabled={!formDetails.date || !isWorkingDay(formDetails.date)}
              >
                <option value="">Select Time</option>
                {generateTimeOptions().map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>
                <FaUser className="input-icon" />
                Age
              </label>
              <input
                type="number"
                name="age"
                placeholder="Enter your age"
                value={formDetails.age}
                onChange={inputChange}
                min="0"
                max="150"
                required
              />
            </div>

            <div className="form-group">
              <label>
                <FaVenusMars className="input-icon" />
                Gender
              </label>
              <select
                name="gender"
                value={formDetails.gender}
                onChange={inputChange}
                required
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="form-group full-width">
              <label>
                <FaPhone className="input-icon" />
                Phone Number
              </label>
              <input
                type="tel"
                name="number"
                placeholder="Enter your phone number"
                value={formDetails.number}
                onChange={inputChange}
                pattern="[0-9]{8,}"
                title="Please enter a valid phone number (minimum 8 digits)"
                required
              />
            </div>
          </div>

          <div className="form-footer">
            <button
              type="button"
              className="cancel-btn"
              onClick={() => setModalOpen(false)}
            >
              Cancel
            </button>
            <button type="submit" className="confirm-btn">
              Confirm Booking
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookAppointment;
