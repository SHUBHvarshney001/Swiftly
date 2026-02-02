import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import logo from "../assets/swiftly-logo.png";
import cart from "../assets/cart.png";
import wideAssortment from "../assets/Wide_Assortment.png";
import "./add-sub.css";

const AddSubCategory = () => {
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [subCategoryData, setSubCategoryData] = useState({
    name: "",
    categoryId: "",
    image: null,
  });
  const [previewImage, setPreviewImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchCategories();
    fetchSubCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/categories");
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchSubCategories = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/subcategories");
      const data = await response.json();
      setSubCategories(data);
    } catch (error) {
      console.error("Error fetching subcategories:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSubCategoryData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      setSubCategoryData((prev) => ({ ...prev, image: file }));
      setPreviewImage(URL.createObjectURL(file));
    } else {
      alert("Please upload a valid image file!");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("name", subCategoryData.name);
    formData.append("categoryId", subCategoryData.categoryId);
    formData.append("image", subCategoryData.image);

    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:8080/api/subcategories", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        alert("Sub-category added successfully!");
        setSubCategoryData({ name: "", categoryId: "", image: null });
        setPreviewImage(null);
        fetchSubCategories();
      } else {
        const errorText = await response.text();
        alert(errorText || "Failed to add sub-category");
      }
    } catch (error) {
      console.error("Error submitting sub-category:", error);
      alert("An error occurred. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await fetch(`http://localhost:8080/api/subcategories/${id}`, {
        method: "DELETE",
      });
      setSubCategories(subCategories.filter((subCategory) => subCategory._id !== id));
    } catch (error) {
      console.error("Error deleting sub-category:", error);
    }
  };

  return (
    <div className="add-product-page">
      <header className="header">
        <img src={logo || "/placeholder.svg"} alt="Logo" className="logo" />
        <div className="search-bar">
          <input type="text" placeholder="Search 'groceries'" />
        </div>
        <div className="header-actions">
          <button className="cart-button">
            <img src={cart || "/placeholder.svg"} alt="Cart" />
            My Cart
          </button>
          <Link to="/add" className="add-product-icon">
            <img src={wideAssortment || "/placeholder.svg"} alt="Wide Assortment" className="wide-assortment" />
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
                <Link to="/add-subcategory">Add Sub Category</Link>
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
          <div className="subcategory-management">
          <section className="existing-subcategories">
              <h2>Existing Sub Categories</h2>
              <div className="subcategories-table">
                <table>
                  <thead>
                    <tr>
                      <th>Sr.No</th>
                      <th>Name</th>
                      <th>Image</th>
                      <th>Category</th>
                      <th>Action</th>
                    </tr>
                  </thead>
<tbody>
  {subCategories.map((subCategory, index) => (
    <tr key={subCategory._id}>
      <td>{index + 1}</td>
      <td>{subCategory.name}</td>
      <td>
        <img
          src={subCategory.image || "/placeholder.svg"}
          alt={subCategory.name}
          className="table-image"
        />
      </td>
      <td>
        {
            subCategory.categoryId.name
        }
      </td>
      <td>
        <button className="edit-button">Edit</button>
        <button 
          className="delete-button"
          onClick={() => handleDelete(subCategory._id)}
        >
          Delete
        </button>
      </td>
    </tr>
  ))}
</tbody>

                </table>
              </div>
            </section>
            <section className="add-subcategory-section">
              <h2>Add New Sub Category</h2>
              <form onSubmit={handleSubmit} className="add-subcategory-form">
                <div className="form-group">
                  <label>Sub Category Name</label>
                  <input
                    type="text"
                    name="name"
                    value={subCategoryData.name}
                    onChange={handleChange}
                    placeholder="Enter sub-category name"
                  />
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <select
                    name="categoryId"
                    value={subCategoryData.categoryId}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map((category) => (
                      <option key={category._id} value={category._id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Image</label>
                  <input type="file" onChange={handleImageUpload} />
                  {previewImage && (
                    <img
                      src={previewImage || "/placeholder.svg"}
                      alt="Preview"
                      className="image-preview"
                    />
                  )}
                </div>
                <button type="submit" className="submit-button" disabled={isLoading}>
                  {isLoading ? "Adding..." : "Add Sub Category"}
                </button>
              </form>
            </section>

            
          </div>
        </main>
      </div>
    </div>
  );
};

export default AddSubCategory;
