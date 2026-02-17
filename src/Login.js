import React, { useState } from "react";
const BACKEND_URL =
    process.env.REACT_APP_BACKEND_URL || "http://localhost:8000";

export default function Login({ onLogin }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            const res = await fetch(`${BACKEND_URL}/api-auth/login/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                credentials: "include",
                body: `username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`,
            });
            if (!res.ok) throw new Error("Invalid credentials");
            setLoading(false);
            if (onLogin) onLogin();
        } catch (err) {
            setError("Login failed. Please check your username and password.");
            setLoading(false);
        }
    };

    return (
        <div
            style={{
                maxWidth: 400,
                margin: "40px auto",
                padding: 24,
                border: "1px solid #ccc",
                borderRadius: 8,
            }}
        >
            <h2>Login</h2>
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: 12 }}>
                    <label>Username:</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        style={{ width: "100%", padding: 8 }}
                    />
                </div>
                <div style={{ marginBottom: 12 }}>
                    <label>Password:</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        style={{ width: "100%", padding: 8 }}
                    />
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    style={{ width: "100%", padding: 10 }}
                >
                    {loading ? "Logging in..." : "Login"}
                </button>
                {error && (
                    <div style={{ color: "red", marginTop: 12 }}>{error}</div>
                )}
            </form>
        </div>
    );
}
