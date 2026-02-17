import React, { useEffect, useState } from "react";
import { messaging, getToken, onMessage } from "./firebase";

const BACKEND_URL =
    process.env.REACT_APP_BACKEND_URL ||
    "https://tripvo-backend-99eabd966d03.herokuapp.com";

export default function PushNotificationRegister({ userId }) {
    const [token, setToken] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (!userId) return;
        Notification.requestPermission().then((permission) => {
            if (permission === "granted") {
                getToken(messaging, { vapidKey: "YOUR_FIREBASE_VAPID_KEY" })
                    .then((currentToken) => {
                        if (currentToken) {
                            setToken(currentToken);
                            // Send token to backend
                            fetch(`${BACKEND_URL}/api/save-device-token/`, {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                credentials: "include",
                                body: JSON.stringify({ token: currentToken }),
                            })
                                .then((res) => res.json())
                                .then(() => setSuccess(true))
                                .catch(() =>
                                    setError("Failed to save device token"),
                                );
                        } else {
                            setError("No registration token available");
                        }
                    })
                    .catch(() => setError("Failed to get token"));
            } else {
                setError("Notification permission denied");
            }
        });
        // Listen for foreground messages
        onMessage(messaging, (payload) => {
            alert(
                payload.notification.title + ": " + payload.notification.body,
            );
        });
    }, [userId]);

    if (!userId) return null;
    if (error) return <div style={{ color: "red" }}>{error}</div>;
    if (success) return <div>Push notifications enabled!</div>;
    return <div>Enabling push notifications...</div>;
}
