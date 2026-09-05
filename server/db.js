const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');

const dbPath = path.join(__dirname, 'messages.json');
let mongoClient = null;
let mongoDb = null;

function ensureJsonFile() {
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

async function init() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    ensureJsonFile();
    return;
  }

  try {
    mongoClient = new MongoClient(uri, {
      serverSelectionTimeoutMS: Number(process.env.MONGODB_SERVER_SELECTION_TIMEOUT_MS) || 5000,
      connectTimeoutMS: Number(process.env.MONGODB_CONNECT_TIMEOUT_MS) || 5000
    });
    await mongoClient.connect();

    const dbName = process.env.MONGODB_DB || 'wedding_site';
    mongoDb = mongoClient.db(dbName);
    await mongoDb.collection('messages').createIndex({ created_at: -1 });

    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection failed, falling back to local JSON store:', err.message);
    mongoClient = null;
    mongoDb = null;
    ensureJsonFile();
  }
}

function hasMongo() {
  return Boolean(mongoClient && mongoDb);
}

function isConnected() {
  return hasMongo();
}

function addMessage({ prenom, nom, message }, cb) {
  if (hasMongo()) {
    const created_at = new Date().toISOString();
    const row = { prenom: prenom || '', nom: nom || '', message: message || '', created_at };

    mongoDb.collection('messages').insertOne(row)
      .then(result => {
        const saved = { ...row, id: result.insertedId.toString() };
        cb(null, saved);
      })
      .catch(cb);
    return;
  }

  const data = _read();
  const id = data.messages.reduce((m, r) => Math.max(m, Number(r.id) || 0), 0) + 1;
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
  if (hasMongo()) {
    mongoDb.collection('messages')
      .find({})
      .sort({ created_at: -1 })
      .toArray()
      .then(rows => {
        const mapped = rows.map(row => ({
          id: row._id ? row._id.toString() : null,
          prenom: row.prenom || '',
          nom: row.nom || '',
          message: row.message || '',
          created_at: row.created_at || new Date().toISOString()
        }));
        cb(null, mapped);
      })
      .catch(cb);
    return;
  }

  const data = _read();
  const rows = (data.messages || []).slice().sort((a, b) => (Number(b.id) || 0) - (Number(a.id) || 0));
  cb(null, rows);
}

module.exports = { init, addMessage, getMessages, isConnected };
