import "../styles/doctorcard.css";
import React, { useState } from "react";
import BookAppointment from "../components/BookAppointment";
import { toast } from "react-hot-toast";
import {
  FaPhone,
  FaMoneyBillWave,
  FaBriefcase,
  FaCalendar,
} from "react-icons/fa";

const DoctorCard = ({ ele }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const token = localStorage.getItem("token") || "";

  const handleModal = () => {
    if (token === "") {
      return toast.error("You must log in first");
    }
    setModalOpen(true);
  };

  return (
    <div className="doctor-card">
      <div className="doctor-card__header">
        <div className="doctor-card__avatar">
          <img
            src={
              ele?.userId?.pic ||
              "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg"
            }
            alt="profile"
          />
        </div>
        <div className="doctor-card__status">
          <span className="status-badge available">Available</span>
        </div>
      </div>

      <div className="doctor-card__content">
        <h3 className="doctor-card__name">
          Dr. {ele?.userId?.firstname + " " + ele?.userId?.lastname}
        </h3>

        <div className="doctor-card__specialty">
          <span className="specialty-tag">{ele?.specialization}</span>
        </div>

        <div className="doctor-card__info">
          <div className="info-item">
            <FaBriefcase className="info-icon" />
            <div className="info-text">
              <span className="info-label">Experience</span>
              <span className="info-value">{ele?.experience} years</span>
            </div>
          </div>

          <div className="info-item">
            <FaMoneyBillWave className="info-icon" />
            <div className="info-text">
              <span className="info-label">Consultation Fee</span>
              <span className="info-value">${ele?.fees}</span>
            </div>
          </div>

          <div className="info-item">
            <FaPhone className="info-icon" />
            <div className="info-text">
              <span className="info-label">Office Phone</span>
              <span className="info-value">{ele?.officePhone}</span>
            </div>
          </div>

          <div className="info-item full-width">
            <FaCalendar className="info-icon" />
            <div className="info-text">
              <span className="info-label">Working Days</span>
              <span className="info-value">{ele?.workingDays?.join(", ")}</span>
            </div>
          </div>
        </div>

        <button className="book-appointment-btn" onClick={handleModal}>
          Book Appointment
        </button>
      </div>

      {modalOpen && <BookAppointment setModalOpen={setModalOpen} ele={ele} />}
    </div>
  );
};

export default DoctorCard;
