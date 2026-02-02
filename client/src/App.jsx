import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import Login from "./componets/Login";
import Signup from "./componets/Signup";
import Home from "./componets/Home";
import Admin from "./componets/Admin";
import AddProduct from "./componets/AddProduct";
import AddCategory from "./componets/add-category";
import AddSubCategory from "./componets/add-sub";
import Check from "./componets/cheakout";
import Order from "./componets/OrderPlaced";
import TrackOrder from "./componets/TrackOrder";

import "./App.css";

function App() {
  const isAdmin = localStorage.getItem("isAdmin") === "true";

  return (
    <Router>
      <Routes>
        {/* Redirect / to /login */}
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/home" element={<Home />} />

        {/* Admin routes */}
        {isAdmin && (
          <>
            <Route path="/admin" element={<Admin />} />
            <Route path="/add" element={<AddProduct />} />
            <Route path="/add-category" element={<AddCategory />} />
            <Route path="/add-subcategory" element={<AddSubCategory />} />
          </>
        )}

        
      </Routes>
    </Router>
  );
}

export default App;
