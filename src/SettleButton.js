import React from "react";
import axios from "axios";

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
            await axios.post(`/api/expenses/${expenseId}/settle/`, {
                member: memberId,
            });
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
