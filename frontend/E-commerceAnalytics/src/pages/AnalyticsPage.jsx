import { api } from "../api";
import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from "recharts";
import { BarChart, Bar, LabelList, Legend } from "recharts";

const EVENT_ORDER = ["VIEW", "ADD_TO_CART", "CLICK", "PURCHASE"];



function prettyLabel(type) {
  return type
    .toLowerCase()
    .split("_")
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(" ");
}

function AnalyticsPage() {
  const [summary, setSummary] = useState(null);
  const [eventsByType, setEventsByType] = useState(null);
  const [revenueLastHour, setRevenueLastHour] = useState(null);
  const [loading, setLoading] = useState(true);
  const [revenueTimeline, setRevenueTimeline] = useState(null);

  const [autoRefresh, setAutoRefresh] = useState(false);
const [lastUpdated, setLastUpdated] = useState(null);


 const fetchMetrics = useCallback(async () => {
  try {
    setLoading(true);

    const [summaryRes, eventsRes, revenueRes,timelineRes] = await Promise.all([
      api.get("/metrics/summary"),
      api.get("/metrics/events-by-type"),
      api.get("/metrics/revenue/last-hour"),
      api.get("/metrics/revenue/timeline"),
    ]);

    setSummary(summaryRes.data);
    setEventsByType(eventsRes.data);
    setRevenueLastHour(revenueRes.data.revenueLastHour);
    setRevenueTimeline(revenueRes.data.timeline);
    setRevenueTimeline(timelineRes.data);
    setLastUpdated(new Date());
  } catch (err) {
    console.error("Failed to load metrics", err);
    alert("Failed to load metrics. Check backend.");
  } finally {
    setLoading(false);
  }
}, []);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  useEffect(() => {
  if (!autoRefresh) return;

  const id = setInterval(() => {
    fetchMetrics();
  }, 5000); // 5 seconds

  return () => clearInterval(id);
}, [autoRefresh, fetchMetrics]);

  // Prepare data for the funnel-style bar chart
  const eventChartData = useMemo(() => {
    if (!eventsByType) return [];

    const normalized = { ...eventsByType };

    // Ensure we show all known stages, even if 0
    EVENT_ORDER.forEach((type) => {
      if (normalized[type] == null) normalized[type] = 0;
    });

    return EVENT_ORDER.map((type) => ({
      type: prettyLabel(type),
      rawType: type,
      count: normalized[type],
    }));
  }, [eventsByType]);

  const hasAnyEvents =
    eventChartData.length > 0 &&
    eventChartData.some((row) => row.count > 0);

  return (
    <div>
      <h2>Admin Analytics Dashboard</h2>
      <p style={{ marginBottom: "0.5rem" }}>
        This is the <strong>admin view</strong>. All metrics are computed from{" "}
        <code>user_event_records</code> in MySQL based on activity in the Shop
        page.
      </p>

      <div
  style={{
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    marginBottom: "1rem",
    flexWrap: "wrap",
  }}
>
  <button onClick={fetchMetrics}>Refresh now</button>

  <label style={{ fontSize: "0.85rem", display: "flex", alignItems: "center" }}>
    <input
      type="checkbox"
      checked={autoRefresh}
      onChange={(e) => setAutoRefresh(e.target.checked)}
      style={{ marginRight: "0.35rem" }}
    />
    Auto refresh every 5s
  </label>

  {lastUpdated && (
    <span style={{ fontSize: "0.8rem", color: "#6b7280" }}>
      Last updated: {lastUpdated.toLocaleTimeString()}
    </span>
  )}
</div>


      {loading && <p>Loading metrics…</p>}

      {/* KPI CARDS */}
      {summary && (
        <>
          <h3>Key Metrics</h3>
          <div className="metric-grid">
            <div className="metric-card">
              <div style={{ fontSize: "0.8rem", color: "#6b7280" }}>
                Total Events
              </div>
              <div style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
                {summary.totalEvents}
              </div>
              <div style={{ fontSize: "0.8rem", color: "#9ca3af" }}>
                All user interactions
              </div>
            </div>

            <div className="metric-card">
              <div style={{ fontSize: "0.8rem", color: "#6b7280" }}>
                Total Purchases
              </div>
              <div style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
                {summary.totalPurchases}
              </div>
              <div style={{ fontSize: "0.8rem", color: "#9ca3af" }}>
                Completed orders
              </div>
            </div>

            <div className="metric-card">
              <div style={{ fontSize: "0.8rem", color: "#6b7280" }}>
                Total Revenue
              </div>
              <div style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
                ₹ {summary.totalRevenue}
              </div>
              <div style={{ fontSize: "0.8rem", color: "#9ca3af" }}>
                Lifetime revenue
              </div>
            </div>

            <div className="metric-card">
              <div style={{ fontSize: "0.8rem", color: "#6b7280" }}>
                Unique Users
              </div>
              <div style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
                {summary.uniqueUsers}
              </div>
              <div style={{ fontSize: "0.8rem", color: "#9ca3af" }}>
                Based on userId
              </div>
            </div>

            <div className="metric-card">
              <div style={{ fontSize: "0.8rem", color: "#6b7280" }}>
                Revenue (Last Hour)
              </div>
              <div style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
                ₹ {revenueLastHour ?? 0}
              </div>
              <div style={{ fontSize: "0.8rem", color: "#9ca3af" }}>
                Purchases in the last 60 minutes
              </div>
            </div>
          </div>
        </>
      )}

      {/* EVENT FUNNEL CHART */}
      <div style={{ marginTop: "2rem" }}>
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "0.5rem",
          }}
        >
          <h3 style={{ margin: 0 }}>User Journey: Events by Type</h3>
          <span style={{ fontSize: "0.85rem", color: "#6b7280" }}>
            VIEW → ADD TO CART → CLICK → PURCHASE
          </span>
        </div>

        {!hasAnyEvents && !loading && (
          <p style={{ marginTop: "0.75rem", color: "#6b7280" }}>
            No events recorded yet. Go to the <strong>Shop</strong> page and
            interact with some products to see data here.
          </p>
        )}

        {hasAnyEvents && (
          <>
            <div style={{ width: "100%", height: 320, marginTop: "1rem" }}>
              <ResponsiveContainer>
                <BarChart
                  data={eventChartData}
                  layout="vertical"
                  margin={{ top: 20, right: 40, left: 60, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" allowDecimals={false} />
                  <YAxis dataKey="type" type="category" />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="count"
                    name="Event Count"
                  >
                    <LabelList
                      dataKey="count"
                      position="right"
                      formatter={(value) => (value === 0 ? "" : value)}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Raw values below for quick debugging / verification */}
            <ul style={{ marginTop: "0.75rem", fontSize: "0.9rem" }}>
              {eventChartData.map((row) => (
                <li key={row.rawType}>
                  <strong>{row.type}</strong>: {row.count}
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      {/* REVENUE TIMELINE CHART */}
<div style={{ marginTop: "2rem" }}>
  <h3>Revenue Timeline (Last 1 Hour)</h3>
  <p style={{ fontSize: "0.85rem", color: "#6b7280" }}>
    Shows how revenue changes over the last hour, grouped into 5-minute intervals.
  </p>

  {!revenueTimeline || revenueTimeline.length === 0 ? (
    <p>No revenue data yet.</p>
  ) : (
    <div style={{ width: "100%", height: 320, marginTop: "1rem" }}>
      <ResponsiveContainer>
        <LineChart data={revenueTimeline}
          margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="revenue"
            stroke="#2563eb"
            strokeWidth={3}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )}
</div>

    </div>
  );
}

export default AnalyticsPage;
