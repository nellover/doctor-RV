// pages/DoctorAppointments.js
import React, { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import momentTimezonePlugin from "@fullcalendar/moment-timezone";
import momentPlugin from "@fullcalendar/moment";
import axios from "axios";
import toast from "react-hot-toast";
import { setLoading } from "../redux/reducers/rootSlice";
import Loading from "../components/Loading";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import jwt_decode from "jwt-decode";
import "../styles/user.css";
import { useSocket } from "../context/SocketProvider";

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const PerPage = 5;
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.root);
  const { userId } = jwt_decode(localStorage.getItem("token"));
  const socket = useSocket();

  const getAllAppoint = useCallback(async () => {
    try {
      dispatch(setLoading(true));
      const response = await axios.get(`/appointment/getallappointments?search=${userId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setAppointments(response.data);
      dispatch(setLoading(false));
    } catch (error) {
      console.error("Error fetching appointments:", error);
      toast.error("Failed to fetch appointments. Please try again.");
    }
  }, [dispatch, userId]);

  useEffect(() => {
    getAllAppoint();
  }, [getAllAppoint]);

  const totalPages = Math.ceil(appointments.length / PerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const renderPagination = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(
        <button key={i} onClick={() => handlePageChange(i)}>
          {i}
        </button>
      );
    }
    return pages;
  };

  const paginatedAppointments = appointments.slice(
    (currentPage - 1) * PerPage,
    currentPage * PerPage
  );

  const completeAppointment = async (appointment) => {
    try {
      await axios.put(
        "/appointment/completed",
        {
          appointid: appointment._id,
          doctorId: appointment.doctorId._id,
          doctorname: `${appointment.userId.firstname} ${appointment.userId.lastname}`,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      toast.success("Appointment completed successfully.");
      getAllAppoint();
    } catch (error) {
      console.error("Error completing appointment:", error);
      toast.error("Failed to complete appointment. Please try again.");
    }
  };

  const cancelAppointment = async (appointmentId) => {
    try {
      const confirm = window.confirm("Are you sure you want to cancel this appointment?");
      if (confirm) {
        const config = {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        };
        await toast.promise(
          axios.put("/appointment/cancel", { appointmentId }, config),
          {
            success: "Appointment cancelled successfully",
            error: "Unable to cancel appointment",
            loading: "Cancelling appointment...",
          }
        );
        getAllAppoint();
      }
    } catch (error) {
      console.error("Error cancelling appointment:", error);
      toast.error("Failed to cancel appointment. Please try again.");
    }
  };

  const calendarEvents = appointments.map((appointment) => ({
    id: appointment._id,
    title: `${appointment.userId.firstname} ${appointment.userId.lastname} - ${appointment.time}`,
    start: appointment.date,
    extendedProps: {
      status: appointment.status,
      age: appointment.age,
      gender: appointment.gender,
      number: appointment.number,
    },
  }));

  return (
    <>
      <Navbar />
      {loading ? (
        <Loading />
      ) : (
        <section className="container notif-section">
          <h2 className="page-heading">Your Appointments</h2>
          <div className="appointments-calendar">
            <div className="calendar-section">
              <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin, listPlugin, momentTimezonePlugin, momentPlugin]}
                initialView="dayGridMonth"
                events={calendarEvents}
                eventContent={(arg) => (
                  <div>
                    <p>{arg.event.title}</p>
                    <p>Status: {arg.event.extendedProps.status}</p>
                    <p>Age: {arg.event.extendedProps.age}</p>
                    <p>Gender: {arg.event.extendedProps.gender}</p>
                    <p>Number: {arg.event.extendedProps.number}</p>
                  </div>
                )}
              />
            </div>
            <div className="table-section">
              <table>
                <thead>
                  <tr>
                    <th>S.No</th>
                    <th>Doctor</th>
                    <th>P Name</th>
                    <th>P Age</th>
                    <th>P Gender</th>
                    <th>P Mobile No.</th>
                    <th>Appointment Date</th>
                    <th>Appointment Time</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedAppointments.map((appointment, index) => (
                    <tr key={appointment._id}>
                      <td>{(currentPage - 1) * PerPage + index + 1}</td>
                      <td>{`${appointment.doctorId.firstname} ${appointment.doctorId.lastname}`}</td>
                      <td>{`${appointment.userId.firstname} ${appointment.userId.lastname}`}</td>
                      <td>{appointment.age}</td>
                      <td>{appointment.gender}</td>
                      <td>{appointment.number}</td>
                      <td>{appointment.date}</td>
                      <td>{appointment.time}</td>
                      <td>{appointment.status}</td>
                      <td>
                        <button
                          className="btn user-btn complete-btn"
                          onClick={() => completeAppointment(appointment)}
                          disabled={appointment.status === "Completed"}
                        >
                          Complete
                        </button>
                        {appointment.status !== "Completed" && (
                          <button
                            className="btn user-btn cancel-btn"
                            onClick={() => cancelAppointment(appointment._id)}
                            disabled={appointment.status === "Cancelled"}
                          >
                            Cancel
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="pagination">{renderPagination()}</div>
            </div>
          </div>
        </section>
      )}
      <Footer />
    </>
  );
};

export default Appointments;