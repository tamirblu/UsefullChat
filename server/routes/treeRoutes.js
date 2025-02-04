// routes/treeRoutes.js
const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();
const treePath = path.join(__dirname, '../data/tree.json');

/**
 * GET /api/get-tree
 * Returns the entire tree.json as JSON
 */
router.get('/get-tree', (req, res) => {
  try {
    const data = fs.readFileSync(treePath, 'utf-8');
    const treeJson = JSON.parse(data);
    res.json(treeJson);
  } catch (err) {
    console.error("Error reading tree.json:", err);
    res.status(500).json({ error: 'Failed to load tree data' });
  }
});

module.exports = router;
