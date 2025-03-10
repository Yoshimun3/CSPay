import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom"; // Import Link for navigation
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "./firebase";
import { collection, addDoc } from "firebase/firestore";
import { useAuth } from "./AuthContext";
import "./Signup.css";
function Signup() {
  const location = useLocation();
  const { selectedPlan } = location.state || {};
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [middleInitial, setMiddleInitial] = useState("");
  const [email, setEmail] = useState("");
  const [reenterEmail, setReenterEmail] = useState("");
  const [password, setPassword] = useState("");
  const [reenterPassword, setReenterPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [blkLotStreet, setBlkLotStreet] = useState("");
  const [barangay, setBarangay] = useState("");
  const [municipality, setMunicipality] = useState("");
  const [region, setRegion] = useState("");
  const [zipcode, setZipcode] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    // ✅ Check if terms were accepted from sessionStorage
    if (sessionStorage.getItem("termsAccepted") === "true") {
      setAcceptTerms(true);
    }
  }, []);

  const handleSignup = async (e) => {
    e.preventDefault();

    if (password !== reenterPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (email !== reenterEmail) {
      setError("Emails do not match.");
      return;
    }    

    if (!selectedPlan || !selectedPlan.Name || !selectedPlan.Price || !selectedPlan.Speed) {
      setError("Please select a valid plan.");
      return;
    }

    if (!acceptTerms) {
      setError("You must accept the terms and conditions to sign up.");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const signupDate = new Date();

      await addDoc(collection(db, "Subscribers"), {
        uid: user.uid,
        firstName,
        lastName,
        middleInitial,
        email,
        contactNumber,
        address: {
          blkLotStreet,
          barangay,
          municipality,
          region,
          zipcode,
        },
        plan: selectedPlan.Name,
        planPrice: selectedPlan.Price,
        planSpeed: selectedPlan.Speed,
        signupDate,
      });
      

      login(user);

      setFirstName("");
      setLastName("");
      setMiddleInitial(""); // Reset middle initial
      setEmail("");
      setPassword("");
      setContactNumber("");
      setBlkLotStreet("");
      setBarangay("");
      setMunicipality("");
      setRegion("");
      setZipcode("");

      setAcceptTerms(false);

      alert("Account created successfully!");
      navigate("/Payment", { state: { selectedPlan } });
    } catch (err) {
      setError("Failed to sign up: " + err.message);
    }
  };

  return (
    <div className="container my-5">
      <div className="row justify-content-center">
        <div className="col-lg-12">
          <div className="card shadow-lg" style={{ width: "100%", margin: "0 auto" }}>
            <div className="card-body">
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
              <h2 className="card-title text-center mb-4">
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "10vh",
                  }}
                >
                  <i className="fas fa-user-plus fa-1x mb-3"></i>
                </div>
                Create Your Account
              </h2>

              <form onSubmit={handleSignup}>
              <div className="mb-3">
                <label className="form-label">First Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Enter your first name"
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Last Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Enter your last name"
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Middle Initial</label>
                <input
                  type="text"
                  className="form-control"
                  value={middleInitial}
                  onChange={(e) => setMiddleInitial(e.target.value)}
                  placeholder="Enter middle initial"
                  maxLength="3"
                />
              </div>
                <div className="mb-3">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your Email Address"
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Re-enter Email</label>
                  <input
                    type="email"
                    className="form-control"
                    value={reenterEmail}
                    onChange={(e) => setReenterEmail(e.target.value)}
                    placeholder="Re-enter your Email Address"
                    required
                  />
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
                    placeholder="Enter your password"
                    required
                  />
                  {passwordError && <p className="text-danger" style={{ fontSize: "12px" }}>{passwordError}</p>}
                </div>


                  <div className="mb-3">
                    <label className="form-label">Re-enter Password</label>
                    <input
                      type={showPassword ? "text" : "password"}
                      className="form-control"
                      value={reenterPassword}
                      onChange={(e) => {
                        setReenterPassword(e.target.value);
                        setPasswordError(e.target.value !== password ? "Passwords do not match!" : "");
                      }}
                      placeholder="Re-enter your password"
                      required
                    />
                    {passwordError && <p className="text-danger" style={{ fontSize: "12px" }}>{passwordError}</p>}
                  </div>

                  <div className="mb-3 form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="showPasswordCheck"
                      checked={showPassword}
                      onChange={() => setShowPassword(!showPassword)}
                    />
                    <label className="form-label" htmlFor="showPasswordCheck">
                      &nbsp; Show Password
                    </label>
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
                <div className="mb-3">
                  <label className="form-label">Blk/Lot/Street/Phase/Section/Building Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={blkLotStreet}
                    onChange={(e) => setBlkLotStreet(e.target.value)}
                    placeholder="Enter your Blk/Lot/Street/Phase/Section/Building Name"
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Barangay</label>
                  <input
                    type="text"
                    className="form-control"
                    value={barangay}
                    onChange={(e) => setBarangay(e.target.value)}
                    placeholder="Enter your Barangay"
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Municipality</label>
                  <input
                    type="text"
                    className="form-control"
                    value={municipality}
                    onChange={(e) => setMunicipality(e.target.value)}
                    placeholder="Enter your Municipality"
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Region</label>
                  <input
                    type="text"
                    className="form-control"
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    placeholder="Enter your Region"
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Zipcode</label>
                  <input
                    type="text"
                    className="form-control"
                    value={zipcode}
                    onChange={(e) => setZipcode(e.target.value)}
                    placeholder="Enter your Zipcode"
                    required
                  />
                </div>


                {/* ✅ Terms and Conditions Checkbox with Auto-check from sessionStorage */}
                <div className="mb-3 form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="termsCheck"
                    checked={acceptTerms}
                    onChange={(e) => setAcceptTerms(e.target.checked)}
                  />
                  <label className="form-label" htmlFor="termsCheck">
                    &nbsp; I accept the{" "}
                    <Link to="/terms-and-conditions">
                      Terms and Conditions
                    </Link>
                  </label>
                </div>

                <button type="submit" className="btn btn-primary w-100">
                  Sign Up
                </button>
              </form>

              {error && <p className="text-danger text-center mt-3">{error}</p>}
            </div>
          </div>

          {selectedPlan && (
            <div className="card shadow-lg mt-4" style={{ width: "100%", margin: "0 auto" }}>
              <div className="card-body">
                <h3 className="card-title text-center">Selected Plan</h3>
                <p>
                  <strong>Name:</strong> {selectedPlan.Name}
                </p>
                <p>
                  <strong>Speed:</strong> {selectedPlan.Speed} Mbps
                </p>
                <p>
                  <strong>Price:</strong> ₱{selectedPlan.Price}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Signup;
