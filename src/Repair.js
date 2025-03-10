import React, { useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { db, storage } from "./firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  Timestamp,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

function Repair() {
  const { user } = useAuth();
  const [repairRequests, setRepairRequests] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [repairType, setRepairType] = useState("");
  const [details, setDetails] = useState("");
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Fetch repair requests in real-time
  useEffect(() => {
    const repairRequestsRef = collection(db, "RepairRequests");
    const q = query(repairRequestsRef, where("userId", "==", user.uid));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const repairs = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setRepairRequests(repairs);
    });

    return () => unsubscribe(); // Cleanup listener on component unmount
  }, [user.uid]);

  const handleAddRequest = () => {
    setShowForm(true);
  };

  const handleBack = () => {
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!repairType || !details) {
      alert("Please fill in all fields.");
      return;
    }

    try {
      setUploading(true);

      let imageUrl = null;

      // Upload the image to Firebase Storage if provided
      if (image) {
        const storageRef = ref(storage, `repair-images/${user.uid}-${Date.now()}`);
        const snapshot = await uploadBytes(storageRef, image);
        imageUrl = await getDownloadURL(snapshot.ref);
      }

      // Save the repair request to Firestore
      const repairRequestsRef = collection(db, "RepairRequests");
      await addDoc(repairRequestsRef, {
        userId: user.uid,
        email: user.email,
        repairType,
        details,
        imageUrl,
        timestamp: Timestamp.fromDate(new Date()),
      });

      alert("Repair request submitted successfully!");

      // Reset form fields and navigate back to the list
      setRepairType("");
      setDetails("");
      setImage(null);
      setShowForm(false);
    } catch (error) {
      console.error("Error submitting repair request:", error);
      alert("Failed to submit repair request. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  return (
    <div className="container mt-4">
      {showForm ? (
        <div className="d-flex flex-column align-items-center justify-content-center vh-100">
          <div
            className="card shadow-lg p-4"
            style={{ maxWidth: "400px", width: "100%" }}
          >
            {/* Back Icon */}
            <div
            className="mb-3"
            style={{
                position: "absolute",
                top: "20px",
                left: "20px",
                cursor: "pointer",
            }}
            onClick={handleBack}
            >
            <i className="fas fa-arrow-left fa-lg text-secondary"></i>
            </div>
            
            <h2 className="text-center text-primary mb-4">
              {/* Centered User Icon */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "10vh",
                }}
              >
                <i className="fas fa-wrench fa-1x mb-3"></i>
              </div>
              Add Service Request</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="repairType" className="form-label">
                  Type of Repair
                </label>
                <select
                  id="repairType"
                  className="form-select"
                  value={repairType}
                  onChange={(e) => setRepairType(e.target.value)}
                  required
                >
                  <option value="">-- Select Service --</option>
                  <option value="Internet Connection">Internet Connection</option>
                  <option value="Router Issue">Router Issue</option>
                  <option value="Slow Speed">Slow Speed</option>
                  <option value="Billing Issue">Billing Issue</option>
                  <option value="Disconnection">Disconnection</option>
                  {/* <option value="Reconnection">Reconnection</option> */}
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="mb-3">
                <label htmlFor="details" className="form-label">
                  Details
                </label>
                <textarea
                  id="details"
                  className="form-control"
                  placeholder="Provide details about the issue..."
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  rows={4}
                  required
                ></textarea>
              </div>

              <div className="mb-3">
                <label htmlFor="image" className="form-label">
                  Upload Image (Optional)
                </label>
                <input
                  type="file"
                  id="image"
                  className="form-control"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary w-100"
                disabled={uploading}
              >
                {uploading ? "Submitting..." : "Submit Request"}
              </button>
            </form>
          </div>
        </div>
      ) : (
        <>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              {/* Back Icon */}
                <div
                className="mb-3"
                style={{
                    position: "absolute",
                    top: "20px",
                    left: "20px",
                    cursor: "pointer",
                }}
                onClick={() => window.history.back()}
                >
                <i className="fas fa-arrow-left fa-lg text-secondary"></i>
                </div>
              <h1 className="text-primary d-inline"> 
              <i className="fas fa-wrench fa-1x mb-3 me-3"></i>
              My Service Requests</h1>
            </div>
            <button
              className="btn btn-primary"
              onClick={handleAddRequest}
            >
                <i className="fas fa-plus fa-sm me-1"></i>
              Add Request
            </button>
          </div>
          <div className="row">
            {repairRequests.map((request) => (
              <div key={request.id} className="col-md-4 mb-4">
                <div className="card">
                  {request.imageUrl && (
                    <img
                      src={request.imageUrl}
                      alt="Repair"
                      className="card-img-top"
                      style={{ height: "200px", objectFit: "cover" }}
                    />
                  )}
                  <div className="card-body">
                    <h5 className="card-title">{request.repairType}</h5>
                    <p className="card-text">{request.details}</p>
                    <p className="text-muted">
                      Submitted on: {new Date(request.timestamp.toDate()).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default Repair;
