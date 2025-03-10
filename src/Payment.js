import React, { useState, useEffect } from "react";
import { storage, db } from "./firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, addDoc, serverTimestamp, doc, getDoc } from "firebase/firestore";
import { useAuth } from "./AuthContext";
import { useLocation, useNavigate } from "react-router-dom";
import "./Payment.css";

function Payment() {
  const location = useLocation();
  const { selectedPlan } = location.state || {}; // Ensure selectedPlan is passed
  const { user } = useAuth();
  const [receipt, setReceipt] = useState(null);
  const [previewURL, setPreviewURL] = useState(null);
  const [modalContent, setModalContent] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [subscriberName, setSubscriberName] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchSubscriberName = async () => {
      try {
        const subscriberDocRef = doc(db, "Subscribers", user.uid);
        const subscriberDocSnap = await getDoc(subscriberDocRef);

        if (subscriberDocSnap.exists()) {
          const subscriberData = subscriberDocSnap.data();
          setSubscriberName(subscriberData.name);
        } else {
          setSubscriberName(user.displayName || user.email);
        }
      } catch (err) {
        console.error("Error fetching subscriber name:", err.message);
        setSubscriberName(user.displayName || user.email);
      }
    };

    fetchSubscriberName();
  }, [user]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setModalContent("Please upload a valid image file.");
        setIsModalOpen(true);
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        setModalContent("File size must be less than 2MB.");
        setIsModalOpen(true);
        return;
      }

      setReceipt(file);
      const reader = new FileReader();
      reader.onload = () => setPreviewURL(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!receipt) {
      setModalContent("Please select a receipt image.");
      setIsModalOpen(true);
      return;
    }

    if (!selectedPlan || !selectedPlan.Name || !selectedPlan.Price) {
      setModalContent("Missing plan data. Please select a valid plan.");
      setIsModalOpen(true);
      return;
    }

    setIsLoading(true);
    setIsModalOpen(true);

    try {
      const receiptRef = ref(storage, `receipts/${receipt.name}`);
      await uploadBytes(receiptRef, receipt);

      const downloadURL = await getDownloadURL(receiptRef);

      await addDoc(collection(db, "Receipts"), {
        subscriberName: subscriberName || user.email,
        planName: selectedPlan.Name,
        planPrice: selectedPlan.Price,
        receiptURL: downloadURL,
        uid:user.uid,
        timestamp: serverTimestamp(),
      });

      setModalContent("Receipt uploaded successfully! Redirecting...");
      setReceipt(null);
      setPreviewURL(null);
      setTimeout(() => navigate("/home"), 2000);
    } catch (err) {
      setModalContent("Failed to upload receipt: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="payment-page">
      <div className="payment-card">
        <h2>
          <div className="icon-container">
            <i className="fas fa-money-check-dollar"></i>
          </div>
          Upload Your Receipt
        </h2>

        <div className="plan-details">
          <h3>Selected Plan</h3>
          <p>
            <strong>Name:</strong> {selectedPlan?.Name || "No plan selected"}
          </p>
          <p>
            <strong>Price:</strong> ₱{selectedPlan?.Price || "N/A"}
          </p>
        </div>

        <form onSubmit={handleUpload} className="payment-form">
          {receipt && (
            <div className="preview-container">
              <p className="receipt-details">Selected File: {receipt.name}</p>
              <img src={previewURL} alt="Receipt Preview" className="receipt-preview" />
            </div>
          )}
          <label htmlFor="receipt-upload" className="file-input-label">
            Upload Receipt
          </label>
          <input
            id="receipt-upload"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            hidden
          />
          <button type="submit" className="upload-button" disabled={isLoading}>
            {isLoading ? "Uploading..." : "Submit"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Payment;
