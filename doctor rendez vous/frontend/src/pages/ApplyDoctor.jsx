import React, { useState } from "react";
import "../styles/contact.css";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

axios.defaults.baseURL = process.env.REACT_APP_SERVER_DOMAIN;

const ApplyDoctor = () => {
  const navigate = useNavigate();
  const [formDetails, setFormDetails] = useState({
    specialization: "",
    experience: "",
    fees: "",
    officePhone: "",
    workingDays: [],
  });

  const weekDays = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  const inputChange = (e) => {
    const { name, value } = e.target;
    if (name === "workingDays") {
      const days = [...formDetails.workingDays];
      if (e.target.checked) {
        days.push(value);
      } else {
        const index = days.indexOf(value);
        if (index > -1) {
          days.splice(index, 1);
        }
      }
      return setFormDetails({
        ...formDetails,
        workingDays: days,
      });
    }
    return setFormDetails({
      ...formDetails,
      [name]: value,
    });
  };

  const btnClick = async (e) => {
    e.preventDefault();
    try {
      if (!formDetails.workingDays.length) {
        return toast.error("Please select at least one working day");
      }
      if (!formDetails.officePhone) {
        return toast.error("Please enter office phone number");
      }
      await toast.promise(
        axios.post(
          "/doctor/applyfordoctor",
          {
            formDetails,
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        ),
        {
          success: "Doctor application sent successfully",
          error: "Unable to send Doctor application",
          loading: "Sending doctor application...",
        }
      );

      navigate("/");
    } catch (error) {
      return error;
    }
  };

  return (
    <>
      <Navbar />
      <section
        className="register-section flex-center apply-doctor"
        id="contact"
      >
        <div className="register-container flex-center contact">
          <h2 className="form-heading">Apply for Doctor</h2>
          <form className="register-form">
            <input
              type="text"
              name="specialization"
              className="form-input"
              placeholder="Enter your specialization"
              value={formDetails.specialization}
              onChange={inputChange}
            />
            <input
              type="number"
              name="experience"
              className="form-input"
              placeholder="Enter your experience (in years)"
              value={formDetails.experience}
              onChange={inputChange}
            />
            <input
              type="number"
              name="fees"
              className="form-input"
              placeholder="Enter your fees (in dollars)"
              value={formDetails.fees}
              onChange={inputChange}
            />
            <input
              type="tel"
              name="officePhone"
              className="form-input"
              placeholder="Enter office phone number"
              value={formDetails.officePhone}
              onChange={inputChange}
              pattern="[0-9]{8,}"
              title="Please enter a valid phone number (minimum 8 digits)"
            />
            <div className="working-days-container">
              <p className="working-days-title">Select Working Days:</p>
              <div className="working-days-checkboxes">
                {weekDays.map((day) => (
                  <label key={day} className="day-checkbox">
                    <input
                      type="checkbox"
                      name="workingDays"
                      value={day}
                      checked={formDetails.workingDays.includes(day)}
                      onChange={inputChange}
                    />
                    {day}
                  </label>
                ))}
              </div>
            </div>
            <button type="submit" className="btn form-btn" onClick={btnClick}>
              apply
            </button>
          </form>
        </div>
      </section>
      <Footer />
    </>
  );
};

export default ApplyDoctor;
