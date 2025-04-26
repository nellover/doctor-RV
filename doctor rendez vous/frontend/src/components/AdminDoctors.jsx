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

const AdminDoctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [editingDoctor, setEditingDoctor] = useState(null);

  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.root);

  const getAllDoctors = async () => {
    try {
      dispatch(setLoading(true));
      let url = "/doctor/getalldoctors";
      if (filter !== "all") {
        url += `?filter=${filter}`;
      }
      if (searchTerm.trim() !== "") {
        url += `${filter !== "all" ? "&" : "?"}search=${searchTerm}`;
      }
      const temp = await fetchData(url);
      setDoctors(temp);
      dispatch(setLoading(false));
    } catch (error) {}
  };

  const deleteUser = async (userId) => {
    try {
      const confirm = window.confirm("Are you sure you want to delete?");
      if (confirm) {
        await toast.promise(
          axios.put(
            "/doctor/deletedoctor",
            { userId },
            {
              headers: {
                authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          ),
          {
            success: "Doctor deleted successfully",
            error: "Unable to delete Doctor",
            loading: "Deleting Doctor...",
          }
        );
        getAllDoctors();
      }
    } catch (error) {
      return error;
    }
  };

  const handleEdit = (doctor) => {
    setEditingDoctor(doctor);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await toast.promise(
        axios.put(
          "/doctor/updatedoctor",
          {
            doctorId: editingDoctor._id,
            updates: {
              specialization: editingDoctor.specialization,
              experience: editingDoctor.experience,
              fees: editingDoctor.fees,
              timing: editingDoctor.timing,
            },
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        ),
        {
          success: "Doctor updated successfully",
          error: "Unable to update doctor",
          loading: "Updating doctor...",
        }
      );
      setEditingDoctor(null);
      getAllDoctors();
    } catch (error) {
      return error;
    }
  };

  useEffect(() => {
    getAllDoctors();
  }, []);

  const filteredDoctors = doctors.filter((doc) => {
    if (filter === "all") {
      return true;
    } else if (filter === "specialization") {
      return doc.specialization
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    } else if (filter === "firstname") {
      return (
        doc.userId &&
        doc.userId.firstname.toLowerCase().includes(searchTerm.toLowerCase())
      );
    } else {
      return true;
    }
  });

  return (
    <>
      {loading ? (
        <Loading />
      ) : (
        <section className="user-section">
          <div className="user-section-header">
            <div className="user-section-filters">
              <select
                className="filter-select"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="all">All</option>
                <option value="specialization">Specialization</option>
              </select>
              <input
                type="text"
                className="form-input"
                id="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search"
              />
            </div>
          </div>
          <h3 className="home-sub-heading">All Doctors</h3>
          {filteredDoctors.length > 0 ? (
            <div className="user-container">
              <table>
                <thead>
                  <tr>
                    <th>S.No</th>
                    <th>Pic</th>
                    <th>First Name</th>
                    <th>Last Name</th>
                    <th>Email</th>
                    <th>Mobile No.</th>
                    <th>Experience</th>
                    <th>Specialization</th>
                    <th>Fees</th>
                    <th>Timing</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDoctors.map((ele, i) => (
                    <tr key={ele._id}>
                      {editingDoctor && editingDoctor._id === ele._id ? (
                        <>
                          <td>{i + 1}</td>
                          <td>
                            <img
                              className="user-table-pic"
                              src={ele.userId.pic}
                              alt={ele.userId.firstname}
                            />
                          </td>
                          <td>{ele.userId.firstname}</td>
                          <td>{ele.userId.lastname}</td>
                          <td>{ele.userId.email}</td>
                          <td>{ele.userId.mobile}</td>
                          <td>
                            <input
                              type="text"
                              value={editingDoctor.experience}
                              onChange={(e) =>
                                setEditingDoctor({
                                  ...editingDoctor,
                                  experience: e.target.value,
                                })
                              }
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              value={editingDoctor.specialization}
                              onChange={(e) =>
                                setEditingDoctor({
                                  ...editingDoctor,
                                  specialization: e.target.value,
                                })
                              }
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              value={editingDoctor.fees}
                              onChange={(e) =>
                                setEditingDoctor({
                                  ...editingDoctor,
                                  fees: e.target.value,
                                })
                              }
                            />
                          </td>
                          <td>
                            <select
                              value={editingDoctor.timing}
                              onChange={(e) =>
                                setEditingDoctor({
                                  ...editingDoctor,
                                  timing: e.target.value,
                                })
                              }
                            >
                              <option value="morning">Morning</option>
                              <option value="afternoon">Afternoon</option>
                              <option value="evening">Evening</option>
                              <option value="night">Night</option>
                            </select>
                          </td>
                          <td className="select">
                            <button
                              className="btn user-btn accept-btn"
                              onClick={handleUpdate}
                            >
                              Save
                            </button>
                            <button
                              className="btn user-btn cancel-btn"
                              onClick={() => setEditingDoctor(null)}
                            >
                              Cancel
                            </button>
                          </td>
                        </>
                      ) : (
                        <>
                          <td>{i + 1}</td>
                          <td>
                            <img
                              className="user-table-pic"
                              src={ele.userId.pic}
                              alt={ele.userId.firstname}
                            />
                          </td>
                          <td>{ele.userId.firstname}</td>
                          <td>{ele.userId.lastname}</td>
                          <td>{ele.userId.email}</td>
                          <td>{ele.userId.mobile}</td>
                          <td>{ele.experience}</td>
                          <td>{ele.specialization}</td>
                          <td>{ele.fees}</td>
                          <td>{ele.timing}</td>
                          <td className="select">
                            <button
                              className="btn user-btn"
                              onClick={() => handleEdit(ele)}
                            >
                              Edit
                            </button>
                            <button
                              className="btn user-btn"
                              onClick={() => deleteUser(ele.userId._id)}
                            >
                              Remove
                            </button>
                          </td>
                        </>
                      )}
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

export default AdminDoctors;
