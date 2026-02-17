import React, { useEffect, useState, useRef } from "react";

import ItineraryList from "./ItineraryList";
import AiAssistPanel from "./AiAssistPanel";
import Polls from "./Polls";
import ExpenseEntry from "./ExpenseEntry";
import ExpenseList from "./ExpenseList";
import Chat from "./Chat";
import NotificationSettings from "./NotificationSettings";
import PushNotificationRegister from "./PushNotificationRegister";
import DashboardView from "./DashboardView";
import Login from "./Login";

const PLAN_ID = "d23c595d-eb7e-457d-9c85-0f2dea9af547"; // London plan
const BACKEND_URL =
    process.env.REACT_APP_BACKEND_URL || "http://localhost:8000";

function App() {
    const [authenticated, setAuthenticated] = useState(false);
    const [itinerary, setItinerary] = useState(() => {
        const saved = localStorage.getItem("itinerary_" + PLAN_ID);
        return saved ? JSON.parse(saved) : [];
    });
    const [aiSuggestions, setAiSuggestions] = useState([]);
    const [aiLoading, setAiLoading] = useState(false);
    const [aiError, setAiError] = useState("");
    const wsRef = useRef(null);
    const [members, setMembers] = useState([]);
    const [expensesChanged, setExpensesChanged] = useState(false);

    const fetchAiSuggestions = async (type = "itinerary") => {
        setAiLoading(true);
        setAiError("");
        try {
            const res = await fetch(`${BACKEND_URL}/api/ai/suggest/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    type,
                    location: "London",
                    dates: "2026-03-01 to 2026-03-07",
                    preferences: "sightseeing, food, culture",
                }),
            });
            const data = await res.json();
            setAiSuggestions(data.suggestions || []);
        } catch (err) {
            setAiError("Failed to fetch AI suggestions");
        } finally {
            setAiLoading(false);
        }
    };

    useEffect(() => {
        localStorage.setItem("itinerary_" + PLAN_ID, JSON.stringify(itinerary));
    }, [itinerary]);

    useEffect(() => {
        const ws = new window.WebSocket(
            `${BACKEND_URL.replace("https://", "wss://")}/ws/itinerary/${PLAN_ID}/`,
        );
        wsRef.current = ws;
        ws.onmessage = (event) => {
            const msg = JSON.parse(event.data);
            if (msg.type === "itinerary_update") {
                setItinerary(msg.itinerary);
                localStorage.setItem(
                    "itinerary_" + PLAN_ID,
                    JSON.stringify(msg.itinerary),
                );
            }
        };
        ws.onclose = () => {};
        return () => ws.close();
    }, []);

    useEffect(() => {
        fetch(`${BACKEND_URL}/api/plans/${PLAN_ID}/members/`)
            .then((res) => res.json())
            .then((data) => setMembers(data));
    }, []);

    const handleComment = (itemId, comment) => {
        if (wsRef.current && wsRef.current.readyState === 1) {
            wsRef.current.send(
                JSON.stringify({ action: "comment", item_id: itemId, comment }),
            );
        } else {
            setItinerary((items) =>
                items.map((item) =>
                    item.id === itemId
                        ? {
                              ...item,
                              comments: [
                                  ...(item.comments || []),
                                  {
                                      id: Date.now(),
                                      content: comment,
                                      author_name_display: "You (offline)",
                                  },
                              ],
                          }
                        : item,
                ),
            );
        }
    };

    if (!authenticated) {
        return <Login onLogin={() => setAuthenticated(true)} />;
    }

    return (
        <div style={{ maxWidth: 800, margin: "0 auto", padding: 24 }}>
            <h1>Tripvo Group Planning</h1>
            <DashboardView />
            <AiAssistPanel
                suggestions={aiSuggestions}
                onAccept={(s) => fetchAiSuggestions()}
                onReject={(s) =>
                    setAiSuggestions(aiSuggestions.filter((x) => x !== s))
                }
                onFeedback={(s, feedback) => {
                    /* Optionally send feedback to backend */
                }}
            />
            {aiLoading && <div>Loading AI suggestions...</div>}
            {aiError && <div style={{ color: "red" }}>{aiError}</div>}
            <ExpenseEntry
                planId={PLAN_ID}
                members={members}
                onExpenseAdded={() => setExpensesChanged((x) => !x)}
            />
            <ExpenseList planId={PLAN_ID} key={expensesChanged} />
            <ItineraryList items={itinerary} onComment={handleComment} />
            <Chat planId={PLAN_ID} user={"DemoUser"} />
            <Polls backendUrl={BACKEND_URL} />
            <NotificationSettings userId={null} />
            <PushNotificationRegister userId={null} />
            {/* TODO: Add calendar view, offline sync, and real-time logic */}
        </div>
    );
}

export default App;
