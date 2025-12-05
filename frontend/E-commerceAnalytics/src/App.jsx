import React from "react";
import { Routes, Route, Link, NavLink } from "react-router-dom";
import ShopPage from "./pages/ShopPage";
import AnalyticsPage from "./pages/AnalyticsPage";

function App() {
  return (
    <div className="app">
      <header className="header">
        <h1>Real-Time E-Commerce Analytics</h1>
        <nav>
          <NavLink to="/shop" className="nav-link">
            Shop
          </NavLink>
          <NavLink to="/analytics" className="nav-link">
            Analytics
          </NavLink>
        </nav>
      </header>

      <main className="main">
        <Routes>
          <Route path="/" element={<ShopPage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
