# Project Context Summary

## 1. Overview
- **Project Name:** ChatGPT Helper (Dynamic Prompt Tree)
- **Description:**  
  A React-based front-end and Node.js/Express back-end application designed to assist users in building and refining prompt flows for ChatGPT. It allows for creating, editing, and deleting nodes in a “prompt tree,” and provides a final prompt screen for uploading files or folders and sending a final prompt (plus optional user text) to various APIs (e.g., `/api/chat`, `/api/upload-file`, `/api/upload-folder`).
- **Goals:**  
  1. Provide a flexible decision-tree/prompt-tree structure where users can add, edit, or remove non-core nodes.  
  2. Let users finalize a prompt at any point and upload files or folders for ChatGPT-based analysis.  
  3. Offer easy UI to manage the tree (admin features) and gather final prompts for advanced ChatGPT usage.

## 2. Technology Stack
- **Frontend:**  
  - **React** (JavaScript) for the user interface.  
- **Backend:**  
  - **Node.js** with **Express** for routes (`/api/chat`, `/api/upload-file`, `/api/upload-folder`, `/api/admin/...`).
- **Database:**  
  - Currently uses a **file-based** `tree.json` for storing the prompt tree.  
- **Other Tools/Frameworks:**  
  - **Multer** (for file uploads).  
  - **pdf-parse** (to handle PDF content).  
  - **adm-zip** (to handle `.zip` files).  
  - **OpenAI** library for making requests to ChatGPT.

## 3. Project Structure
- **Directory Layout:**  
project-root/ ├── server/ │ ├── app.js │ ├── server.js │ ├── logger.js │ ├── routes/ │ │ ├── adminRoutes.js │ │ ├── chatRoutes.js │ │ ├── fileRoutes.js │ │ ├── folderRoutes.js │ │ └── treeRoutes.js │ ├── data/ │ │ └── tree.json │ └── ... ├── client/ │ ├── src/ │ │ ├── components/ │ │ │ ├── NodeViewer.jsx │ │ │ ├── AddNodeForm.jsx │ │ │ ├── EditNodeForm.jsx │ │ │ └── FinalPromptScreen.jsx │ │ ├── App.js │ │ ├── style.css │ │ └── index.js │ └── public/ └── README.md
- **Key Files/Modules:**  
- **`server/app.js`**: Initializes Express app, mounts routes (admin, chat, file, folder, etc.).  
- **`server/server.js`**: Entry point to start the server listening on a given port.  
- **`server/logger.js`**: Handles daily rotating logs and logs prompt + result for each call.  
- **`tree.json`**: Stores the dynamic prompt-tree data.  
- **`NodeViewer.jsx`**: Displays a single node’s question and options; allows edit/delete for non-core nodes.  
- **`AddNodeForm.jsx`**: Allows adding new child nodes to the prompt tree.  
- **`EditNodeForm.jsx`**: Allows editing existing non-core nodes (question, basePrompt, finalPrompt).  
- **`FinalPromptScreen.jsx`**: Displays the final prompt, allows users to upload a file/folder or send a question.  

## 4. Key Features & Modules
- **Dynamic Prompt Tree**  
- Users can add new nodes via an admin form (`AddNodeForm`).  
- Non-core nodes can be edited (`EditNodeForm`) or deleted from the tree.  
- **Final Prompt Screen**  
- Users can finalize the prompt, add additional text, and either send it to ChatGPT (`/api/chat`) or upload files/folders for chunk-based analysis.  
- **Logging**  
- A `logger.js` module writes logs for each API call (prompt + result), including IP and timestamp.  
- **File Upload & Parsing**  
- Single-file or `.zip` upload for advanced content analysis using `Multer`, `pdf-parse`, and `adm-zip`.

## 5. Dependencies & Integrations
- **External APIs:**  
- **OpenAI** API (ChatGPT) for text completions.  
- **Libraries/Packages:**  
- **React** & **react-dom** in the client.  
- **Node.js / Express** for server routes.  
- **Multer**, **pdf-parse**, **adm-zip** for file and folder handling.  
- **dotenv** for environment variables (e.g., OpenAI API key).  

## 6. Current Status & Roadmap
- **Current Status:**  
- Actively in development. Basic tree management (add/edit/delete non-core) and file/folder analysis endpoints are functional.  
- **Upcoming Milestones:**  
1. **Improve UI/UX** around node editing/deleting (e.g., drag-and-drop or confirm dialogs).  
2. **Security Hardening** (e.g., user authentication, secure file storage, rate limiting).  
3. **Potential DB Migration** from file-based storage (`tree.json`) to a more robust database solution.  
4. **Enhance Prompt Scripting** (e.g., ability to store entire conversation logs, more advanced chunking strategies).

## 7. Additional Notes
- **Assumptions:**  
- No multi-user authentication or role management is currently implemented.  
- The prompt tree’s “core nodes” (root, ask, analyze_file, analyze_project) are protected from edit/delete.  
- `OpenAI` usage requires a valid API key in `.env`.  
- **File Storage:**  
- `uploads/` folder for temporary file storage during PDF or ZIP analysis.  
- **Logging Details:**  
- Each request logs the prompt summary (up to first 50 chars) and partial results in a daily rotating log file.
