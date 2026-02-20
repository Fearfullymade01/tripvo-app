import React from "react";
import axiosInstance from "./axios";
const BACKEND_URL =
    process.env.REACT_APP_BACKEND_URL ||
    "https://tripvo-backend-99eabd966d03.herokuapp.com";

export default function SettleButton({
    expenseId,
    memberId,
    settled,
    onSettled,
}) {
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState("");

    if (settled) return <span>Settled ✅</span>;

    const handleSettle = async () => {
        setLoading(true);
        setError("");
        try {
            await axiosInstance.post(
                `${BACKEND_URL}/api/expenses/${expenseId}/settle/`,
                {},
            );
            if (onSettled) onSettled();
        } catch (err) {
            setError("Failed to settle");
        } finally {
            setLoading(false);
        }
    };

    return (
        <span>
            <button onClick={handleSettle} disabled={loading}>
                Mark as Settled
            </button>
            {error && <span style={{ color: "red" }}>{error}</span>}
        </span>
    );
}
