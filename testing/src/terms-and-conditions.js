

import React from "react";
import { useNavigate } from "react-router-dom";
import "./terms-and-conditions.css"; 

const TermsAndConditions = () => {
  const navigate = useNavigate();

  const handleAccept = () => {
 
    sessionStorage.setItem("termsAccepted", "true");

 
    navigate(-1);
  };

  return (
    <div className="terms-container">
      <h1 className="terms-header">Terms and Conditions</h1>

      <h2 className="terms-section-title">Welcome to FYC Ibayo Marilao formerly known as Internet ni Juan (INJ)</h2>
      <p className="terms-text">
      FYC Ibayo Marilao formerly known as Internet ni Juan (INJ) is a private Internet Service Provider (ISP) dedicated to delivering 
        reliable and high-speed internet services. By subscribing to our services, you agree to comply 
        with the following Terms and Conditions.
      </p>

      <h2 className="terms-section-title">1. Definitions</h2>
      <p className="terms-text">
        <strong>1.1 FYC Ibayo Marilao formerly known as Internet ni Juan (INJ)</strong> – The private ISP providing internet services to 
        residential and business subscribers.
      </p>
      <p className="terms-text">
        <strong>1.2 Subscriber</strong> – An individual or entity that has entered into an agreement 
        with FYC Ibayo Marilao formerly known as INJ for internet services.
      </p>
      <p className="terms-text">
        <strong>1.3 Service Plan</strong> – The specific internet package selected by the subscriber, 
        with defined speed, data allocation, and pricing.
      </p>
      <p className="terms-text">
        <strong>1.4 Billing Cycle</strong> – The recurring period (e.g., monthly) for which service 
        fees are charged.
      </p>

      <h2 className="terms-section-title">2. Subscription and Account Management</h2>
      <p className="terms-text">
        <strong>2.1 Eligibility</strong> – Subscription is available to individuals and businesses 
        in FYC Ibayo Marilao formerly known as INJ’s serviceable areas. Proof of residence or business operation may be required.
      </p>
      <p className="terms-text">
        <strong>2.2 Account Registration</strong> – Subscribers must provide accurate information 
        upon sign-up. Providing false or misleading details may result in termination.
      </p>

      <h2 className="terms-section-title">3. Service Provision and Limitations</h2>
      <p className="terms-text">
        <strong>3.1 Coverage Area</strong> – FYC Ibayo Marilao formerly known as INJ provides services only within designated coverage 
        areas. Availability may vary due to technical constraints.
      </p>
      <p className="terms-text">
        <strong>3.2 Service Speed and Performance</strong> – Internet speeds may fluctuate due to 
        factors such as network congestion, weather conditions, and subscriber location.
      </p>

      <h2 className="terms-section-title">4. Payments and Billing</h2>
      <p className="terms-text">
        <strong>4.1 Billing Cycle</strong> – Subscribers are billed on a monthly basis unless 
        otherwise specified in their service agreement.
      </p>
      <p className="terms-text">
        <strong>4.2 Payment Methods</strong> – Payments must be made via CSPay, Gcash, bank 
        transfer, or other authorized payment channels.
      </p>

      <h2 className="terms-section-title">5. Service Termination and Disconnection</h2>
      <p className="terms-text">
        <strong>5.1 Subscriber-Initiated Termination</strong> – A subscriber may request termination 
        of service with at least 7 days’ notice before the next billing cycle.
      </p>
      <p className="terms-text">
        <strong>5.2 FYC Ibayo Marilao formerly known as INJ-Initiated Termination</strong> – FYC Ibayo Marilao formerly known as INJ reserves the right to suspend or 
        terminate service for reasons including non-payment, violation of terms, or engaging in 
        illegal activities.
      </p>

      <h2 className="terms-section-title">6. Acceptable Use Policy (AUP)</h2>
      <p className="terms-text">
        <strong>6.1 Prohibited Activities</strong> – Subscribers may not use FYC Ibayo Marilao formerly known as INJ’s services for 
        illegal activities, unauthorized access to systems, spamming, or excessive bandwidth 
        consumption that disrupts network performance.
      </p>

      <h2 className="terms-section-title">7. Privacy and Data Protection</h2>
      <p className="terms-text">
        <strong>7.1 Data Collection</strong> – FYC Ibayo Marilao formerly known as INJ collects subscriber information for account 
        management, billing, and customer support purposes.
      </p>

      <h2 className="terms-section-title">8. Liability and Disclaimers</h2>
      <p className="terms-text">
        <strong>8.1 Service Availability</strong> – FYC Ibayo Marilao formerly known as INJ does not guarantee 100% uptime and is not 
        liable for service interruptions beyond its control.
      </p>

      <h2 className="terms-section-title">9. Amendments and Updates</h2>
      <p className="terms-text">
        <strong>9.1 Changes to Terms</strong> – FYC Ibayo Marilao formerly known as INJ may update these Terms and Conditions periodically. 
        Subscribers will be notified of significant changes.
      </p>

      <h2 className="terms-section-title">10. Governing Law</h2>
      <p className="terms-text">
        These Terms and Conditions are governed by the laws of the Republic of the Philippines. Any 
        disputes shall be resolved in accordance with Philippine legal procedures.
      </p>

      <h2 className="terms-section-title">11. Contact Information</h2>
      <p className="terms-text">
        For inquiries, service requests, or support, contact:
        <br />
        <strong>Email:</strong> fycibayomarilao@gmail.com
        <br />
        <strong>Phone:</strong> +63 917 188 0394
        <br />
        <strong>Office Address:</strong> Barangay Ibayo, Marilao, Bulacan, Philippines
      </p>

      <p className="terms-text terms-highlight">
        By subscribing to Internet ni Juan, you confirm that you have read, understood, and agreed 
        to these Terms and Conditions.
      </p>

      <button className="terms-accept-btn" onClick={handleAccept}>
        Accept Terms
      </button>
    </div>
  );
};

export default TermsAndConditions;
