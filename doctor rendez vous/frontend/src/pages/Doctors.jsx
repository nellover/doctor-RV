import React, { useEffect, useState } from "react";
import DoctorCard from "../components/DoctorCard";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import "../styles/doctors.css";
import fetchData from "../helper/apiCall";
import Loading from "../components/Loading";
import { useDispatch, useSelector } from "react-redux";
import { setLoading } from "../redux/reducers/rootSlice";
import Empty from "../components/Empty";

const Doctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("all");
  const [specialties, setSpecialties] = useState([]);
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.root);

  const fetchAllDocs = async () => {
    dispatch(setLoading(true));
    const data = await fetchData(`/doctor/getalldoctors`);
    setDoctors(data);
    // Extraire les spécialités uniques
    const uniqueSpecialties = [
      ...new Set(data.map((doc) => doc.specialization)),
    ];
    setSpecialties(uniqueSpecialties);
    dispatch(setLoading(false));
  };

  useEffect(() => {
    fetchAllDocs();
  }, []);

  const filteredDoctors = doctors.filter((doctor) => {
    const nameMatch =
      doctor.userId.firstname
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      doctor.userId.lastname.toLowerCase().includes(searchTerm.toLowerCase());
    const specialtyMatch =
      selectedSpecialty === "all" ||
      doctor.specialization === selectedSpecialty;
    return nameMatch && specialtyMatch;
  });

  return (
    <>
      <Navbar />
      {loading && <Loading />}
      {!loading && (
        <section className="container doctors">
          <h2 className="page-heading">Our Doctors</h2>

          <div className="doctors-filter">
            <div className="search-box">
              <input
                type="text"
                placeholder="Search doctor by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>

            <div className="specialty-filter">
              <div className="specialty-tags">
                <button
                  className={`specialty-tag ${
                    selectedSpecialty === "all" ? "active" : ""
                  }`}
                  onClick={() => setSelectedSpecialty("all")}
                >
                  All Specialties
                </button>
                {specialties.map((specialty) => (
                  <button
                    key={specialty}
                    className={`specialty-tag ${
                      selectedSpecialty === specialty ? "active" : ""
                    }`}
                    onClick={() => setSelectedSpecialty(specialty)}
                  >
                    {specialty}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {filteredDoctors.length > 0 ? (
            <div className="doctors-card-container">
              {filteredDoctors.map((ele) => {
                return <DoctorCard ele={ele} key={ele._id} />;
              })}
            </div>
          ) : (
            <Empty />
          )}
        </section>
      )}
      <Footer />
    </>
  );
};

export default Doctors;
