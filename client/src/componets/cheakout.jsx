import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/swiftly-logo.png";
import cartIcon from "../assets/cart.png";
import paytm from "../assets/rupay (4).png";
import shopPay from "../assets/rupay (2).png";
import amazonPay from "../assets/rupay (3).png";
import applePay from "../assets/rupay (1).png";
import "./cheakout.css";
import defaultAvatar from "../assets/minute_delivery.png";
import confirmationMp3 from "../assets/newk.mp4"; // Import MP3 file

export default function Checkout() {
  const [showAlert, setShowAlert] = useState(false);
  const [paymentSuccessful, setPaymentSuccessful] = useState(false);
  const [showOrderText, setShowOrderText] = useState(false);

  const continueButtonRef = useRef(null);
  const [username, setUsername] = useState("");

  const sanitizeString = (str) => {
    // Remove emojis and special characters
    return str.replace(/[^\w\s]/gi, '').trim();
  };

  const handleRazorpayPayment = async () => {
    if (!formData.firstName || !formData.lastName || !formData.address || !formData.city) {
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 2000);
      return;
    }

    try {
      const orderData = JSON.parse(localStorage.getItem("total"));
      if (!orderData || typeof orderData.total !== "number") {
        throw new Error("Total amount is not available in localStorage");
      }

      const totalAmountInRupees = orderData.total;
      const amountInPaise = totalAmountInRupees * 100; // Convert to paise


      // Validate Razorpay API Key
      const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID;
      if (!razorpayKey) {
        throw new Error("Razorpay API Key is not set properly");
      }


      const response = await fetch("http://localhost:8080/api/payment/razor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ amount: amountInPaise }),

      });

      if (!response.ok) throw new Error("Failed to create order");

      const data = await response.json();
      console.log("Order Data:", data);

      const options = {
        key: razorpayKey,
        amount: data.order.amount,
        currency: "INR",
        name: sanitizeString(formData.firstName),
        description: "Test Transaction",
        order_id: data.order.id,
        handler: function (response) {
          if (formData.firstName && formData.lastName && formData.address && formData.city) {
            if (continueButtonRef.current) {
              continueButtonRef.current.click();
            }
          }

          navigate("/order");
          setPaymentSuccessful(true);
        },
        prefill: {
          name: sanitizeString(formData.firstName),
          email: formData.email || "test@example.com",
          contact: formData.phone || "9999999999",
        },
        theme: {
          color: "#3399cc",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Payment failed:", error.message || error);
    }
  };


  const [formData, setFormData] = useState(() => {
    const savedData = localStorage.getItem("formData");
    console.log("Loaded formData from localStorage:", savedData); // Log formData
    return savedData ? JSON.parse(savedData) : {
      email: "",
      firstName: "",
      lastName: "",
      company: "",
      address: "",
      apartment: "",
      city: "",
      country: "India",
      state: "",
      zipCode: "",
      phone: "",
      newsletter: false,
      cashOnDelivery: false,
    };
  });

  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem("cart");
    console.log("Loaded cart from localStorage:", savedCart); // Log cart
    return savedCart ? JSON.parse(savedCart) : [];
  });

  const [showConfirmation, setShowConfirmation] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, []);

  useEffect(() => {
    if (showConfirmation) {
      const timer = setTimeout(() => {
        setShowConfirmation(false);
        navigate("/order");
      }, 6500); // Timer for redirect after audio plays

      return () => clearTimeout(timer);
    }
  }, [showConfirmation, navigate]);

  useEffect(() => {
    // Store formData in localStorage whenever it changes
    if (formData) {
      console.log("Saving formData to localStorage:", formData); // Log saving formData
      localStorage.setItem("formData", JSON.stringify(formData));
    }
  }, [formData]);

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, []);

  useEffect(() => {
    // Store cart in localStorage whenever it changes
    console.log("Saving cart to localStorage:", cart); // Log saving cart
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);
  setTimeout(() => {
    setShowOrderText(true);
    window.scrollTo(0, 0);
  }, 1000);

  const calculateTotal = () => {
    const subtotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);

    let shipping = 0;
    if (subtotal === 100) {
      shipping = 0;
    } else if (subtotal > 100 && subtotal <= 500) {
      shipping = 30;
    } else if (subtotal > 500 && subtotal <= 1000) {
      shipping = 60;
    } else if (subtotal > 1000 && subtotal <= 3000) {
      shipping = 100;
    } else if (subtotal > 3000 && subtotal <= 6000) {
      shipping = 300;
    } else {
      shipping = 0;
    }

    const total = subtotal + shipping;

    // Save the values in localStorage
    localStorage.setItem("total", JSON.stringify({ subtotal, total, shipping }));

    return { subtotal, total, shipping };
  }


  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const { subtotal, shipping, total } = calculateTotal();

  return (
    <div className="checkout-wrapper">
      <div className={`checkout-container ${showConfirmation ? "blurred" : ""}`}>
        <header className="header">
          <div className="left-section">
            <a href="/">
              <img src={logo || "/placeholder.svg"} alt="Swiftly Logo" className="logo" />
            </a>
            <div className="delivery-info">
              <strong>Delivery in 9 minutes</strong>
              <span>Mathura, Uttar Pradesh, India</span>
            </div>
          </div>

          <div className="header-actions">
            {username ? (
              <div className="user-info">
                <img
                  src={defaultAvatar}
                  alt="User"
                  className="user-avatar"
                />
                <span className="username-display">Welcome, {username}</span>
              </div>
            ) : (
              <button className="login-button" onClick={() => navigate("/login")}>
                Login
              </button>
            )}
          </div>

        </header>

        <main className="checkout-main">
          <div className="checkout-content">
            <nav className="breadcrumb">
              <span>Information</span> &gt; <span>Shipping</span> &gt; <span>Payment</span>
            </nav>

            <div className="express-checkout">
              <h2>Express checkout</h2>
              <div className="payment-buttons">
                <button onClick={handleRazorpayPayment}>
                  <img src={shopPay || "/placeholder.svg"} alt="Shop Pay" />
                </button>
                <button onClick={handleRazorpayPayment}>
                  <img src={amazonPay || "/placeholder.svg"} alt="Amazon Pay" />
                </button>
                <button onClick={handleRazorpayPayment}>
                  <img src={applePay || "/placeholder.svg"} alt="Apple Pay" />
                </button>
                <button onClick={handleRazorpayPayment}>
                  <img src={paytm || "/placeholder.svg"} alt="Paytm" />
                </button>
              </div>
            </div>

            <div className="cash-on-delivery">
              <input
                type="checkbox"
                id="cashOnDelivery"
                name="cashOnDelivery"
                checked={formData.cashOnDelivery}
                onChange={handleInputChange}
              />
              <label htmlFor="cashOnDelivery">Cash on Delivery</label>
            </div>
            {paymentSuccessful && (
              <div className="payment-success">
                <span className="success-tick">✔</span>
                <span className="success-message">Payment Successful!</span>
              </div>
            )}
            <div className="contact-section">
              <form className="checkout-form">
                <div className="shipping-address">
                  <h2>Shipping address</h2>
                  <div className="form-row">
                    <input
                      type="text"
                      name="firstName"
                      placeholder="First name"
                      value={formData.firstName}
                      onChange={handleInputChange}
                    />
                    <input
                      type="text"
                      name="lastName"
                      placeholder="Last name"
                      value={formData.lastName}
                      onChange={handleInputChange}
                    />
                  </div>
                  <input
                    type="text"
                    name="company"
                    placeholder="Company (optional)"
                    value={formData.company}
                    onChange={handleInputChange}
                  />
                  <input
                    type="text"
                    name="address"
                    placeholder="Address"
                    value={formData.address}
                    onChange={handleInputChange}
                  />
                  <input
                    type="text"
                    name="apartment"
                    placeholder="Apartment, suite, etc. (optional)"
                    value={formData.apartment}
                    onChange={handleInputChange}
                  />
                  <input type="text" name="city" placeholder="City" value={formData.city} onChange={handleInputChange} />
                  <div className="form-row three-columns">
                    <select name="country" value={formData.country} onChange={handleInputChange}>
                      <option value="India">India</option>
                    </select>
                    <input
                      type="text"
                      name="state"
                      placeholder="State"
                      value={formData.state}
                      onChange={handleInputChange}
                    />
                    <input
                      type="text"
                      name="zipCode"
                      placeholder="ZIP code"
                      value={formData.zipCode}
                      onChange={handleInputChange}
                    />
                  </div>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Phone (optional)"
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                  <button
                    type="button"
                    className={`continue-button ${paymentSuccessful ? "blinking-button" : ""}`}
                    onClick={() => setShowConfirmation(true)}
                    ref={continueButtonRef}
                  >
                    CONTINUE TO SHIPPING
                  </button>

                </div>
              </form>
            </div>
          </div>

          <aside className="order-summary">
            <div className="summary-totals">
              <div className="total">
                <span>Total</span>
                <span>₹ {total.toFixed(2)}</span>
              </div>
              <div className="subtotal">
                <span>Subtotal</span>
                <span>₹ {subtotal.toFixed(2)}</span>
              </div>
              <div className="shipping">
                <span>Shipping</span>
                <span>₹ {shipping}</span>
              </div>
            </div>

            <div className="product-items">
              {cart.map((item) => (
                <div key={item._id} className="product-item">
                  <img src={item.image || "/placeholder.svg"} alt="Product" />
                  <div className="product-details">
                    <h3>{item.name}</h3>
                    <p>{item.quantity}</p>
                    <p className="price">₹ {item.price}</p>
                  </div>
                </div>
              ))}
            </div>

            <p className="shipping-note">
              ** Expedited orders cannot be shipped or delivered on weekends/holidays nor can they be shipped to a PO Box.
            </p>
          </aside>
        </main>
        {showAlert && (
          <div className="blob-message">
            <p>Please fill the shipping details before payment.</p>
          </div>
        )}
        {showConfirmation && (
          <div className="confirmation-popup">
            <video src={confirmationMp3} autoPlay className="confirmation-gif" />
          </div>
        )}
      </div>
    </div>
  );
}
