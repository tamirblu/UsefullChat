import React, { useState } from "react";
import "../style.css";

/**
 * FinalPromptScreen
 *  - shows the finalPrompt
 *  - let user add extra text
 *  - upload single file or folder
 *  - calls /api/chat, /api/upload-file, /api/upload-folder
 *
 * Props:
 *  - finalPrompt (string)
 *  - onReset() => reset flow
 */


function FinalPromptScreen({ finalPrompt, onReset, pageType }) {
  const [userQuestion, setUserQuestion] = useState("");
  const [singleFile, setSingleFile] = useState(null);
  const [folderZip, setFolderZip] = useState(null);
  const [serverResponse, setServerResponse] = useState("");

  // 1) Send question to /api/chat
  async function handleSendQuestion() {
    try {
      const prompt = finalPrompt + "\n" + userQuestion;
      const resp = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await resp.json();
      if (data.answer) {
        setServerResponse("ChatGPT: " + data.answer);
      } else {
        setServerResponse("No answer received.");
      }
    } catch (err) {
      setServerResponse("Error: " + err.message);
    }
  }

  // 2) Upload single file to /api/upload-file
  async function handleUploadFile() {
    if (!singleFile) {
      alert("Please select a file first!");
      return;
    }
    try {
      const prompt = finalPrompt + "\n" + userQuestion;
      const formData = new FormData();
      formData.append("fileToAnalyze", singleFile);
      formData.append("userPrompt", prompt);

      const resp = await fetch("/api/upload-file", {
        method: "POST",
        body: formData,
      });
      const data = await resp.json();
      if (data.success) {
        setServerResponse(
          "File Analysis Summary:\n" + data.summary + "\n\nPartials:\n" +
          (data.partials || []).join("\n---\n")
        );
      } else {
        setServerResponse("Error: " + (data.error || "Unknown error"));
      }
    } catch (err) {
      setServerResponse("File upload error: " + err.message);
    }
  }

  // 3) Upload folder (zip) to /api/upload-folder
  async function handleUploadFolder() {
    if (!folderZip) {
      alert("Please select a .zip folder first!");
      return;
    }
    try {
      const prompt = finalPrompt + "\n" + userQuestion;
      const formData = new FormData();
      formData.append("folderZip", folderZip);
      formData.append("userPrompt", prompt);

      const resp = await fetch("/api/upload-folder", {
        method: "POST",
        body: formData,
      });
      const data = await resp.json();
      if (data.success) {
        setServerResponse(
          "Folder Analysis Summary:\n" + data.summary + "\n\nPartials:\n" +
          (data.partials || []).join("\n---\n")
        );
      } else {
        setServerResponse("Error: " + (data.error || "Unknown error"));
      }
    } catch (err) {
      setServerResponse("Folder upload error: " + err.message);
    }
  }

  function renderPageContent() {
    switch(pageType){
      case 'analyze_file':
        return (
        <div>
          <label>Select a Single File (PDF, etc.):</label>
          <br />
          <input
            type="file"
            onChange={(e) => setSingleFile(e.target.files[0] || null)}
          />
          <br />
          <button className="btn" onClick={handleUploadFile}>
            Analyze Single File
          </button>
        </div>
        ) 
      case "analyze_project" :
        return(
        <div>
          <div>
            <label>Upload the Project Folder (.zip):</label>
            <br />
            <input
              type="file"
              accept=".zip"
              onChange={(e) => setFolderZip(e.target.files[0] || null)}
            />
            <br />
            <button className="btn" onClick={handleUploadFolder}>
              Analyze Project
            </button>
          </div>
          <div style={{ marginTop: "1rem" }}>
            <label>Select a Template File To Analyze (pdf, txt, etc.):</label>
            <br />
            <input
              type="file"
              onChange={(e) => setSingleFile(e.target.files[0] || null)}
            />
            <br />
            <button className="btn" onClick={handleUploadFile}>
              Template to Analyze
            </button>
          </div>
        </div>
        )
      case "app_build" :
        return(
          <div>
            <label>Select a Folder (.zip):</label>
            <br />
            <input
              type="file"
              accept=".zip"
              onChange={(e) => setFolderZip(e.target.files[0] || null)}
            />
            <br />
            <button className="btn" onClick={handleUploadFolder}>
              Analyze Folder
            </button>
          </div>  
        )  
      case 'ask':
        return (
        // If pageType is something else (but truthy), default to analyzing folder
        <div>
          <button className="btn" onClick={handleSendQuestion}>
            Send to ChatGPT (/api/chat)
          </button>
        </div>
        )
      default:
        return (
        <div>
          <button className="btn" onClick={handleSendQuestion}>
            Send to ChatGPT (/api/chat)
          </button>
        </div>
        )
    }  
  }

  return (
    <div className='section'>
      <h2>Final Prompt</h2>
      <textarea
        className='input'
        readOnly
        rows={3}
        value={finalPrompt}
      />

      <label>Additional Text / Question:</label>
      <textarea
        className='input'
        rows={2}
        value={userQuestion}
        onChange={(e) => setUserQuestion(e.target.value)}
        placeholder="Type extra question or text here..."
      />

      {pageType && renderPageContent()}
      {serverResponse && (
        <div style={{ marginTop: 15, whiteSpace: "pre-wrap" }}>
          <strong>Server Response:</strong>
          <br />
          {serverResponse}
        </div>
      )}

      <hr />
      <button className='btn btn-secondary' onClick={onReset}>
        Reset Flow
      </button>
    </div>
  );
}

export default FinalPromptScreen;
