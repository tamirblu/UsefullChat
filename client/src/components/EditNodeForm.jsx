import React, { useState, useEffect } from "react";
import "../style.css";

/**
 * EditNodeForm
 * Allows editing a node's question, basePrompt, finalPrompt
 *
 * Props:
 *  - nodeId (string)
 *  - onDone() => called after successful edit
 */
function EditNodeForm({ nodeId, onDone }) {
  const [question, setQuestion] = useState("");
  const [basePrompt, setBasePrompt] = useState("");
  const [finalPrompt, setFinalPrompt] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNodeData();
    // eslint-disable-next-line
  }, [nodeId]);

  async function loadNodeData() {
    try {
      const resp = await fetch("/api/admin/get-node", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nodeId }),
      });
      const data = await resp.json();
      if (data.success && data.node) {
        setQuestion(data.node.question || "");
        setBasePrompt(data.node.basePrompt || "");
        setFinalPrompt(data.node.finalPrompt || "");
      }
      setLoading(false);
    } catch (err) {
      alert("Failed to load node data: " + err.message);
      setLoading(false);
    }
  }

  async function handleSave() {
    try {
      const body = {
        nodeId,
        question,
        basePrompt,
        finalPrompt,
      };
      const resp = await fetch("/api/admin/edit-node", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await resp.json();
      if (data.success) {
        alert("Node updated successfully.");
        onDone();
      } else {
        alert("Error: " + data.error);
      }
    } catch (err) {
      alert("Error saving node: " + err.message);
    }
  }

  if (loading) {
    return <div>Loading Node Info...</div>;
  }

  return (
    <div className="section" style={{ marginTop: 10 }}>
      <h4>Edit Node: {nodeId}</h4>
      <label>Question:</label>
      <input
        className="input"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
      />

      <label>Base Prompt:</label>
      <input
        className="input"
        value={basePrompt}
        onChange={(e) => setBasePrompt(e.target.value)}
      />

      <label>Final Prompt (if any):</label>
      <input
        className="input"
        value={finalPrompt}
        onChange={(e) => setFinalPrompt(e.target.value)}
      />

      <button className="btn" onClick={handleSave}>
        Save Changes
      </button>
    </div>
  );
}

export default EditNodeForm;
