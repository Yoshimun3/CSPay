import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Plans from './Plans';
import AdminLogin from './AdminLogin';
import Admin from './Admin';
import Login from './login';
import Repair from './Repair';
import checkAndDisconnectUsers from './checkAndDisconnectUsers';
import UpdateInfo from "./UpdateInfo";
import Signup from './signup';
import Payment from './Payment';
import PayBills from "./PayBills";
import FAQs from "./FAQs";
import UpdatePlan from './UpdatePlan';
import BillsPayment from './BillsPayment';
import TermsAndConditions from './terms-and-conditions';
import Home from './Home'; // Import the new Home component
import { AuthProvider } from './AuthContext'; // Import the AuthProvider
import './App.css'; // Import your custom CSS for styling

const App = () => {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                <Route path="/checkAndDisconnectUsers" element={<checkAndDisconnectUsers />} />
                <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
                <Route path="/updateplan" element={<UpdatePlan />} />
                <Route path="/paybills" element={<PayBills />} />
                <Route path="/FAQs" element={<FAQs />} />
                <Route path="/BillsPayment" element={<BillsPayment />} />
                    <Route path="/Login" element={<Login />} /> 
                    <Route path="/updateinfo" element={<UpdateInfo />} />
                    <Route path="/repair" element={<Repair />} /> 
                    <Route path="/Payment" element={<Payment />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/" element={<Plans />} />
                    <Route path="/admin-login" element={<AdminLogin />} />
                    <Route path="/admin" element={<Admin />} />
                    <Route path="/home" element={<Home />} /> {/* Add the Home route */}
                </Routes>
            </Router>
        </AuthProvider>
    );
};

export default App;
