import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "./firebase"; // Ensure this includes Firestore (db)
import { doc, getDoc } from "firebase/firestore"; // Firestore methods for querying
import { useNavigate } from "react-router-dom"; // Import useNavigate for navigation

function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate(); // Initialize navigate

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null); // Clear any previous errors
    try {
      // Authenticate the user
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const { uid } = userCredential.user; // Get the user's UID
      
      // Check if the user is an admin
      const adminDocRef = doc(db, "admin", uid); // Reference to the admin document
      const adminDoc = await getDoc(adminDocRef);

      if (adminDoc.exists()) {
        // Admin verified, navigate to admin dashboard
        navigate("/admin");
      } else {
        // Not an admin, sign out and show error
        setError("Access denied: Not an admin account.");
        await auth.signOut();
      }
    } catch (err) {
      setError("Failed to log in: " + err.message);
    }
  };

  return (
    <div className="container d-flex flex-column align-items-center justify-content-center vh-100">
      {/* Login Card */}
      <div className="card shadow-lg p-4" style={{ maxWidth: "400px", width: "100%" }}>
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

        {/* Admin Login Title */}
        <h2 className="text-center text-primary mb-4">  {/* Centered User Icon */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "10vh",
          }}
        >
          <i className="fas fa-user-shield fa-2x mb-3"></i>
        </div>Admin Login</h2>

        {/* Login Form */}
        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">
              Admin Email
            </label>
            <input
              type="email"
              id="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter admin email"
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              type="password"
              id="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
            />
          </div>
          {error && <p className="text-danger text-center">{error}</p>}
          <button type="submit" className="btn btn-primary w-100">
            Login
          </button>
        </form>
      </div>
    </div>
  );
}

export default AdminLogin;
