import React, { useState, useEffect } from "react";
import NodeViewer from "./components/NodeViewer";
import AddNodeForm from "./components/AddNodeForm";
import FinalPromptScreen from "./components/FinalPromptScreen";
import "./style.css";

function App() {
  const [treeData, setTreeData] = useState(null);
  const [currentNodeId, setCurrentNodeId] = useState("root");
  const [finalPageType, setFinalPageType] = useState("chat");

  const [finalPrompt, setFinalPrompt] = useState("");
  const [showFinalScreen, setShowFinalScreen] = useState(false);

  // Load the tree on mount
  useEffect(() => {
    loadTree();
  }, []);

  async function loadTree() {
    try {
      const resp = await fetch("/api/get-tree");
      const data = await resp.json();
      setTreeData(data);
    } catch (err) {
      console.error("Failed to load tree:", err);
    }
  }

  function handleSelectNode(nodeId,currentNodeId) {
    console.log(currentNodeId)
    currentNodeId?
    (()=>{
      setFinalPageType(currentNodeId);
      setCurrentNodeId(nodeId);
    })():
    setCurrentNodeId(nodeId);
  }

  function handleFinalize(promptStr) {
    setFinalPrompt(promptStr);
    setShowFinalScreen(true);
  }

  function handleNodeAdded() {
    loadTree();
  }

  function handleResetFlow() {
    setFinalPrompt("");
    setShowFinalScreen(false);
    setCurrentNodeId("root");
    setFinalPageType("chat");
  }

  return (
    <div className="app-container">
      <h1>ChatGPT Helper</h1>
      {showFinalScreen ? (
        <FinalPromptScreen
          finalPrompt={finalPrompt}
          onReset={handleResetFlow}
          pageType={finalPageType}
        />
      ) : (
        <>
          {treeData && (
            <>
              <NodeViewer
                currentNodeId={currentNodeId}
                treeData={treeData}
                onSelectNode={handleSelectNode}
                onFinalize={handleFinalize}
                onTreeChange={loadTree}
              />
              <AddNodeForm
                parentNodeId={currentNodeId}
                onNodeAdded={handleNodeAdded}
              />
            </>
          )}
        </>
      )}
    </div>
  );
}

export default App;
