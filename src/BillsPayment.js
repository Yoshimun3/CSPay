import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { db, storage, auth } from "./firebase"; // Import auth
import { collection, addDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import "./BillsPayment.css"; // Ensure this file exists for styling

function BillsPayment() {
  const location = useLocation();
  const navigate = useNavigate();
  const bill = location.state?.bill;

  const [receipt, setReceipt] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploading, setUploading] = useState(false);

  if (!bill || !bill.id) {
    return <p>Error: Invalid bill data.</p>;
  }

  const handleFileChange = (event) => {
    const file = event.target.files[0];

    if (file) {
      if (!file.type.startsWith("image/")) {
        alert("Only image files are allowed.");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        alert("File size should not exceed 5MB.");
        return;
      }

      setReceipt(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleUpload = async () => {
    if (!receipt) {
      alert("Please select a receipt to upload.");
      return;
    }

    if (!window.confirm("Are you sure you want to upload this receipt?")) {
      return;
    }

    setUploading(true);

    try {
      console.log("Uploading file:", receipt.name);

      // Get authenticated user
      const currentUser = auth.currentUser;
      if (!currentUser) {
        alert("You must be logged in to upload a receipt.");
        return;
      }
      const userId = bill.userId || currentUser.uid; // Ensure userId is always set

      // Upload to Firebase Storage
      const storageRef = ref(storage, `billsreceipts/${bill.id}-${receipt.name}`);
      await uploadBytes(storageRef, receipt);
      const downloadURL = await getDownloadURL(storageRef);

      console.log("Upload successful! File URL:", downloadURL);

      // Create Firestore collection & save details
      await addDoc(collection(db, "billsreceipt"), {
        billId: bill.id,
        userId, // Ensured authenticated user ID is used
        amount: bill.amount || 0,
        planName: bill.planName || "Unknown Plan",
        dueDate: bill.dueDate || "N/A",
        receiptUrl: downloadURL,
        timestamp: new Date(),
      });

      alert("Receipt uploaded successfully!");
      navigate("/paybills");
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Upload failed. Please check console logs for details.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bills-payment-container">
      <h2>Upload Receipt</h2>
      <p>Bill for {bill.planName} - ₱{bill.amount?.toFixed(2)}</p>

      <input type="file" accept="image/*" onChange={handleFileChange} />

      {previewUrl && (
        <div className="image-preview">
          <p>Receipt Preview:</p>
          <img src={previewUrl} alt="Receipt Preview" className="preview-image" />
        </div>
      )}

      <button onClick={handleUpload} disabled={uploading}>
        {uploading ? "Uploading..." : "Upload Receipt"}
      </button>
      <button onClick={() => navigate("/paybills")}>Back</button>
    </div>
  );
}

export default BillsPayment;
