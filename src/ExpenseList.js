import React, { useEffect, useState } from "react";
import axiosInstance from "./axios";
const BACKEND_URL =
    process.env.REACT_APP_BACKEND_URL ||
    "https://tripvo-backend-99eabd966d03.herokuapp.com";
import SettleButton from "./SettleButton";
import { saveAs } from "file-saver";
import { exportExpensesToPDF } from "./exportExpensesToPDF";

export default function ExpenseList({ planId }) {
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchExpenses = async () => {
        setLoading(true);
        try {
            const res = await axiosInstance.get(
                `${BACKEND_URL}/api/expenses/?plan=${planId}`,
            );
            setExpenses(res.data);
        } catch (err) {
            setError("Failed to load expenses");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchExpenses();
        // Optionally: add websocket or polling for real-time updates
    }, [planId]);

    function toCSV(expenses) {
        const rows = [
            [
                "Description",
                "Amount",
                "Category",
                "Paid By",
                "Split Method",
                "Shares",
            ],
            ...expenses.map((exp) => [
                exp.description,
                exp.amount,
                exp.category,
                exp.paid_by_info?.username || exp.paid_by,
                exp.split_method,
                (exp.shares || [])
                    .map(
                        (s) =>
                            `${s.member_name}: ${s.amount}${s.is_settled ? " (Settled)" : ""}`,
                    )
                    .join("; "),
            ]),
        ];
        return rows.map((r) => r.map((v) => `"${v}"`).join(",")).join("\n");
    }

    function handleExportCSV() {
        const csv = toCSV(expenses);
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
        saveAs(blob, `expenses_${planId}.csv`);
    }

    function handleExportPDF() {
        exportExpensesToPDF(expenses, planId);
    }

    if (loading) return <div>Loading expenses...</div>;
    if (error) return <div style={{ color: "red" }}>{error}</div>;

    return (
        <div style={{ marginBottom: 32 }}>
            <h3>Shared Expenses</h3>
            {expenses.length === 0 && <div>No expenses yet.</div>}
            <ul>
                {expenses.map((exp) => (
                    <li key={exp.id} style={{ marginBottom: 8 }}>
                        <b>{exp.description}</b> - {exp.amount} ({exp.category})
                        <br />
                        Paid by: {exp.paid_by_info?.username || exp.paid_by}
                        <br />
                        Split: {exp.split_method}
                        <br />
                        {exp.shares && exp.shares.length > 0 && (
                            <ul>
                                {exp.shares.map((s) => (
                                    <li key={s.id}>
                                        {s.member_name}: {s.amount}{" "}
                                        <SettleButton
                                            expenseId={exp.id}
                                            memberId={s.member}
                                            settled={s.is_settled}
                                            onSettled={fetchExpenses}
                                        />
                                    </li>
                                ))}
                            </ul>
                        )}
                    </li>
                ))}
            </ul>
            <button onClick={fetchExpenses}>Refresh</button>
            <button onClick={handleExportCSV} style={{ marginLeft: 8 }}>
                Export CSV
            </button>
            <button onClick={handleExportPDF} style={{ marginLeft: 8 }}>
                Export PDF
            </button>
        </div>
    );
}
