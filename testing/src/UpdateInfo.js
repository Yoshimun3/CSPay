import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { db } from "./firebase";
import { useAuth } from "./AuthContext";
import "./UpdateInfo.css";
import { collection, query, where, getDocs, updateDoc } from "firebase/firestore";

function UpdateInfo() {
    const { user } = useAuth(); // Fetch user from AuthContext
  const location = useLocation(); // Access state passed from Home
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [reenterPassword, setReenterPassword] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [blkLotStreet, setBlkLotStreet] = useState("");
  const [barangay, setBarangay] = useState("");
  const [municipality, setMunicipality] = useState("");
  const [region, setRegion] = useState("");
  const [zipcode, setZipcode] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const uid = location.state?.uid; // Get uid from navigation state

  const handleUpdate = async (e) => {
    e.preventDefault();
  
    if (!password && !contactNumber && !blkLotStreet && !barangay && !municipality && !region && !zipcode ) {
      alert("Please fill at least one field to update.");
      return;
    }
  
    try {
      // Query the Subscribers collection for the document with the matching UID
      const subscribersRef = collection(db, "Subscribers");
      const q = query(subscribersRef, where("uid", "==", user.uid));
      const querySnapshot = await getDocs(q);
  
      if (!querySnapshot.empty) {
        // Get the document ID
        const docRef = querySnapshot.docs[0].ref;
  
        // Prepare updates
        const updates = {};
        if (password) updates.password = password;
        if (contactNumber) updates.contactNumber = contactNumber;
        if (blkLotStreet) updates.blkLotStreet = blkLotStreet;
        if (barangay) updates.barangay = barangay;
        if (municipality) updates.municipality = municipality;
        if (region) updates.region = region;
        if (zipcode) updates.zipcode = zipcode;
  
        // Update the document
        await updateDoc(docRef, updates);
  
        alert("Information updated successfully!");
        navigate("/home");
      } else {
        alert("No subscriber found with the provided UID. Please try again.");
      }
    } catch (error) {
      console.error("Error updating info:", error.message);
      alert("Failed to update information. Please try again later.");
    }
  };
  

  return (
    <div className="update-info-container">
        {/* Centered User Icon */}
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "10vh",
      }}
    >
      <i className="fas fa-user-pen fa-2x mb-3"></i>
    </div>
      <h1>Update Your Information</h1>
      <form onSubmit={handleUpdate}>
        {/* Back Icon */}
        <div
          className="mb-3"
          style={{
            position: "absolute",
            top: "20px",
            left: "20px",
            cursor: "pointer",
          }}
          onClick={() => navigate(-1)}
        >
          <i className="fas fa-arrow-left fa-lg text-secondary"></i>
        </div>

        <div className="mb-3">
                <label className="form-label">Password</label>
                <input
                  type={showPassword ? "text" : "password"}
                  className="form-control"
                  value={password}
                  onChange={(e) => {
                    const newPassword = e.target.value;
                    setPassword(newPassword);

                    // Validation checks
                    if (newPassword.length < 8) {
                      setPasswordError("⚠ Password must be at least 8 characters.");
                    } else if (!/[A-Z]/.test(newPassword)) {
                      setPasswordError("⚠ Password must have at least one uppercase letter.");
                    } else if (!/[a-z]/.test(newPassword)) {
                      setPasswordError("⚠ Password must have at least one lowercase letter.");
                    } else if (!/[0-9]/.test(newPassword)) {
                      setPasswordError("⚠ Password must have at least one number.");
                    } else {
                      setPasswordError(""); // Clear error if valid
                    }
                  }}
                  placeholder="Enter your new password"
                  required
                />
                {passwordError && <p className="text-danger" style={{ fontSize: "12px" }}>{passwordError}</p>}
              </div>


          <div className="form-group">
            <label className="form-label">Re-enter Password</label>
            <input
              type={showPassword ? "text" : "password"}
              className="form-control"
              value={reenterPassword}
              onChange={(e) => {
                setReenterPassword(e.target.value);
                setPasswordError(e.target.value !== password ? "Passwords do not match!" : "");
              }}
              placeholder="Re-enter your new password"
              required
            />
            {passwordError && <p className="text-danger" style={{ fontSize: "12px" }}>{passwordError}</p>}
          </div>

        <div className="form-group">
          <label htmlFor="address">Blk/Lot/Street/Phase/Section/Building Name</label>
          <textarea
            id="blkLotStreet"
            className="form-control"
            placeholder="Enter your Blk/Lot/Street/Phase/Section/Building Name"
            value={blkLotStreet}
            onChange={(e) => setBlkLotStreet(e.target.value)}
          ></textarea>
        </div>

        <div className="form-group">
          <label htmlFor="barangay">Barangay</label>
          <textarea
            id="barangay"
            className="form-control"
            placeholder="Enter your Barangay"
            value={barangay}
            onChange={(e) => setBarangay(e.target.value)}
          ></textarea>
        </div>

        <div className="form-group">
          <label htmlFor="municipality">Municipality</label>
          <textarea
            id="municipality"
            className="form-control"
            placeholder="Enter your Municipality"
            value={municipality}
            onChange={(e) => setMunicipality(e.target.value)}
          ></textarea>
        </div>

        <div className="form-group">
          <label htmlFor="region">Region</label>
          <textarea
            id="region"
            className="form-control"
            placeholder="Enter your Region"
            value={region}
            onChange={(e) => setRegion(e.target.value)}
          ></textarea>
        </div>

        <div className="form-group">
          <label htmlFor="zipcode">Zipcode</label>
          <textarea
            id="zipcode"
            className="form-control"
            placeholder="Enter your Zipcode"
            value={zipcode}
            onChange={(e) => setZipcode(e.target.value)}
          ></textarea>
        </div>
        <div className="mb-3">
                    <label className="form-label">Contact Number</label>
                    <input
                      type="text"
                      className="form-control"
                      value={contactNumber}
                      onChange={(e) => {
                        let value = e.target.value.replace(/\D/g, ""); // Remove non-numeric characters

                        if (value.startsWith("0")) {
                          value = "63" + value.substring(1); // Replace leading "0" with "63"
                        } else if (!value.startsWith("63")) {
                          value = "63" + value; // Ensure it always starts with "63"
                        }

                        // Limit to max length (12 digits: 63 + 10 digits)
                        value = value.slice(0, 12);

                        // Format as +63 XXX XXX XXXX
                        let formatted = `+${value.substring(0, 2)}`;
                        if (value.length > 2) formatted += ` ${value.substring(2, 5)}`;
                        if (value.length > 5) formatted += ` ${value.substring(5, 8)}`;
                        if (value.length > 8) formatted += ` ${value.substring(8, 12)}`;

                        setContactNumber(formatted);
                      }}
                      placeholder="Enter your mobile number"
                      maxLength={16} // Enforces max length of formatted number
                      required
                    />
                    {contactNumber.length > 0 && contactNumber.length !== 16 && (
                      <small className="text-danger">Invalid number (must be +63 xxx xxx xxxx).</small>
                    )}
                  </div>
        <button type="submit" className="btn btn-primary">
          Apply Changes
        </button>
      </form>
      <button
        className="btn btn-secondary mt-3"
        onClick={() => {
          // Clear form fields and navigate to home
          setContactNumber("");
          setBlkLotStreet("");
          setBarangay("");
          setMunicipality("");
          setRegion("");
          setZipcode("");
          setPassword("");
              
        }}
      >
        Cancel
      </button>
    </div>
  );
}

export default UpdateInfo;
