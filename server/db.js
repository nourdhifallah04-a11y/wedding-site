const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'messages.json');

function init() {
  if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, JSON.stringify({ messages: [] }, null, 2));
  }
}

function _read() {
  try {
    return JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  } catch (e) {
    return { messages: [] };
  }
}

function _write(data) {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

function addMessage({ prenom, nom, message }, cb) {
  const data = _read();
  const id = data.messages.reduce((m, r) => Math.max(m, r.id || 0), 0) + 1;
  const created_at = new Date().toISOString();
  const row = { id, prenom: prenom || '', nom: nom || '', message: message || '', created_at };
  data.messages.push(row);
  try {
    _write(data);
    cb(null, row);
  } catch (err) {
    cb(err);
  }
}

function getMessages(cb) {
  const data = _read();
  // return newest first
  const rows = (data.messages || []).slice().sort((a, b) => b.id - a.id);
  cb(null, rows);
}

module.exports = { init, addMessage, getMessages };
