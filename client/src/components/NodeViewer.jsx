import React, { useState } from "react";
import EditNodeForm from "./EditNodeForm";
import "../style.css";

/**
 * NodeViewer
 * Renders a single node's question + options
 * Adds "Edit" / "Delete" for non-core nodes
 *
 * Props:
 *  - currentNodeId
 *  - treeData
 *  - onSelectNode(nextNodeId)
 *  - onFinalize(finalPrompt)
 *  - onTreeChange() => reload tree after edit/delete
 */
function NodeViewer({
  currentNodeId,
  treeData,
  onSelectNode,
  onFinalize,
  onTreeChange,}) {
  const [showEdit, setShowEdit] = useState(false);
  // const 

  if (!treeData || !treeData.nodes || !treeData.nodes[currentNodeId]) {
    return <div>Loading node...</div>;
  }

  const node = treeData.nodes[currentNodeId];

  // Let's define "core" node IDs that can't be edited/deleted
  const coreNodeIds = ["root", "ask", "analyze_file", "analyze_project","app_build"];

  const isCoreNode = coreNodeIds.includes(currentNodeId);

  async function handleDelete() {
    if (!window.confirm("Are you sure you want to delete this node?")) return;

    // Call server to delete node
    try {
      const resp = await fetch("/api/admin/delete-node", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nodeId: currentNodeId }),
      });
      const data = await resp.json();
      if (data.success) {
        alert("Node deleted successfully.");
        // Force the user back to root (or you can pick any fallback node)
        onSelectNode("root");
        onTreeChange();
      } else {
        alert("Error: " + data.error);
      }
    } catch (err) {
      alert("Failed to delete node: " + err.message);
    }
  }

  return (
    <div className="section">
      <h3 style={{ marginTop: 0 }}>{node.question || "No question here"}</h3>

      {!isCoreNode && (
        <div style={{ marginBottom: 10 }}>
          <button className="btn" onClick={() => setShowEdit(!showEdit)}>
            {showEdit ? "Cancel Edit" : "Edit Node"}
          </button>
          <button className="btn btn-secondary" onClick={handleDelete}>
            Delete Node
          </button>
        </div>
      )}

      {showEdit && !isCoreNode && (
        <EditNodeForm
          nodeId={currentNodeId}
          onDone={() => {
            setShowEdit(false);
            onTreeChange();
          }}
        />
      )}

      {node.options &&
        node.options.map((opt, idx) => {
          if (opt.nextNodeId) {
            const correntId = coreNodeIds.includes(opt.nextNodeId)?opt.nextNodeId:'';
            // leads to another node
            return (
              <button
                key={idx}
                className="btn"
                onClick={() =>isCoreNode? onSelectNode(opt.nextNodeId,correntId):onSelectNode(opt.nextNodeId,'')}
              >
                {opt.text}
              </button>
            );
          } else if (opt.finalPrompt) {
            // "Stop/Finalize" option
            return (
              <button
                key={idx}
                className="btn"
                onClick={() => onFinalize(opt.finalPrompt)}
              >
                {opt.text}
              </button>
            );
          }
          return null;
        })}
    </div>
  );
}

export default NodeViewer;
