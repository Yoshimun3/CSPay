import React, { createContext, useContext, useState, useEffect } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "./firebase"; // Import Firebase Auth instance

// Create the AuthContext
const AuthContext = createContext();

// AuthProvider to wrap the app and provide the auth state
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Store user info
  const [loading, setLoading] = useState(true); // Track loading state

  useEffect(() => {
    // Listen for Firebase Auth state changes
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        console.log("User is logged in:", firebaseUser); // Debugging log
        setUser(firebaseUser); // Set user from Firebase
      } else {
        console.log("No user is logged in"); // Debugging log
        setUser(null); // Clear user state
      }
      setLoading(false); // Done loading
    });

    // Cleanup listener on unmount
    return () => unsubscribe();
  }, []);

  // Function to log out the user
  const logout = async () => {
    try {
      await signOut(auth); // Firebase logout
      setUser(null); // Clear user state
      console.log("User successfully logged out");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  // Function to manually log in the user (you can pass in user data if needed)
  const login = (firebaseUser) => {
    setUser(firebaseUser); // Set user directly (this will be useful if you want to log in without using Firebase's onAuthStateChanged)
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {!loading && children} {/* Render children only after loading */}
    </AuthContext.Provider>
  );
};

// Hook to use the AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
