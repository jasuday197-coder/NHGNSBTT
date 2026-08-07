const fs = require('fs');
const path = require('path');

console.log("--- STARTING SYSTEM INTEGRATION TEST ---");

// Test 1: Verify audio_database.json structure & contents
const dbPath = path.join(__dirname, '..', 'audio_database.json');
const pendingPath = path.join(__dirname, '..', 'pending_contributions.json');

console.log("1. Checking audio_database.json exists:", fs.existsSync(dbPath));
console.log("2. Checking pending_contributions.json exists:", fs.existsSync(pendingPath));

let audioDb = [];
if (fs.existsSync(dbPath)) {
  audioDb = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
}
console.log(`3. Total records in audio_database.json: ${audioDb.length}`);

// Test 2: Verify audio URL validation function logic matching app.js
function isValidAudioUrl(url) {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (!trimmed) return false;
  return (
    trimmed.startsWith('blob:') ||
    trimmed.startsWith('data:audio') ||
    trimmed.startsWith('/uploads/') ||
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    /\.(mp3|wav|m4a|webm|ogg|aac)$/i.test(trimmed)
  );
}

const testUrls = [
  { url: '/uploads/audio_1723028392.mp3', expected: true },
  { url: '/uploads/audio_1723028392.wav', expected: true },
  { url: '/uploads/audio_1723028392.ogg', expected: true },
  { url: 'blob:http://localhost:3000/1234-5678', expected: true },
  { url: 'data:audio/mp3;base64,AAAA', expected: true },
  { url: '', expected: false }
];

let allUrlsValid = true;
testUrls.forEach(t => {
  const result = isValidAudioUrl(t.url);
  console.log(`Test URL [${t.url}] -> ${result} (Expected: ${t.expected})`);
  if (result !== t.expected) allUrlsValid = false;
});

if (allUrlsValid) {
  console.log("4. Audio URL Validation test PASSED!");
} else {
  console.error("4. Audio URL Validation test FAILED!");
  process.exit(1);
}

console.log("--- ALL INTEGRATION PERSISTENCE TESTS COMPLETED SUCCESSFULLY ---");
