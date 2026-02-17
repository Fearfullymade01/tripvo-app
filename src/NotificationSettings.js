import React, { useEffect, useState } from "react";
const BACKEND_URL =
    process.env.REACT_APP_BACKEND_URL ||
    "https://tripvo-backend-99eabd966d03.herokuapp.com";

export default function NotificationSettings({ userId }) {
    const [settings, setSettings] = useState({
        chat: true,
        poll: true,
        itinerary: true,
        expense: true,
        member: true,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetch(`${BACKEND_URL}/api/notification-settings/`, {
            credentials: "include",
        })
            .then((res) => res.json())
            .then((data) => {
                setSettings(data);
                setLoading(false);
            })
            .catch(() => {
                setError("Failed to load notification settings");
                setLoading(false);
            });
    }, []);

    const handleChange = (type) => {
        setSettings((prev) => ({ ...prev, [type]: !prev[type] }));
    };

    const handleSave = () => {
        setLoading(true);
        fetch(`${BACKEND_URL}/api/notification-settings/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(settings),
        })
            .then((res) => res.json())
            .then(() => setLoading(false))
            .catch(() => {
                setError("Failed to save settings");
                setLoading(false);
            });
    };

    if (loading) return <div>Loading notification settings...</div>;
    if (error) return <div style={{ color: "red" }}>{error}</div>;

    return (
        <div style={{ margin: "24px 0" }}>
            <h2>Notification Preferences</h2>
            {Object.keys(settings).map((type) => (
                <div key={type}>
                    <label>
                        <input
                            type="checkbox"
                            checked={settings[type]}
                            onChange={() => handleChange(type)}
                        />
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                    </label>
                </div>
            ))}
            <button onClick={handleSave} style={{ marginTop: 12 }}>
                Save Preferences
            </button>
        </div>
    );
}
