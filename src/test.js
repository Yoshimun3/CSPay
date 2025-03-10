import React, { useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { db } from "./firebase";
import { collection, doc, getDoc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import "./PayBills.css";

function PayBills() {
  const { user } = useAuth();
  const [billingData, setBillingData] = useState({ unpaid: [], paid: [] });
  const [activeTab, setActiveTab] = useState("unpaid");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBillingData = async () => {
      if (!user?.uid) return;

      try {
        const billingRef = doc(db, "Billing", user.uid);
        const billingSnap = await getDoc(billingRef);

        if (billingSnap.exists()) {
          const userBilling = billingSnap.data().bills || [];
          let unpaidBills = [];
          let paidBills = [];
          let latestBillDate = null;

          userBilling.forEach((bill) => {
            if (!bill.billingStartDate?.seconds) return;

            const dueDate = new Date(bill.billingStartDate.seconds * 1000);
            dueDate.setMonth(dueDate.getMonth() + 1);
            const formattedDueDate = dueDate.toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            });

            const billData = {
              id: bill.id,
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

            if (!latestBillDate || billData.billingStartDate > latestBillDate) {
              latestBillDate = billData.billingStartDate;
            }
          });

          // Check if a new bill needs to be created
          const today = new Date();
          if (!latestBillDate || today.getMonth() !== latestBillDate.getMonth() || today.getFullYear() !== latestBillDate.getFullYear()) {
            await generateNewBill(user.uid, userBilling);
          }

          setBillingData({ unpaid: unpaidBills, paid: paidBills });
        } else {
          await generateNewBill(user.uid, []);
        }
      } catch (error) {
        console.error("Error fetching billing data:", error);
      }
    };

    const generateNewBill = async (userId, existingBills) => {
      try {
        const newBill = {
          id: Date.now().toString(),
          planName: "Standard Plan",
          planPrice: Number(bill.planPrice) ,
          billingStartDate: new Date(),
          status: "Unpaid",
        };

        const updatedBills = [...existingBills, newBill];
        await setDoc(doc(db, "Billing", userId), { bills: updatedBills }, { merge: true });

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
      <button className="btn-back" onClick={() => navigate("/home")}>Back to Home</button>
    </div>
  );
}

export default PayBills;
