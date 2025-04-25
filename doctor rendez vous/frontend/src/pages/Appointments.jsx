// pages/DoctorAppointments.js
import React, { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import interactionPlugin from "@fullcalendar/interaction";
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
      const response = await axios.get(
        `/appointment/getallappointments?search=${userId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
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
      const confirm = window.confirm(
        "Are you sure you want to cancel this appointment?"
      );
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
    title: `${appointment.userId.firstname} ${appointment.userId.lastname}`,
    start: `${appointment.date}T${appointment.time}`,
    end: `${appointment.date}T${parseInt(appointment.time.split(":")[0]) + 1}:${
      appointment.time.split(":")[1]
    }`,
    className: `status-${appointment.status.toLowerCase()}`,
    extendedProps: {
      status: appointment.status,
      age: appointment.age,
      gender: appointment.gender,
      number: appointment.number,
      patientName: `${appointment.userId.firstname} ${appointment.userId.lastname}`,
    },
  }));

  const handleEventClick = (info) => {
    const event = info.event;
    const props = event.extendedProps;

    toast(
      (t) => (
        <div className="event-tooltip">
          <h3>Détails du rendez-vous</h3>
          <p>
            <strong>Patient:</strong> {props.patientName}
          </p>
          <p>
            <strong>Statut:</strong> {props.status}
          </p>
          <p>
            <strong>Date:</strong> {event.start.toLocaleDateString()}
          </p>
          <p>
            <strong>Heure:</strong>{" "}
            {event.start.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
          <p>
            <strong>Âge:</strong> {props.age}
          </p>
          <p>
            <strong>Genre:</strong> {props.gender}
          </p>
          <p>
            <strong>Téléphone:</strong> {props.number}
          </p>
        </div>
      ),
      {
        duration: 5000,
        style: {
          background: "#fff",
          color: "#1f2937",
          padding: "1rem",
          borderRadius: "8px",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        },
      }
    );
  };

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
                plugins={[
                  dayGridPlugin,
                  timeGridPlugin,
                  listPlugin,
                  interactionPlugin,
                  momentTimezonePlugin,
                  momentPlugin,
                ]}
                initialView="dayGridMonth"
                headerToolbar={{
                  left: "prev,next today",
                  center: "title",
                  right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek",
                }}
                views={{
                  timeGridWeek: {
                    titleFormat: {
                      year: "numeric",
                      month: "short",
                      day: "2-digit",
                    },
                  },
                  timeGridDay: {
                    titleFormat: {
                      year: "numeric",
                      month: "short",
                      day: "2-digit",
                    },
                  },
                }}
                events={calendarEvents}
                eventClick={handleEventClick}
                eventContent={(arg) => (
                  <div className="calendar-event">
                    <div className="event-time">{arg.timeText}</div>
                    <div className="event-title">{arg.event.title}</div>
                    <div className="event-status">
                      {arg.event.extendedProps.status}
                    </div>
                  </div>
                )}
                slotMinTime="08:00:00"
                slotMaxTime="20:00:00"
                slotDuration="00:30:00"
                allDaySlot={false}
                nowIndicator={true}
                dayMaxEvents={true}
                eventMaxStack={3}
                locale="fr"
              />
            </div>

            <div className="table-section">
              <div className="table-header">
                <h3 className="table-title">Liste des rendez-vous</h3>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>N°</th>
                    <th>Patient</th>
                    <th>Date</th>
                    <th>Heure</th>
                    <th>Statut</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedAppointments.map((appointment, index) => (
                    <tr key={appointment._id}>
                      <td>{(currentPage - 1) * PerPage + index + 1}</td>
                      <td>{`${appointment.userId.firstname} ${appointment.userId.lastname}`}</td>
                      <td>{appointment.date}</td>
                      <td>{appointment.time}</td>
                      <td>
                        <span
                          className={`status-badge status-${appointment.status.toLowerCase()}`}
                        >
                          {appointment.status}
                        </span>
                      </td>
                      <td className="actions">
                        <button
                          className="btn complete-btn"
                          onClick={() => completeAppointment(appointment)}
                          disabled={appointment.status === "Completed"}
                        >
                          Terminer
                        </button>
                        {appointment.status !== "Completed" && (
                          <button
                            className="btn cancel-btn"
                            onClick={() => cancelAppointment(appointment._id)}
                            disabled={appointment.status === "Cancelled"}
                          >
                            Annuler
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {totalPages > 1 && (
                <div className="pagination">{renderPagination()}</div>
              )}
            </div>
          </div>
        </section>
      )}
      <Footer />
    </>
  );
};

export default Appointments;
