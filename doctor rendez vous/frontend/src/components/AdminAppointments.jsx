import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Loading from "./Loading";
import { setLoading } from "../redux/reducers/rootSlice";
import { useDispatch, useSelector } from "react-redux";
import Empty from "./Empty";
import fetchData from "../helper/apiCall";
import "../styles/user.css";

axios.defaults.baseURL = process.env.REACT_APP_SERVER_DOMAIN;

const AdminAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.root);

  const getAllAppoint = async (e) => {
    try {
      dispatch(setLoading(true));
      const temp = await fetchData(`/appointment/getallappointments`);
      setAppointments(temp);
      dispatch(setLoading(false));
    } catch (error) {
      console.error("Error fetching appointments:", error);
      toast.error("Failed to fetch appointments. Please try again.");
    }
  };

  useEffect(() => {
    getAllAppoint();
  }, []);

  const complete = async (ele) => {
    try {
      await toast.promise(
        axios.put(
          "/appointment/completed",
          {
            appointid: ele?._id,
            doctorId: ele?.doctorId._id,
            doctorname: `${ele?.userId?.firstname} ${ele?.userId?.lastname}`,
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        ),
        {
          success: "Appointment completed successfully",
          error: "Unable to complete appointment",
          loading: "Completing appointment...",
        }
      );
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
        await toast.promise(
          axios.put(
            "/appointment/cancel",
            { appointmentId },
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          ),
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

  return (
    <>
      {loading ? (
        <Loading />
      ) : (
        <section className="user-section">
          <h3 className="home-sub-heading">All Appointments</h3>
          {appointments.length > 0 ? (
            <div className="user-container">
              <table>
                <thead>
                  <tr>
                    <th>S.No</th>
                    <th>Doctor</th>
                    <th>P Name</th>
                    <th>P Age</th>
                    <th>P Gender</th>
                    <th>P Mobile No.</th>
                    <th>P bloodGroup</th>
                    <th>P Family Diseases</th>
                    <th>Appointment Date</th>
                    <th>Appointment Time</th>
                    <th>Booking Date</th>
                    <th>Booking Time</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map((ele, i) => (
                    <tr key={ele?._id}>
                      <td>{i + 1}</td>
                      <td>
                        {ele?.doctorId?.firstname + " " + ele?.doctorId?.lastname}
                      </td>
                      <td>
                        {ele?.userId?.firstname + " " + ele?.userId?.lastname}
                      </td>
                      <td>{ele?.age}</td>
                      <td>{ele?.gender}</td>
                      <td>{ele?.number}</td>
                      <td>{ele?.bloodGroup}</td>
                      <td>{ele?.familyDiseases}</td>
                      <td>{ele?.date}</td>
                      <td>{ele?.time}</td>
                      <td>{ele?.createdAt.split("T")[0]}</td>
                      <td>{ele?.updatedAt.split("T")[1].split(".")[0]}</td>
                      <td>{ele?.status}</td>
                      <td>
                        <button
                          className={`btn user-btn accept-btn ${
                            ele?.status === "Completed" ? "disable-btn" : ""
                          }`}
                          disabled={ele?.status === "Completed"}
                          onClick={() => complete(ele)}
                        >
                          Complete
                        </button>
                        <button
                          className={`btn user-btn cancel-btn ${
                            ele?.status === "Cancelled" || ele?.status === "Completed"
                              ? "disable-btn"
                              : ""
                          }`}
                          disabled={ele?.status === "Cancelled" || ele?.status === "Completed"}
                          onClick={() => cancelAppointment(ele?._id)}
                        >
                          Cancel
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <Empty />
          )}
        </section>
      )}
    </>
  );
};

export default AdminAppointments;