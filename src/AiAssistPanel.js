import React, { useState } from "react";

export default function AiAssistPanel({
    onAccept,
    onReject,
    suggestions,
    onFeedback,
}) {
    const [feedback, setFeedback] = useState({});

    return (
        <div
            style={{
                border: "2px solid #0077ff",
                borderRadius: 8,
                padding: 24,
                margin: 24,
                background: "#f7faff",
            }}
        >
            <h2>AI Assist</h2>
            {suggestions.length === 0 ? (
                <div>
                    No suggestions yet. Click 'Get Suggestions' to start
                    planning!
                </div>
            ) : (
                <ul>
                    {suggestions.map((s, idx) => (
                        <li key={idx} style={{ marginBottom: 16 }}>
                            <b>{s.type}</b>: {s.text}
                            <div style={{ marginTop: 8 }}>
                                <button onClick={() => onAccept(s)}>
                                    Accept
                                </button>
                                <button
                                    onClick={() => onReject(s)}
                                    style={{ marginLeft: 8 }}
                                >
                                    Reject
                                </button>
                                <span style={{ marginLeft: 16 }}>
                                    Helpful?
                                    <button
                                        style={{ marginLeft: 4 }}
                                        onClick={() => {
                                            setFeedback({
                                                ...feedback,
                                                [idx]: "helpful",
                                            });
                                            onFeedback(s, "helpful");
                                        }}
                                        disabled={feedback[idx] === "helpful"}
                                    >
                                        👍
                                    </button>
                                    <button
                                        style={{ marginLeft: 4 }}
                                        onClick={() => {
                                            setFeedback({
                                                ...feedback,
                                                [idx]: "not_helpful",
                                            });
                                            onFeedback(s, "not_helpful");
                                        }}
                                        disabled={
                                            feedback[idx] === "not_helpful"
                                        }
                                    >
                                        👎
                                    </button>
                                </span>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
            <button style={{ marginTop: 16 }} onClick={() => onAccept(null)}>
                Get Suggestions
            </button>
        </div>
    );
}
