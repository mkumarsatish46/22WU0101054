const fs = require('fs');
const path = require('path');

const logDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
const logFile = path.join(logDir, 'app.log');

function randomId(len = 12) {
  return Math.random().toString(36).substring(2, 2 + len);
}

module.exports = function logger(req, res, next) {
  const start = Date.now();
  const cid = req.headers['x-correlation-id'] || randomId();
  req.cid = cid;
  res.setHeader('X-Correlation-Id', cid);

  res.on('finish', () => {
    const ms = Date.now() - start;
    const line = `${new Date().toISOString()} | ${cid} | ${req.method} ${req.originalUrl} | ${res.statusCode} | ${ms}ms\n`;
    fs.appendFile(logFile, line, () => {});
  });
  next();
};
