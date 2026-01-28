import React, { useEffect, useState } from "react";

function App() {
    const [backendMessage, setBackendMessage] = useState("");

    useEffect(() => {
        // Use your actual deployed FastAPI backend URL below
        fetch("https://fearfullymade01-tripvo-8e6e6e6e6e6e.herokuapp.com/")
            .then((res) => res.json())
            .then((data) => setBackendMessage(data.message))
            .catch(() => setBackendMessage("Could not reach backend"));
    }, []);

    return (
        <div>
            <h1>Hello from React frontend!</h1>
            <p>Backend says: {backendMessage}</p>
        </div>
    );
}

export default App;
