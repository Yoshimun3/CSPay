import React, { useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { signOut } from "firebase/auth";
import { auth } from "./firebase";
import { db } from "./firebase";
import { collection, query, where, onSnapshot, getDocs } from "firebase/firestore";
import {
  getStorage,
  ref,
  getDownloadURL,
  listAll,
} from "firebase/storage";
import { Link, useNavigate } from "react-router-dom";
import "./Home.css"; // Import custom styles

function Home() {
  const { user } = useAuth();
  const [subscriberData, setSubscriberData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rejectionReason, setRejectionReason] = useState("");
  const navigate = useNavigate();
   const [plans, setPlans] = useState([]);
    const [headerBgUrl, setHeaderBgUrl] = useState(null); // Header background image URL
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [logoUrl, setLogoUrl] = useState(null); // State for the logo URL
    const [planPics, setPlanPics] = useState([]); // State for the plan images
    useEffect(() => {
      const storage = getStorage();
      const logoRef = ref(storage, "internet.png");
      const headerBgRef = ref(storage, "internetnijohn.png");
    
      getDownloadURL(logoRef)
        .then((url) => setLogoUrl(url))
        .catch((error) => console.error("Error fetching logo:", error));
    
      getDownloadURL(headerBgRef)
        .then((url) => setHeaderBgUrl(url))
        .catch((error) => console.error("Error fetching header background:", error));
    
      let unsubscribe;
    
      const fetchSubscriberData = async () => {
        if (user?.uid) {
          try {
            const subscribersRef = collection(db, "Subscribers");
            const q = query(subscribersRef, where("uid", "==", user.uid));
    
            unsubscribe = onSnapshot(q, async (querySnapshot) => {
              if (!querySnapshot.empty) {
                const docData = querySnapshot.docs[0].data();
                const email = docData.email;
    
                const completedInstallationsRef = collection(db, "CompletedInstallations");
                const completedInstallationsQuery = query(completedInstallationsRef, where("subscriberName", "==", email));
    
                const rejectedReceiptsRef = collection(db, "RejectedReceipts");
                const rejectedReceiptsQuery = query(rejectedReceiptsRef, where("subscriberName", "==", email));
    
                let installationStatus = docData.installationStatus || "Pending"; // Default to stored status
                let reason = ""; 
    
                const [completedInstallationsSnapshot, rejectedReceiptsSnapshot] = await Promise.all([
                  getDocs(completedInstallationsQuery),
                  getDocs(rejectedReceiptsQuery),
                ]);
    
                if (!rejectedReceiptsSnapshot.empty) {
                  installationStatus = "Rejected";
                  reason = rejectedReceiptsSnapshot.docs[0].data()?.rejectionReason || "No reason provided";
                } else if (!completedInstallationsSnapshot.empty) {
                  installationStatus = "Connected";
                }
    
                // 🔥 Ensure real-time "Disconnected" status update when a repair is resolved
                if (docData.installationStatus === "Disconnected") {
                  installationStatus = "Disconnected";
                }
    
                setSubscriberData({
                  ...docData,
                  installationStatus,
                });
    
                setRejectionReason(reason);
              }
              setLoading(false);
            });
          } catch (error) {
            console.error("Error fetching subscriber data:", error);
            setLoading(false);
          }
        }
      };
    
      fetchSubscriberData();
    
      return () => {
        if (unsubscribe) unsubscribe();
      };
    }, [user]);
    

  const handleRetryPayment = () => {
    if (subscriberData) {
      try {
        if (!subscriberData.plan || !subscriberData.planPrice) {
          alert("Plan data is missing. Please contact support.");
          return;
        }
        navigate("/payment", {
          state: {
            selectedPlan: {
              Name: subscriberData.plan,
              Speed: subscriberData.planSpeed,
              Price: subscriberData.planPrice,
            },
          },
        });
      } catch (error) {
        console.error("Error during payment retry:", error);
      }
    }
  };
  const handleLogout = async () => {
    try {
      await signOut(auth);
      alert("Successfully logged out!");
      navigate("/");
    } catch (err) {
      console.error("Failed to log out:", err.message);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <div className="row">
        {/* Subscriber Details Card */}
        <div className="col-lg-5">
          <div className="card w-100 p-4 text-center shadow-lg h-100 subscriber-card">
            {subscriberData ? (
              <>
                <h1 className="text-muted">
                  Hello, <span className="text-warning fw-bold">{subscriberData.lastName || "Subscriber"}, {subscriberData.firstName || "Subscriber"} {subscriberData.middleInitial || ""}</span>
                </h1>
                <p>Welcome to your ISP Online account!</p>
              </>
            ) : (
              <p>No subscriber data found. Please contact support.</p>
            )}
            <h3>Internet Status: 
              <span className={subscriberData.installationStatus === "Disconnected" ? "text-danger" : "text-success"}>
                {subscriberData.installationStatus}
              </span>
            </h3>
            {subscriberData.installationStatus === "Rejected" && (
              <p><strong>Reason for Rejection:</strong> {rejectionReason}</p>
            )}

            <ul className="list-group text-start mt-3">
              <li className="list-group-item"><strong>Subscription Plan:</strong> {subscriberData.plan || "N/A"}</li>
              <li className="list-group-item"><strong>Price:</strong> {subscriberData.planPrice || "N/A"}</li>
              <li className="list-group-item"><strong>Speed:</strong> {subscriberData.planSpeed || "N/A"}</li>
              <li className="list-group-item"><strong>Email Address:</strong> {subscriberData.email || "N/A"}</li>
              <li className="list-group-item"><strong>Contact Number:</strong> {subscriberData.contactNumber || "N/A"}</li>
              <ul>
              <strong>Address:</strong>
              <li className="list-group-item">
               {subscriberData.address.blkLotStreet || "N/A"}, {subscriberData.address.barangay || "N/A"}, {subscriberData.address.municipality || "N/A"}, {subscriberData.address.region || "N/A"}, {subscriberData.address.zipcode || "N/A"}
            </li>
            </ul>
            <li className="list-group-item">
              <strong>Signup Date:</strong>{" "}
              {subscriberData.signupDate
                ? new Date(subscriberData.signupDate.seconds * 1000).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })
                : "N/A"}
            </li>
            </ul>
                <hr></hr>
                {logoUrl && (
              <img
                class="card-img-top"
                src={headerBgUrl}
                alt="Internet ni Juan Logo"
                style={{ maxHeight: "200px" }} 
              />
            )}
            <button className="btn btn-warning" onClick={handleLogout}>
              <i className="fas fa-door-open me-2"></i>
              Logout
            </button>
                <hr></hr>
            {subscriberData.installationStatus === "Rejected" && (
              <button className="btn btn-warning mt-3" onClick={handleRetryPayment}>
                Retry Payment
              </button>
            )}
          
          </div>
        </div>

        {/* Navigation & FAQs Section */}
        <div className="col-lg-7 d-flex flex-column">
          {/* Navigation Cards */}
          <div className="row text-center g-4">
            {[
               {
                path: "/paybills",
                icon: "fa-solid fa-money-bill-wave",
                label: "PAY BILLS",
                state: { planName: subscriberData?.plan || "N/A" }, // Pass the plan name
              },
              { path: "/updateinfo", icon: "fa-solid fa-user-gear", label: "ADD  SUBSCRIPTION" },
               { path: "/updateinfo", icon: "fa-solid fa-user-gear", label: "UPDATE PROFILE" },
               { path: "/updateplan", icon: "fa-solid fa-network-wired", label: "UPDATE PLAN" },
               { path: "/repair", icon: "fa-solid fa-screwdriver-wrench", label: "REQUEST SERVICE" },
            ].map((item, index) => (
              <div key={index} className="col-md-6">
                <Link to={item.path} className="text-decoration-none">
                  <div className="card w-100 p-4 shadow-lg rounded-lg">
                    <i className={`bi ${item.icon} fs-1 text-warning`}></i>
                    <h6 className="mt-3 fw-bold text-dark">{item.label}</h6>
                  </div>
                </Link>
              </div>
            ))}
          </div>

          {/* FAQ Card Spanning Two Columns */}
          <div className="card w-100 p-4 shadow-lg rounded-lg mt-4 text-center flex-xxl-grow-1 ">
          {logoUrl && (
              <img
                class="card-img-top"
                src={logoUrl}
                alt="Internet ni Juan Logo"
                style={{ maxHeight: "250px" }} 
              />
            )}
            <div class="card-body">
            <h5 className="fw-bold">Need Help?</h5>
            <p>Check out our Frequently Asked Questions (FAQs) to get quick answers to your concerns.</p>
            <Link to="/FAQs" className="btn btn-warning">Visit FAQs</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
