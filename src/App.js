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
import Onboarding from "./Onboarding";
import ProfileSettings from "./ProfileSettings";

const PLAN_ID = "d23c595d-eb7e-457d-9c85-0f2dea9af547"; // London plan
const BACKEND_URL =
    process.env.REACT_APP_BACKEND_URL || "http://localhost:8000";

function App() {
    const [authenticated, setAuthenticated] = useState(false);
    const [onboarded, setOnboarded] = useState(() => {
        return localStorage.getItem("onboarded") === "true";
    });
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
            let data;
            try {
                data = await res.json();
            } catch (jsonErr) {
                setAiError("Invalid response from server");
                setAiSuggestions([]);
                return;
            }
            setAiSuggestions(
                Array.isArray(data.suggestions) ? data.suggestions : [],
            );
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
            .then((res) => {
                if (!res.ok) throw new Error("Failed to fetch members");
                return res.json();
            })
            .then((data) => {
                if (Array.isArray(data)) {
                    setMembers(data);
                } else {
                    setMembers([]);
                }
            })
            .catch(() => setMembers([]));
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

    return (
        <div>
            {!authenticated ? (
                <Login onAuth={() => setAuthenticated(true)} />
            ) : !onboarded ? (
                <Onboarding onComplete={() => setOnboarded(true)} />
            ) : (
                <DashboardView members={members} />
            )}
            <ItineraryList
                itinerary={itinerary}
                onComment={handleComment}
                members={members}
            />
            <AiAssistPanel
                suggestions={aiSuggestions}
                loading={aiLoading}
                error={aiError}
                fetchSuggestions={fetchAiSuggestions}
            />
            <Polls planId={PLAN_ID} backendUrl={BACKEND_URL} />
            <ExpenseEntry
                planId={PLAN_ID}
                backendUrl={BACKEND_URL}
                onChange={() => setExpensesChanged(true)}
            />
            <ExpenseList
                planId={PLAN_ID}
                backendUrl={BACKEND_URL}
                expensesChanged={expensesChanged}
                setExpensesChanged={setExpensesChanged}
            />
            <Chat planId={PLAN_ID} backendUrl={BACKEND_URL} />
            <NotificationSettings />
            <PushNotificationRegister />
            <ProfileSettings />
        </div>
    );
}

export default App;
