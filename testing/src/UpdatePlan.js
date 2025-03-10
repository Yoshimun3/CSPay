import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "./firebase";
import { doc, updateDoc, collection, query, where, onSnapshot, getDocs } from "firebase/firestore";
import { useAuth } from "./AuthContext";
import "./UpdatePlan.css"; // Import custom styles

const UpdatePlan = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribe;

    const fetchSubscriberData = async () => {
      if (user?.uid) {
        console.log("Fetching subscriber data for UID:", user.uid);

        try {
          const subscribersRef = collection(db, "Subscribers");
          const q = query(subscribersRef, where("uid", "==", user.uid));

          // Set up real-time listener
          unsubscribe = onSnapshot(q, (querySnapshot) => {
            if (!querySnapshot.empty) {
              const docData = querySnapshot.docs[0].data();
              console.log("Fetched Subscriber Data:", docData);

              setCurrentPlan(docData.plan || "N/A");
            } else {
              console.warn("No subscriber data found!");
            }
            setLoading(false);
          });
        } catch (error) {
          console.error("Error fetching subscriber data:", error);
          setLoading(false);
        }
      }
    };

    const fetchPlans = async () => {
      try {
        const plansRef = collection(db, "internetPlans");
        const plansSnapshot = await getDocs(plansRef);
        const plansList = plansSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        console.log("Fetched Plans:", plansList);
        setPlans(plansList);
      } catch (error) {
        console.error("Error fetching plans:", error);
      }
    };

    fetchSubscriberData();
    fetchPlans();

    // Cleanup listener on component unmount
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [user]);

  const handlePlanSelect = (plan) => {
    setSelectedPlan(plan);
  };

  const handleUpdatePlan = async () => {
    if (!selectedPlan || !user?.uid) {
      alert("Please select a plan.");
      return;
    }

    try {
      const subscribersRef = collection(db, "Subscribers");
      const q = query(subscribersRef, where("uid", "==", user.uid));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0].ref;
        await updateDoc(userDoc, {
          plan: selectedPlan.Name,
          planSpeed: selectedPlan.Speed,
          planPrice: selectedPlan.Price,
        });

        alert("Plan updated successfully!");
        navigate("/home");
      } else {
        alert("Failed to update plan: Subscriber not found.");
      }
    } catch (error) {
      console.error("Error updating plan:", error);
      alert("Failed to update plan.");
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
    <div className="update-plan-container">
      <h1>Update Your Plan</h1>
      <h3>Current Plan: {currentPlan || "N/A"}</h3>

      <div className="plans-list">
        {plans.length > 0 ? (
          plans.map((plan, index) => (
            <div
              key={index}
              className={`plan-card ${selectedPlan?.Name === plan.Name ? "selected" : ""}`}
              onClick={() => handlePlanSelect(plan)}
            >
              <h2>{plan.Name}</h2>
              <p>Speed: {plan.Speed} Mbps</p>
              <p>Price:₱{plan.Price}</p>
            </div>
          ))
        ) : (
          <p>No plans available.</p>
        )}
      </div>

      <button className="update-button" onClick={handleUpdatePlan}>
        Confirm Plan Update
      </button>

      <button className="btn btn-secondary mt-3" onClick={() => navigate("/home")}>
        Cancel
      </button>
    </div>
  );
};

export default UpdatePlan;
