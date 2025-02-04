// server.js
const app = require('./app');
const { logEvent } = require('./logger');

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  logEvent('INFO', `Server started on port ${PORT}`);
  console.log(`Server is listening on port ${PORT}`);
});
