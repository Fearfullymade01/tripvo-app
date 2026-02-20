import React, { useState } from "react";

export default function Onboarding({ onComplete }) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    photo: null,
    mode: "signup", // signup | guest
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm((f) => ({
      ...f,
      [name]: files ? files[0] : value,
    }));
  };

  const handleMode = (mode) => setForm((f) => ({ ...f, mode }));

  const handleNext = () => setStep((s) => s + 1);
  const handleBack = () => setStep((s) => s - 1);

  // Real OAuth logic: redirect to backend allauth endpoints
  const handleOAuth = (provider) => {
    const base = window.location.origin;
    // Django allauth expects /accounts/{provider}/login/
    window.location.href = `/accounts/${provider}/login/?next=/`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || (form.mode === "signup" && (!form.email || !form.password))) {
      setError("Please fill all required fields.");
      return;
    }
    setError("");
    if (form.mode === "signup") {
      try {
        const username = form.email.split("@")[0];
        const res = await fetch("/api/signup/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username,
            email: form.email,
            password: form.password,
            first_name: form.name,
          }),
        });
        if (!res.ok) {
          const err = await res.json();
          setError(err.email || err.username || err.password || "Signup failed");
          return;
        }
        setStep(2);
      } catch (err) {
        setError("Signup failed. Please try again.");
      }
    } else {
      // Guest mode: call backend to create guest user
      try {
        const res = await fetch("/api/guest/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: form.name }),
        });
        if (!res.ok) {
          const err = await res.json();
          setError(err.error || "Guest signup failed");
          return;
        }
        setStep(2);
      } catch (err) {
        setError("Guest signup failed. Please try again.");
      }
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "40px auto", padding: 24, border: "1px solid #eee", borderRadius: 12, background: "#fff" }}>
      <h2>Welcome to Tripvo!</h2>
      {step === 0 && (
        <>
          <button onClick={() => handleMode("signup")} style={{ marginRight: 8, background: form.mode === "signup" ? "#1976d2" : "#eee", color: form.mode === "signup" ? "#fff" : "#333", border: 0, padding: 8, borderRadius: 6 }}>Sign up</button>
          <button onClick={() => handleMode("guest")} style={{ background: form.mode === "guest" ? "#1976d2" : "#eee", color: form.mode === "guest" ? "#fff" : "#333", border: 0, padding: 8, borderRadius: 6 }}>Continue as Guest</button>
          <div style={{ margin: "24px 0" }}>
            <button onClick={() => handleOAuth("Google")}>Continue with Google</button>
            <button onClick={() => handleOAuth("Apple")} style={{ marginLeft: 8 }}>Continue with Apple</button>
          </div>
          <button onClick={handleNext} style={{ marginTop: 16 }}>Next</button>
        </>
      )}
      {step === 1 && (
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 12 }}>
            <label>Name:<br />
              <input name="name" value={form.name} onChange={handleChange} required style={{ width: "100%" }} />
            </label>
          </div>
          {form.mode === "signup" && (
            <>
              <div style={{ marginBottom: 12 }}>
                <label>Email:<br />
                  <input name="email" type="email" value={form.email} onChange={handleChange} required style={{ width: "100%" }} />
                </label>
              </div>
              <div style={{ marginBottom: 12 }}>
                <label>Password:<br />
                  <input name="password" type="password" value={form.password} onChange={handleChange} required style={{ width: "100%" }} />
                </label>
              </div>
            </>
          )}
          <div style={{ marginBottom: 12 }}>
            <label>Photo:<br />
              <input name="photo" type="file" accept="image/*" onChange={handleChange} />
            </label>
          </div>
          {error && <div style={{ color: "red" }}>{error}</div>}
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <button type="button" onClick={handleBack}>Back</button>
            <button type="submit">Finish</button>
          </div>
        </form>
      )}
      {step === 2 && (
        <div>
          <h3>You're all set!</h3>
          <p>Let's start planning your first trip.</p>
          <button onClick={onComplete}>Go to Dashboard</button>
        </div>
      )}
    </div>
  );
}
