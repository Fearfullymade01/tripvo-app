import React, { useState, useEffect } from "react";

export default function ProfileSettings({ user, onSave }) {
  const [form, setForm] = useState({
    name: user?.first_name || "",
    email: user?.email || "",
    photo: null,
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  useEffect(() => {
    // Fetch profile from backend
    fetch("/api/profile/", { credentials: "include" })
      .then((res) => res.ok ? res.json() : Promise.reject(res))
      .then((data) => setForm((f) => ({ ...f, name: data.first_name || "", email: data.email || "" })))
      .catch(() => {});
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm((f) => ({
      ...f,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    if (!form.name || !form.email) {
      setError("Name and email are required.");
      return;
    }
    try {
      const res = await fetch("/api/profile/", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ first_name: form.name, email: form.email }),
      });
      if (!res.ok) {
        const err = await res.json();
        setError(err.email || err.first_name || "Update failed");
        return;
      }
      setSuccess(true);
      if (onSave) onSave(form);
    } catch {
      setError("Update failed. Please try again.");
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "40px auto", padding: 24, border: "1px solid #eee", borderRadius: 12, background: "#fff" }}>
      <h2>Profile Settings</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 12 }}>
          <label>Name:<br />
            <input name="name" value={form.name} onChange={handleChange} required style={{ width: "100%" }} />
          </label>
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>Email:<br />
            <input name="email" type="email" value={form.email} onChange={handleChange} required style={{ width: "100%" }} />
          </label>
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>Photo:<br />
            <input name="photo" type="file" accept="image/*" onChange={handleChange} />
          </label>
        </div>
        {error && <div style={{ color: "red" }}>{error}</div>}
        {success && <div style={{ color: "green" }}>Profile updated!</div>}
        <button type="submit">Save</button>
      </form>
    </div>
  );
}
