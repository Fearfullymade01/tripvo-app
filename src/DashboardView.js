import React, { useEffect, useState } from "react";
const BACKEND_URL =
    process.env.REACT_APP_BACKEND_URL || "http://localhost:8000";

export default function DashboardView() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Sort/filter state
    const [planSort, setPlanSort] = useState("title");
    const [planFilter, setPlanFilter] = useState("");
    const [eventSort, setEventSort] = useState("start_time");
    const [eventFilter, setEventFilter] = useState("");
    const [expenseSort, setExpenseSort] = useState("amount");
    const [expenseFilter, setExpenseFilter] = useState("");

    useEffect(() => {
        setLoading(true);
        fetch(`${BACKEND_URL}/api/dashboard/`, {
            credentials: "include",
        })
            .then((res) => {
                if (!res.ok) throw new Error("Failed to fetch dashboard data");
                return res.json();
            })
            .then((data) => {
                setData(data);
                setLoading(false);
            })
            .catch(() => {
                setError("Failed to load dashboard");
                setLoading(false);
            });
    }, []);

    if (loading) return <div>Loading dashboard...</div>;
    if (error) return <div style={{ color: "red" }}>{error}</div>;
    if (!data) return null;

    // Sort/filter helpers
    const filteredPlans = data.active_plans
        .filter((p) =>
            planFilter
                ? p.title.toLowerCase().includes(planFilter.toLowerCase())
                : true,
        )
        .sort((a, b) => {
            if (planSort === "title") return a.title.localeCompare(b.title);
            if (planSort === "category")
                return a.category.localeCompare(b.category);
            if (planSort === "created_at")
                return new Date(b.created_at) - new Date(a.created_at);
            return 0;
        });

    const filteredEvents = data.upcoming_events
        .filter((e) =>
            eventFilter
                ? e.title.toLowerCase().includes(eventFilter.toLowerCase())
                : true,
        )
        .sort((a, b) => {
            if (eventSort === "start_time")
                return new Date(a.start_time) - new Date(b.start_time);
            if (eventSort === "title") return a.title.localeCompare(b.title);
            return 0;
        });

    const filteredExpenses = data.outstanding_expenses
        .filter((e) =>
            expenseFilter
                ? e.description
                      .toLowerCase()
                      .includes(expenseFilter.toLowerCase())
                : true,
        )
        .sort((a, b) => {
            if (expenseSort === "amount") return b.amount - a.amount;
            if (expenseSort === "description")
                return a.description.localeCompare(b.description);
            return 0;
        });

    return (
        <div
            style={{
                border: "1px solid #ccc",
                borderRadius: 8,
                padding: 24,
                margin: 24,
            }}
        >
            <h2>My Dashboard</h2>
            <section>
                <h3>Active Plans</h3>
                <div style={{ marginBottom: 8 }}>
                    <input
                        placeholder="Filter by title..."
                        value={planFilter}
                        onChange={(e) => setPlanFilter(e.target.value)}
                        style={{ marginRight: 8 }}
                    />
                    <label>Sort by: </label>
                    <select
                        value={planSort}
                        onChange={(e) => setPlanSort(e.target.value)}
                    >
                        <option value="title">Title</option>
                        <option value="category">Category</option>
                        <option value="created_at">Created</option>
                    </select>
                </div>
                {filteredPlans.length === 0 ? (
                    <div>No active plans.</div>
                ) : (
                    <ul>
                        {filteredPlans.map((plan) => (
                            <li key={plan.id}>
                                <b>{plan.title}</b> ({plan.category})<br />
                                {plan.description}
                            </li>
                        ))}
                    </ul>
                )}
            </section>
            <section>
                <h3>Upcoming Events</h3>
                <div style={{ marginBottom: 8 }}>
                    <input
                        placeholder="Filter by title..."
                        value={eventFilter}
                        onChange={(e) => setEventFilter(e.target.value)}
                        style={{ marginRight: 8 }}
                    />
                    <label>Sort by: </label>
                    <select
                        value={eventSort}
                        onChange={(e) => setEventSort(e.target.value)}
                    >
                        <option value="start_time">Start Time</option>
                        <option value="title">Title</option>
                    </select>
                </div>
                {filteredEvents.length === 0 ? (
                    <div>No upcoming events.</div>
                ) : (
                    <ul>
                        {filteredEvents.map((event) => (
                            <li key={event.id}>
                                <b>{event.title}</b> ({event.start_time} -{" "}
                                {event.end_time})<br />
                                {event.location}
                            </li>
                        ))}
                    </ul>
                )}
            </section>
            <section>
                <h3>Pending Polls</h3>
                {/* No sort/filter for polls for now */}
                {data.pending_polls.length === 0 ? (
                    <div>No pending polls.</div>
                ) : (
                    <ul>
                        {data.pending_polls.map((poll) => (
                            <li key={poll.id}>
                                <b>{poll.title}</b>: {poll.message}
                            </li>
                        ))}
                    </ul>
                )}
            </section>
            <section>
                <h3>Outstanding Expenses</h3>
                <div style={{ marginBottom: 8 }}>
                    <input
                        placeholder="Filter by description..."
                        value={expenseFilter}
                        onChange={(e) => setExpenseFilter(e.target.value)}
                        style={{ marginRight: 8 }}
                    />
                    <label>Sort by: </label>
                    <select
                        value={expenseSort}
                        onChange={(e) => setExpenseSort(e.target.value)}
                    >
                        <option value="amount">Amount</option>
                        <option value="description">Description</option>
                    </select>
                </div>
                {filteredExpenses.length === 0 ? (
                    <div>No outstanding expenses.</div>
                ) : (
                    <ul>
                        {filteredExpenses.map((exp) => (
                            <li key={exp.id}>
                                <b>{exp.description}</b> - {exp.amount} (
                                {exp.category})
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </div>
    );
}
