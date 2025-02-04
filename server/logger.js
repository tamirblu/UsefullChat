// logger.js
const fs = require('fs');
const path = require('path');

function getLogFilePath() {
  // For example, create daily log files named "server-YYYY-MM-DD.log"
  const dateStr = new Date().toISOString().slice(0, 10); // "2025-01-28"
  const fileName = `server-${dateStr}.log`;
  const logsDir = path.join(__dirname, 'logs');

  // Ensure "logs" folder exists
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir);
  }

  return path.join(logsDir, fileName);
}

/**
 * logEvent
 * @param {string} level - e.g. "INFO", "ERROR", "WARN", "DEBUG"
 * @param {string} message - the message to log
 * @param {object} [req] - optional Express request object for more context
 */
function logEvent(level, message, req = null) {
  const dateStr = new Date().toISOString();
  let logMsg = `[${dateStr}] [${level}] ${message}`;

  // If we have a request object, log IP, URL, etc.
  if (req) {
    const ip = req.ip || req.headers['x-forwarded-for'] || req.socket?.remoteAddress;
    const url = req.originalUrl || req.url || "N/A";
    logMsg += ` | IP: ${ip} | URL: ${url}`;
    // You can also log req.body, headers, etc., if needed
  }

  // Append to today's log file
  fs.appendFileSync(getLogFilePath(), logMsg + '\n');
}

module.exports = { logEvent };
