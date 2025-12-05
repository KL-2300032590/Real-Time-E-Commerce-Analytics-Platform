import React, { useState } from "react";
import { api } from "../api";

const PRODUCTS = [
  {
    id: "P1001",
    name: "Noise Cancelling Headphones",
    price: 9999,
    description: "Over-ear wireless headphones with active noise cancellation.",
    image:
      "https://loremflickr.com/300/200/headphones,audio", // Placeholder image for Headphones
  },
  {
    id: "P1002",
    name: "Mechanical Keyboard",
    price: 5499,
    description: "RGB mechanical keyboard with blue switches.",
    image:
      "https://loremflickr.com/300/200/keyboard,mechanical", // Placeholder image for Mechanical Keyboard
  },
  {
    id: "P1003",
    name: "4K Monitor",
    price: 22999,
    description: "27-inch 4K UHD monitor for productivity and gaming.",
    image:
      "https://loremflickr.com/300/200/monitor,computer", // Placeholder image for 4K Monitor
  },
  // --- New Products Added Below ---
  {
    id: "P1004",
    name: "Smart Coffee Maker",
    price: 12500,
    description: "Wi-Fi enabled coffee machine with schedule programming.",
    image:
      "https://loremflickr.com/300/200/coffee,maker,smart", // Placeholder image for Smart Home device
  },
  {
    id: "P1005",
    name: "Fitness Tracker Watch",
    price: 7999,
    description: "Waterproof watch with heart rate and sleep tracking.",
    image:
      "https://loremflickr.com/300/200/smartwatch,fitness", // Placeholder image for Wearable Tech
  },
  {
    id: "P1006",
    name: "Ergonomic Gaming Mouse",
    price: 3299,
    description: "High-precision optical mouse with customizable buttons.",
    image:
      "https://loremflickr.com/300/200/gaming,mouse", // Placeholder image for Gaming Gear
  },
];

function ShopPage() {
  // In real world these would be dynamic / from auth
  const sessionId = "S-demo-session";
  const userId = "U-demo";

  const [cart, setCart] = useState([]);

  const sendEvent = async (eventType, product) => {
    try {
      await api.post("/events", {
        eventType,
        userId,
        sessionId,
        productId: product.id,
        price: product.price,
        currency: "INR",
        timestamp: Date.now(),
      });
      console.log(`Sent ${eventType} event for ${product.id}`);
    } catch (err) {
      console.error("Failed to send event", err);
      alert("Failed to send event. Check backend.");
    }
  };

  const handleView = (product) => {
    sendEvent("VIEW", product);
  };

  const handleAddToCart = (product) => {
    // Update local cart state
    setCart((prev) => [...prev, product]);
    // Send ADD_TO_CART event
    sendEvent("ADD_TO_CART", product);
  };

  const handlePurchase = (product) => {
    // In a real app this would create an order for cart.
    // For now we simulate a single-product purchase.
    sendEvent("PURCHASE", product);
    alert(`Purchase completed for ${product.name}`);
  };

  const cartTotal = cart.reduce((sum, p) => sum + p.price, 0);

  return (
    <div>
      <h2>Shop</h2>
      <p>
        This is the customer-facing e-commerce page. Every interaction sends
        events to the backend (VIEW / ADD_TO_CART / PURCHASE).
      </p>

      {/* Cart Summary */}
      <div
        style={{
          margin: "1rem 0",
          padding: "0.75rem 1rem",
          borderRadius: "10px",
          border: "1px solid #eee",
          background: "#fefce8",
        }}
      >
        <h3>Cart</h3>
        {cart.length === 0 ? (
          <p>No items in cart yet.</p>
        ) : (
          <>
            <ul>
              {cart.map((item, idx) => (
                <li key={idx}>
                  {item.name} – ₹ {item.price}
                </li>
              ))}
            </ul>
            <p>
              <strong>Total:</strong> ₹ {cartTotal}
            </p>
          </>
        )}
      </div>

      {/* Product listing */}
      <div className="product-grid">
        {PRODUCTS.map((p) => (
          <div key={p.id} className="product-card">
            <img
              src={p.image}
              alt={p.name}
              style={{
                width: "100%",
                height: "150px",
                objectFit: "cover",
                borderRadius: "8px",
                marginBottom: "0.5rem",
              }}
              onClick={() => handleView(p)}
            />
            <h3>{p.name}</h3>
            <p style={{ fontSize: "0.9rem", color: "#555" }}>
              {p.description}
            </p>
            <p style={{ fontWeight: "bold", marginTop: "0.25rem" }}>
              ₹ {p.price}
            </p>
            <div className="button-row">
              <button onClick={() => handleView(p)}>View</button>
              <button onClick={() => handleAddToCart(p)}>Add to Cart</button>
              <button onClick={() => handlePurchase(p)}>Purchase</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ShopPage;
