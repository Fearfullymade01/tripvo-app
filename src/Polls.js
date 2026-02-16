import React, { useState, useEffect } from "react";

const USER_ID = "demo-user"; // Replace with real user ID in production
const BACKEND_URL =
    process.env.REACT_APP_BACKEND_URL ||
    "https://tripvo-backend-99eabd966d03.herokuapp.com";

function Polls({ backendUrl }) {
    const [polls, setPolls] = useState([]);
    const [question, setQuestion] = useState("");
    const [options, setOptions] = useState([""]);
    const [ws, setWs] = useState(null);

    useEffect(() => {
        fetch(`${BACKEND_URL}/polls`)
            .then((res) => res.json())
            .then((data) => setPolls(data));
        // WebSocket for real-time updates
        const socket = new window.WebSocket(
            `${BACKEND_URL.replace("https://", "wss://")}/ws/polls/global`,
        );
        socket.onmessage = (event) => {
            const msg = JSON.parse(event.data);
            if (msg.event === "new_poll")
                setPolls((polls) => [msg.poll, ...polls]);
            if (msg.event === "poll_closed")
                setPolls((polls) =>
                    polls.map((p) =>
                        p.id === msg.poll_id ? { ...p, is_closed: true } : p,
                    ),
                );
        };
        setWs(socket);
        return () => socket.close();
    }, []);

    const createPoll = (e) => {
        e.preventDefault();
        fetch(`${BACKEND_URL}/polls`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                question,
                options: options.filter(Boolean),
            }),
        })
            .then((res) => res.json())
            .then((poll) => setPolls((polls) => [poll, ...polls]));
    };

    const votePoll = (pollId, optionId) => {
        fetch(`${BACKEND_URL}/polls/${pollId}/vote`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user_id: USER_ID, option_id: optionId }),
        })
            .then((res) => res.json())
            .then((result) => {
                if (result.poll) {
                    setPolls((polls) =>
                        polls.map((p) => (p.id === pollId ? result.poll : p)),
                    );
                }
            });
    };

    return (
        <div>
            <h2>Group Polls</h2>
            <form onSubmit={createPoll}>
                <input
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="Poll question"
                    required
                />
                {options.map((opt, i) => (
                    <input
                        key={i}
                        value={opt}
                        onChange={(e) =>
                            setOptions((opts) =>
                                opts.map((o, j) =>
                                    j === i ? e.target.value : o,
                                ),
                            )
                        }
                        placeholder={`Option ${i + 1}`}
                        required
                    />
                ))}
                <button
                    type="button"
                    onClick={() => setOptions((opts) => [...opts, ""])}
                >
                    Add Option
                </button>
                <button type="submit">Create Poll</button>
            </form>
            <ul>
                {polls.map((poll) => {
                    const votedOption =
                        poll.votes_by_user && poll.votes_by_user[USER_ID];
                    return (
                        <li
                            key={poll.id}
                            style={{
                                marginBottom: 16,
                                border: "1px solid #ccc",
                                padding: 8,
                            }}
                        >
                            <strong>{poll.question}</strong>
                            {poll.deadline && (
                                <div style={{ fontSize: 12, color: "#888" }}>
                                    Deadline:{" "}
                                    {new Date(poll.deadline).toLocaleString()}
                                </div>
                            )}
                            <ul>
                                {poll.options.map((opt) => (
                                    <li key={opt.id}>
                                        {opt.text} ({opt.votes} votes)
                                        {poll.is_closed ? null : !votedOption ? (
                                            <button
                                                style={{ marginLeft: 8 }}
                                                onClick={() =>
                                                    votePoll(poll.id, opt.id)
                                                }
                                                disabled={!!votedOption}
                                            >
                                                Vote
                                            </button>
                                        ) : votedOption === opt.id ? (
                                            <span
                                                style={{
                                                    marginLeft: 8,
                                                    color: "green",
                                                }}
                                            >
                                                Your vote
                                            </span>
                                        ) : null}
                                    </li>
                                ))}
                            </ul>
                            {poll.is_closed ? (
                                <span style={{ color: "red" }}>Closed</span>
                            ) : (
                                <span style={{ color: "green" }}>Open</span>
                            )}
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}

export default Polls;
