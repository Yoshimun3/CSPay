import React, { useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { db } from "./firebase";
import { collection, doc, getDoc, setDoc, query, where, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import "./PayBills.css";

function PayBills() {
  const { user } = useAuth();
  const [billingData, setBillingData] = useState({ unpaid: [], paid: [] });
  const [accountStatusData, setAccountStatusData] = useState({ active: [], disconnected: [], forDisconnection: [] });
  const [activeTab, setActiveTab] = useState("unpaid");
  const navigate = useNavigate();

  useEffect(() => {
    console.log("User in PayBills:", user);
  }, [user]);
  
  useEffect(() => {
    const fetchBillingData = async () => {
      if (!user?.uid) return;
  
      const userId = user.uid;
  
      try {
        const billingRef = collection(db, "Billing");
        const q = query(billingRef, where("uid", "==", userId));
        const querySnapshot = await getDocs(q);
  
        console.log("Total Bills Found:", querySnapshot.size);
  
        let unpaidBills = [];
        let paidBills = [];
        let latestBill = null;
  
        querySnapshot.forEach((doc) => {
          const bill = doc.data();
          console.log("Fetched Bill:", bill, "Doc ID:", doc.id);
  
          if (!bill.billingStartDate?.seconds) {
            console.warn("Invalid billingStartDate in document:", doc.id);
            return;
          }
  
          const dueDate = new Date(bill.billingStartDate.seconds * 1000);
          dueDate.setMonth(dueDate.getMonth() + 1);
          const formattedDueDate = dueDate.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          });
  
          const billData = {
            id: doc.id,
            month: dueDate.toLocaleString("en-US", { month: "short" }),
            year: dueDate.getFullYear(),
            dueDate: formattedDueDate,
            amount: Number(bill.planPrice) || 0,
            planName: bill.planName || "Unknown Plan",
            billingStartDate: new Date(bill.billingStartDate.seconds * 1000),
            status: bill.status || "Unpaid",
          };
  
          if (bill.status === "Paid") {
            paidBills.push(billData);
          } else {
            unpaidBills.push(billData);
          }
  
          if (!latestBill || billData.billingStartDate > latestBill.billingStartDate) {
            latestBill = billData;
          }
        });
  
        const today = new Date();
        if (!latestBill || (today.getMonth() !== latestBill.billingStartDate.getMonth() || today.getFullYear() !== latestBill.billingStartDate.getFullYear()) && latestBill.status !== "Paid") {
          await generateNewBill(userId);
        }
  
        setBillingData({ unpaid: unpaidBills, paid: paidBills });
      } catch (error) {
        console.error("Error fetching billing data:", error);
      }
    };
  
    const generateNewBill = async (userId) => {
      try {
        const userRef = doc(db, "Subscribers", userId);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
          console.error("User document not found");
          return;
        }

        const userData = userSnap.data();
        const newBill = {
          id: Date.now().toString(),
          planName: userData.plan || "Unknown Plan",
          planPrice: Number(userData.planPrice) || 0,
          billingStartDate: new Date(),
          status: "Unpaid",
        };

        await setDoc(doc(db, "Billing", userId), { bills: [newBill] }, { merge: true });

        console.log("New bill generated for:", userId);
        fetchBillingData();
      } catch (error) {
        console.error("Error generating new bill:", error);
      }
    };

    fetchBillingData();
  }, [user?.uid]);
  
  const handlePay = (bill) => {
    navigate("/billspayment", { state: { bill } });
  };
  
  return (
    <div className="pay-bills-container">
      <h2 className="page-title">My Bills</h2>
      <div className="tabs">
        <button className={activeTab === "unpaid" ? "active" : ""} onClick={() => setActiveTab("unpaid")}>
          Unpaid
        </button>
        <button className={activeTab === "paid" ? "active" : ""} onClick={() => setActiveTab("paid")}>
          Paid
        </button>
      </div>
      <div className="bills-list">
        {billingData[activeTab].length > 0 ? (
          billingData[activeTab].map((bill) => (
            <div className="bill-item" key={bill.id}>
              <div className="bill-details">
                <p className="bill-month">{bill.month} {bill.year}</p>
                <p className="bill-plan">{bill.planName}</p>
                <p className="bill-due-date">Due date: {bill.dueDate}</p>
              </div>
              <div className="bill-amount">
                <span>₱{bill.amount.toFixed(2)}</span>
                {activeTab === "unpaid" && (
                  <button className="btn-pay" onClick={() => handlePay(bill)}>Pay</button>
                )}
              </div>
            </div>
          ))
        ) : (
          <p className="no-bills">No {activeTab} bills found.</p>
        )}
      </div>

      
      <div className="account-status-section">
  <h3 className="account-status-header">Account Status Overview</h3>
  <div className="status-container">
    <div 
      className={`status-box ${
        billingData.unpaid.length >= 2 
          ? "for-disconnection" 
          : billingData.unpaid.length === 0 
          ? "active" 
          : "pending"
      }`}
    >
      {billingData.unpaid.length >= 2 
        ? "For Disconnection" 
        : billingData.unpaid.length === 0 
        ? "Active" 
        : "Pending Payment"}
    </div>
  </div>
</div>


      <button className="btn-back" onClick={() => navigate("/home")}>Back to Home</button>
    </div>
  );
}

export default PayBills;
