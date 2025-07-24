import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./componets/Login";
import Signup from "./componets/Signup";
import Home from "./componets/Home";
import Admin from "./componets/Admin";
import AddProduct from "./componets/AddProduct";
import AddCategory from "./componets/add-category";
import AddSubCategory from "./componets/add-sub";
import Cheak from "./componets/cheakout";
import Order from "./componets/OrderPlaced";
import TrackOrder from "./componets/TrackOrder";

import "./App.css";

function App() {
  // Check if the user is an admin (You may want to fetch this from localStorage or user context)
  const isAdmin = localStorage.getItem("isAdmin") === "true";

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Admin Routes (only accessible if the user is an admin) */}
        {isAdmin && (
          <>
            <Route path="/admin" element={<Admin />} />
            <Route path="/add" element={<AddProduct />} />
            <Route path="/add-category" element={<AddCategory />} />
            <Route path="/add-subcategory" element={<AddSubCategory />} />
          </>
        )}
         <Route path="/track-order/:orderId" element={<TrackOrder />} />
        <Route path="/checkout" element={<Cheak />} /> {/* Fixed typo here */}
        <Route path="/order" element={<Order />} />
      </Routes>
    </Router>
  );
}

export default App;
