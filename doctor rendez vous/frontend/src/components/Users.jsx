import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Loading from "./Loading";
import { setLoading } from "../redux/reducers/rootSlice";
import { useDispatch, useSelector } from "react-redux";
import Empty from "./Empty";
import fetchData from "../helper/apiCall";

axios.defaults.baseURL = process.env.REACT_APP_SERVER_DOMAIN;

const Users = () => {
  const [users, setUsers] = useState([]);
  const dispatch = useDispatch();
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const { loading } = useSelector((state) => state.root);
  const [editingUser, setEditingUser] = useState(null);

  const handleEdit = (user) => {
    setEditingUser(user);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await toast.promise(
        axios.put(
          "/user/updateuser",
          {
            userId: editingUser._id,
            updates: {
              firstname: editingUser.firstname,
              lastname: editingUser.lastname,
              email: editingUser.email,
              mobile: editingUser.mobile,
              age: editingUser.age,
              gender: editingUser.gender,
            },
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        ),
        {
          success: "User updated successfully",
          error: "Unable to update user",
          loading: "Updating user...",
        }
      );
      setEditingUser(null);
      getAllUsers();
    } catch (error) {
      return error;
    }
  };

  const getAllUsers = async () => {
    try {
      dispatch(setLoading(true));
      let url = "/user/getallusers";
      if (filter !== "all") {
        url += `?filter=${filter}`;
      }
      if (searchTerm.trim() !== "") {
        url += `${filter !== "all" ? "&" : "?"}search=${searchTerm}`;
      }
      const temp = await fetchData(url);
      setUsers(temp);
      dispatch(setLoading(false));
    } catch (error) {}
  };

  const deleteUser = async (userId) => {
    try {
      const confirm = window.confirm("Are you sure you want to delete?");
      if (confirm) {
        await toast.promise(
          axios.delete("/user/deleteuser", {
            headers: {
              authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            data: { userId },
          }),
          {
            pending: "Deleting in...",
            success: "User deleted successfully",
            error: "Unable to delete user",
            loading: "Deleting user...",
          }
        );
        getAllUsers();
      }
    } catch (error) {
      return error;
    }
  };

  useEffect(() => {
    getAllUsers();
  }, []);

  const filteredUsers = users.filter((doc) => {
    if (filter === "all") {
      return true;
    } else if (filter === "firstname") {
      return doc.firstname.toLowerCase().includes(searchTerm.toLowerCase());
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
          <h3 className="home-sub-heading">All Users</h3>
          {users.length > 0 ? (
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
                    <th>Age</th>
                    <th>Gender</th>
                    <th>Is Doctor</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((ele, i) => (
                    <tr key={ele._id}>
                      {editingUser && editingUser._id === ele._id ? (
                        <>
                          <td>{i + 1}</td>
                          <td>
                            <img
                              className="user-table-pic"
                              src={ele.pic}
                              alt={ele.firstname}
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              value={editingUser.firstname}
                              onChange={(e) =>
                                setEditingUser({
                                  ...editingUser,
                                  firstname: e.target.value,
                                })
                              }
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              value={editingUser.lastname}
                              onChange={(e) =>
                                setEditingUser({
                                  ...editingUser,
                                  lastname: e.target.value,
                                })
                              }
                            />
                          </td>
                          <td>
                            <input
                              type="email"
                              value={editingUser.email}
                              onChange={(e) =>
                                setEditingUser({
                                  ...editingUser,
                                  email: e.target.value,
                                })
                              }
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              value={editingUser.mobile}
                              onChange={(e) =>
                                setEditingUser({
                                  ...editingUser,
                                  mobile: e.target.value,
                                })
                              }
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              value={editingUser.age}
                              onChange={(e) =>
                                setEditingUser({
                                  ...editingUser,
                                  age: e.target.value,
                                })
                              }
                            />
                          </td>
                          <td>
                            <select
                              value={editingUser.gender}
                              onChange={(e) =>
                                setEditingUser({
                                  ...editingUser,
                                  gender: e.target.value,
                                })
                              }
                            >
                              <option value="male">Male</option>
                              <option value="female">Female</option>
                              <option value="other">Other</option>
                            </select>
                          </td>
                          <td>{ele.isDoctor ? "Yes" : "No"}</td>
                          <td className="select">
                            <button
                              className="btn user-btn accept-btn"
                              onClick={handleUpdate}
                            >
                              Save
                            </button>
                            <button
                              className="btn user-btn cancel-btn"
                              onClick={() => setEditingUser(null)}
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
                              src={ele.pic}
                              alt={ele.firstname}
                            />
                          </td>
                          <td>{ele.firstname}</td>
                          <td>{ele.lastname}</td>
                          <td>{ele.email}</td>
                          <td>{ele.mobile}</td>
                          <td>{ele.age}</td>
                          <td>{ele.gender}</td>
                          <td>{ele.isDoctor ? "Yes" : "No"}</td>
                          <td className="select">
                            <button
                              className="btn user-btn"
                              onClick={() => handleEdit(ele)}
                            >
                              Edit
                            </button>
                            <button
                              className="btn user-btn"
                              onClick={() => deleteUser(ele._id)}
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

export default Users;
