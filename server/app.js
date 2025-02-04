// app.js
const express = require('express');
const path = require('path');

// Your route files:
const chatRoutes = require('./routes/chatRoutes');
const fileRoutes = require('./routes/fileRoutes');
const folderRoutes = require('./routes/folderRoutes');
const adminRoutes = require('./routes/adminRoutes');
const treeRoutes = require('./routes/treeRoutes');

const app = express();
app.use(express.json());

// Attach routes
app.use('/api', chatRoutes);       // POST /api/chat
app.use('/api', fileRoutes);       // POST /api/upload-file
app.use('/api', folderRoutes);     // POST /api/upload-folder
app.use('/api/admin', adminRoutes);// POST /api/admin/add-child
app.use('/api', treeRoutes);       // GET /api/get-tree

module.exports = app;
