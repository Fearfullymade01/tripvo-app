import React, { useEffect, useState, useRef } from "react";
import ItineraryList from "./ItineraryList";
import Polls from "./Polls";
import ExpenseEntry from "./ExpenseEntry";
import ExpenseList from "./ExpenseList";
import Chat from "./Chat";

const PLAN_ID = "d23c595d-eb7e-457d-9c85-0f2dea9af547"; // London plan
const BACKEND_URL =
    process.env.REACT_APP_BACKEND_URL ||
    "https://tripvo-backend-99eabd966d03.herokuapp.com";

function App() {
    const [itinerary, setItinerary] = useState(() => {
        // Load from localStorage if available
        const saved = localStorage.getItem("itinerary_" + PLAN_ID);
        return saved ? JSON.parse(saved) : [];
    });
    const wsRef = useRef(null);
    const [members, setMembers] = useState([]);
    const [expensesChanged, setExpensesChanged] = useState(false);

    // Save itinerary to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem("itinerary_" + PLAN_ID, JSON.stringify(itinerary));
    }, [itinerary]);

    useEffect(() => {
        // Connect to WebSocket for real-time updates
        const ws = new window.WebSocket(
            `${BACKEND_URL.replace("https://", "wss://")}/ws/itinerary/${PLAN_ID}/`,
        );
        wsRef.current = ws;
        ws.onmessage = (event) => {
            const msg = JSON.parse(event.data);
            if (msg.type === "itinerary_update") {
                setItinerary(msg.itinerary);
                // Overwrite localStorage with server data
                localStorage.setItem(
                    "itinerary_" + PLAN_ID,
                    JSON.stringify(msg.itinerary),
                );
            }
        };
        ws.onclose = () => {
            // Optionally handle reconnect
        };
        return () => ws.close();
    }, []);

    useEffect(() => {
        // Fetch members for the plan
        fetch(`${BACKEND_URL}/api/plans/${PLAN_ID}/members/`)
            .then((res) => res.json())
            .then((data) => setMembers(data));
    }, []);

    // Send comment via WebSocket
    const handleComment = (itemId, comment) => {
        if (wsRef.current && wsRef.current.readyState === 1) {
            wsRef.current.send(
                JSON.stringify({ action: "comment", item_id: itemId, comment }),
            );
        } else {
            // If offline, update local state only
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
        <div style={{ maxWidth: 800, margin: "0 auto", padding: 24 }}>
            <h1>Tripvo Group Planning</h1>
            <ExpenseEntry
                planId={PLAN_ID}
                members={members}
                onExpenseAdded={() => setExpensesChanged((x) => !x)}
            />
            <ExpenseList planId={PLAN_ID} key={expensesChanged} />
            <ItineraryList items={itinerary} onComment={handleComment} />
            <Chat planId={PLAN_ID} user={"DemoUser"} />
            <Polls backendUrl={BACKEND_URL} />
            {/* TODO: Add calendar view, offline sync, and real-time logic */}
        </div>
    );
}

export default App;
