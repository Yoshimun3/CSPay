import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./FAQs.css";

function FAQs() {
  const navigate = useNavigate();

  const faqs = [
    {
      question: "How can I pay my bill?",
      answer:
        "You can pay your bill through our online portal by clicking the 'Pay' button under the 'Pay Bills' section.",
    },
    {
      question: "What should I do if my internet is slow?",
      answer:
        "Try restarting your router. If the issue persists, submit a repair request in the 'Repairs' section.",
    },
    {
      question: "How do I change my internet plan?",
      answer:
        "Contact our customer support or visit the nearest branch to upgrade or downgrade your plan.",
    },
    {
      question: "Can I request a repair online?",
      answer:
        "Yes! Go to the 'Repairs' section, fill in the details, and submit your request.",
    },
    {
      question: "Where can I check my due date?",
      answer:
        "Your due date is listed in the 'Pay Bills' section next to your current plan details.",
    },
  ];

  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="faqs-container">
      <div className="back-button" onClick={() => navigate("/home")}>
        <i className="fas fa-arrow-left"></i> Back to Home
      </div>
      <h2 className="page-title">Frequently Asked Questions</h2>
      <div className="faqs-list">
        {faqs.map((faq, index) => (
          <div key={index} className="faq-item">
            <div className="faq-question" onClick={() => toggleFAQ(index)}>
              {faq.question}
              <span className="faq-icon">{openIndex === index ? "−" : "+"}</span>
            </div>
            {openIndex === index && <div className="faq-answer">{faq.answer}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}

export default FAQs;
