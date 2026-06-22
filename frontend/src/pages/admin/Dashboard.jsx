import React, { useEffect, useState } from "react";
import {
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    Tooltip,
    XAxis,
    YAxis,
    CartesianGrid,
    ResponsiveContainer,
} from "recharts";
import "./Dashboard.css";

export default function Dashboard() {
    const [data, setData] = useState(null);

    useEffect(() => {
        fetchDashboard();
    }, []);

    const fetchDashboard = async () => {
        try {
            const token = localStorage.getItem("adminToken");

            const res = await fetch("http://localhost:5000/api/admin/dashboard", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const result = await res.json();
            setData(result);
        } catch (error) {
            console.log("Dashboard error:", error);
        }
    };

    if (!data) {
        return <h2 className="dashboard-loading">Loading dashboard...</h2>;
    }

    const categoryData = data.productsByCategory.map((item) => ({
        name: item._id || "Unknown",
        value: item.count,
    }));

    const statusData = data.ordersByStatus.map((item) => ({
        name: item._id || "Unknown",
        value: item.count,
    }));

    const monthNames = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ];

    const monthlyData = data.monthlySales.map((item) => ({
        month: `${monthNames[item._id.month - 1]} ${item._id.year}`,
        revenue: item.revenue || 0,
        orders: item.orders || 0,
    }));

    return (
        <div className="dashboard-page">
            <h1>Admin Dashboard</h1>
            <p className="dashboard-subtitle">Store analytics and business overview</p>

            <div className="dashboard-cards">
                <div className="dashboard-card">
                    <h3>Total Products</h3>
                    <h2>{data.totalProducts}</h2>
                </div>

                <div className="dashboard-card">
                    <h3>Total Orders</h3>
                    <h2>{data.totalOrders}</h2>
                </div>

                <div className="dashboard-card">
                    <h3>Total Revenue</h3>
                    <h2>₹{data.totalRevenue}</h2>
                </div>

                <div className="dashboard-card">
                    <h3>Total Users</h3>
                    <h2>{data.totalUsers}</h2>
                </div>

                <div className="dashboard-card">
                    <h3>Pending Orders</h3>
                    <h2>{data.pendingOrders}</h2>
                </div>

                <div className="dashboard-card">
                    <h3>Completed Orders</h3>
                    <h2>{data.completedOrders}</h2>
                </div>
            </div>

            <div className="dashboard-charts">
                <div className="chart-box">
                    <h3>Monthly Sales</h3>

                    {monthlyData.length === 0 ? (
                        <p>No monthly sales data available</p>
                    ) : (
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={monthlyData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="revenue" fill="#6b4eff" />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>

                <div className="chart-box">
                    <h3>Orders By Status</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={statusData}
                                dataKey="value"
                                nameKey="name"
                                outerRadius={100}
                                label
                            >
                                {statusData.map((_, index) => (
                                    <Cell
                                        key={index}
                                        fill={["#6b4eff", "#ff9f43", "#00c851", "#ff4444"][index % 4]}
                                    />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                <div className="chart-box">
                    <h3>Products By Category</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={categoryData}
                                dataKey="value"
                                nameKey="name"
                                outerRadius={100}
                                label
                            >
                                {categoryData.map((_, index) => (
                                    <Cell
                                        key={index}
                                        fill={["#0088FE", "#00C49F", "#FFBB28", "#FF8042"][index % 4]}
                                    />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="recent-orders">
                <h3>Recent Orders</h3>

                <table>
                    <thead>
                        <tr>
                            <th>User Email</th>
                            <th>Total</th>
                            <th>Status</th>
                            <th>Payment</th>
                        </tr>
                    </thead>

                    <tbody>
                        {data.recentOrders.map((order) => (
                            <tr key={order._id}>
                                <td>{order.userEmail}</td>
                                <td>₹{order.totalAmount}</td>
                                <td>{order.status}</td>
                                <td>{order.paymentStatus}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}