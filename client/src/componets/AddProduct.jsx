import React, { useState, useEffect } from "react";
import "./AddProduct.css";
import { Link } from "react-router-dom";
import logo from "../assets/swiftly-logo.png";
import cart from "../assets/cart.png";
import wideAssortment from "../assets/Wide_Assortment.png";

const AddProduct = () => {
  const [productData, setProductData] = useState({
    name: "",
    description: "",
    price: "",  // Initialize price as an empty string
    image: null,
  });
  const [previewImage, setPreviewImage] = useState(null);
  const [showAlert, setShowAlert] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [username, setUsername] = useState("Guest");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProductData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      setProductData((prev) => ({ ...prev, image: file }));
      setPreviewImage(URL.createObjectURL(file));
    } else {
      alert("Please upload a valid image file!");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!productData.name || !productData.description || !productData.image || !productData.price) {
      alert("Please fill in all fields and upload an image!");
      return;
    }
  
    const formData = new FormData();
    formData.append("name", productData.name);
    formData.append("description", productData.description);
    formData.append("price", productData.price); // Ensure price is appended
    formData.append("image", productData.image);
  
    setIsLoading(true);
  
    try {
      const response = await fetch("http://localhost:8080/api/products/add", {
        method: "POST",
        body: formData,
      });
  
      if (response.ok) {
        const data = await response.json();
        
        // Show the blob with success message
        setShowAlert(true);
  
        // Optionally hide the alert after 3 seconds
        setTimeout(() => {
          setShowAlert(false);
        }, 3000);
      } else {
        const errorText = await response.text();
        alert(errorText || "Failed to add product");
      }
    } catch (error) {
      console.error("Error submitting product:", error);
      alert("An error occurred. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };
  

  return (
    <div className="add-product-page">
      <header className="header">
        <img src={logo} alt="Logo" className="logo" />
        <div className="search-bar">
          <input type="text" placeholder="Search 'groceries'" />
        </div>
        <div className="header-actions">
          <button className="cart-button">
            <img src={cart} alt="Cart" />
            My Cart
          </button>
        </div>
      </header>

      <div className="content">
        <aside className="side-panel">
          <div className="welcome-container">
            <span className="welcome-text">Welcome</span>
          </div>
          <nav>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/add-category">Add Category</Link></li>
              <li><Link to="/add">Add Product</Link></li>
              <li><Link to="/login">Profile</Link></li>
              <li><Link to="/login">Logout</Link></li>
            </ul>
          </nav>
        </aside>

        <main className="main-content">
          <h2>Upload Product</h2>
          <form onSubmit={handleSubmit} className="add-product-form">
            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                name="name"
                value={productData.name}
                onChange={handleChange}
                placeholder="Enter product name"
              />
            </div>
            <div className="form-group">
              <label>Weight</label>
              <input
                type="text"
                name="description"
                value={productData.description}
                onChange={handleChange}
                placeholder="Enter product weight"
              />
            </div>
            <div className="form-group">
              <label>Price</label>
              <input
                type="number"
                name="price"
                value={productData.price}
                onChange={handleChange}
                placeholder="Enter product price"
              />
            </div>
            <div className="form-group">
              <label>Image</label>
              <input type="file" onChange={handleImageUpload} />
              {previewImage && (
                <img
                  src={previewImage}
                  alt="Preview"
                  className="image-preview"
                />
              )}
            </div>
            <button
              type="submit"
              className="submit-button"
              disabled={isLoading}
            >
              {isLoading ? "Submitting..." : "Submit"}
            </button>
          </form>
        </main>
      </div>
      {showAlert && (
      <div className="blob-message">
        <p>Product added successfully!</p>
      </div>
    )}
    </div>
    
  );
  
};

export default AddProduct;
