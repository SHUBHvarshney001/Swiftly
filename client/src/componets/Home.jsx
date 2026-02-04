import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/ChatGPT Image Dec 4, 2025, 01_33_25 AM.jpg";
import banner from "../assets/banner.jpg";
import cartIcon from "../assets/cart.png";
import promo1 from "../assets/3 (1).avif";
import promo2 from "../assets/3 (2).avif";
import promo3 from "../assets/3 (3).avif";
import emptyCartImage from "../assets/empty_cart.webp";
import confirmationMp3 from "../assets/Recording 2025-02-03 001912 (online-video-cutter.com).mp4"; // Import MP3 file
import defaultAvatar from "../assets/minute_delivery.png";
import "./Home.css";

const Home = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState(() => {
    const storedUsername = localStorage.getItem("username");
    if (storedUsername) {
      // Retrieve the cart for the current user using their username
      const savedCart = localStorage.getItem(`${storedUsername}_cart`);
      return savedCart ? JSON.parse(savedCart) : [];
    }
    return [];
  });

  const [showConfirmation, setShowConfirmation] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [username, setUsername] = useState("");
  const [isAdmin, setIsAdmin] = useState(false); // Admin state

  useEffect(() => {
    fetch("http://localhost:8080/api/products")
      .then((response) => response.json())
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load products. Please try again later.");
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    if (storedUsername) {
      setUsername(storedUsername);
    }

    // Check if user is admin
    const storedIsAdmin = localStorage.getItem("isAdmin");
    if (storedIsAdmin) {
      setIsAdmin(JSON.parse(storedIsAdmin));
    }
  }, []);

  useEffect(() => {
    if (username) {
      // Store the cart for the specific user in localStorage under their username
      localStorage.setItem(`${username}_cart`, JSON.stringify(cart));
    }
  }, [cart, username]);


  useEffect(() => {
    if (showConfirmation) {
      const timer = setTimeout(() => {
        setShowConfirmation(false);
        navigate("/checkout");
      }, 4000); // Timer for redirect after audio plays

      return () => clearTimeout(timer);
    }
  }, [showConfirmation, navigate]);

  useEffect(() => {
    fetch("http://localhost:8080/api/categories")
      .then((response) => response.json())
      .then((data) => {
        setCategories(data);
      })
      .catch((error) => {
        console.error("Error fetching categories:", error);
      });
  }, []);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product) => {
    const existingProduct = cart.find((item) => item._id === product._id);
    if (existingProduct) {
      setCart(cart.map((item) => (item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item)));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const increaseQuantity = (productId) => {
    setCart(cart.map((item) => (item._id === productId ? { ...item, quantity: item.quantity + 1 } : item)));
  };

  const decreaseQuantity = (productId) => {
    setCart(
      cart.map((item) =>
        item._id === productId && item.quantity > 1 ? { ...item, quantity: item.quantity - 1 } : item
      )
    );
  };

  const removeItem = (productId) => {
    setCart(cart.filter((item) => item._id !== productId));
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + item.quantity * item.price, 0);
  };

  return (
    <div className={`home-page ${showConfirmation ? "blurred" : ""}`}>
      <header className="header">
        <div className="left-section">

          <Link to="/">
            <img
              src={logo}
              alt=" Logo"
              className="logo"

            />

          </Link>

          <h3>Search items</h3>
        </div>

        <div className="header-actions">
          {isAdmin ? (
            <div className="user-info">
              <img src={defaultAvatar} alt="User" className="user-avatar" />
              <span className="username-display">Welcome, Admin</span>
            </div>
          ) : username ? (
            <div className="user-info">
              <img src={defaultAvatar} alt="User" className="user-avatar" />
              <span className="username-display">Welcome, {username}</span>
            </div>
          ) : (
            <button className="login-button" onClick={() => navigate("/login")}>
              Login
            </button>
          )}

          {!isAdmin && (
            <button className="cart-button" onClick={() => setIsCartOpen(!isCartOpen)}>
              <img src={cartIcon || "/placeholder.svg"} alt="Cart" className="cart-icon" />
              <span>My Cart • ₹{calculateTotal().toFixed(2)}</span>
            </button>
          )}

          {isAdmin && (
            <div className="admin-actions">
              <button className="control-button" onClick={() => navigate("/add-category")}>
                Control
              </button>
            </div>
          )}

        </div>
      </header>

      <main className="main-content">
        <img src={banner || "/placeholder.svg"} alt="Banner" className="banner" />

        <div className="promo-cards">
          <img src={promo1 || "/placeholder.svg"} alt="Pharmacy Delivery" className="promo-card" />
          <img src={promo2 || "/placeholder.svg"} alt="Pet Care Supplies" className="promo-card" />
          <img src={promo3 || "/placeholder.svg"} alt="Baby Care Essentials" className="promo-card" />
        </div>

        <div className="categories">
          <div className="category-list">
            {categories.map((category) => (
              <div key={category._id} className="category-container">
                <div className="category-card">
                  <img src={category.image || "/placeholder.svg"} className="category-image" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {loading && <p>Loading products...</p>}
        {error && <p>{error}</p>}

        <div className="product-list">
          <h2>Products</h2>
          <div className="product-cards">
            {products.length > 0 ? (
              products.map((product) => (
                <div key={product._id} className="product-card">
                  <img src={product.image || "/placeholder.svg"} alt={product.name} className="product-image" />
                  <p className="product-name">{product.name}</p>
                  <p className="product-description">{product.description}</p>
                  <div className="product-actions">
                    <p className="product-price">₹{product.price}</p>
                    <button className="add-button" onClick={() => addToCart(product)}>
                      Add to Cart
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p>No products available.</p>
            )}
          </div>
        </div>
      </main>

      {isCartOpen && (
        <div className="cart-container open">
          <div className="cart-header">
            <h1>Shopping Cart</h1>
            <button className="close-cart-button" onClick={() => setIsCartOpen(false)}>
              &times;
            </button>
          </div>
          <div className="cart-items">
            {cart.length === 0 ? (
              <div className="empty-cart">
                <img src={emptyCartImage || "/placeholder.svg"} alt="Empty Cart" className="empty-cart-image" />
              </div>
            ) : (
              cart.map((item) => (
                <div key={item._id} className="cart-item">
                  <img src={item.image || "/placeholder.svg"} alt={item.name} className="cart-item-image" />
                  <div className="cart-item-details">
                    <p className="cart-item-name">{item.name}</p>
                    <p className="cart-item-price">₹{item.price}</p>
                    <div className="quantity-controls">
                      <button className="quantity-button" onClick={() => decreaseQuantity(item._id)}>
                        -
                      </button>
                      <span><h5>{item.quantity}</h5></span>
                      <button className="quantity-button" onClick={() => increaseQuantity(item._id)}>
                        +
                      </button>
                    </div>
                    <button className="remove-button" onClick={() => removeItem(item._id)}>
                      Remove
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="cart-footer">
            <p>Total: ₹{calculateTotal().toFixed(2)}</p>
            <button className="checkout-button" onClick={() => setShowConfirmation(true)}>
              Proceed to Checkout
            </button>
          </div>
        </div>
      )}

      {showConfirmation && (
        <div className="confirmation-popup">
          <video src={confirmationMp3} autoPlay className="confirmation-gifs" />
        </div>
      )}
    </div>
  );
};

export default Home;
