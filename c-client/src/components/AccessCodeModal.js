import React, { useState } from "react";
import Modal from "./Modal";

const ACCESS_CODE = "Th3w0rld1squiethere"; 
// TEMP: move to env or backend later

const AccessCodeModal = ({ onSuccess, onClose }) => {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (code === ACCESS_CODE) {
      sessionStorage.setItem("cloakk_access_granted", "true");
      onSuccess();
    } else {
      setError("Invalid access code");
    }
  };

  return (
    <Modal onClose={onClose}>
      <h2>Enter Organization Access Code</h2>

      <input
        type="password"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Access code"
        style={{ width: "100%", padding: 10, marginTop: 12 }}
      />

      {error && (
        <div style={{ color: "red", marginTop: 8 }}>{error}</div>
      )}

      <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
        <button onClick={handleSubmit}>Continue</button>
        <button onClick={onClose}>Cancel</button>
      </div>
    </Modal>
  );
};

export default AccessCodeModal;