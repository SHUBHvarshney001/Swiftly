// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";
// import "./Login.css";
// import logo from "../assets/swiftly-logo.png";
// import cart from "../assets/cart.png";

// const Login = () => {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [message, setMessage] = useState("");
//   const navigate = useNavigate();

//   useEffect(() => {
//     document.body.classList.add("login-signup");
//     return () => {
//       document.body.classList.remove("login-signup");
//     };
//   }, []);

//  const handleSubmit = async (e) => {
//   e.preventDefault();
//   try {
//     const response = await axios.post("http://localhost:8080/api/auth/login", {
//       email,
//       password,
//     });

//     console.log("Response from server:", response.data);
//     setMessage(response.data.message);

//     if (response.status === 200 && response.data.user) {
//       const { isAdmin, email } = response.data.user;

//       // Save to localStorage
//       localStorage.setItem("isAdmin", isAdmin);
//       localStorage.setItem("email", email);

//       // Extract and save username
//       const username = email.split("@")[0].replace(/[0-9]/g, "").split(/[.\-_]/)[0];
//       localStorage.setItem("username", username);

//       // Redirect
//       navigate("/");
//     } else {
//       setMessage("User data not found in the response");
//     }
//   } catch (error) {
//     console.error("Error during login:", error);
//     setMessage(error.response?.data?.message || "An error occurred");
//   }
// };

  
//   return (
//     <div className="login-page">
//       <header className="header">
//         <img src={logo} alt="Logo" className="logo" />
//         <div className="search-bar">
//           <input type="text" placeholder="Search 'egg'" />
//         </div>
//         <button className="cart-button">
//           <img src={cart} alt="cart" />
//           My Cart
//         </button>
//       </header>
//       <div className="login-container">
//         <h1>Login</h1>
//         <form onSubmit={handleSubmit}>
//           <div className="input-group">
//             <label htmlFor="email">Email:</label>
//             <input
//               type="email"
//               id="email"
//               placeholder="Enter your email"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//             />
//           </div>
//           <div className="input-group">
//             <label htmlFor="password">Password:</label>
//             <input
//               type="password"
//               id="password"
//               placeholder="Enter your password"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//             />
//           </div>
//           <button className="login-button">Login</button>
//         </form>
//         <p>{message}</p>
//         <p>
//           Don't have an account? <a href="/signup">Sign up</a>
//         </p>
//       </div>
//     </div>
//   );
// };

// export default Login;
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./login.css";
import logo from "../assets/swiftly-logo.png";
import cart from "../assets/cart.png";

const Login = () => {
  const [step, setStep] = useState(1); // 1 = login, 2 = OTP
  const [email, setEmail] = useState("");        // <-- add this
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    document.body.classList.add("login-signup");
    return () => {
      document.body.classList.remove("login-signup");
    };
  }, []);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:8080/api/auth/login", {
        email,
        password,
      });
      setMessage(res.data.message);
      setStep(2); // move to OTP step
    } catch (err) {
      setMessage(err.response?.data?.message || "Error logging in");
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        "http://localhost:8080/api/auth/verify-otp",
        { email, otp }
      );
      // Save user info and token if provided
      localStorage.setItem("token", res.data.token || "");
      localStorage.setItem("isAdmin", res.data.user.isAdmin);
      localStorage.setItem("email", res.data.user.email);

      const username = res.data.user.email
        .split("@")[0]
        .replace(/[0-9]/g, "")
        .split(/[.\-_]/)[0];
      localStorage.setItem("username", username);

      // Redirect to home page after successful login
      navigate("/home");  // <-- Redirect to /home or "/" depending on your setup
    } catch (err) {
      setMessage(err.response?.data?.message || "OTP verification failed");
    }
  };

  return (
    <div className="login-page">
      {/* Header */}
      

      {/* Login/OTP Container */}
      <div className="login-container">
        <img src={logo} alt="Logo" className="logo" />
        {step === 1 ? (
          <>
            <h1>Login</h1>
            <form onSubmit={handleLoginSubmit}>
              <div className="input-group">
                <label htmlFor="email">Email:</label>
                <input
                  type="email"
                  id="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="input-group">
                <label htmlFor="password">Password:</label>
                <input
                  type="password"
                  id="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <button  display:flex>Send OTP</button>
            </form>
            <p>{message}</p>
            <p><h4>
              Don't have an account? <a href="/signup">Sign up</a></h4>
            </p>
          </>
        ) : (
          <>
            <h1>Enter OTP</h1>
            <form onSubmit={handleOtpSubmit}>
              <div className="input-group">
                <label htmlFor="otp">OTP:</label>
                <input
                  type="text"
                  id="otp"
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                />
              </div>
              <button display: flex>Verify OTP</button>
            </form>
            <p><b>{message}</b></p>
            <p>
              <b>Didn't get OTP?{" "}</b>
              <button onClick={() => setStep(1)}>Resend</button>
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default Login;
