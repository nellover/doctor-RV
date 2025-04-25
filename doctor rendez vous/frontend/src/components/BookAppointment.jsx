import React, { useState } from "react";
import { IoMdClose } from "react-icons/io";
import axios from "axios";
import toast from "react-hot-toast";

const BookAppointment = ({ setModalOpen, ele }) => {
  const [formDetails, setFormDetails] = useState({
    date: "",
    time: "",
    age: "",
    gender: "",
    number: "",
  });

  const inputChange = (e) => {
    const { name, value } = e.target;
    setFormDetails({
      ...formDetails,
      [name]: value,
    });
  };

  const bookAppointment = async (e) => {
    e.preventDefault();
    try {
      // Solution : Utilisez une URL absolue ou vérifiez votre configuration axios
      const API_BASE_URL = "http://localhost:5015"; // Remplacez par votre URL de base
      
      await toast.promise(
        axios.post(
          `${API_BASE_URL}/api/appointment/bookappointment`,
          {
            doctorId: ele?.userId?._id,
            date: formDetails.date,
            time: formDetails.time,
            age: formDetails.age,
            gender: formDetails.gender,
            number: formDetails.number,
            doctorname: `${ele?.userId?.firstname} ${ele?.userId?.lastname}`,
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        ),
        {
          success: "Rendez-vous réservé avec succès",
          // error: "Impossible de prendre rendez-vous",
          loading: "Réservation en cours...",
        }
      );
      setModalOpen(false);
    } catch (error) {
      return error;
    }
  };

  const generateTimeOptions = () => {
    const startHour = 8; // 8h
    const endHour = 18; // 18h
    const timeOptions = [];

    for (let hour = startHour; hour <= endHour; hour++) {
      timeOptions.push(`${hour}:00`);
      if (hour !== endHour) {
        timeOptions.push(`${hour}:30`);
      }
    }

    return timeOptions;
  };

  const timeOptions = generateTimeOptions();

  return (
    <div className="modal flex-center">
      <div className="modal__content">
        <h2 className="page-heading">Book Appointment</h2>
        <IoMdClose
          onClick={() => {
            setModalOpen(false);
          }}
          className="close-btn"
        />
        <div className="register-container flex-center book">
          <form className="register-form">
            <input
              type="date"
              name="date"
              className="form-input"
              value={formDetails.date}
              onChange={inputChange}
            />
            <select
              name="time"
              className="form-input"
              value={formDetails.time}
              onChange={inputChange}
            >
              <option value="">Select Time</option>
              {timeOptions.map((time) => (
                <option key={time} value={time}>
                  {time}
                </option>
              ))}
            </select>
            <input
              type="number"
              name="age"
              placeholder="Age"
              className="form-input"
              value={formDetails.age}
              onChange={inputChange}
              required
            />
            <select
              name="gender"
              className="form-input"
              value={formDetails.gender}
              onChange={inputChange}
              required
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
            <input
              type="number"
              name="number"
              placeholder="Mobile Number"
              className="form-input"
              value={formDetails.number}
              onChange={inputChange}
              required
            />
            <button
              type="submit"
              className="btn form-btn"
              onClick={bookAppointment}
            >
              book
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BookAppointment;