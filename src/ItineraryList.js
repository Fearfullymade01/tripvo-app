import React, { useState, useEffect } from "react";

function ItineraryList({ items, onComment }) {
    return (
        <div>
            <h2>Itinerary</h2>
            <ul>
                {items.map((item) => (
                    <li
                        key={item.id}
                        style={{
                            marginBottom: 16,
                            border: "1px solid #ccc",
                            padding: 8,
                        }}
                    >
                        <strong>{item.title}</strong> <br />
                        <span>
                            {item.start_time} - {item.end_time}
                        </span>{" "}
                        <br />
                        <span>{item.location}</span> <br />
                        <span>{item.notes}</span> <br />
                        {item.has_conflict && (
                            <span style={{ color: "red" }}>Conflict!</span>
                        )}
                        <div>
                            <h4>Comments</h4>
                            <ul>
                                {(item.comments || []).map((c) => (
                                    <li key={c.id}>
                                        {c.content}{" "}
                                        <em>by {c.author_name_display}</em>
                                    </li>
                                ))}
                            </ul>
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    onComment(item.id, e.target.comment.value);
                                    e.target.reset();
                                }}
                            >
                                <input
                                    name="comment"
                                    placeholder="Add comment..."
                                    required
                                />
                                <button type="submit">Add</button>
                            </form>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default ItineraryList;
