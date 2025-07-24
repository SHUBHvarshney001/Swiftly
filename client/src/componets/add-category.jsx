import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import logo from "../assets/blinkit-logo.png";
import cart from "../assets/cart.png";
import wideAssortment from "../assets/Wide_Assortment.png";
import "./add-category.css";

const AddCategory = () => {
  const [categories, setCategories] = useState([]);
  const [categoryData, setCategoryData] = useState({
    name: "",
    description: "",
    image: null,
  });
  const [previewImage, setPreviewImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/categories");
      const data = await response.json();
      console.log("Fetched categories:", data);
      setCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCategoryData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      setCategoryData((prev) => ({ ...prev, image: file }));
      setPreviewImage(URL.createObjectURL(file));
    } else {
      alert("Please upload a valid image file!");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("name", categoryData.name);
    formData.append("description", categoryData.description);
    formData.append("image", categoryData.image);

    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:8080/api/categories", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        alert("Category added successfully!");
        setCategoryData({ name: "", description: "", image: null });
        setPreviewImage(null);
        fetchCategories();
      } else {
        const errorText = await response.text();
        alert(errorText || "Failed to add category");
      }
    } catch (error) {
      console.error("Error submitting category:", error);
      alert("An error occurred. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await fetch(`http://localhost:8080/api/categories/${id}`, {
        method: "DELETE",
      });
      setCategories(categories.filter((category) => category._id !== id));
    } catch (error) {
      console.error("Error deleting category:", error);
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
          <Link to="/add" className="add-product-icon">
            <img src={wideAssortment} alt="Wide Assortment" className="wide-assortment" />
          </Link>
        </div>
      </header>

      <div className="content">
        <aside className="side-panel">
          <div className="welcome-container">
            <span className="welcome-text">Welcome</span>
          </div>
          <nav>
            <ul>
              <li>
                <Link to="/">Home</Link>
              </li>
              <li>
                <Link to="/add">Add Product</Link>
              </li>
              <li>
                <Link to="/add-category">Add Category</Link>
              </li>
              <li>
                <Link to="/add-subcategory">Add SubCategory</Link>
              </li>
              <li>
                <Link to="/login">Profile</Link>
              </li>
              <li>
                <Link to="/login">Logout</Link>
              </li>
            </ul>
          </nav>
        </aside>

        <main className="main-content">
          <div className="category-management">
            <section className="existing-categories">
              <h2>Existing Categories</h2>
              <div className="categories-grid">
                {categories.map((category) => (
                  <div key={category._id} className="category-card">
                    <img
                      src={category.image}
                      alt={category.name}
                      className="category-image"
                    />
                  </div>
                ))}
              </div>
            </section>
            <section className="add-category-section">
              <h2>Add New Category</h2>
              <form onSubmit={handleSubmit} className="add-category-form">
                <div className="form-group">
                  <label>Category Name</label>
                  <input
                    type="text"
                    name="name"
                    value={categoryData.name}
                    onChange={handleChange}
                    placeholder="Enter category name"
                  />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <input
                    type="text"
                    name="description"
                    value={categoryData.description}
                    onChange={handleChange}
                    placeholder="Enter category description"
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
                <button type="submit" className="submit-button" disabled={isLoading}>
                  {isLoading ? "Adding..." : "Add Category"}
                </button>
              </form>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AddCategory;
