import React, { useState } from "react";
import "../style.css";

/**
 * AddNodeForm
 * Allows admin to add a new child node under currentNodeId
 *
 * Props:
 *  - parentNodeId (string)
 *  - onNodeAdded() => refresh or re-fetch the tree
 */
function AddNodeForm({ parentNodeId, onNodeAdded }) {
  const [textForOption, setTextForOption] = useState("");
  const [basePromptAddition, setBasePromptAddition] = useState("");

  async function handleAddChild() {
    if (!parentNodeId) {
      alert("No parent node selected!");
      return;
    }
    try {
      const body = {
        parentNodeId,
        textForOption,
        basePromptAddition,
      };
      const resp = await fetch("/api/admin/add-child", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await resp.json();
      if (data.success) {
        alert("New node created: " + data.newNodeId);
        setTextForOption("");
        setBasePromptAddition("");
        onNodeAdded(); // Reload the tree in parent
      } else {
        alert("Error: " + data.error);
      }
    } catch (err) {
      alert("Error adding child node: " + err.message);
    }
  }

  return (
    <div className="section">
      <h4>Add a New Node under <em>{parentNodeId}</em></h4>
      <label>Text for Option:</label>
      <input
        className='input'
        value={textForOption}
        onChange={(e) => setTextForOption(e.target.value)}
        placeholder="Label for the new option"
      />

      <label>Base Prompt Addition:</label>
      <input
        className='input'
        value={basePromptAddition}
        onChange={(e) => setBasePromptAddition(e.target.value)}
        placeholder="What extra prompt info to add?"
      />

      <button className='btn' onClick={handleAddChild}>
        Add Child Node
      </button>
    </div>
  );
}



export default AddNodeForm;
