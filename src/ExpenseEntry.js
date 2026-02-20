import React, { useState } from "react";
import axiosInstance from "./axios";
const BACKEND_URL =
    process.env.REACT_APP_BACKEND_URL ||
    "https://tripvo-backend-99eabd966d03.herokuapp.com";

const defaultShares = (members, amount) => {
    if (!members.length) return [];
    const share = parseFloat((amount / members.length).toFixed(2));
    return members.map((m) => ({
        member: m.id,
        name: m.member_name || m.user_info?.username,
        amount: share,
    }));
};

export default function ExpenseEntry({ planId, members, onExpenseAdded }) {
    const [description, setDescription] = useState("");
    const [amount, setAmount] = useState("");
    const [category, setCategory] = useState("other");
    const [paidBy, setPaidBy] = useState("");
    const [splitMethod, setSplitMethod] = useState("equal");
    const [shares, setShares] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    React.useEffect(() => {
        if (splitMethod === "equal" && amount && members.length) {
            setShares(defaultShares(members, amount));
        }
    }, [splitMethod, amount, members]);

    const handleCustomShare = (idx, value) => {
        const newShares = shares.slice();
        newShares[idx].amount = value;
        setShares(newShares);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            const data = {
                plan: planId,
                description,
                amount,
                category,
                paid_by: paidBy,
                split_method: splitMethod,
            };
            if (splitMethod === "custom") {
                data.shares = shares.map((s) => ({
                    member: s.member,
                    amount: s.amount,
                }));
            }
            await axiosInstance.post(`${BACKEND_URL}/api/expenses/`, data);
            setDescription("");
            setAmount("");
            setCategory("other");
            setPaidBy("");
            setSplitMethod("equal");
            setShares([]);
            if (onExpenseAdded) onExpenseAdded();
        } catch (err) {
            setError(err.response?.data?.detail || "Error adding expense");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            style={{
                border: "1px solid #eee",
                padding: 16,
                borderRadius: 8,
                marginBottom: 24,
            }}
        >
            <h3>Add Expense</h3>
            {error && <div style={{ color: "red" }}>{error}</div>}
            <div>
                <label>
                    Description:{" "}
                    <input
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                    />
                </label>
            </div>
            <div>
                <label>
                    Amount:{" "}
                    <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        required
                        min="0.01"
                        step="0.01"
                    />
                </label>
            </div>
            <div>
                <label>
                    Category:
                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                    >
                        <option value="food">Food</option>
                        <option value="transport">Transport</option>
                        <option value="accommodation">Accommodation</option>
                        <option value="activity">Activity</option>
                        <option value="other">Other</option>
                    </select>
                </label>
            </div>
            <div>
                <label>
                    Paid By:
                    <select
                        value={paidBy}
                        onChange={(e) => setPaidBy(e.target.value)}
                        required
                    >
                        <option value="">Select</option>
                        {Array.isArray(members) && members.length > 0 ? (
                            members.map((m) => (
                                <option
                                    key={m.id}
                                    value={m.user || m.guest_email}
                                >
                                    {m.member_name ||
                                        m.user_info?.username ||
                                        m.guest_email}
                                </option>
                            ))
                        ) : (
                            <option disabled>No members found</option>
                        )}
                    </select>
                </label>
            </div>
            <div>
                <label>
                    Split Method:
                    <select
                        value={splitMethod}
                        onChange={(e) => setSplitMethod(e.target.value)}
                    >
                        <option value="equal">Equal</option>
                        <option value="custom">Custom</option>
                    </select>
                </label>
            </div>
            {splitMethod === "custom" && shares.length > 0 && (
                <div>
                    <h4>Custom Shares</h4>
                    {shares.map((s, idx) => (
                        <div key={s.member}>
                            {s.name}:{" "}
                            <input
                                type="number"
                                value={s.amount}
                                min="0"
                                step="0.01"
                                onChange={(e) =>
                                    handleCustomShare(idx, e.target.value)
                                }
                            />
                        </div>
                    ))}
                </div>
            )}
            <button type="submit" disabled={loading}>
                {loading ? "Adding..." : "Add Expense"}
            </button>
        </form>
    );
}
