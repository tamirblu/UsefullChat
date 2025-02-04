// routes/adminRoutes.js
const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();
const { logEvent } = require('../logger'); // if you have a logger

const treePath = path.join(__dirname, '../data/tree.json');

/**
 * POST /api/admin/add-child
 * Body example:
 * {
 *   "parentNodeId": "root",
 *   "textForOption": "New Root Option",
 *   "basePromptAddition": "I am a pro Java developer",
 *   "makeFinal": false
 * }
 */
// routes/adminRoutes.js (example changes)
router.post('/add-child', (req, res) => {
  try {
    const { parentNodeId, textForOption, basePromptAddition } = req.body;

    const treeData = JSON.parse(fs.readFileSync(treePath, 'utf-8'));
    const parentNode = treeData.nodes[parentNodeId];
    if (!parentNode) {
      return res.status(400).json({ error: `Parent node ${parentNodeId} not found.` });
    }

    // Generate new node ID
    const newNodeId = `node_${Date.now()}`;

    // Combine parent's base or final prompt
    let parentBase = parentNode.basePrompt || parentNode.finalPrompt || "";
    let combined = parentBase
      ? (basePromptAddition
          ? parentBase + " and " + basePromptAddition
          : parentBase)
      : (basePromptAddition || "");

    // Build the new node with a default "Stop/Finalize"
    const newNode = {
      basePrompt: combined,
      question: `Node created from: ${textForOption}`,
      options: [
        {
          text: "Stop/Finalize",
          finalPrompt: combined
        }
      ]
    };

    treeData.nodes[newNodeId] = newNode;

    if (!parentNode.options) {
      parentNode.options = [];
    }
    parentNode.options.push({
      text: textForOption,
      nextNodeId: newNodeId
    });

    fs.writeFileSync(treePath, JSON.stringify(treeData, null, 2));
    res.json({ success: true, newNodeId });
  } catch (err) {
    console.error("Error adding child node:", err);
    res.status(500).json({ error: "Error updating tree" });
  }
});

// server/routes/adminRoutes.js (partial)
router.post('/get-node', (req, res) => {
  const { nodeId } = req.body;
  try {
    const treeData = JSON.parse(fs.readFileSync(treePath, 'utf-8'));
    const node = treeData.nodes[nodeId];
    if (!node) {
      return res.json({ success: false, error: "Node not found." });
    }
    return res.json({ success: true, node });
  } catch (err) {
    console.error("Error reading node:", err);
    return res.json({ success: false, error: err.message });
  }
});

router.post('/edit-node', (req, res) => {
  const { nodeId, question, basePrompt, finalPrompt } = req.body;
  const coreNodeIds = ["root","ask","analyze_file","analyze_project","app_build"];
  if (coreNodeIds.includes(nodeId)) {
    return res.json({ success: false, error: "Cannot delete a core node." });
  }
  try {
    const treeData = JSON.parse(fs.readFileSync(treePath, 'utf-8'));
    if (!treeData.nodes[nodeId]) {
      return res.json({ success: false, error: "Node not found." });
    }
    // Update fields
    treeData.nodes[nodeId].question = question;
    treeData.nodes[nodeId].basePrompt = basePrompt;
    if (finalPrompt) {
      treeData.nodes[nodeId].finalPrompt = finalPrompt;
    } else {
      // If finalPrompt is empty, remove it so it's not final
      delete treeData.nodes[nodeId].finalPrompt;
    }

    fs.writeFileSync(treePath, JSON.stringify(treeData, null, 2));
    return res.json({ success: true });
  } catch (err) {
    console.error("Error editing node:", err);
    return res.json({ success: false, error: err.message });
  }
});

router.post('/delete-node', (req, res) => {
  const { nodeId } = req.body;
  const coreNodeIds = ["root","ask","analyze_file","analyze_project"];
  if (coreNodeIds.includes(nodeId)) {
    return res.json({ success: false, error: "Cannot delete a core node." });
  }
  try {
    const treeData = JSON.parse(fs.readFileSync(treePath, 'utf-8'));

    // Check if node exists
    if (!treeData.nodes[nodeId]) {
      return res.json({ success: false, error: "Node does not exist." });
    }

    // Remove references to this node from any parent's options
    for (let nId in treeData.nodes) {
      const node = treeData.nodes[nId];
      if (node.options) {
        node.options = node.options.filter(opt => {
          if (opt.nextNodeId === nodeId) {
            return false; // remove this option
          }
          return true;
        });
      }
    }

    // Now remove the node itself
    delete treeData.nodes[nodeId];

    fs.writeFileSync(treePath, JSON.stringify(treeData, null, 2));
    return res.json({ success: true });
  } catch (err) {
    console.error("Error deleting node:", err);
    return res.json({ success: false, error: err.message });
  }
});

module.exports = router;
