import React, { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  getDocs,
  query,
} from "firebase/firestore";
import {
  getStorage,
  ref,
  getDownloadURL,
  listAll,
} from "firebase/storage";
import { db } from "./firebase";
import { Link } from "react-router-dom";
import "./Plans.css";

const Plans = () => {
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [planPics, setPlanPics] = useState([]);
  const [heroImages, setHeroImages] = useState([]);
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);
  const [logoUrl, setLogoUrl] = useState(null);
  const [selectedTab, setSelectedTab] = useState(plans.length > 0 ? plans[0].id : null);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "internetPlans"),
      (querySnapshot) => {
        const allFetchedPlans = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPlans(allFetchedPlans);
      },
      (error) => console.error("Error fetching plans:", error)
    );

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const storage = getStorage();
    const planPicsRef = ref(storage, "plan-pics");
    const heroRef = ref(storage, "hero-images");
    const logoRef = ref(storage, "internetnijohn.png");

    getDownloadURL(logoRef)
      .then((url) => setLogoUrl(url))
      .catch((error) => console.error("Error fetching logo:", error));

    listAll(planPicsRef)
      .then((result) => {
        const fetchUrls = result.items.map((itemRef) =>
          getDownloadURL(itemRef)
        );
        Promise.all(fetchUrls).then((urls) =>
          setPlanPics(urls.sort(() => Math.random() - 0.5)) // Randomize order
        );
      })
      .catch((error) => console.error("Error fetching plan pics:", error));

    listAll(heroRef)
      .then((result) => {
        const fetchUrls = result.items.map((itemRef) =>
          getDownloadURL(itemRef)
        );
        Promise.all(fetchUrls).then((urls) => setHeroImages(urls));
      })
      .catch((error) => console.error("Error fetching hero images:", error));
  }, []);

  const closeSelectedPlan = () => {
    setSelectedPlan(null);
  };

  const nextHeroImage = () => {
    setCurrentHeroIndex((prevIndex) => (prevIndex + 1) % heroImages.length);
  };

  const prevHeroImage = () => {
    setCurrentHeroIndex((prevIndex) =>
      (prevIndex - 1 + heroImages.length) % heroImages.length
    );
  };
  useEffect(() => {
    if (plans.length > 0) {
      setSelectedPlan(plans[0]);
    }
  }, [plans]);

  return (
    <div className="plans-page">
      {/* Navbar */}
      <nav class="navbar navbar-expand-lg navbar-light bg-white">
        <div className="container">
          <a className="navbar-brand" href="/">
            {logoUrl && (
              <img
                src={logoUrl}
                alt="Internet ni Juan Logo"
                className="navbar-logo"
              />
            )}
            CSPay
          </a>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto">
              <li className="nav-item">
                <Link to="/login" className="nav-link">
                  <i className="fas fa-user-large me-1"></i> Account Login
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      {/* Hero Section with Carousel */}
      <header className="hero-section">
        <div
          id="heroCarousel"
          className="carousel slide"
          data-bs-ride="carousel"
        >
          
          <div className="carousel-inner">
          {heroImages.map((image, index) => (
            <div
              key={index}
              className={`carousel-item ${index === currentHeroIndex ? "active" : ""}`}
            >

                <img
                  src={image}
                  className="d-block w-100 hero-image"
                  alt={`Slide ${index + 1}`}
                />
                <div className="carousel-caption">
                  <h1 className="fw-bold">Explore Our Internet Plans</h1>
                  <p>Reliable, Fast, and Affordable Internet for Everyone!</p>
                  <a href="#plans" className="btn btn-primary btn-lg mt-3">
                    View Plans
                  </a>
                </div>
              </div>
            ))}
          </div>

          <a
            className="carousel-control-prev"
            href="#heroCarousel"
            role="button"
            data-bs-slide="prev"
          >
            <span className="carousel-control-prev-icon" aria-hidden="true"></span>
            <span className="visually-hidden">Previous</span>
          </a>
          <a
            className="carousel-control-next"
            href="#heroCarousel"
            role="button"
            data-bs-slide="next"
          >
            <span className="carousel-control-next-icon" aria-hidden="true"></span>
            <span className="visually-hidden">Next</span>
          </a>
        </div>
      </header>

      {/* Internet Plans */}
      <div id="plans" className="container my-5">
      <div className="row">
        {/* Tabs (Left Side) */}
        <div className="col-md-3 d-flex flex-column align-items-center mt-5">
          <ul className="nav flex-column nav-pills w-100">
            {plans.map((plan) => (
              <li key={plan.id} className="nav-item">
                <button
                  className={`nav-link w-100 text-center ${
                    selectedPlan?.id === plan.id ? "active-tab" : ""
                  }`}
                  onClick={() => setSelectedPlan(plan)}
                >
                  {plan.Name}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="col-md-9 d-flex justify-content-center">
  {selectedPlan && (
    <div className="card plan-card shadow-lg border-0">
      <div className="plan-image-wrapper">
        <img
          src={heroImages[plans.indexOf(selectedPlan) % heroImages.length]}
          className="plan-image"
          alt="Plan"
        />
        <div className="overlay"></div>
      </div>
      <div className="card-body text-center">
        <h3 className="card-title">{selectedPlan.Name}</h3>
        <p className="card-text">Speed: <strong>{selectedPlan.Speed} Mbps</strong></p>
        <p className="card-text">Price: <strong>₱{selectedPlan.Price}</strong></p>
        <Link
          to="/Signup"
          state={{ selectedPlan }}
          className="btn apply-btn"
        >
          Apply Now!
        </Link>
      </div>
    </div>
  )}
</div>

      </div>
      </div>
      <footer className="bg-white text-dark py-4">
  <div className="container text-center">
    {/* Navigation Links */}
    <div className="mb-3">
      <Link to="/about" className="text-dark mx-2 text-decoration-none">About Us</Link>
      <Link to="/news" className="text-dark mx-2 text-decoration-none">News</Link>
      <Link to="/loyalty-rewards" className="text-dark mx-2 text-decoration-none">Loyalty & Rewards</Link>
      <Link to="/store-locator" className="text-dark mx-2 text-decoration-none">Store Locator</Link>
      <Link to="/contact" className="text-dark mx-2 text-decoration-none">Contact Us</Link>
      <Link to="/terms" className="text-dark mx-2 text-decoration-none">Terms of Use</Link>
      <Link to="/privacy" className="text-dark mx-2 text-decoration-none">Privacy Policy</Link>
    </div>

    {/* Copyright */}
    <Link to="/admin-login" className="navbar-brand d-block mb-2">
      <strong>&copy; {new Date().getFullYear()} CSPay. All rights reserved.</strong>
    </Link>

    {/* Social Media Icons */}
    <div className="d-flex justify-content-center gap-3">
      <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
        <i className="fab fa-facebook fa-lg text-dark"></i>
      </a>
      <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
        <i className="fab fa-twitter fa-lg text-dark"></i>
      </a>
      <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
        <i className="fab fa-instagram fa-lg text-dark"></i>
      </a>
      <a href="https://youtube.com" target="_blank" rel="noopener noreferrer">
        <i className="fab fa-youtube fa-lg text-dark"></i>
      </a>
    </div>
  </div>
</footer>


      <style>{`
 

  /* Make hero section fill the full screen */
  .hero-section {
    position: relative;
    width: 100vw;
    height: 100vh;
    overflow: hidden;
  }

  /* Fix Bootstrap carousel */
  .carousel,
.carousel-inner,
.carousel-item {
  width: 100%;
  height: 100vh;
}

.carousel-item img {
  width: 100%;
  height: 100vh;
  object-fit: cover;
}
.carousel-caption {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-75%, -50%);
  text-align: center;
  width: 100%;
}
.carousel-caption h1 {
  font-size: 2rem; /* Increase heading size */
  font-weight: bold;
}

.carousel-caption p {
  font-size: 1.5rem;
}
.carousel-caption .btn {
  background-color:#ffde59;
  border: 0px;
}
.carousel-control-prev,
.carousel-control-next {
  background-color: rgba(0, 0, 0, 0.5); /* Black background with 50% transparency */
  border-radius: 50%; /* Optional: Makes it circular */
  width: 50px; /* Adjust width */
  height: 50px; /* Adjust height */
  top: 50%; /* Position in the middle vertically */
  transform: translateY(-50%); /* Ensures perfect centering */
}

.carousel-control-prev {
  left: 20px; /* Move away from the left edge */
}

.carousel-control-next {
  right: 50px; /* Move away from the right edge */
}

.carousel-control-prev:hover,
.carousel-control-next:hover {
  background-color: rgba(0, 0, 0, 0.7); /* Darker on hover */
}
   .nav-pills {
          margin-top: 50px; /* Adjust this if you want it lower */
        }
   /* Center and style tabs */
        .nav-pills .nav-link {
          background-color: #343a40; /* Dark theme */
          color: white;
          margin-bottom: 10px;
          border-radius: 10px;
          padding: 10px 15px;
          font-weight: bold;
        }

        .nav-pills .nav-link:hover {
          background-color: #ffde59; /* Highlight on hover */
          color: #343a40;
        }

        .active-tab {
          background-color: #ffde59 !important;
          color: #343a40 !important;
        }

        /* Make plan card wider */
       
        /* Plan card styling */
        .plan-card {
          display: flex;
          flex-direction: row;
          width: 100%;
          max-width: 700px;
          border-radius: 10px;
          overflow: hidden;
        }



`}</style>      
    </div>
  );
};

export default Plans;
