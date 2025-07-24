import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import jsPDF from "jspdf"
import logo from "../assets/blinkit-logo.png"
import cartIcon from "../assets/cart.png"
import confirmationGif from "../assets/Animation - 1738440257841.gif"
import soundFile from "../assets/videoplayback.mp3"
import "./orders.css"

export default function OrderPlaced() {
  const [orderDetails, setOrderDetails] = useState(null)
  const [userDetails, setUserDetails] = useState(null)
  const [showGif, setShowGif] = useState(false)
  const [showOrderText, setShowOrderText] = useState(false)
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem("cart");
    console.log("Loaded cart from localStorage:", savedCart); // Log cart
    return savedCart ? JSON.parse(savedCart) : [];
  });

  const navigate = useNavigate()

  useEffect(() => {
    // Retrieve orderDetails and formData from localStorage
    const storedOrder = localStorage.getItem("orderDetails");
    const storedUser = localStorage.getItem("formData");
    
    // Retrieve total, subtotal, and shipping from localStorage
    const storedTotal = localStorage.getItem("total");
    
    if (storedOrder) {
      setOrderDetails(JSON.parse(storedOrder));
    }
  
    if (storedUser) {
      setUserDetails(JSON.parse(storedUser));
    }
  
    if (storedTotal) {
      // Parse the total, subtotal, and shipping values from the stored data
      const { subtotal, total, shipping } = JSON.parse(storedTotal);
      
      // Update orderDetails with the new values
      setOrderDetails((prevDetails) => ({
        ...prevDetails,
        total: {
          ...prevDetails.total,
          subtotal,
          grandTotal: total,
          shipping,
        }
      }));
    }
  
    // Play sound and show GIF after a delay
    const sound = new Audio(soundFile);
    setTimeout(() => {
      sound.play().catch((error) => {
        console.error("Audio playback error:", error);
      });
    }, 1000);
  
    setTimeout(() => {
      setShowOrderText(true);
      window.scrollTo(0, 0);
    }, 1000);
  
    setTimeout(() => {
      setShowGif(true);
      window.scrollTo(0, 0,smooth);
    }, 1200);
  }, []);
  
  // Update cart and orderDetails in localStorage when they change
  useEffect(() => {
    if (cart.length) {
      localStorage.setItem("cart", JSON.stringify(cart))
    }
  }, [cart])

  const updateLocalStorage = (newOrderDetails, newUserDetails) => {
    localStorage.setItem("orderDetails", JSON.stringify(newOrderDetails))
    localStorage.setItem("formData", JSON.stringify(newUserDetails))
    setOrderDetails(newOrderDetails)
    setUserDetails(newUserDetails)
  }

  const handleTrackOrder = () => {
    if (orderDetails && orderDetails.orderId) {
      // Navigate to track order page with the orderId
      navigate(`/track-order/${orderDetails.orderId}`);
    } else {
      console.error("Order ID is missing");
    }
  }

  const downloadInvoice = () => {
    const doc = new jsPDF()
    const margin = 20
    let yPos = margin

    doc.addImage(logo, "PNG", doc.internal.pageSize.width - 90, yPos, 70, 70)
    doc.setFontSize(30)
    doc.setFont("helvetica", "bold")
    doc.text("INVOICE", margin, yPos + 30)
    doc.setFontSize(12)
    doc.setFont("helvetica", "normal")
    doc.text(`Invoice #: ${orderDetails.orderId}`, margin, yPos + 45)
    yPos += 60
    doc.text(`Date: ${orderDetails.date}`, doc.internal.pageSize.width - margin - 80, yPos)
    doc.text(`Due Date: ${orderDetails.date}`, doc.internal.pageSize.width - margin - 80, yPos + 10)
    yPos += 30
    doc.setFont("helvetica", "bold")
    doc.text("Billed To:", margin, yPos)
    doc.setFont("helvetica", "normal")
    doc.text(`${userDetails.firstName} ${userDetails.lastName}`, margin, yPos + 10)
    doc.text(userDetails.email, margin, yPos + 20)
    doc.text(userDetails.address, margin, yPos+20.5) // Add the address here
    yPos += 40
    const tableHeaders = ["Product", "Quantity", "Price", "Total"]
    const columnWidths = [60, 30, 30, 30]
    const startX = margin

    doc.setFillColor(240, 240, 240)
    doc.rect(startX, yPos - 5, doc.internal.pageSize.width - 2 * margin, 10, "F")
    doc.setFont("helvetica", "bold")
    let xPos = startX
    tableHeaders.forEach((header, index) => {
      doc.text(header, xPos, yPos)
      xPos += columnWidths[index]
    })
    yPos += 15
    doc.setFont("helvetica", "normal")
    cart.forEach((item) => {
      xPos = startX
      doc.text(item.name, xPos, yPos)
      doc.text(item.quantity.toString(), xPos + columnWidths[0], yPos)
      doc.text(`₹${item.price.toFixed(2)}`, xPos + columnWidths[0] + columnWidths[1], yPos)
      doc.text(
        `₹${(item.price * item.quantity).toFixed(2)}`,
        xPos + columnWidths[0] + columnWidths[1] + columnWidths[2],
        yPos
      )
      yPos += 9
    })

    yPos += 15
    const totalX = startX + columnWidths[0] + columnWidths[1] + columnWidths[2]
    doc.setFont("Arial", "bold")
    doc.text("Subtotal", totalX - 40, yPos)
    doc.text(`₹${orderDetails.total.subtotal.toFixed(2)}`, totalX, yPos)

    yPos += 7
    doc.text("Tax", totalX - 40, yPos)
    doc.text(`₹${(orderDetails.total.grandTotal - orderDetails.total.subtotal).toFixed(2)}`, totalX, yPos)

    yPos += 7
    doc.setFontSize(14)
    doc.text("Total", totalX - 40, yPos)
    doc.text(`₹${orderDetails.total.grandTotal.toFixed(2)}`, totalX, yPos)
    yPos += 15

    doc.setFontSize(10)
    doc.setFont("helvetica", "bold")
    doc.text("Thank you for shopping with Blinkit!", margin, yPos)
    doc.text("For any questions or concerns, please contact our customer support.", margin, yPos + 7)

    doc.save("invoice.pdf")
  }

  return (
    <div className="order-placed-container">
      <header className="header">
        <div className="left-section">
          <a href="/">
            <img src={logo || "/placeholder.svg"} alt="Blinkit Logo" className="logo" />
          </a>
          <div className="delivery-info">
            <strong>Delivery in 9 minutes</strong>
            <span>Mathura, Uttar Pradesh, India</span>
          </div>
        </div>
        <div className="search-bar">
          <input type="text" placeholder='Search "egg"' />
        </div>
        <div className="header-actions">
          <button className="login-button">Login</button>
          <button className="cart-button">
            <img src={cartIcon || "/placeholder.svg"} alt="Cart" aria-label="Cart" />
            My Cart
          </button>
        </div>
      </header>

      <main className="order-summary-container">
        <div className="order-details-container">
          <div className="order-confirmation">
            {showOrderText && <h2>Your Order is Placed</h2>}
            {showGif && <img src={confirmationGif || "/placeholder.svg"} alt="Order Confirmation" className="confim" />}
          </div>

          <div className="order-summary-details">
            <div className="order-summary-card">
              <div className="total">
                <span>Total</span>
                <span>₹ {orderDetails?.total?.grandTotal?.toFixed(2) || "Loading..."}</span>
              </div>
              <div className="subtotal">
                <span>Subtotal</span>
                <span>₹ {orderDetails?.total?.subtotal?.toFixed(2) || "Loading..."}</span>
              </div>
              <div className="shipping">
                <span>Shipping</span>
                <span>₹ {orderDetails?.total?.shipping.toFixed(2) || "Loading..."}</span>
              </div>
            </div>
          </div>

          <div className="order-product-list">
            {cart?.map((item, index) => (
              <div key={index} className="order-product-card">
                <img src={item.image || "/placeholder.svg"} alt={item.name} className="order-product-image" />
                <div className="order-product-info">
                  <h3>{item.name}</h3>
                  <p>Quantity: {item.quantity}</p>
                  <p className="price">₹ {item.price}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="track-order-container">
            <button className="track-order-button" onClick={handleTrackOrder}>
              Track Your Order
            </button>
            <button className="download-invoice-button" onClick={downloadInvoice}>
              Download Invoice
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
