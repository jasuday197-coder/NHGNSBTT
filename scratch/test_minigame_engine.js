const fs = require('fs');
const path = require('path');
const vm = require('vm');

console.log('[Test] Loading data.js and MinigameEngine.js in Node VM...');

let dataCode = fs.readFileSync(path.join(__dirname, '../data.js'), 'utf-8');
dataCode = dataCode.replace(/\bconst\s+(DIALECT_LEXICON|AUDIO_CORPUS|CHATBOT_RAG_DATABASE)\b/g, 'var $1');
const engineCode = fs.readFileSync(path.join(__dirname, '../src/components/Minigames/MinigameEngine.js'), 'utf-8');

const sandbox = {
  window: null,
  document: {
    getElementById: (id) => ({
      innerText: '',
      style: {},
      classList: { add: () => {}, remove: () => {} },
      value: ''
    }),
    querySelectorAll: () => []
  },
  localStorage: {
    store: {},
    getItem(k) { return this.store[k] || null; },
    setItem(k, v) { this.store[k] = String(v); }
  },
  console: console,
  setInterval: () => {},
  clearInterval: () => {},
  Date: Date
};
sandbox.window = sandbox;

vm.createContext(sandbox);

vm.runInContext(dataCode, sandbox);
vm.runInContext(engineCode, sandbox);

console.log('[Test] DIALECT_LEXICON count:', sandbox.DIALECT_LEXICON.length);
console.log('[Test] VoiceBankGamesEngine defined:', typeof sandbox.VoiceBankGamesEngine);

const engine = new sandbox.VoiceBankGamesEngine();
console.log('[Test] Initialized Engine instance. Default player name:', engine.playerName);

engine.promptStartGame(1);
console.log('[Test] promptStartGame executed without throwing.');

console.log('[Test] ALL VERIFICATION TESTS PASSED SUCCESSFULLY!');
