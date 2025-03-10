

import { collection, query, where, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "./firebase";

/**
 * Function to check users with unpaid bills for 2+ months
 * and mark them as "To Be Disconnected". Adds a notification flag.
 */
const checkAndDisconnectUsers = async () => {
  try {
    const billingRef = collection(db, "Billing");
    
    // Query all unpaid bills
    const q = query(billingRef, where("status", "==", "Unpaid"));
    const querySnapshot = await getDocs(q);

    const today = new Date();
    let usersToDisconnect = new Set();

    // Check overdue bills
    querySnapshot.forEach((docSnapshot) => {
      const bill = docSnapshot.data();

      // Skip if billingStartDate is missing
      if (!bill.billingStartDate?.seconds) return;

      // Calculate due date (1 month after billing start)
      const dueDate = new Date(bill.billingStartDate.seconds * 1000);
      dueDate.setMonth(dueDate.getMonth() + 1);

      // Calculate months overdue
      const monthsOverdue = (today.getFullYear() - dueDate.getFullYear()) * 12 + (today.getMonth() - dueDate.getMonth());

      // If overdue for 2+ months, add user to disconnection list
      if (monthsOverdue >= 2) {
        usersToDisconnect.add(bill.uid);
      }
    });

    // Update user status & notify dashboard
    for (let userId of usersToDisconnect) {
      const userRef = doc(db, "Users", userId);
      await updateDoc(userRef, { 
        status: "To Be Disconnected",
        disconnectionNotice: true // Flag to notify dashboards
      });

      console.log(`User ${userId} marked as "To Be Disconnected" and notified.`);
    }
  } catch (error) {
    console.error("Error checking for disconnections:", error);
  }
};

export default checkAndDisconnectUsers;
