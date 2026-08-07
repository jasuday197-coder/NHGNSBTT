const fs = require('fs');
const path = require('path');
const vm = require('vm');

const dbPath = path.join(__dirname, '..', 'audio_database.json');
const dataFilePath = path.join(__dirname, '..', 'data.js');

let content = fs.readFileSync(dataFilePath, 'utf-8');
content = content.replace(/\bconst\s+(DIALECT_LEXICON|AUDIO_CORPUS|CHATBOT_RAG_DATABASE)\b/g, 'var $1');
const sandbox = {};
vm.createContext(sandbox);
vm.runInContext(content, sandbox);
const audioCorpus = sandbox.AUDIO_CORPUS || [];

console.log('Base AUDIO_CORPUS item count from data.js:', audioCorpus.length);

if (fs.existsSync(dbPath)) {
  const currentDb = JSON.parse(fs.readFileSync(dbPath, 'utf-8') || '[]');
  if (currentDb.length === 0 && audioCorpus.length > 0) {
    fs.writeFileSync(dbPath, JSON.stringify(audioCorpus, null, 2), 'utf-8');
    console.log(`Populated audio_database.json with ${audioCorpus.length} base items!`);
  }
}
