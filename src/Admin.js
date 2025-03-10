import React, { useEffect, useState } from "react";
import { db } from "./firebase";
import { collection, addDoc, deleteDoc, doc, onSnapshot, setDoc, query ,where, getDocs, updateDoc, getDoc,increment  } from "firebase/firestore";
import { Timestamp } from "firebase/firestore";
import { signOut } from "firebase/auth";
import "bootstrap/dist/css/bootstrap.min.css"; // Bootstrap
import { auth } from "./firebase";
import { getAuth } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import './Admin.css';
import { createUserWithEmailAndPassword } from "firebase/auth";

function Admin() {
    const [showAlert, setShowAlert] = useState(false);
    const [activeTab, setActiveTab] = useState("subscribers");
    const [tab, setTab] = useState("users");
    const [plans, setPlans] = useState([]);
    const [receipts, setReceipts] = useState([]);
    const [repairRequests, setRepairRequests] = useState([]);
    const [installations, setInstallations] = useState([]);
    const [subscribers, setSubscribers] = useState([]);
    const [newPlan, setNewPlan] = useState({ Name: "", Speed: "", Price: "" });
    const [newEmployee, setNewEmployee] = useState({ name: "", email: "", role: "employee" });
    const [selectedSubscriber, setSelectedSubscriber] = useState(null);
  const [billingRecords, setBillingRecords] = useState([]);
    const [sortOrder, setSortOrder] = useState("asc");
    const [sortBy, setSortBy] = useState("name");
    const [editingMaterial, setEditingMaterial] = useState(null);
    const [selectedPriorityFilter, setSelectedPriorityFilter] = useState("All");

const filteredInstallations = selectedPriorityFilter === "All"
    ? installations
    : installations.filter(installation => installation.priority === selectedPriorityFilter);

    const [installationStatus, setInstallationStatus] = useState("");
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState(""); // Search term state
    const filteredSubscribers = subscribers?.filter(
      (subscriber) =>
        (subscriber.firstName &&
          subscriber.firstName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (subscriber.lastName &&
          subscriber.lastName.toLowerCase().includes(searchTerm.toLowerCase()))
    );    
    
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(true);
    const filteredInventory = inventory?.filter(
      (item) =>
        item.name &&
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const sortedInventory = [...inventory].sort((a, b) => {
      if (sortBy === "newest") {
        return b.serialNumber.localeCompare(a.serialNumber);
      } else if (sortBy === "oldest") {
        return a.serialNumber.localeCompare(b.serialNumber);
      } else if (sortBy === "lowestStock") {
        return a.totalStock - b.totalStock;
      } else if (sortBy === "highestStock") {
        return b.totalStock - a.totalStock;
      }
      return 0;
    });
    const fetchBillingRecords = async (subscriberEmail) => {
      if (!subscriberEmail) return;
      const billingQuery = query(
        collection(db, "Billing"),
        where("subscriberName", "==", subscriberEmail)
      );
      const querySnapshot = await getDocs(billingQuery);
      const data = querySnapshot.docs.map((doc) => doc.data());
      setBillingRecords(data);
    };
    
    // Use in useEffect
    useEffect(() => {
      if (selectedSubscriber) {
        fetchBillingRecords(selectedSubscriber.email);
      }
    }, [selectedSubscriber]);

    const formatTimestamp = (timestamp) => {
      if (!timestamp || !timestamp.seconds) return "N/A"; // Handle missing values
      const date = new Date(timestamp.seconds * 1000); // Convert to milliseconds
      return date.toLocaleString(); // Convert to readable date
    };
    

    useEffect(() => {
      
      
      const unsubscribePlans = onSnapshot(
          collection(db, "internetPlans"),
          (snapshot) => {
              const plansData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
              console.log("Plans data fetched:", plansData); // Log fetched plans data
              setPlans(plansData);
          },
          (error) => console.error("Error fetching plans:", error) // Log errors if any
      );
  
      const unsubscribeReceipts = onSnapshot(
          collection(db, "Receipts"),
          (snapshot) => {
              const receiptsData = snapshot.docs.map(doc => ({
                  id: doc.id,
                  ...doc.data(),
                  expanded: false,
              }));
              console.log("Receipts data fetched:", receiptsData); // Log fetched receipts data
              setReceipts(receiptsData);
          },
          (error) => console.error("Error fetching receipts:", error) // Log errors if any
      );
  
      const unsubscribeInstallations = onSnapshot(
          collection(db, "Installations"),
          (snapshot) => {
              const installationsData = snapshot.docs.map(doc => ({
                  id: doc.id,
                  ...doc.data(),
              }));
              console.log("Installations data fetched:", installationsData); // Log fetched installations data
              setInstallations(installationsData);
          },
          (error) => console.error("Error fetching installations:", error) // Log errors if any
      );
  
      const unsubscribeSubscribers = onSnapshot(
          collection(db, "Subscribers"),
          (snapshot) => {
              const subscribersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
              console.log("Subscribers data fetched:", subscribersData); // Log fetched subscribers data
              setSubscribers(subscribersData);
          },
          (error) => console.error("Error fetching subscribers:", error) // Log errors if any
      );
  
      const unsubscribeRepairRequests = onSnapshot(
          collection(db, "RepairRequests"),
          (snapshot) => {
              const repairRequestsData = snapshot.docs.map(doc => ({
                  id: doc.id,
                  ...doc.data(),
              }));
              console.log("Repair requests data fetched:", repairRequestsData); // Log fetched repair requests data
              setRepairRequests(repairRequestsData);
          },
          (error) => console.error("Error fetching repair requests:", error) // Log errors if any
      );
  
      const fetchInventory = async () => {
          try {
              setLoading(true);
              const querySnapshot = await getDocs(collection(db, "inventory"));
              const fetchedInventory = querySnapshot.docs.map(doc => ({
                  id: doc.id,
                  ...doc.data(),
              }));
              console.log("Inventory data fetched:", fetchedInventory); // Log fetched inventory data
              setInventory(fetchedInventory);
          } catch (error) {
              console.error("Error fetching inventory:", error); // Log errors if any
          } finally {
              setLoading(false);
          }
      };
  
      fetchInventory(); // Initial call to fetch inventory
  
      // Cleanup listeners and prevent memory leaks
      return () => {
          unsubscribePlans();
          unsubscribeReceipts();
          unsubscribeInstallations();
          unsubscribeSubscribers();
          unsubscribeRepairRequests();
      };
  }, []);
  

    // const handleResolveRequest = async (requestId) => {
    //   try {
    //     // Mark repair request as resolved
    //     await updateDoc(doc(db, "RepairRequests", requestId), {
    //       status: "Resolved",
    //       resolvedDate: Timestamp.fromDate(new Date()),
    //     });
    //     alert("Repair request marked as resolved!");
    //   } catch (error) {
    //     console.error("Error resolving repair request: ", error.message);
    //     alert("Failed to mark repair request as resolved.");
    //   }
    // };
    const handleSortChange = (field) => {
      setSortBy(field);
      setSortOrder(sortOrder === "asc" ? "desc" : "asc"); // Toggle order
    };
    const handleEditMaterial = (id) => {
      const materialToEdit = inventory.find((item) => item.id === id);
      setEditingMaterial({ ...materialToEdit });
    };
    
    const handleSaveEdit = (e) => {
      e.preventDefault();
      const updatedInventory = inventory.map((item) =>
        item.id === editingMaterial.id ? editingMaterial : item
      );
      setInventory(updatedInventory);
      setEditingMaterial(null); // Close the edit form
    };
    const handleAddPlan = async (e) => {
        e.preventDefault();
        if (!newPlan.Name || !newPlan.Speed || !newPlan.Price) return alert("Please fill in all plan fields.");
        try {
            await addDoc(collection(db, "internetPlans"), newPlan);
            setNewPlan({ Name: "", Speed: "", Price: "" });
            // Simulate adding a plan
            console.log("Plan added successfully!");

            // Show success alert
            setShowAlert(true);

            // Hide the alert after 3 seconds (optional)
            setTimeout(() => setShowAlert(false), 3000);
        } catch (error) {
            alert("Failed to add plan: " + error.message);
        }
    };

    const handleRemovePlan = async (planId) => {
        try {
            await deleteDoc(doc(db, "internetPlans", planId));
            // Show success alert
            setShowAlert(true);

            // Hide the alert after 3 seconds (optional)
            setTimeout(() => setShowAlert(false), 3000);
        } catch (error) {
            alert("Failed to remove plan: " + error.message);
        }
    };

    const handleCreateAccount = async (e) => {
      e.preventDefault();
      try {
        // Create user in Firebase Authentication
        const userCredential = await createUserWithEmailAndPassword(
          auth, 
          newEmployee.email, 
          newEmployee.password
        );
    
        // Prepare the user object
        const user = userCredential.user;
    
        // Prepare the data to be added to Firestore
        const userData = {
          name: newEmployee.name,
          email: newEmployee.email,
          role: newEmployee.role,
          uid: user.uid, // Store the UID for reference
        };
    
        // Determine the collection based on the role
        const collectionRef = newEmployee.role === "admin" ? "admin" : "Employees";
    
        // Add user to Firestore (either Admin or Employee collection)
        if (newEmployee.role === "admin") {
          // Set the document ID to the UID for the admin account
          await setDoc(doc(db, collectionRef, user.uid), userData);
        } else {
          // Add the employee to the Employees collection (Firestore auto-generates the document ID)
          await addDoc(collection(db, collectionRef), userData);
        }
    
        // Reset form
        setNewEmployee({ name: "", email: "", password: "", role: "employee" });
        alert(`${newEmployee.role.charAt(0).toUpperCase() + newEmployee.role.slice(1)} account created successfully!`);
      } catch (error) {
        alert("Failed to create account: " + error.message);
      }
    };
    const handleLogout = async () => {
        try {
            await signOut(auth);
            alert("Successfully logged out!");
            navigate("/");
        } catch (err) {
            console.error("Failed to log out: ", err.message);
        }
    };

    const confirmReceipt = async (receiptId) => {
      try {
          const auth = getAuth(); // Get the auth instance
          const user = auth.currentUser; // Get the currently logged-in user
  
          if (!user) {
              return alert("User not authenticated. Please log in.");
          }
  
          // Find the receipt in the list of receipts
          const receipt = receipts.find((r) => r.id === receiptId);
          if (!receipt) return alert("Receipt not found.");
  
          // Find the plan corresponding to the receipt
          const plan = plans.find((p) => p.Name === receipt.planName);
          if (!plan) return alert("Plan not found for the receipt.");
  
          // Determine the priority and installation schedule
          const sortedPlans = [...plans].sort((a, b) => b.Price - a.Price);
          const planIndex = sortedPlans.findIndex((p) => p.Name === plan.Name);
          const priority =
              planIndex < sortedPlans.length / 3
                  ? "High"
                  : planIndex < (2 * sortedPlans.length) / 3
                  ? "Medium"
                  : "Low";
  
          const installationDays =
              priority === "High"
                  ? 1 + Math.floor(Math.random() * 3)
                  : priority === "Medium"
                  ? 4 + Math.floor(Math.random() * 4)
                  : 8 + Math.floor(Math.random() * 7);
  
          const scheduledDate = new Date();
          scheduledDate.setDate(scheduledDate.getDate() + installationDays);
  
          // Add the installation to the Installations collection, including UID
          const installationRef = await addDoc(collection(db, "Installations"), {
              ...receipt,
              confirmed: true,
              installationDate: Timestamp.fromDate(scheduledDate),
              installationStatus: "Scheduled",
              priority,
              uid: user.uid, // Get user UID from Firebase Auth
          });
  
          // Update the newly created installation with its document ID
          await setDoc(installationRef, { id: installationRef.id }, { merge: true });
  
          console.log(
              "Installation added to Installations collection with ID:",
              installationRef.id
          );
  
          // Delete the receipt from the Receipts collection
          await deleteDoc(doc(db, "Receipts", receiptId));
          console.log("Receipt deleted from Receipts collection:", receiptId);
  
          // Remove the user's record from the RejectedReceipts collection
          const rejectedReceiptsRef = collection(db, "RejectedReceipts");
          const rejectedReceiptsQuery = query(
              rejectedReceiptsRef,
              where("subscriberName", "==", receipt.subscriberName)
          );
          const rejectedReceiptsSnapshot = await getDocs(rejectedReceiptsQuery);
  
          if (!rejectedReceiptsSnapshot.empty) {
              rejectedReceiptsSnapshot.forEach(async (doc) => {
                  await deleteDoc(doc.ref);
                  console.log("Deleted from RejectedReceipts:", doc.id);
              });
          }
  
          // Alert the user of successful receipt confirmation and scheduling
          alert(
              `Receipt confirmed! Installation scheduled for ${scheduledDate.toDateString()} (Priority: ${priority}).`
          );
      } catch (error) {
          console.error("Error confirming receipt:", error);
          alert("Failed to confirm receipt: " + error.message);
      }
  };
  const [selectedQuantities, setSelectedQuantities] = useState({});
  const completeInstallation = async (installationId, selectedItems) => {
    try {
        const installation = installations.find((i) => i.id === installationId);
        if (!installation) {
            alert("Installation not found in state.");
            return;
        }

        // Validate installation ID
        if (!installation.id) {
            console.error("Error: Missing ID for installation:", installation);
            alert("Failed to mark installation as complete: ID is missing.");
            return;
        }

        const completionDate = Timestamp.fromDate(new Date());

        // Move installation to CompletedInstallations
        const completedInstallationData = {
            ...installation,
            completionDate,
            installationStatus: "Completed",
        };

        await addDoc(collection(db, "CompletedInstallations"), completedInstallationData);
        console.log(`Installation ${installationId} added to CompletedInstallations.`);

        // Remove from Installations collection
        await deleteDoc(doc(db, "Installations", installationId));
        console.log(`Installation ${installationId} deleted from Installations collection.`);

        // Create Billing Entry with ID and UID
        if (installation.planName && installation.planPrice) {
            const billingData = {
                id: installation.id, // Using id instead of uid
                uid: installation.uid || "Unknown", // Ensure UID is included
                subscriberName: installation.subscriberName || "Unknown",
                planName: installation.planName,
                planPrice: installation.planPrice,
                billingStartDate: installation.installationDate,
                status: "Pending",
                timestamp: Timestamp.now(),
            };

            await addDoc(collection(db, "Billing"), billingData);
            console.log(`Billing entry created for installation ID: ${installation.id}, UID: ${installation.uid}.`);
        } else {
            console.warn("Missing plan details. Billing entry not created.");
        }

        // Update Inventory
        const updatedInventory = inventory.map(item => {
            if (selectedItems.includes(item.id)) {
                const usedQuantity = parseInt(selectedQuantities[item.id], 10) || 0;

                return item.category === "Cable"
                    ? { ...item, lengthAvailable: Math.max(0, item.lengthAvailable - usedQuantity), lengthDeployed: (item.lengthDeployed || 0) + usedQuantity }
                    : { ...item, availableStock: Math.max(0, item.availableStock - usedQuantity), deployedStock: (item.deployedStock || 0) + usedQuantity };
            }
            return item;
        });

        setInventory(updatedInventory);

        // Batch update inventory in Firebase
        await Promise.all(
            selectedItems.map(async (itemId) => {
                const itemRef = doc(db, "inventory", itemId);
                const itemSnapshot = await getDoc(itemRef);
                if (itemSnapshot.exists()) {
                    const itemData = itemSnapshot.data();
                    const usedQuantity = parseInt(selectedQuantities[itemId], 10) || 0;

                    await updateDoc(itemRef, itemData.category === "Cable"
                        ? { lengthAvailable: Math.max(0, itemData.lengthAvailable - usedQuantity), lengthDeployed: (itemData.lengthDeployed || 0) + usedQuantity }
                        : { availableStock: Math.max(0, itemData.availableStock - usedQuantity), deployedStock: (itemData.deployedStock || 0) + usedQuantity }
                    );
                }
            })
        );

        // Show success alert
        setShowAlert(true);
        setTimeout(() => setShowAlert(false), 3000);

    } catch (error) {
        console.error("Error marking installation as complete:", error);
        alert("Failed to mark installation as complete: " + error.message);
    }
};


    const handleRejectReceipt = async (receiptId) => {
      try {
        // Step 1: Find the receipt in the local state
        const receipt = receipts.find((r) => r.id === receiptId);
        if (!receipt) {
          alert("Receipt not found.");
          return;
        }
    
        // Step 2: Prompt the admin to provide a rejection reason
        const rejectionReason = prompt("Please provide a reason for rejecting this receipt:");
        if (!rejectionReason) {
          alert("Rejection reason is required.");
          return;
        }
    
        // Step 3: Add the receipt to the RejectedReceipts collection
        const rejectedReceiptData = {
          ...receipt,
          rejectionDate: Timestamp.fromDate(new Date()), // Add rejection timestamp
          rejectionReason, // Add rejection reason
        };
        await addDoc(collection(db, "RejectedReceipts"), rejectedReceiptData);
    
        // Step 4: Delete the receipt from the Receipts collection
        await deleteDoc(doc(db, "Receipts", receiptId));
    
        // Step 5: Notify the user
        alert("Receipt rejected with the reason.");
      } catch (error) {
        console.error("Error rejecting receipt:", error);
        alert("Failed to reject receipt: " + error.message);
      }
    };
    
    const handleResolveRepairRequest = async (requestId) => {
      try {
        // Find the request in the list of repair requests
        const request = repairRequests.find((r) => r.id === requestId);
        if (!request) return alert("Repair request not found.");
    
        // Add the repair request to the CompletedRepairs collection
        const completedRepairRef = await addDoc(collection(db, "CompletedRepairs"), {
          ...request,
          resolvedDate: Timestamp.fromDate(new Date()), // Add resolved timestamp
          status: "Resolved", // Mark as resolved
        });
    
        // Update the newly created completed repair with its document ID
        await setDoc(completedRepairRef, { id: completedRepairRef.id }, { merge: true });
    
        console.log(
          "Repair request added to CompletedRepairs collection with ID:",
          completedRepairRef.id
        );
    
        // If the repair type is "Disconnection", update the user's installation status
        if (request.repairType === "Disconnection" && request.userId) {
          const userRef = doc(db, "Subscribers", request.userId);
          const userSnap = await getDoc(userRef);
    
          if (userSnap.exists()) {
            await updateDoc(userRef, {
              installationStatus: "Disconnected",
            });
            console.log(`Updated installation status for user ${request.userId} to Disconnected.`);
          } else {
            console.error("User not found in Subscribers collection.");
          }
        }
    
        // Delete the request from the RepairRequests collection
        await deleteDoc(doc(db, "RepairRequests", requestId));
        console.log("Repair request deleted from RepairRequests collection:", requestId);
    
        // Notify the user of successful resolution
        alert("Repair request resolved and moved to Completed Repairs.");
      } catch (error) {
        console.error("Error resolving repair request:", error);
        alert("Failed to resolve repair request: " + error.message);
      }
    };
    
    
    const [newMaterial, setNewMaterial] = useState("");
    const [cableLengths, setCableLengths] = useState({});


    const handleAddMaterial = async (e) => {
      e.preventDefault();
      if (!newMaterial.manufacturer.trim() || !newMaterial.model.trim() || !newMaterial.category.trim() || isNaN(newMaterial.availableStock) || isNaN(newMaterial.deployedStock)) {
        alert("Please enter valid material details.");
        return;
      }
    
      try {
        const serialNumber = `SN-${Date.now()}-${Math.floor(Math.random() * 1000)}`; // Generate unique serial number
        const materialData = {
          ...newMaterial,
          serialNumber,
          availableStock: parseInt(newMaterial.availableStock, 10) || 0,
          deployedStock: parseInt(newMaterial.deployedStock, 10) || 0,
          totalStock: parseInt(newMaterial.availableStock, 10) + parseInt(newMaterial.deployedStock, 10) || 0,
        };
        const docRef = await addDoc(collection(db, "inventory"), materialData);
        setInventory((prev) => [...prev, { id: docRef.id, ...materialData }]);
        setNewMaterial({ manufacturer: "", model: "", category: "", availableStock: "", deployedStock: "" }); // Reset form
        alert("Material added successfully!");
      } catch (error) {
        console.error("Error adding material: ", error);
      }
    };
    const updateInventory = async (id, updatedFields) => {
      try {
        const docRef = doc(db, "inventory", id);
        await updateDoc(docRef, updatedFields);
        setInventory((prev) =>
          prev.map((item) => (item.id === id ? { ...item, ...updatedFields } : item))
        );
      } catch (error) {
        console.error("Error updating inventory: ", error);
      }
    };
    const deleteMaterial = async (id) => {
      try {
        console.log("Deleting material with ID:", id);
        
        const materialRef = doc(db, "inventory", id);
        await deleteDoc(materialRef);
        
        setInventory((prevInventory) => prevInventory.filter((item) => item.id !== id));
    
        alert("Material deleted successfully!");
      } catch (error) {
        console.error("Error deleting material:", error);
        alert("Failed to delete material.");
      }
    };
    
    
const [showAddForm, setShowAddForm] = useState(false);
const [filterCategory, setFilterCategory] = useState("");
const [showAddCategory, setShowAddCategory] = useState(false);
// const [categories, setCategories] = useState(["NAP Box", "Modem", "Cable", "Power Adapter", "Tools", "Connectors"]);
const [newCategory, setNewCategory] = useState("");
const [categories, setCategories] = useState(() => {
  const savedCategories = localStorage.getItem("categories");
  return savedCategories ? JSON.parse(savedCategories) : ["NAP Box", "Modem", "Cable", "Power Adapter", "Tools", "Connectors"];
});

// const categories = ["NAP Box", "Modem", "Cable", "Power Adapter", "Tools","Connectors"]; // Example categories
const categoryColors = {
  Electronics: "primary",
  Furniture: "success",
  Tools: "warning",
  "Office Supplies": "info"
};
const [selectedCategory, setSelectedCategory] = useState("");

    const toggleReceiptDetails = (receiptId) => {
        const updatedReceipts = receipts.map(receipt =>
            receipt.id === receiptId ? { ...receipt, expanded: !receipt.expanded } : receipt
        );
        setReceipts(updatedReceipts);
    };
    
    const [selectedInstallation, setSelectedInstallation] = useState(null);
    const [selectedItems, setSelectedItems] = useState([]);
    
    const toggleItemSelection = (itemId) => {
        setSelectedItems((prevSelected) =>
            prevSelected.includes(itemId)
                ? prevSelected.filter((id) => id !== itemId)
                : [...prevSelected, itemId]
        );
    };
    
    const saveConfiguration = () => {
        if (selectedInstallation) {
            setInstallations((prevInstallations) =>
                prevInstallations.map((inst) =>
                    inst.id === selectedInstallation.id
                        ? { ...inst, selectedItems }
                        : inst
                )
            );
        }
        setSelectedInstallation(null);
        setSelectedItems([]);
    };
    const [sortOption, setSortOption] = useState("all");

   
    const [timeFilter, setTimeFilter] = useState("all");
    
    const now = new Date();
    const filteredReceipts = receipts.filter((receipt) => {
      const uploadDate = new Date(receipt.timestamp.seconds * 1000);
      
      if (timeFilter === "lastWeek") {
        const lastWeek = new Date();
        lastWeek.setDate(now.getDate() - 7);
        return uploadDate >= lastWeek;
      }
      
      if (timeFilter === "lastMonth") {
        const lastMonth = new Date();
        lastMonth.setMonth(now.getMonth() - 1);
        return uploadDate >= lastMonth;
      }
    
      return true;
    }).sort((a, b) => {
      const dateA = new Date(a.timestamp.seconds * 1000);
      const dateB = new Date(b.timestamp.seconds * 1000);
      return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
    });
    
    const handleUpdateStock = (itemId, category) => {
      const newStock = prompt("Enter stock to add:");
  
      if (newStock && !isNaN(newStock)) {
          const stockToAdd = parseInt(newStock, 10);
  
          setInventory(prevInventory =>
              prevInventory.map(item =>
                  item.id === itemId
                      ? {
                            ...item,
                            lengthAvailable: category === "Cable"
                                ? (item.lengthAvailable || 0) + stockToAdd // Update lengthAvailable for cables
                                : item.lengthAvailable,
  
                            availableStock: category !== "Cable"
                                ? (item.availableStock || 0) + stockToAdd // Only update availableStock for non-cables
                                : item.availableStock,
  
                            totalStock: category === "Cable"
                                ? (item.lengthAvailable || 0) + stockToAdd + (item.lengthDeployed || 0) // Ensure totalStock is correct for cables
                                : (item.availableStock || 0) + (item.deployedStock || 0) + stockToAdd
                        }
                      : item
              )
          );
  
          // Firestore update logic
          const itemRef = doc(db, "inventory", itemId);
          const updateData = {};
  
          if (category === "Cable") {
              updateData.lengthAvailable = increment(stockToAdd);
              updateData.totalStock = increment(stockToAdd);
          } else {
              updateData.availableStock = increment(stockToAdd);
              updateData.totalStock = increment(stockToAdd);
          }
  
          updateDoc(itemRef, updateData)
              .then(() => {
                  alert("Stock updated successfully!");
              })
              .catch((error) => {
                  console.error("Error updating stock:", error);
              });
      }
  };
  
    return (
      <div className="admin-dashboard">
        {/* Sidebar */}
        <nav className="sidebar">
          <h2>Admin</h2>
          <ul>
            {[
              { name: "subscribers", icon: "fas fa-users", count: null },
              { name: "receipts", icon: "fas fa-file-invoice", count: receipts.length },
              { name: "repairs", icon: "fas fa-tools", count: repairRequests.length },
              { name: "create Plan", icon: "fas fa-plus-circle", count: null },
              { name: "remove Plan", icon: "fas fa-minus-circle", count: null },
              { name: "create Account", icon: "fas fa-user-plus", count: null },
              { name: "installations", icon: "fas fa-wrench", count: installations.length },
              { name: "inventory", icon: "fas fa-boxes", count: null },
              { name: "billing", icon: "fas fa-file-invoice-dollar", count: null },
              { name: "Reports", icon: "fas fa-file-lines", count: null },
            ].map((tab) => (
              <li
                key={tab.name}
                className={activeTab === tab.name ? "active" : ""}
                onClick={() => setActiveTab(tab.name)}
              >
                <i className={tab.icon}></i> {tab.name.charAt(0).toUpperCase() + tab.name.slice(1)}
                {tab.count !== null && (
          <span className="badge bg-warning rounded-pill px-2 py-1 ms-auto"> {tab.count}</span>
        )}

              </li>
            ))}
          </ul>
          
          <button onClick={handleLogout}  className="logout-btn">
            <i className="fas fa-door-open me-2"></i>
              Logout
            </button>

        </nav>
  
        {/* Main Content Area */}
        <div className="admin-content">

        {activeTab === "subscribers" && (
  <div className="subscribers-container">
    <h2 className="text-warning fw">Subscribers</h2>

    {/* Search Input */}
    <div className="search-container mb-3">
      <input
        type="text"
        className="form-control"
        placeholder="🔍 Search"
        value={searchTerm || ""} // Ensure searchTerm is always defined
        onChange={(e) => setSearchTerm(e.target.value)}
      />
    </div>

    {/* Debugging Logs */}
    {console.log("Subscribers:", subscribers)}
    {console.log("Search Term:", searchTerm)}
    {console.log("Filtered Subscribers:", filteredSubscribers)}

    {/* Display Filtered Subscribers */}
    {filteredSubscribers && filteredSubscribers.length > 0 ? (
      <div className="table-responsive">
        <table className="table table-striped table-hover border">
          <thead className="table-dark">
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Plan</th>
              <th>Contact Number</th>
            </tr>
          </thead>
          <tbody>
            {filteredSubscribers.map((subscriber) => (
              <tr key={subscriber.id}>
                <td>{subscriber.lastName}, {subscriber.firstName} {subscriber.middleInitial}</td>
                <td>{subscriber.email}</td>
                <td>{subscriber.plan}</td>
                <td>{subscriber.contactNumber}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ) : (
      <div className="text-muted">
        <p>
          {searchTerm
            ? "No subscribers match the search query."
            : "No subscribers available."}
        </p>
      </div>
    )}
  </div>
)}


{activeTab === "receipts" && (
  <div>
    <h2 className="text-warning fw">Receipts</h2>

    {/* Sorting Dropdown */}
    <div className="d-flex gap-3">
  <select className="form-select w-auto" onChange={(e) => setTimeFilter(e.target.value)} value={timeFilter}>
    <option value="all">All</option>
    <option value="lastWeek">Last Week</option>
    <option value="lastMonth">Last Month</option>
  </select>

  <select className="form-select w-auto" onChange={(e) => setSortOrder(e.target.value)} value={sortOrder}>
    <option value="desc">Newest First</option>
    <option value="asc">Oldest First</option>
  </select>
</div>


    {/* Responsive Grid */}
    <div className="row row-cols-1 row-cols-md-3 g-3">
      {filteredReceipts.map((receipt) => (
        <div className="col" key={receipt.id}>
          <div className="card shadow h-100">
            <img
              src={receipt.receiptURL}
              className="card-img-top receipt-img"
              alt="Receipt"
              data-bs-toggle="modal"
              data-bs-target={`#modal-${receipt.id}`}
              style={{ cursor: "pointer" }}
            />
            <div className="card-body">
              <h5 className="card-title text-info">{receipt.subscriberName}</h5>
              <p>Uploaded on: {new Date(receipt.timestamp.seconds * 1000).toDateString()}</p>
              <button className="btn btn-success me-3" onClick={() => confirmReceipt(receipt.id)}>
                Accept
              </button>
              <button className="btn btn-danger" onClick={() => handleRejectReceipt(receipt.id)}>
                Reject
              </button>
            </div>
          </div>

          {/* Modal for Receipt Image */}
          <div
            className="modal fade"
            id={`modal-${receipt.id}`}
            tabIndex="-1"
            aria-labelledby={`modalLabel-${receipt.id}`}
            aria-hidden="true"
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title" id={`modalLabel-${receipt.id}`}>
                    Receipt from {receipt.subscriberName}
                  </h5>
                  <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div className="modal-body text-center">
                  <img src={receipt.receiptURL} alt="Expanded Receipt" className="img-fluid" />
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
)}


          {activeTab === "repairs" && (
  <div>
    <h2 className="text-warning fw">Repair Requests</h2>
    <div className="row">
      {repairRequests.map((request) => (
        <div className="row row-cols-1 row-cols-md-3 g-3" key={request.id}>
          <div className="card shadow border-info">
            <img
              src={request.imageUrl}
              className="card-img-top repair-img"
              alt="Repair Evidence"
              data-bs-toggle="modal"
              data-bs-target={`#modal-${request.id}`}
              style={{ maxHeight: "200px", objectFit: "cover", cursor: "pointer" }}
            />
            <div className="card-body">
              <h5 className="card-title text-info">
                {request.reportedBy}
              </h5>
              <p>
                <strong>Type:</strong> {request.repairType}
              </p>
              <p>
                <strong>Details:</strong> {request.details}
              </p>
              <p>
                <strong>Reported On: </strong>{" "}
                {new Date(request.timestamp.seconds * 1000).toDateString()}
              </p>
              <p>
                <strong>Reported by: </strong>{request.email}
              </p>
              {request.status !== "Resolved" && (
                      <button
                      className="btn btn-success"
                      onClick={() => handleResolveRepairRequest(request.id, request.repairType, request.userId)}
                    >
                      Mark as Resolved
                    </button>
                    
                    )}
            </div>
          </div>

          {/* Modal for Image Preview */}
          <div
            className="modal fade"
            id={`modal-${request.id}`}
            tabIndex="-1"
            aria-labelledby={`modalLabel-${request.id}`}
            aria-hidden="true"
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title" id={`modalLabel-${request.id}`}>
                    Repair Evidence
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    data-bs-dismiss="modal"
                    aria-label="Close"
                  ></button>
                </div>
                <div className="modal-body text-center">
                  <img
                    src={request.imageUrl}
                    alt="Expanded Repair Evidence"
                    className="img-fluid"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
)}
          {activeTab === "create Plan" && (
  <div>
    {/* Success Alert */}
    {showAlert && (
      <div className="alert alert-success alert-dismissible fade show" role="alert">
        <strong>Success!</strong> Plan added successfully!
      </div>
    )}

    <h2 className="text-warning fw">Create New Internet Plan</h2>
    <form onSubmit={handleAddPlan} className="form-container shadow">
      <div className="mb-3">
        <label className="form-label">Plan Name</label>
        <input
          type="text"
          className="form-control"
          value={newPlan.Name}
          onChange={(e) => setNewPlan({ ...newPlan, Name: e.target.value })}
          placeholder="Enter Plan Name"
          required
        />
      </div>
      <div className="mb-3">
        <label className="form-label">Speed (Mbps)</label>
        <input
          type="number"
          className="form-control"
          value={newPlan.Speed}
          onChange={(e) => setNewPlan({ ...newPlan, Speed: e.target.value })}
          placeholder="Enter Speed"
          required
        />
      </div>
      <div className="mb-3">
        <label className="form-label">Price (₱)</label>
        <input
          type="number"
          className="form-control"
          value={newPlan.Price}
          onChange={(e) => setNewPlan({ ...newPlan, Price: e.target.value })}
          placeholder="Enter Price in ₱"
          required
        />
      </div>
      <button type="submit" className="btn btn-primary">
        Add Plan
      </button>
    </form>
  </div>
)}


          {activeTab === "remove Plan" && (
            <div>
              {/* Success Alert */}
                {showAlert && (
                  <div className="alert alert-success alert-dismissible fade show" role="alert">
                    <strong>Success!</strong> Plan removed successfully!
                  </div>
                )}
                <h2 className="text-warning fw">Remove Internet Plan</h2>
              <div className="row">
                {plans.map((plan) => (
                  <div className="col-md-4 mb-3" key={plan.id}>
                    <div className="card shadow border-danger">
                      <div className="card-body">
                        <h5 className="card-title text-dark">{plan.Name}</h5>
                        <p>
                          <strong>Speed:</strong> {plan.Speed} Mbps
                        </p>
                        <p>
                          <strong>Price:</strong> ₱{plan.Price}
                        </p>
                        <button className="btn btn-danger" onClick={() => handleRemovePlan(plan.id)}>Remove Plan</button>

                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "create Account" && (
  <div>
    <h2 className="text-warning fw">Create Account</h2>
    <div className="form-container">
      <form onSubmit={handleCreateAccount}>
        {newEmployee.role === "employee" && (
          <input
            type="text"
            value={newEmployee.name}
            onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
            placeholder="Employee Name"
            required
          />
        )}

        <input
          type="email"
          value={newEmployee.email}
          onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
          placeholder="Email"
          required
        />

        <input
          type="password"
          value={newEmployee.password}
          onChange={(e) => setNewEmployee({ ...newEmployee, password: e.target.value })}
          placeholder="Password"
          required
        />

        <select
          value={newEmployee.role}
          onChange={(e) => setNewEmployee({ ...newEmployee, role: e.target.value })}
        >
          <option value="employee">Employee</option>
          <option value="admin">Admin</option>
        </select>

        <button type="submit">Create Account</button>
      </form>
    </div>
  </div>
)}

{activeTab === "installations" && (
    <div className="container">
        {showAlert && (
            <div className="alert alert-success alert-dismissible fade show text-center" role="alert">
                <strong>Success!</strong> Installation marked as complete!
            </div>
        )}

        <h2 className="text-warning fw-bold mb-4">Installations Management</h2>

        {/* Filter by Priority */}
        <div className="d-flex align-items-center mb-3">
            <label className="fw-bold me-2">Filter by Priority:</label>
            <select 
                className="form-select w-auto"
                value={selectedPriorityFilter} 
                onChange={(e) => setSelectedPriorityFilter(e.target.value)}
            >
                <option value="All">All</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
            </select>
        </div>

        {filteredInstallations.length === 0 ? (
            <div className="alert alert-info text-center">No installations to show.</div>
        ) : (
            <div className="row">
                {filteredInstallations.map(installation => (
                    <div className="col-lg-6 col-md-6 mb-4" key={installation.id}>
                        <div className="card shadow-sm border-0 rounded-3 p-3">
                            <div className="card-body">
                                <h5 className="card-title fw-bold text-primary">{installation.subscriberName}</h5>
                                <p className="mb-1"><strong>Plan:</strong> {installation.planName}</p>
                                <p className="mb-1">
                                    <strong>Installation Date:</strong> {installation.installationDate.toDate().toLocaleString()}
                                </p>
                                <p className="mb-3">
                                    <strong>Priority:</strong> 
                                    <span className={`badge ms-2 rounded-pill ${installation.priority === "High" ? "bg-danger" : installation.priority === "Medium" ? "bg-warning text-dark" : "bg-secondary"}`}>
                                        {installation.priority}
                                    </span>
                                </p>

                                <div className="d-flex">
                                    <button 
                                        className="btn btn-outline-warning flex-grow-1 me-2 rounded-pill" 
                                        onClick={() => setSelectedInstallation(installation)}
                                    >
                                        <i className="bi bi-tools me-1"></i> Configure
                                    </button>

                                    <button
                                        className="btn btn-success flex-grow-1 rounded-pill"
                                        onClick={() => completeInstallation(installation.id, installation.selectedItems)}
                                    >
                                        <i className="bi bi-check-circle me-1"></i> Mark Complete
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        )}

       {/* Configure Installation Modal */}
       {selectedInstallation && (
    <div className="modal fade show d-block" tabIndex="-1" role="dialog">
        <div className="modal-dialog modal-xl" role="document">
            <div className="modal-content rounded-3">
                <div className="modal-header bg-primary text-white">
                    <h5 className="modal-title fw-bold">Configure Installation</h5>
                    <button type="button" className="btn-close" onClick={() => setSelectedInstallation(null)}></button>
                </div>

                {/* Scrollable Modal Body */}
                <div className="modal-body" style={{ maxHeight: "75vh", overflowY: "auto", overflowX: "hidden" }}>
                    <p className="mb-3 fw-semibold">Select items to use for installation:</p>
                    
                    {/* FLEX CONTAINER - Ensures proper wrapping */}
                    <div className="d-flex flex-wrap gap-3">
                        {inventory.map(item => (
                            <div key={item.id} className="card border-0 shadow-sm p-3" style={{ flex: "1 1 250px", minWidth: "250px" }}>
                                <div className="d-flex align-items-center">
                                    <input
                                        type="checkbox"
                                        className="form-check-input me-2"
                                        id={item.id}
                                        checked={selectedItems.includes(item.id)}
                                        onChange={() => toggleItemSelection(item.id)}
                                    />
                                    <label className="form-check-label fw-bold" htmlFor={item.id}>
                                        {item.deviceName}
                                    </label>
                                </div>
                                <small className="text-muted">
                                    {item.category === "Cable" 
                                        ? `Available: ${item.lengthAvailable} ${item.unit}`
                                        : `Stock: ${item.availableStock}`
                                    }
                                </small>
                                <input
                                    type="number"
                                    className="form-control mt-2"
                                    placeholder={item.category === "Cable" ? "Enter length" : "Enter quantity"}
                                    value={selectedQuantities[item.id] || ""}
                                    onChange={(e) => setSelectedQuantities({
                                        ...selectedQuantities,
                                        [item.id]: parseInt(e.target.value, 10) || 0
                                    })}
                                />
                                {item.category === "Cable" && <span className="text-muted">{item.unit}</span>}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="modal-footer">
                    <button type="button" className="btn btn-secondary rounded-pill" onClick={() => setSelectedInstallation(null)}>Cancel</button>
                    <button type="button" className="btn btn-primary rounded-pill" onClick={saveConfiguration}>
                        <i className="bi bi-save me-1"></i> Save
                    </button>
                </div>
            </div>
        </div>
    </div>
)}

    </div>
)}

          {activeTab === "inventory" && (
  <div>
    <h2 className="text-warning fw">Inventory Management</h2>
    
    <div className="d-flex justify-content-between mb-3">
      <input
        type="text"
        className="form-control w-50"
        placeholder="&#x1F50E;&#xFE0E; Type to search"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      
      <select className="form-select w-25" onChange={(e) => setSelectedCategory(e.target.value)}>
        <option value="">All Categories</option>
        {categories.map((category) => (
          <option key={category} value={category}>{category}</option>
        ))}
      </select>
      
      <div className="dropdown">
        <button className="btn btn-light dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
          Sort <i className="fas fa-sort"></i>
        </button>
        <ul className="dropdown-menu">
          <li><button className="dropdown-item" onClick={() => setSortBy("newest")}>Newest</button></li>
          <li><button className="dropdown-item" onClick={() => setSortBy("oldest")}>Oldest</button></li>
          <li><button className="dropdown-item" onClick={() => setSortBy("lowestStock")}>Lowest Stock</button></li>
          <li><button className="dropdown-item" onClick={() => setSortBy("highestStock")}>Highest Stock</button></li>
        </ul>
      </div>
      
      {selectedCategory && selectedCategory !== "" && (
        <button className="btn btn-secondary" onClick={() => setShowAddForm(!showAddForm)}>
          {showAddForm ? "Cancel" : "Add Item"}
        </button>
      )}
      {!selectedCategory && (
      <button className="btn btn-secondary" onClick={() => setShowAddCategory(!showAddCategory)}>
          {showAddCategory ? "Cancel" : "Add Category"}
        </button>
      )}
    </div>
    {showAddCategory && (
  <div className="mt-4">
    <h3 className="text-info">Add New Category</h3>
    <form onSubmit={(e) => {
    e.preventDefault();
    const updatedCategories = [...categories, newCategory];
    setCategories(updatedCategories);
    localStorage.setItem("categories", JSON.stringify(updatedCategories)); // Save to localStorage
    setNewCategory("");
    setShowAddCategory(false);
}}>

      <input
        type="text"
        className="form-control"
        placeholder="Category Name"
        value={newCategory}
        onChange={(e) => setNewCategory(e.target.value)}
        required
      />
      <button type="submit" className="btn btn-primary mt-2">Add Category</button>
    </form>
  </div>
)}

    {showAddForm && selectedCategory && (
      <div className="mt-4">
        <h3 className="text-info">Add New {selectedCategory}</h3>
        <form onSubmit={async (e) => {
            e.preventDefault();
            const docRef = await addDoc(collection(db, "inventory"), {
              ...newMaterial,
              category: selectedCategory,
              serialNumber: (selectedCategory === "Modem" || selectedCategory === "Router" || selectedCategory === "NAP Box") ? newMaterial.serialNumber : "",
              totalStock: selectedCategory === "Cable" ? (parseInt(newMaterial.lengthAvailable, 10) || 0) + (parseInt(newMaterial.lengthDeployed, 10) || 0) : (parseInt(newMaterial.availableStock, 10) || 0) + (parseInt(newMaterial.deployedStock, 10) || 0),
            });
            
            const newEntry = { id: docRef.id, ...newMaterial };
            setInventory([...inventory, newEntry]);
            setNewMaterial({ manufacturer: "", deviceName: "", serialNumber: "", availableStock: "", deployedStock: "", lengthAvailable: "", lengthDeployed: "", unit: "meters" });
            setShowAddForm(false);
          }}>
          <div className="row g-3">
            <div className="col-md-4">
              <input
                type="text"
                className="form-control"
                placeholder="Supplier"
                value={newMaterial.manufacturer}
                onChange={(e) => setNewMaterial({ ...newMaterial, manufacturer: e.target.value })}
                required
              />
            </div>
            <div className="col-md-4">
              <input
                type="text"
                className="form-control"
                placeholder="Device Name"
                value={newMaterial.deviceName}
                onChange={(e) => setNewMaterial({ ...newMaterial, deviceName: e.target.value })}
                required
              />
            </div>
            {(selectedCategory === "Modem" || selectedCategory === "Router" || selectedCategory === "NAP Box") && (
              <div className="col-md-4">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Serial Number"
                  value={newMaterial.serialNumber || ""}
                  onChange={(e) => setNewMaterial({ ...newMaterial, serialNumber: e.target.value })}
                  required
                />
              </div>
            )}
            {selectedCategory === "Cable" ? (
              <>
              <div className="col-md-4">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Serial Number"
                  value={newMaterial.serialNumber || ""}
                  onChange={(e) => setNewMaterial({ ...newMaterial, serialNumber: e.target.value })}
                  
                />
              </div>
                <div className="col-md-4">
                  <input
                    type="number"
                    className="form-control"
                    placeholder="Length Available"
                    value={newMaterial.lengthAvailable || ""}
                    onChange={(e) => setNewMaterial({ ...newMaterial, lengthAvailable: parseInt(e.target.value, 10) || 0 })}
                    required
                  />
                </div>
                <div className="col-md-4">
                  <input
                    type="number"
                    className="form-control"
                    placeholder="Length Deployed"
                    value={newMaterial.lengthDeployed || ""}
                    onChange={(e) => setNewMaterial({ ...newMaterial, lengthDeployed: parseInt(e.target.value, 10) || 0 })}
                    required
                  />
                </div>
                <div className="col-md-4">
                  <select
                    className="form-select"
                    value={newMaterial.unit || "meters"}
                    onChange={(e) => setNewMaterial({ ...newMaterial, unit: e.target.value })}
                    required
                  >
                    <option value="meters">Meters</option>
                    <option value="feet">Feet</option>
                  </select>
                </div>
              </>
            ) : (
              <>
                <div className="col-md-4">
                  <input
                    type="number"
                    className="form-control"
                    placeholder="Available"
                    value={newMaterial.availableStock || ""}
                    onChange={(e) => setNewMaterial({ ...newMaterial, availableStock: parseInt(e.target.value, 10) || 0 })}
                    required
                  />
                </div>
                <div className="col-md-4">
                  <input
                    type="number"
                    className="form-control"
                    placeholder="Deployed"
                    value={newMaterial.deployedStock || ""}
                    onChange={(e) => setNewMaterial({ ...newMaterial, deployedStock: parseInt(e.target.value, 10) || 0 })}
                    required
                  />
                </div>
              </>
            )}
          </div>
          <div className="col-md-12 text-end">
            <button type="submit" className="btn btn-primary">Add</button>
          </div>
        </form>
      </div>
    )}    
    <table className="table table-bordered shadow mt-4">
  <thead className="table-dark">
    <tr>
      <th>Serial Number</th>
      <th>Supplier</th>
      <th>Device Name</th>
      <th>Category</th>
      <th>Available</th>
      <th>Deployed</th>
      <th>Total</th>
      <th>Action</th>
    </tr>
  </thead>
  <tbody>
    {inventory
      .filter(item => 
        item.manufacturer.toLowerCase().includes(searchTerm.toLowerCase()) || 
        item.deviceName.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (item.serialNumber && item.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()))
      )
      .sort((a, b) => {
        if (sortBy === "newest") return b.serialNumber.localeCompare(a.serialNumber);
        if (sortBy === "oldest") return a.serialNumber.localeCompare(b.serialNumber);
        if (sortBy === "lowestStock") return (a.totalStock || 0) - (b.totalStock || 0);
        if (sortBy === "highestStock") return (b.totalStock || 0) - (a.totalStock || 0);
        return 0;
      })
      .filter(item => !selectedCategory || item.category === selectedCategory)
      .map(item => (
        <tr key={item.id}>
          <td>{item.serialNumber}</td>
          <td>{item.manufacturer}</td>
          <td>
            {item.deviceName} 
            {item.availableStock <= 10 && (
              <span className="badge bg-danger ms-2">Low Stock</span>
            )}
          </td>
          <td>{item.category}</td>
          <td>
            {item.category === "Cable" 
              ? `${item.lengthAvailable || 0} ${item.unit || 'meters'}` 
              : `${item.availableStock || 0} pcs.`}
          </td>
          <td>
            {item.category === "Cable" 
              ? `${item.lengthDeployed || 0} ${item.unit || 'meters'}` 
              : `${item.deployedStock || 0} pcs.`}
          </td>
          <td>
            {item.category === "Cable" 
              ? `${item.totalStock || 0} ${item.unit || 'meters'}` 
              : `${item.totalStock || 0} pcs.`}
          </td>
          <td>
            {/* <button className="btn btn-info btn-sm me-2" onClick={() => handleEdit(item)}>Edit</button> */}
            <button className="btn btn-danger btn-sm" onClick={() => deleteMaterial(item.id)}>Delete</button>
            <button 
              className="btn btn-sm btn-success ms-2"  // Bootstrap margin-left class
              onClick={() => handleUpdateStock(item.id, item.category)}
            >
              Add Stock
            </button>

          </td>
        </tr>
      ))}
  </tbody>
</table>

  </div>
)}
{activeTab === "billing" && (
  <div className="row">
    <h2 className="text-warning fw-bold mb-4">Billing Management</h2>
   {/* Search Input */}
   <div className="search-container">
    
    <input
      type="text"
      className="form-control"
      placeholder="&#x1F50E;&#xFE0E; Search"
      value={searchTerm || ""} // Ensure searchTerm is always defined
      onChange={(e) => setSearchTerm(e.target.value)}
    />
  </div>
    {/* Sidebar - Subscriber List */}
    <div className="col-md-4">
      <div className="card shadow-sm border-0">
        <div className="card-header bg-primary text-white text-center">
          <h5 className="mb-0">Subscribers</h5>
        </div>
        <div className="card-body p-0">
          <ul className="list-group list-group-flush">
            {filteredSubscribers.length > 0 ? (
              filteredSubscribers.map((subscriber) => (
                <li
                  key={subscriber.id}
                  className={`list-group-item d-flex justify-content-between align-items-center ${
                    selectedSubscriber?.id === subscriber.id ? "active bg-primary text-white" : "hover-bg-light"
                  }`}
                  onClick={() => {
                    setSelectedSubscriber(subscriber);
                    fetchBillingRecords(subscriber.email); // Fetch records when clicked
                  }}
                  style={{ cursor: "pointer", transition: "0.3s" }}
                >
                  {subscriber.lastName}, {subscriber.firstName}
                  <span className="badge bg-secondary">{subscriber.plan}</span>
                </li>
              ))
            ) : (
              <li className="list-group-item text-muted">
                {searchTerm ? "No subscribers match your search." : "No subscribers available."}
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>

   {/* Main Content - Billing Records */}
<div className="col-md-8">
  {selectedSubscriber ? (
    <div className="card shadow border-0 p-4" style={{ width: "100%", maxWidth: "800px", margin: "auto" }}>
      <div className="card-header bg-success text-white">
        <h5 className="mb-0">{selectedSubscriber.firstName}'s Billing Records</h5>
      </div>
      <div className="card-body">
        <h5 className="text-dark fw-bold">
          {selectedSubscriber.lastName}, {selectedSubscriber.firstName} {selectedSubscriber.middleInitial}
        </h5>
        <p className="text-muted"><strong>Email:</strong> {selectedSubscriber.email}</p>
        <p className="text-muted"><strong>Plan:</strong> {selectedSubscriber.plan}</p>
        <p className="text-muted"><strong>Contact:</strong> {selectedSubscriber.contactNumber}</p>

        <h4 className="mt-4">Billing History</h4>
        {billingRecords && billingRecords.length > 0 ? (
          <ul className="list-group">
            {billingRecords.map((bill, index) => (
              <li key={index} className="list-group-item p-3">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <strong className="text-primary">{bill.planName}</strong>
                    <p className="mb-1"><strong>Billing Date:</strong> {formatTimestamp(bill.billingStartDate)}</p>
                    <p className="mb-1"><strong>Amount:</strong> ₱{bill.planPrice}</p>
                  </div>
                  <span className={`badge ${bill.status === "Pending" ? "bg-warning text-dark" : "bg-success"}`}>
                    {bill.status}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted">No billing records found.</p>
        )}
      </div>
    </div>
  ) : (
    <div className="alert alert-info text-center">
      Select a subscriber to view their billing records.
    </div>
  )}
</div>

  </div>
)}

        </div>
      </div>
    );
   
    }
    
    export default Admin;

      
