import React, { useState, useEffect } from "react";
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { auth } from "./firebase";
import { getStorage, ref, getDownloadURL } from "firebase/storage";
import "./Login.css";
import { Link } from "react-router-dom"; // Import Link

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [bgImageUrl, setBgImageUrl] = useState("");
  const [logoUrl, setLogoUrl] = useState(""); // State for logo
  const [resetMessage, setResetMessage] = useState("");
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutTime, setLockoutTime] = useState(null); 
  const navigate = useNavigate();
  
  useEffect(() => {
    const storage = getStorage();
    const bgImageRef = ref(storage, "loginbg.png");
    getDownloadURL(bgImageRef)
      .then((url) => setBgImageUrl(url))
      .catch((error) => console.error("Error fetching background:", error));

      const logoRef = ref(storage, "internetnijohn.png"); // Update with your actual Firebase storage path
      getDownloadURL(logoRef)
        .then((url) => setLogoUrl(url))
        .catch((error) => console.error("Error fetching logo:", error));

  }, []);

  useEffect(() => {
    if (!email) return;

    // Check if this email is locked out
    const storedLockout = localStorage.getItem(`lockout_${email}`);
    if (storedLockout && new Date().getTime() < parseInt(storedLockout)) {
      setIsLocked(true);
      setLockoutTime(parseInt(storedLockout));
    } else {
      setIsLocked(false);
      setLockoutTime(null);
    }
  }, [email]);

  useEffect(() => {
    if (isLocked && lockoutTime) {
      const interval = setInterval(() => {
        const remainingTime = Math.max(0, lockoutTime - new Date().getTime());
        if (remainingTime <= 0) {
          setIsLocked(false);
          setLockoutTime(null);
          localStorage.removeItem(`lockout_${email}`);
        } else {
          setLockoutTime(lockoutTime);
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isLocked, lockoutTime, email]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setResetMessage("");

    if (isLocked) {
      setError("Too many failed attempts. Please wait.");
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log("Login successful:", userCredential.user);
      localStorage.removeItem(`failedAttempts_${email}`);
      navigate("/Home");
    } catch (err) {
      console.error("Error during login:", err);
      setError("Invalid email or password. Please check your credentials.");

      // Track failed attempts for this specific email
      let failedAttempts = parseInt(localStorage.getItem(`failedAttempts_${email}`)) || 0;
      failedAttempts++;
      localStorage.setItem(`failedAttempts_${email}`, failedAttempts);

      if (failedAttempts === 4 || failedAttempts === 5) {
        setError(`Warning: Your account will be locked for 2 minutes after your next failed attempt.`);
      }

      if (failedAttempts >= 5) {
        const lockoutEnd = new Date().getTime() + 2 * 60 * 1000; // Lockout for 2 minutes
        localStorage.setItem(`lockout_${email}`, lockoutEnd);
        setIsLocked(true);
        setLockoutTime(lockoutEnd);
      }
    }
  };
  
  

  const handleForgotPassword = async () => {
    if (!email) {
      setResetMessage("Please enter your email to reset password.");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      setResetMessage("Password reset email sent. Check your inbox.");
    } catch (err) {
      console.error("Error sending reset email:", err.message);
      setResetMessage(`Failed to send reset email: ${err.message}`);
    }
  };
  

  const getRemainingTime = () => {
    if (!lockoutTime) return "";
    const remaining = Math.max(0, lockoutTime - new Date().getTime());
    const minutes = Math.floor(remaining / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  };


  return (
    
    <div className="logincontainer" style={{ backgroundImage: `url(${bgImageUrl})`, backgroundSize: "cover", backgroundPosition: "center" }}>
      <div className="login-left">
        <div className="login-text">
 
        <div className="nav-bar">
  <nav className="my-navbar navbar-expand-lg navbar-light bg-light text-dark">
    <Link to="/" className="nav-link">
      {logoUrl && <img src={logoUrl} alt="CSPay Logo" className="navbar-logo" />}
      <span className="cspay-text">CSPAY</span>
    </Link>
  </nav>
  </div>

          <h1>FYC IBAYO</h1>
          <p>Unlimited Internet for your Home & Business.</p>
          
        </div>
      </div>
      <div className="login-right">
        <div className="logincard shadow-lg p-4">
          <span className="back-arrow" onClick={() => navigate(-1)}>←</span>
          <h1 className="text-center mb-4" style={{ color: "black" }}>
            <i className="fas fa-user-check mb-3"></i> Welcome Back
          </h1>
          <form onSubmit={handleLogin}>
            <div className="mb-3">
              <label htmlFor="email" className="form-label">Email</label>
              <input
                type="email"
                id="email"
                className="form-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                disabled={isLocked}
              />
            </div>
            <div className="mb-3 position-relative">
  <label htmlFor="password" className="form-label">Password</label>
  <div className="input-group">
    <input
      type={showPassword ? "text" : "password"}
      id="password"
      className="form-control password-input"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      placeholder="Enter your password"
      required
      disabled={isLocked}
    />
    <i 
      className={`password-icon fas ${showPassword ? "fa-eye-slash" : "fa-eye"}`} 
      onClick={() => setShowPassword(!showPassword)}
    ></i>
  </div>
</div>
            <div className="text-end">
              <button type="button" className="loginbtn text-primary" style={{ border: "none", background: "none" }} onClick={handleForgotPassword} disabled={isLocked}>
                Forgot Password?
              </button>
            </div>
            {error && <p className="text-danger text-center">{error}</p>}
            {isLocked && <p className="text-warning text-center">Too many failed attempts. Try again in {getRemainingTime()}.</p>}
            {resetMessage && <p className="text-success text-center">{resetMessage}</p>}
            <button type="submit" className="loginbtn w-100" style={{ backgroundColor: "#007bff", color: "white" }} disabled={isLocked}>
              Login
            </button>
          </form>
          <div className="text-center mt-3">
            <p>Don't have an account? Get a Plan and<button className="loginbtn text-primary" style={{ border: "none", background: "none" }} onClick={() => navigate("/")}>Sign Up</button></p>
          </div>
        </div>
      </div>
      <div className="nav-footer bg-gray-100 text-gray-800 py-3 text-center">
  <Link to="/admin-login" className="navbar-brand text-gray-800 font-bold hover:text-gray-600">
    &copy; {new Date().getFullYear()} CSPay. All rights reserved.
  </Link>
</div>

    </div>

  );
}

export default Login;
